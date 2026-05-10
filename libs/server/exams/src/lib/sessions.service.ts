import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionsRepository } from './sessions.repository';
import { Session } from './session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class ServerSessionsService {
    constructor(
        @InjectRepository(SessionsRepository)
        private readonly sessionsRepository: SessionsRepository
    ) { }

    async create(dto: CreateSessionDto): Promise<Session> {

        if (this.checkDateOverlapOrInversion(dto.dateStartInsertion, dto.dateEndInsertion, dto.dateStartExamination, dto.dateEndExamination)) {
            throw new Error('Le date di inserimento e di esaminazione si sovrappongono o sono invertite');
        }

        return this.sessionsRepository.create(dto);
    }

    async update(sessionId: number, dto: UpdateSessionDto): Promise<Session> {
        const session = await this.sessionsRepository.findById(sessionId);

        if (!session) {
            throw new Error(`Sessione con id ${sessionId} non trovata`);
        }

        const date1 = dto.dateStartInsertion !== undefined ? dto.dateStartInsertion : session.dateStartInsertion;
        const date2 = dto.dateEndInsertion !== undefined ? dto.dateEndInsertion : session.dateEndInsertion;
        const date3 = dto.dateStartExamination !== undefined ? dto.dateStartExamination : session.dateStartExamination;
        const date4 = dto.dateEndExamination !== undefined ? dto.dateEndExamination : session.dateEndExamination;

        if (this.checkDateOverlapOrInversion(date1, date2, date3, date4)) {
            throw new Error('Le date di inserimento e di esaminazione si sovrappongono o sono invertite');
        }

        return this.sessionsRepository.update(session, dto);
    }

    async delete(sessionId: number): Promise<void> {
        const session = await this.sessionsRepository.findById(sessionId);

        if (!session) {
            throw new Error(`Sessione con id ${sessionId} non trovata`);
        }

        await this.sessionsRepository.delete(sessionId);
    }

    async findById(id: number): Promise<Session | null> {
        return this.sessionsRepository.findById(id);
    }

    async findAll(): Promise<Session[]> {
        return this.sessionsRepository.findAll();
    }

    async findCurrentPlanningWindow(): Promise<Session | null> {
        return this.sessionsRepository.findCurrentPlanningWindow();
    }

    async findCurrentExaminationWindow(): Promise<Session | null> {
        return this.sessionsRepository.findCurrentExaminationWindow();
    }

    checkDateOverlapOrInversion(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
        return (start1 < end2 && start2 < end1) || (start1 > end2);
    }
}
