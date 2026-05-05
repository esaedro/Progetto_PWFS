import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exam } from './exam.entity';
import { Repository } from 'typeorm';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { Session } from './session.entity';
import { Degree, Teaching } from '@server/courses';
import { Professor } from '@server/people';
// import { CreateExamDto } from './dto/create-exam.dto';
// import { UpdateExmaDto } from './dto/update-exam.dto';

@Injectable()
export class ExamsRepository {
    constructor(
        @InjectRepository(Exam)
        private readonly repository: Repository<Exam>) { }

    findById(id: number): Promise<Exam | null> {
        return this.repository.findOne({ where: { id } });
    }

    findAllBySession(session: Session): Promise<Exam[] | null> {
        return this.repository.find({ where: { session } });
    }

    findByDateAndDegreeYear(session: Session, dateStart: Date, dateEnd: Date, degree: Degree, degreeYear: number): Promise<Exam[]> {
        return this.repository.find({
            where: {
                session,
                dateTimeStart: dateStart,
                dateTimeEnd: dateEnd,
                teaching: {
                    degree,
                    year: degreeYear
                }
            },
            relations: ['teaching']
        });
    }

    findByProfessor(professor: Professor): Promise<Exam[]> {
        return this.repository.find({ where: { professor } });
    }

    findbyTeaching(teaching: Teaching): Promise<Exam[]> {
        return this.repository.find({ where: { teaching } });
    }

    findCalendarBySessionAndDegreeYear(session: Session, degree: Degree, degreeYear: number): Promise<Exam[]> {
        return this.repository.find({
            where: {
                session,
                teaching: {
                    degree,
                    year: degreeYear
                }
            },
            relations: ['teaching']
        });
    }

    async create(dto: CreateExamDto): Promise<Exam> {
        const exam = this.repository.create({
            dateTimeStart: dto.dateTimeStart,
            dateTimeEnd: dto.dateTimeEnd,
            room: dto.room,
            description: dto.description,
            partial: dto.partial,
            type: dto.type,
            teaching: dto.teaching,
            professor: dto.professor,
            session: dto.session
        });

        return this.repository.save(exam);
    }

    async save(exam: Exam): Promise<Exam> {
        return this.repository.save(exam);
    }

    async update(examId: number, dto: UpdateExamDto): Promise<Exam> {
        const exam = await this.findById(examId);
        if (!exam) {
            throw new Error('Esame non trovato');
        }

        if (dto.dateTimeStart !== undefined) exam.dateTimeStart = dto.dateTimeStart;
        if (dto.dateTimeEnd !== undefined) exam.dateTimeEnd = dto.dateTimeEnd;
        if (dto.room !== undefined) exam.room = dto.room;
        if (dto.description !== undefined) exam.description = dto.description;
        if (dto.partial !== undefined) exam.partial = dto.partial;
        if (dto.type !== undefined) exam.type = dto.type;
        if (dto.teaching !== undefined) exam.teaching = dto.teaching;
        if (dto.professor !== undefined) exam.professor = dto.professor;
        if (dto.session !== undefined) exam.session = dto.session;

        return this.repository.save(exam);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    async existsConflictInSameYear(session: Session, dateTimeStart: Date, dateTimeEnd: Date, degree: Degree, degreeYear: number): Promise<boolean> {
        const exams = await this.repository.find({
            where: {
                session,
                teaching: {
                    degree,
                    year: degreeYear
                }
            },
            relations: ['teaching']
        });

        const newStart = dateTimeStart.getTime();
        const newEnd = dateTimeEnd.getTime();

        return exams.some(exam => {
            const examStart = exam.dateTimeStart.getTime();
            const examEnd = exam.dateTimeEnd.getTime();
            return examStart < newEnd && examEnd > newStart;
        });
    }

    async existsConflictInSameRoom(session: Session, dateTimeStart: Date, dateTimeEnd: Date, room: string): Promise<boolean> {
        const exams = await this.repository.find({
            where: {
                session,
                room
            }
        });

        const newStart = dateTimeStart.getTime();
        const newEnd = dateTimeEnd.getTime();

        return exams.some(exam => {
            const examStart = exam.dateTimeStart.getTime();
            const examEnd = exam.dateTimeEnd.getTime();
            return examStart < newEnd && examEnd > newStart;
        });
    }
}
