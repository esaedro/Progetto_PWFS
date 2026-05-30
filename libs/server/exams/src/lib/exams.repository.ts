import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exam } from './exam.entity';
import { Repository } from 'typeorm';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { Session } from './session.entity';
import { Teaching } from '@server/courses/teaching.entity';
import { Professor } from '@server/people/professor.entity';
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

    findAll(): Promise<Exam[]> {
        return this.repository.find();
    }

    findBySession(session: Session): Promise<Exam[] | null> {
        return this.repository.find({ where: { session } });
    }

    findByDateAndDegreeYear(sessionId: number, dateStart: Date, dateEnd: Date, degreeId: number, degreeYear: number): Promise<Exam[]> {
        return this.repository.find({
            where: {
                session: { id: sessionId },
                dateTimeStart: dateStart,
                dateTimeEnd: dateEnd,
                teaching: {
                    degree: { id: degreeId },
                    year: degreeYear
                }
            },
            relations: ['teaching']
        });
    }

    findByProfessor(professorId: number): Promise<Exam[]> {
        return this.repository.find({ where: { professor: { professor_id: professorId } } });
    }

    findbyTeaching(teachingId: number): Promise<Exam[]> {
        return this.repository.find({ where: { teaching: { id: teachingId } } });
    }

    findBySessionAndDegree(sessionId: number, degreeId: number, degreeYear: number): Promise<Exam[]> {
        return this.repository.find({
            where: {
                session: { id: sessionId },
                teaching: {
                    degree: { id: degreeId },
                    year: degreeYear
                }
            },
            relations: ['teaching']
        });
    }

    async create(dto: CreateExamDto): Promise<Exam> {
        if (dto.dateTimeStart >= dto.dateTimeEnd) {
            throw new Error('La data di inizio deve essere precedente alla data di fine');
        }
        const exam = this.repository.create({
            dateTimeStart: dto.dateTimeStart,
            dateTimeEnd: dto.dateTimeEnd,
            room: dto.room,
            description: dto.description,
            partial: dto.partial,
            type: dto.type,
            teaching: { id: dto.teachingId },
            professor: { professor_id: dto.professorId },
            session: { id: dto.sessionId }
        });

        return this.repository.save(exam);
    }

    async save(exam: Exam): Promise<Exam> {
        return this.repository.save(exam);
    }

    async update(exam: Exam, dto: UpdateExamDto): Promise<Exam> {

        if (dto.dateTimeStart !== undefined) exam.dateTimeStart = dto.dateTimeStart;
        if (dto.dateTimeEnd !== undefined) exam.dateTimeEnd = dto.dateTimeEnd;
        if (dto.room !== undefined) exam.room = dto.room;
        if (dto.description !== undefined) exam.description = dto.description;
        if (dto.partial !== undefined) exam.partial = dto.partial;
        if (dto.type !== undefined) exam.type = dto.type;
        if (dto.teachingId !== undefined) exam.teaching = { id: dto.teachingId } as Teaching;
        if (dto.professorId !== undefined) exam.professor = { professor_id: dto.professorId } as Professor;
        if (dto.sessionId !== undefined) exam.session = { id: dto.sessionId } as Session;

        return this.repository.save(exam);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    //
    // Probabilmente non serve perché non dobbiamo gestire le aule
    //
    // async existsConflictInSameRoom(sessionId: number, dateTimeStart: Date, dateTimeEnd: Date, room: string): Promise<boolean> {
    //     const exams = await this.repository.find({
    //         where: {
    //             session: { id: sessionId },
    //             room
    //         }
    //     });

    //     const newStart = dateTimeStart.getTime();
    //     const newEnd = dateTimeEnd.getTime();

    //     return exams.some(exam => {
    //         const examStart = exam.dateTimeStart.getTime();
    //         const examEnd = exam.dateTimeEnd.getTime();
    //         return examStart < newEnd && examEnd > newStart;
    //     });
    // }
}
