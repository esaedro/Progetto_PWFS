import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exam } from './exam.entity';
import { Repository } from 'typeorm';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { Session } from './session.entity';
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

    findByDateAndDegreeYear(sessionId: number, date: Date, degreeId: number, degreeYear: number): Promise<Exam[]> {
        return this.repository.find({
            where: {
                sessionId,
                dateTime: date,
                teaching: {
                    degreeId,
                    degreeYear
                }
            },
            relations: ['teaching']
        });
    }

    findByProfessor(professorId: number): Promise<Exam[]> {
        return this.repository.find({ where: { professorId } });
    }

    findbyTeaching(teachingId: number): Promise<Exam[]> {
        return this.repository.find({ where: { teachingId } });
    }

    findCalendarBySessionAndDegreeYear(sessionId: number, degreeId: number, degreeYear: number): Promise<Exam[]> {
        return this.repository.find({
            where: {
                sessionId,
                teaching: {
                    degreeId,
                    degreeYear
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
            teachingId: dto.teachingId,
            professorId: dto.professorId,
            sessionId: dto.sessionId
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
        if (dto.teachingId !== undefined) exam.teachingId = dto.teachingId;
        if (dto.professorId !== undefined) exam.professorId = dto.professorId;
        if (dto.sessionId !== undefined) exam.sessionId = dto.sessionId;

        return this.repository.save(exam);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    async existsConflictInSameYear(sessionId: number, dateTimeStart: Date, dateTimeEnd: Date, degreeId: number, degreeYear: number): Promise<boolean> {
        const exams = await this.repository.find({
            where: {
                sessionId,
                teaching: {
                    degreeId,
                    degreeYear
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

    async existsConflictInSameRoom(sessionId: number, dateTimeStart: Date, dateTimeEnd: Date, room: string): Promise<boolean> {
        const exams = await this.repository.find({
            where: {
                sessionId,
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

    async createOne(dto: CreateExamDto, passwordHash: string): Promise<Exam> {
        const user = this.repository.create({
            name: dto.name,
            email: dto.email,
            passwordHash: passwordHash,
            role: dto.role
        });
        return this.repository.save(user);
    }

    findAll(role?: UserRole): Promise<Exam[]> {
        if (role) {
            return this.repository.find({
                where: { role },
                order: { id: 'ASC' },
            });
        }
        return this.repository.find({ order: { id: 'ASC' } });
    }

    async updateOne(id: number, dto: UpdateUserDto): Promise<Exam | null> {
        const user = await this.findById(id);
        if (!user)
            return null;
        if (dto.name !== undefined) user.name = dto.name;
        if (dto.email !== undefined) user.email = dto.email;
        if (dto.role !== undefined) user.role = dto.role;

        return this.repository.save(user);
    }

    async deleteOne(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }
}
