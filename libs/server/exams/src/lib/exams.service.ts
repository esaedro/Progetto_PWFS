import { ConflictException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ServerCoursesService } from '@server/courses';
import { ExamsRepository } from './exams.repository';
import { Exam } from './exam.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { SessionsRepository } from './sessions.repository';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session } from './session.entity';

@Injectable()
export class ServerExamsService {
    constructor(
        @Inject(forwardRef(() => ServerCoursesService))
        private readonly coursesService: ServerCoursesService,
        private readonly examsRepository: ExamsRepository,
        private readonly sessionsRepository: SessionsRepository
    ) { }

    ////////////////////
    /// Exam section ///
    ////////////////////

    async createExam(dto: CreateExamDto): Promise<Exam> {
        if (await this.existsConflictInSameYear(dto.sessionId, dto.dateTimeStart, dto.dateTimeEnd, dto.teachingId)) {
            throw new ConflictException('Esame in conflitto con un altro esame dello stesso anno del corso di laurea');
        }

        return this.examsRepository.create(dto);
    }

    async updateExam(examId: number, dto: UpdateExamDto): Promise<Exam> {
        const exam = await this.examsRepository.findById(examId);
        if (!exam) {
            throw new NotFoundException(`Esame con id ${examId} non trovato`);
        }

        const sessionId = dto.sessionId !== undefined ? dto.sessionId : exam.session.id;
        const dateTimeStart = dto.dateTimeStart !== undefined ? dto.dateTimeStart : exam.dateTimeStart;
        const dateTimeEnd = dto.dateTimeEnd !== undefined ? dto.dateTimeEnd : exam.dateTimeEnd;
        const teachingId = dto.teachingId !== undefined ? dto.teachingId : exam.teaching.id;

        if (await this.existsConflictInSameYear(sessionId, dateTimeStart, dateTimeEnd, teachingId)) {
            throw new ConflictException('Esame in conflitto con un altro esame dello stesso anno del corso di laurea');
        }

        const date1 = dto.dateTimeStart !== undefined ? dto.dateTimeStart : exam.dateTimeStart;
        const date2 = dto.dateTimeEnd !== undefined ? dto.dateTimeEnd : exam.dateTimeEnd;
        if (date1 >= date2) {
            throw new ForbiddenException('La data di inizio deve essere precedente alla data di fine');
        }

        return this.examsRepository.update(exam, dto);
    }

    async deleteExam(examId: number): Promise<void> {
        const exam = await this.examsRepository.findById(examId);
        if (!exam) {
            throw new NotFoundException(`Esame con id ${examId} non trovato`);
        }

        await this.examsRepository.delete(examId);
    }

    async findExamById(id: number): Promise<Exam | null> {
        return this.examsRepository.findById(id);
    }

    async findAllExams(): Promise<Exam[]> {
        return this.examsRepository.findAll();
    }

    async findExamsBySessionAndDegree(sessionId: number, degreeId: number, degreeYear: number): Promise<Exam[]> {
        return this.examsRepository.findBySessionAndDegree(sessionId, degreeId, degreeYear);
    }

    async findExamsBySession(sessionId: number): Promise<Exam[] | null> {
        const session = await this.sessionsRepository.findById(sessionId);

        if (!session) {
            throw new NotFoundException(`Sessione con id ${sessionId} non trovata`);
        }

        return this.examsRepository.findBySession(session);
    }

    async findExamsByProfessor(professorId: number): Promise<Exam[]> {
        return this.examsRepository.findByProfessor(professorId);
    }

    async findExamsByTeaching(teachingId: number): Promise<Exam[]> {
        return this.examsRepository.findbyTeaching(teachingId);
    }

    async existsConflictInSameYear(sessionId: number, dateTimeStart: Date, dateTimeEnd: Date, teachingId: number): Promise<boolean> {
        const teaching = await this.coursesService.getTeachingByID(teachingId);
        const degreeId = teaching.degree.id;
        const degreeYear = teaching.year;
        const exams = await this.examsRepository.findBySessionAndDegree(sessionId, degreeId, degreeYear);

        const newStart = dateTimeStart.getTime();
        const newEnd = dateTimeEnd.getTime();

        return exams.some((exam: Exam) => {
            const examStart = exam.dateTimeStart.getTime();
            const examEnd = exam.dateTimeEnd.getTime();
            return examStart < newEnd && examEnd > newStart;
        });
    }

    ///////////////////////
    /// Session section ///
    ///////////////////////

    async createSession(dto: CreateSessionDto): Promise<Session> {

        if (!this.checkDateIsFuture(dto.dateStartInsertion) || !this.checkDateIsFuture(dto.dateEndInsertion) || !this.checkDateIsFuture(dto.dateStartExamination) || !this.checkDateIsFuture(dto.dateEndExamination)) {
            throw new ForbiddenException('Le date non possono essere nel passato');
        }

        if (this.checkDateOverlapOrInversion(dto.dateStartInsertion, dto.dateEndInsertion, dto.dateStartExamination, dto.dateEndExamination)) {
            throw new ConflictException('Le date di inserimento e di esaminazione si sovrappongono o sono invertite');
        }

        return this.sessionsRepository.create(dto);
    }

    async updateSession(sessionId: number, dto: UpdateSessionDto): Promise<Session> {
        const session = await this.sessionsRepository.findById(sessionId);

        if (!session) {
            throw new NotFoundException(`Sessione con id ${sessionId} non trovata`);
        }

        const date1 = dto.dateStartInsertion !== undefined ? dto.dateStartInsertion : session.dateStartInsertion;
        const date2 = dto.dateEndInsertion !== undefined ? dto.dateEndInsertion : session.dateEndInsertion;
        const date3 = dto.dateStartExamination !== undefined ? dto.dateStartExamination : session.dateStartExamination;
        const date4 = dto.dateEndExamination !== undefined ? dto.dateEndExamination : session.dateEndExamination;

        if (!this.checkDateIsFuture(date1) || !this.checkDateIsFuture(date2) || !this.checkDateIsFuture(date3) || !this.checkDateIsFuture(date4)) {
            throw new ForbiddenException('Le date non possono essere nel passato');
        }

        if (this.checkDateOverlapOrInversion(date1, date2, date3, date4)) {
            throw new ConflictException('Le date di inserimento e di esaminazione si sovrappongono o sono invertite');
        }

        return this.sessionsRepository.update(session, dto);
    }

    async deleteSession(sessionId: number): Promise<void> {
        const session = await this.sessionsRepository.findById(sessionId);

        if (!session) {
            throw new NotFoundException(`Sessione con id ${sessionId} non trovata`);
        }

        await this.sessionsRepository.delete(sessionId);
    }

    async findSessionById(id: number): Promise<Session | null> {
        return this.sessionsRepository.findById(id);
    }

    async findAllSessions(): Promise<Session[]> {
        return this.sessionsRepository.findAll();
    }

    async findSessionByCurrentPlanningWindow(): Promise<Session | null> {
        return this.sessionsRepository.findCurrentPlanningWindow();
    }

    async findSessionByCurrentExaminationWindow(): Promise<Session | null> {
        return this.sessionsRepository.findCurrentExaminationWindow();
    }

    checkDateOverlapOrInversion(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
        return (start1 < end2 && start2 < end1) || (start1 > end2);
    }

    checkDateIsFuture(date: Date): boolean {
        const now = new Date();
        return date > now;
    }
}
