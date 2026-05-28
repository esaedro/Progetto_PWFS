import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ServerCoursesService } from '@server/courses';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam } from './exam.entity';
import { SessionsRepository } from './sessions.repository';
import { ExamsRepository } from './exams.repository';

@Injectable()
export class ExamValidationService {
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

        // 1. Validazione del professore e dell'insegnamento
        await this.validateProfessorAndTeaching(dto.professorId, dto.teachingId, coursesService, errors);

        // 2. Validazione della sessione
        const session = await this.validateSession(dto.sessionId, sessionsRepository, errors);

        // 3. Validazione delle date dell'esame (formato e logica)
        this.validateExamDates(dto.dateTimeStart, dto.dateTimeEnd, errors);

        // 4. Validazione dell'esame all'interno della finestra di esaminazione della sessione
        if (session) {
            this.validateExamWithinSessionWindow(dto.dateTimeStart, dto.dateTimeEnd, session, errors);
        }

        // Se ci sono errori, lancia un'eccezione con tutti gli errori
        if (errors.length > 0) {
            throw new ForbiddenException(errors);
        }

        // 5. Validazione dei conflitti con altri esami (check finale, dopo tutti gli altri controlli)
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
        const professorId = exam.professor.professor_id;
        const teachingId = dto.teachingId !== undefined ? dto.teachingId : exam.teaching.id;
        const sessionId = dto.sessionId !== undefined ? dto.sessionId : exam.session.id;
        const dateTimeStart = dto.dateTimeStart !== undefined ? new Date(dto.dateTimeStart) : exam.dateTimeStart;
        const dateTimeEnd = dto.dateTimeEnd !== undefined ? new Date(dto.dateTimeEnd) : exam.dateTimeEnd;

        const errors: string[] = [];

        // 1. Validazione dell'insegnamento (se modificato)
        if (dto.teachingId !== undefined) {
            try {
                await coursesService.getTeachingByID(teachingId);
            } catch (error) {
                errors.push('L\'insegnamento specificato non esiste');
            }
        }

        // 2. Validazione della sessione (se modificata)
        let session = null;
        if (dto.sessionId !== undefined) {
            session = await this.validateSession(sessionId, sessionsRepository, errors);
        } else {
            session = exam.session;
        }

        // 3. Validazione delle date dell'esame (se modificate)
        if (dto.dateTimeStart !== undefined || dto.dateTimeEnd !== undefined) {
            this.validateExamDates(dateTimeStart, dateTimeEnd, errors);
        }

        // 4. Validazione dell'esame all'interno della finestra di esaminazione della sessione
        if (session) {
            this.validateExamWithinSessionWindow(dateTimeStart, dateTimeEnd, session, errors);
        }

        if (errors.length > 0) {
            throw new ForbiddenException(errors);
        }

        // 5. Validazione dei conflitti con altri esami (escludi l'esame corrente dal controllo)
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
    ): Promise<any | null> {
        try {
            const session = await sessionsRepository.findById(sessionId);
            if (!session) {
                errors.push(`Sessione con id ${sessionId} non trovata`);
                return null;
            }
            return session;
        } catch (error) {
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
            errors.push('Errore nella validazione delle date dell\'esame');
        }
    }

    /**
     * Valida che l'esame sia all'interno della finestra di esaminazione della sessione.
     */
    private validateExamWithinSessionWindow(
        dateTimeStart: Date | string,
        dateTimeEnd: Date | string,
        session: any,
        errors: string[]
    ): void {
        try {
            const examStart = new Date(dateTimeStart);
            const examEnd = new Date(dateTimeEnd);
            const sessionStart = new Date(session.dateStartExamination);
            const sessionEnd = new Date(session.dateEndExamination);

            if (isNaN(examStart.getTime()) || isNaN(examEnd.getTime())) {
                // Gli errori sono già stati aggiunti da validateExamDates
                return;
            }

            if (examStart < sessionStart) {
                errors.push('La data di inizio dell\'esame è precedente alla data di inizio esaminazione della sessione');
            }

            if (examEnd > sessionEnd) {
                errors.push('La data di fine dell\'esame è successiva alla data di fine esaminazione della sessione');
            }
        } catch (error) {
            errors.push('Errore nella validazione delle date rispetto alla sessione');
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

            const newStart = new Date(dateTimeStart).getTime();
            const newEnd = new Date(dateTimeEnd).getTime();

            const conflictingExams = exams.filter((exam: Exam) => {
                const examStart = new Date(exam.dateTimeStart).getTime();
                const examEnd = new Date(exam.dateTimeEnd).getTime();
                return examStart < newEnd && examEnd > newStart;
            });

            if (conflictingExams.length > 0) {
                const conflictDetails = conflictingExams
                    .map(e => `${e.teaching.name} (${new Date(e.dateTimeStart).toLocaleString()})`)
                    .join(', ');
                errors.push(`Esame in conflitto con: ${conflictDetails}`);
            }
        } catch (error) {
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

            const newStart = new Date(dateTimeStart).getTime();
            const newEnd = new Date(dateTimeEnd).getTime();

            const conflictingExams = exams.filter((exam: Exam) => {
                // Esclude l'esame corrente dal controllo
                if (exam.id === examId) return false;

                const examStart = new Date(exam.dateTimeStart).getTime();
                const examEnd = new Date(exam.dateTimeEnd).getTime();
                return examStart < newEnd && examEnd > newStart;
            });

            if (conflictingExams.length > 0) {
                const conflictDetails = conflictingExams
                    .map(e => `${e.teaching.name} (${new Date(e.dateTimeStart).toLocaleString()})`)
                    .join(', ');
                errors.push(`Esame in conflitto con: ${conflictDetails}`);
            }
        } catch (error) {
            errors.push('Errore nel controllo dei conflitti con altri esami');
        }
    }
}
