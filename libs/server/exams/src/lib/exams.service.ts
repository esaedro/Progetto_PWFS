import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServerCoursesService } from '@server/courses';
import { ExamsRepository } from './exams.repository';
import { Exam } from './exam.entity';
import { CreateExamDto } from './dto/create-exam.dto';

@Injectable()
export class ServerExamsService {
    constructor(
        private readonly coursesService: ServerCoursesService,
        @InjectRepository(ExamsRepository)
        private readonly examsRepository: ExamsRepository
    ) { }

    async create(dto: CreateExamDto): Promise<Exam> {
        if (await this.existsConflictInSameYear(dto.sessionId, dto.dateTimeStart, dto.dateTimeEnd, dto.teachingId)) {
            throw new Error('Esame in conflitto con un altro esame dello stesso anno del corso di laurea');
        }

        return this.examsRepository.create(dto);
    }

    async update(examId: number, dto: CreateExamDto): Promise<Exam> {
        const exam = await this.examsRepository.findById(examId);
        if (!exam) {
            throw new Error(`Esame con id ${examId} non trovato`);
        }

        if (await this.existsConflictInSameYear(dto.sessionId, dto.dateTimeStart, dto.dateTimeEnd, dto.teachingId)) {
            throw new Error('Esame in conflitto con un altro esame dello stesso anno del corso di laurea');
        }

        const date1 = dto.dateTimeStart !== undefined ? dto.dateTimeStart : exam.dateTimeStart;
        const date2 = dto.dateTimeEnd !== undefined ? dto.dateTimeEnd : exam.dateTimeEnd;
        if (date1 >= date2) {
            throw new Error('La data di inizio deve essere precedente alla data di fine');
        }

        return this.examsRepository.update(exam, dto);
    }

    async existsConflictInSameYear(sessionId: number, dateTimeStart: Date, dateTimeEnd: Date, teachingId: number): Promise<boolean> {
        const teaching = await this.coursesService.getTeachingById(teachingId);
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
