import { ConflictException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ServerCoursesService } from '@server/courses';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam } from './exam.entity';
import { SessionsRepository } from './sessions.repository';
import { ExamsRepository } from './exams.repository';
import { Session } from './session.entity';

@Injectable()
export class ExamValidationService {
    private readonly logger = new Logger(ExamValidationService.name);

    /**
     * Valida un esame per la creazione.
     * Raccoglie TUTTI gli errori prima di lanciarli.
     */
    async validateForCreate(
        dto: CreateExamDto,
        coursesService: ServerCoursesService,
        sessionsRepository: SessionsRepository,
        examsRepository: ExamsRepository
    ): Promise<void> {
        const errors: string[] = [];

        // Validazione del professore e dell'insegnamento
        await this.validateProfessorAndTeaching(dto.professorId, dto.teachingId, coursesService, errors);

        // Validazione della sessione
        const session = await this.validateSession(dto.sessionId, sessionsRepository, errors);

        // Validazione delle date dell'esame (formato e logica)
        this.validateExamDates(dto.dateTimeStart, dto.dateTimeEnd, errors);

        // Validazione della data odierna all'interno della finestra di inserimento
        if (session) {
            this.validateWithinInsertionWindow(session, errors);
        }

        // Validazione dell'esame all'interno della finestra di esaminazione della sessione
        if (session) {
            this.validateExamWithinSessionWindow(dto.dateTimeStart, dto.dateTimeEnd, session, errors);
        }

        // Validazione weekend e festivi
        if (session) {
            this.validateExamNotOnWeekendOrHoliday(dto.dateTimeStart, dto.dateTimeEnd, session, errors);
        }

        // Se ci sono errori, lancia un'eccezione con tutti gli errori
        if (errors.length > 0) {
            throw new ForbiddenException(errors);
        }

        // Validazione dei conflitti con altri esami (check finale, dopo tutti gli altri controlli)
        await this.validateNoConflictsWithOtherExams(
            dto.sessionId,
            dto.dateTimeStart,
            dto.dateTimeEnd,
            dto.teachingId,
            coursesService,
            examsRepository,
            errors
        );

        if (errors.length > 0) {
            throw new ConflictException(errors);
        }
    }

    /**
     * Valida un esame per l'aggiornamento.
     * Raccoglie TUTTI gli errori prima di lanciarli.
     */
    async validateForUpdate(
        dto: UpdateExamDto,
        exam: Exam,
        coursesService: ServerCoursesService,
        sessionsRepository: SessionsRepository,
        examsRepository: ExamsRepository
    ): Promise<void> {
        // Estrae i valori effettivi (aggiornati o attuali)
        const teachingId = dto.teachingId !== undefined ? dto.teachingId : exam.teaching.id;
        const sessionId = dto.sessionId !== undefined ? dto.sessionId : exam.session.id;
        const dateTimeStart = dto.dateTimeStart !== undefined ? new Date(dto.dateTimeStart) : exam.dateTimeStart;
        const dateTimeEnd = dto.dateTimeEnd !== undefined ? new Date(dto.dateTimeEnd) : exam.dateTimeEnd;

        const errors: string[] = [];

        // Validazione dell'insegnamento (se modificato)
        if (dto.teachingId !== undefined) {
            try {
                await coursesService.getTeachingByID(teachingId);
            } catch (error) {
                this.logger.error(
                    `Errore nel recupero dell'insegnamento con id ${teachingId}: ${error.message}`,
                    error instanceof Error ? error.message : String(error)
                );
                errors.push('L\'insegnamento specificato non esiste');
            }
        }

        // Validazione della sessione (se modificata)
        let session: Session | null = null;
        if (dto.sessionId !== undefined) {
            session = await this.validateSession(sessionId, sessionsRepository, errors);
        } else {
            session = exam.session;
        }

        // Validazione delle date dell'esame (se modificate)
        if (dto.dateTimeStart !== undefined || dto.dateTimeEnd !== undefined) {
            this.validateExamDates(dateTimeStart, dateTimeEnd, errors);
        }

        // Validazione della data odierna all'interno della finestra di inserimento
        if (session) {
            this.validateWithinInsertionWindow(session, errors);
        }

        // Validazione dell'esame all'interno della finestra di esaminazione della sessione
        if (session) {
            this.validateExamWithinSessionWindow(dateTimeStart, dateTimeEnd, session, errors);
        }

        // Validazione weekend e festivi
        if (session) {
            this.validateExamNotOnWeekendOrHoliday(dateTimeStart, dateTimeEnd, session, errors);
        }

        if (errors.length > 0) {
            throw new ForbiddenException(errors);
        }

        // Validazione dei conflitti con altri esami (escludi l'esame corrente dal controllo)
        await this.validateNoConflictsWithOtherExamsForUpdate(
            sessionId,
            dateTimeStart,
            dateTimeEnd,
            teachingId,
            exam.id,
            coursesService,
            examsRepository,
            errors
        );

        if (errors.length > 0) {
            throw new ConflictException(errors);
        }
    }

    /**
     * Valida che il professore esista e insegni l'insegnamento specificato.
     */
    private async validateProfessorAndTeaching(
        professorId: number,
        teachingId: number,
        coursesService: ServerCoursesService,
        errors: string[]
    ): Promise<void> {
        try {
            const professorTeachings = await coursesService.getTeachingsByProfessor(professorId);

            if (!professorTeachings || professorTeachings.length === 0) {
                errors.push('Il professore non è stato trovato o non ha insegnamenti');
                return;
            }

            const teaching = professorTeachings.find(t => t.id === teachingId);
            if (!teaching) {
                errors.push('Il professore non insegna questo insegnamento');
            }
        } catch (error) {
            this.logger.error(
                `Errore nel recupero degli insegnamenti del professore con id ${professorId}: ${error.message}`,
                error instanceof Error ? error.message : String(error)
            );
            errors.push('Il professore non è stato trovato o non ha insegnamenti');
        }
    }

    /**
     * Valida che la sessione esista.
     */
    private async validateSession(
        sessionId: number,
        sessionsRepository: SessionsRepository,
        errors: string[]
    ): Promise<Session | null> {
        try {
            const session = await sessionsRepository.findById(sessionId);
            if (!session) {
                errors.push(`Sessione con id ${sessionId} non trovata`);
                return null;
            }
            return session;
        } catch (error) {
            this.logger.error(
                `Errore nel recupero della sessione con id ${sessionId}: ${error.message}`,
                error instanceof Error ? error.message : String(error)
            );
            errors.push(`Errore nel recupero della sessione con id ${sessionId}`);
            return null;
        }
    }

    /**
     * Valida la logica delle date dell'esame (inizio < fine).
     */
    private validateExamDates(
        dateTimeStart: Date | string,
        dateTimeEnd: Date | string,
        errors: string[]
    ): void {
        try {
            const start = new Date(dateTimeStart);
            const end = new Date(dateTimeEnd);

            if (isNaN(start.getTime())) {
                errors.push('La data di inizio dell\'esame non è valida');
                return;
            }

            if (isNaN(end.getTime())) {
                errors.push('La data di fine dell\'esame non è valida');
                return;
            }

            if (start >= end) {
                errors.push('La data di inizio deve essere precedente alla data di fine');
            }
        } catch (error) {
            this.logger.error(
                `Errore nella validazione delle date dell'esame: ${error.message}`,
                error instanceof Error ? error.message : String(error)
            );
            errors.push('Errore nella validazione delle date dell\'esame');
        }
    }

    /**
     * Valida che l'esame sia all'interno della finestra di esaminazione della sessione.
     */
    private validateExamWithinSessionWindow(
        dateTimeStart: Date | string,
        dateTimeEnd: Date | string,
        session: Session,
        errors: string[]
    ): void {
        try {
            const examStart = new Date(dateTimeStart);
            const examEnd = new Date(dateTimeEnd);
            const sessionStart = new Date(session.dateStartExamination);
            const sessionEnd = new Date(session.dateEndExamination);

            if (examStart < sessionStart) {
                errors.push('La data di inizio dell\'esame è precedente alla data di inizio esaminazione della sessione');
            }

            if (examEnd > sessionEnd) {
                errors.push('La data di fine dell\'esame è successiva alla data di fine esaminazione della sessione');
            }
        } catch (error) {
            this.logger.error(
                `Errore nella validazione delle date dell'esame rispetto alla sessione: ${error.message}`,
                error instanceof Error ? error.message : String(error)
            );
            errors.push('Errore nella validazione delle date rispetto alla sessione');
        }
    }

    /**
     * Valida che l'esame non cada di sabato, domenica o in un giorno festivo della sessione.
     */
    private validateExamNotOnWeekendOrHoliday(
        dateTimeStart: Date | string,
        dateTimeEnd: Date | string,
        session: Session,
        errors: string[]
    ): void {
        try {
            const start = new Date(dateTimeStart);
            const end = new Date(dateTimeEnd);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

            // Controlla ogni giorno dell'intervallo
            const current = new Date(start);
            current.setHours(0, 0, 0, 0);
            const endDay = new Date(end);
            endDay.setHours(0, 0, 0, 0);

            while (current <= endDay) {
                const dayOfWeek = current.getDay(); // 0 = Domenica, 6 = Sabato
                // Usa formato locale YYYY-MM-DD, non UTC, per evitare sfasamenti di fuso orario
                const year = current.getFullYear();
                const month = String(current.getMonth() + 1).padStart(2, '0');
                const day = String(current.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                if (dayOfWeek === 0) {
                    errors.push(`La data ${dateStr} è di domenica, non è possibile fissare appelli`);
                } else if (dayOfWeek === 6) {
                    errors.push(`La data ${dateStr} è di sabato, non è possibile fissare appelli`);
                } else if (session.holidays?.includes(dateStr)) {
                    errors.push(`La data ${dateStr} è un giorno festivo, non è possibile fissare appelli`);
                }

                current.setDate(current.getDate() + 1);
            }
        } catch (error) {
            this.logger.error(
                `Errore nella validazione weekend/festivi: ${error.message}`,
                error instanceof Error ? error.message : String(error)
            );
            errors.push('Errore nella validazione weekend/festivi');
        }
    }

    /**
     * Valida che la data odierna sia all'interno della finestra di inserimento della sessione.
     */
    private validateWithinInsertionWindow(
        session: Session,
        errors: string[]
    ): void {
        try {
            const startStr = new Date(session.dateStartInsertion)
                .toISOString()
                .slice(0, 10);
            const endStr = new Date(session.dateEndInsertion)
                .toISOString()
                .slice(0, 10);

            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            if (todayStr < startStr) {
                errors.push(
                    `La finestra di inserimento per questa sessione inizierà il ${startStr}`
                );
            }

            if (todayStr > endStr) {
                errors.push(
                    `La finestra di inserimento per questa sessione è terminata il ${endStr}`
                );
            }
        } catch (error) {
            this.logger.error(
                `Errore nella validazione della finestra di inserimento: ${error.message}`,
                error instanceof Error ? error.message : String(error)
            );
            errors.push('Errore nella validazione della finestra di inserimento');
        }
    }

    /**
     * Valida che non esistano conflitti con altri esami dello stesso anno del corso di laurea.
     */
    private async validateNoConflictsWithOtherExams(
        sessionId: number,
        dateTimeStart: Date | string,
        dateTimeEnd: Date | string,
        teachingId: number,
        coursesService: ServerCoursesService,
        examsRepository: ExamsRepository,
        errors: string[]
    ): Promise<void> {
        try {
            const teaching = await coursesService.getTeachingByID(teachingId);
            const degreeId = teaching.degree.id;
            const degreeYear = teaching.year;
            const exams = await examsRepository.findBySessionAndDegree(sessionId, degreeId, degreeYear);


            const conflictingExams = exams.filter((exam: Exam) => {
                const examDate = new Date(exam.dateTimeStart).toISOString().slice(0, 10);
                const newExamDate = new Date(dateTimeStart).toISOString().slice(0, 10);
                return examDate === newExamDate;
            });

            if (conflictingExams.length > 0) {
                const conflictDetails = conflictingExams
                    .map(e => `${e.teaching.subject.name} (${new Date(e.dateTimeStart).toLocaleDateString('it-IT')})`)
                    .join(', ');
                errors.push(`Esame in conflitto con: ${conflictDetails}`);
            }
        } catch (error) {
            this.logger.error(
                `Errore nel controllo dei conflitti con altri esami: ${error.message}`,
                error instanceof Error ? error.message : String(error)
            );
            errors.push('Errore nel controllo dei conflitti con altri esami');
        }
    }

    /**
     * Valida che non esistano conflitti con altri esami (escluso l'esame corrente).
     */
    private async validateNoConflictsWithOtherExamsForUpdate(
        sessionId: number,
        dateTimeStart: Date,
        dateTimeEnd: Date,
        teachingId: number,
        examId: number,
        coursesService: ServerCoursesService,
        examsRepository: ExamsRepository,
        errors: string[]
    ): Promise<void> {
        try {
            const teaching = await coursesService.getTeachingByID(teachingId);
            const degreeId = teaching.degree.id;
            const degreeYear = teaching.year;
            const exams = await examsRepository.findBySessionAndDegree(sessionId, degreeId, degreeYear);


            const conflictingExams = exams.filter((exam: Exam) => {
                // Esclude l'esame corrente dal controllo
                if (exam.id === examId) return false;

                const examDate = new Date(exam.dateTimeStart).toISOString().slice(0, 10);
                const newExamDate = new Date(dateTimeStart).toISOString().slice(0, 10);
                return examDate === newExamDate;
            });

            if (conflictingExams.length > 0) {
                const conflictDetails = conflictingExams
                    .map(e => `${e.teaching.subject.name} (${new Date(e.dateTimeStart).toLocaleDateString('it-IT')})`)
                    .join(', ');
                errors.push(`Esame in conflitto con: ${conflictDetails}`);
            }
        } catch (error) {
            this.logger.error(
                `Errore nel controllo dei conflitti con altri esami (update): ${error.message}`,
                error instanceof Error ? error.message : String(error)
            );
            errors.push('Errore nel controllo dei conflitti con altri esami');
        }
    }

    //////////////////////////////////////////////////////////////
    /// Metodo pubblico per il controllo conflitti (API) ///
    //////////////////////////////////////////////////////////////

    /**
     * Controlla se esistono conflitti con altri esami e restituisce i dettagli.
     * Usato dall\'endpoint GET /exams/check-conflicts per mostrare avvisi nel frontend.
     */
    async checkConflicts(
        sessionId: number,
        dateTimeStart: Date,
        dateTimeEnd: Date,
        teachingId: number,
        coursesService: ServerCoursesService,
        examsRepository: ExamsRepository,
        examId?: number
    ): Promise<string[]> {
        const conflicts: string[] = [];

        try {
            const teaching = await coursesService.getTeachingByID(teachingId);
            if (!teaching) return conflicts;

            const degreeId = teaching.degree.id;
            const degreeYear = teaching.year;

            const exams = await examsRepository.findBySessionAndDegree(
                sessionId,
                degreeId,
                degreeYear
            );

            const newExamDate = dateTimeStart.toISOString().slice(0, 10);

            for (const exam of exams) {
                // Esclude l'esame corrente (in caso di modifica)
                if (examId && exam.id === examId) continue;

                const examDate = new Date(exam.dateTimeStart).toISOString().slice(0, 10);

                if (examDate === newExamDate) {
                    const subjectName = exam.teaching?.subject?.name ?? `Appello #${exam.id}`;
                    conflicts.push(subjectName);
                }
            }
        } catch (error) {
            this.logger.error(
                `Errore nel controllo conflitti: ${error.message}`,
                error instanceof Error ? error.message : String(error)
            );
        }

        return conflicts;
    }
}
