import { forwardRef, Inject, Injectable } from '@nestjs/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ServerCoursesService } from '@server/courses';
import { ExamsRepository } from './exams.repository';
import { Exam } from './exam.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { SessionsRepository } from './sessions.repository';

@Injectable()
export class ServerExamsService {
    constructor(
        @Inject(forwardRef(() => ServerCoursesService))
        private readonly coursesService: ServerCoursesService,
        private readonly examsRepository: ExamsRepository,
        private readonly sessionsRepository: SessionsRepository
    ) { }

    async create(dto: CreateExamDto): Promise<Exam> {
        if (await this.existsConflictInSameYear(dto.sessionId, dto.dateTimeStart, dto.dateTimeEnd, dto.teachingId)) {
            throw new Error('Esame in conflitto con un altro esame dello stesso anno del corso di laurea');
        }

        return this.examsRepository.create(dto);
    }

    async update(examId: number, dto: UpdateExamDto): Promise<Exam> {
        const exam = await this.examsRepository.findById(examId);
        if (!exam) {
            throw new Error(`Esame con id ${examId} non trovato`);
        }

        const sessionId = dto.sessionId !== undefined ? dto.sessionId : exam.session.id;
        const dateTimeStart = dto.dateTimeStart !== undefined ? dto.dateTimeStart : exam.dateTimeStart;
        const dateTimeEnd = dto.dateTimeEnd !== undefined ? dto.dateTimeEnd : exam.dateTimeEnd;
        const teachingId = dto.teachingId !== undefined ? dto.teachingId : exam.teaching.id;

        if (await this.existsConflictInSameYear(sessionId, dateTimeStart, dateTimeEnd, teachingId)) {
            throw new Error('Esame in conflitto con un altro esame dello stesso anno del corso di laurea');
        }

        const date1 = dto.dateTimeStart !== undefined ? dto.dateTimeStart : exam.dateTimeStart;
        const date2 = dto.dateTimeEnd !== undefined ? dto.dateTimeEnd : exam.dateTimeEnd;
        if (date1 >= date2) {
            throw new Error('La data di inizio deve essere precedente alla data di fine');
        }

        return this.examsRepository.update(exam, dto);
    }

    async delete(examId: number): Promise<void> {
        const exam = await this.examsRepository.findById(examId);
        if (!exam) {
            throw new Error(`Esame con id ${examId} non trovato`);
        }

        await this.examsRepository.delete(examId);
    }

    async findById(id: number): Promise<Exam | null> {
        return this.examsRepository.findById(id);
    }

    async findAll(): Promise<Exam[]> {
        return this.examsRepository.findAll();
    }

    async findBySessionAndDegree(sessionId: number, degreeId: number, degreeYear: number): Promise<Exam[]> {
        return this.examsRepository.findBySessionAndDegree(sessionId, degreeId, degreeYear);
    }

    async findBySession(sessionId: number): Promise<Exam[] | null> {
        const session = await this.sessionsRepository.findById(sessionId);

        if (!session) {
            throw new Error(`Sessione con id ${sessionId} non trovata`);
        }

        return this.examsRepository.findBySession(session);
    }

    async findByProfessor(professorId: number): Promise<Exam[]> {
        return this.examsRepository.findByProfessor(professorId);
    }

    async findByTeaching(teachingId: number): Promise<Exam[]> {
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
}
