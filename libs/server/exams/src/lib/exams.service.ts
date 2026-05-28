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
import { ExamValidationService } from './exam-validation.service';
import { SessionValidationService } from './session-validation.service';

@Injectable()
export class ServerExamsService {
    constructor(
        @Inject(forwardRef(() => ServerCoursesService))
        private readonly coursesService: ServerCoursesService,
        private readonly examsRepository: ExamsRepository,
        private readonly sessionsRepository: SessionsRepository,
        private readonly examValidationService: ExamValidationService,
        private readonly sessionValidationService: SessionValidationService
    ) { }

    ////////////////////
    /// Exam section ///
    ////////////////////

    async createExam(dto: CreateExamDto): Promise<Exam> {
        await this.examValidationService.validateForCreate(
            dto,
            this.coursesService,
            this.sessionsRepository,
            this.examsRepository
        );

        return this.examsRepository.create(dto);
    }

    async updateExam(examId: number, dto: UpdateExamDto, professorId?: number): Promise<Exam> {
        const exam = await this.examsRepository.findById(examId);
        if (!exam) {
            throw new NotFoundException(`Esame con id ${examId} non trovato`);
        }

        // Verifica che il professore loggato sia il proprietario dell'esame
        if (professorId && exam.professor.professor_id !== professorId) {
            throw new ForbiddenException('Non puoi aggiornare un esame di un altro professore');
        }

        await this.examValidationService.validateForUpdate(
            dto,
            exam,
            this.coursesService,
            this.sessionsRepository,
            this.examsRepository
        );

        return this.examsRepository.update(exam, dto);
    }

    async deleteExam(examId: number, professorId?: number): Promise<void> {
        const exam = await this.examsRepository.findById(examId);
        if (!exam) {
            throw new NotFoundException(`Esame con id ${examId} non trovato`);
        }

        // Verifica che il professore loggato sia il proprietario dell'esame
        if (professorId && exam.professor.professor_id !== professorId) {
            throw new ForbiddenException('Non puoi cancellare un esame di un altro professore');
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

    ///////////////////////
    /// Session section ///
    ///////////////////////

    async createSession(dto: CreateSessionDto): Promise<Session> {
        await this.sessionValidationService.validateForCreate(dto);
        return this.sessionsRepository.create(dto);
    }

    async updateSession(sessionId: number, dto: UpdateSessionDto): Promise<Session> {
        const session = await this.sessionsRepository.findById(sessionId);

        if (!session) {
            throw new NotFoundException(`Sessione con id ${sessionId} non trovata`);
        }

        await this.sessionValidationService.validateForUpdate(dto, session);
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
}
