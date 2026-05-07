import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Session } from "./session.entity";
import { CreateSessionDto } from "./dto/create-session.dto";
import { UpdateSessionDto } from "./dto/update-session.dto";

@Injectable()
export class SessionRepository {
    constructor(
        @InjectRepository(Session)
        private readonly repository: Repository<Session>) { }

    async findById(id: number): Promise<Session | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findAll(): Promise<Session[]> {
        return this.repository.find();
    }

    async create(dto: CreateSessionDto): Promise<Session> {
        if (this.checkDateOverlapOrInversion(dto.dateStartInsertion, dto.dateEndInsertion, dto.dateStartExamination, dto.dateEndExamination)) {
            throw new Error('Le date di inserimento e di esame si sovrappongono o sono invertite');
        }

        const session = this.repository.create({
            dateStartInsertion: dto.dateStartInsertion,
            dateEndInsertion: dto.dateEndInsertion,
            dateStartExamination: dto.dateStartExamination,
            dateEndExamination: dto.dateEndExamination
        })

        return this.repository.save(session);
    }

    async save(session: Session): Promise<Session> {
        return this.repository.save(session);
    }

    async update(sessionId: number, dto: UpdateSessionDto): Promise<Session> {
        const session = await this.repository.findOne({ where: { id: sessionId } });

        if (!session) {
            throw new Error(`Sessione con id ${sessionId} non trovata`);
        }

        const date1 = dto.dateStartInsertion !== undefined ? dto.dateStartInsertion : session.dateStartInsertion;
        const date2 = dto.dateEndInsertion !== undefined ? dto.dateEndInsertion : session.dateEndInsertion;
        const date3 = dto.dateStartExamination !== undefined ? dto.dateStartExamination : session.dateStartExamination;
        const date4 = dto.dateEndExamination !== undefined ? dto.dateEndExamination : session.dateEndExamination;
        if (this.checkDateOverlapOrInversion(date1, date2, date3, date4)) {
            throw new Error('Le date di inserimento e di esame si sovrappongono o sono invertite');
        }

        if (dto.dateStartInsertion !== undefined) session.dateStartInsertion = dto.dateStartInsertion;
        if (dto.dateEndInsertion !== undefined) session.dateEndInsertion = dto.dateEndInsertion;
        if (dto.dateStartExamination !== undefined) session.dateStartExamination = dto.dateStartExamination;
        if (dto.dateEndExamination !== undefined) session.dateEndExamination = dto.dateEndExamination;

        return this.repository.save(session);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    async findCurrentPlanningWindow(): Promise<Session | null> {
        const today = new Date();
        return this.repository.findOne({
            where: {
                dateStartInsertion: LessThanOrEqual(today),
                dateEndInsertion: MoreThanOrEqual(today)
            }
        });
    }

    async findCurrentSession(): Promise<Session | null> {
        const today = new Date();
        return this.repository.findOne({
            where: {
                dateStartExamination: LessThanOrEqual(today),
                dateEndExamination: MoreThanOrEqual(today)
            }
        });
    }

    checkDateOverlapOrInversion(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
        return (start1 < end2 && start2 < end1) || (start1 > end2);
    }
}
