import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Session } from "./session.entity";
import { CreateSessionDto } from "./dto/create-session.dto";
import { UpdateSessionDto } from "./dto/update-session.dto";

@Injectable()
export class SessionsRepository {
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

    async update(session: Session, dto: UpdateSessionDto): Promise<Session> {
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

    async findCurrentExaminationWindow(): Promise<Session | null> {
        const today = new Date();
        return this.repository.findOne({
            where: {
                dateStartExamination: LessThanOrEqual(today),
                dateEndExamination: MoreThanOrEqual(today)
            }
        });
    }
}
