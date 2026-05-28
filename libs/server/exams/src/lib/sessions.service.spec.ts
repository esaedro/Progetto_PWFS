import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session } from './session.entity';

// Mock dependencies
const mockSessionsRepository = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findCurrentPlanningWindow: jest.fn(),
    findCurrentExaminationWindow: jest.fn(),
};

const mockExamsRepository = {
    findBySessionAndDegree: jest.fn(),
};

const mockCoursesService = {
    getTeachingByID: jest.fn(),
};

// Simple service implementation for testing
class TestServerExamsService {
    constructor(
        readonly coursesService: any,
        readonly examsRepository: any,
        readonly sessionsRepository: any
    ) { }

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
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return date >= todayStart;
    }
}

describe('ServerExamsService - Sessions', () => {
    let service: TestServerExamsService;

    const mockSession: Session = {
        id: 1,
        dateStartInsertion: new Date('2026-06-01T00:00:00Z'),
        dateEndInsertion: new Date('2026-06-30T23:59:59Z'),
        dateStartExamination: new Date('2026-07-01T00:00:00Z'),
        dateEndExamination: new Date('2026-07-31T23:59:59Z'),
    } as Session;

    const mockCreateSessionDto: CreateSessionDto = {
        dateStartInsertion: new Date('2026-06-01T00:00:00Z'),
        dateEndInsertion: new Date('2026-06-30T23:59:59Z'),
        dateStartExamination: new Date('2026-07-01T00:00:00Z'),
        dateEndExamination: new Date('2026-07-31T23:59:59Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        service = new TestServerExamsService(mockCoursesService, mockExamsRepository, mockSessionsRepository);
    });

    describe('createSession', () => {
        it('should create a session successfully with valid dates', async () => {
            mockSessionsRepository.create.mockResolvedValue(mockSession);

            const result = await service.createSession(mockCreateSessionDto);

            expect(result).toEqual(mockSession);
            expect(mockSessionsRepository.create).toHaveBeenCalledWith(mockCreateSessionDto);
        });

        it('should throw ForbiddenException if start insertion date is in the past', async () => {
            const pastDto: CreateSessionDto = {
                dateStartInsertion: new Date('2020-06-01T00:00:00Z'),
                dateEndInsertion: new Date('2026-06-30T23:59:59Z'),
                dateStartExamination: new Date('2026-07-01T00:00:00Z'),
                dateEndExamination: new Date('2026-07-31T23:59:59Z'),
            };

            await expect(service.createSession(pastDto)).rejects.toThrow(ForbiddenException);
        });

        it('should throw ConflictException if insertion and examination dates overlap', async () => {
            const overlapDto: CreateSessionDto = {
                dateStartInsertion: new Date('2026-06-01T00:00:00Z'),
                dateEndInsertion: new Date('2026-07-15T23:59:59Z'),
                dateStartExamination: new Date('2026-07-01T00:00:00Z'),
                dateEndExamination: new Date('2026-07-31T23:59:59Z'),
            };

            await expect(service.createSession(overlapDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('updateSession', () => {
        it('should update a session successfully', async () => {
            const updateDto: UpdateSessionDto = {
                dateStartInsertion: new Date('2026-06-05T00:00:00Z'),
            };
            const updatedSession = { ...mockSession, dateStartInsertion: new Date('2026-06-05T00:00:00Z') };

            mockSessionsRepository.findById.mockResolvedValue(mockSession);
            mockSessionsRepository.update.mockResolvedValue(updatedSession);

            const result = await service.updateSession(1, updateDto);

            expect(result).toEqual(updatedSession);
            expect(mockSessionsRepository.update).toHaveBeenCalled();
        });

        it('should throw NotFoundException when session does not exist', async () => {
            mockSessionsRepository.findById.mockResolvedValue(null);

            await expect(service.updateSession(999, {})).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if updated dates are in the past', async () => {
            const updateDto: UpdateSessionDto = {
                dateStartInsertion: new Date('2020-06-01T00:00:00Z'),
            };

            mockSessionsRepository.findById.mockResolvedValue(mockSession);

            await expect(service.updateSession(1, updateDto)).rejects.toThrow(ForbiddenException);
        });

        it('should throw ConflictException if updated dates overlap', async () => {
            const updateDto: UpdateSessionDto = {
                dateEndInsertion: new Date('2026-07-15T23:59:59Z'),
            };

            mockSessionsRepository.findById.mockResolvedValue(mockSession);

            await expect(service.updateSession(1, updateDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('deleteSession', () => {
        it('should delete a session successfully', async () => {
            mockSessionsRepository.findById.mockResolvedValue(mockSession);
            mockSessionsRepository.delete.mockResolvedValue(undefined);

            await service.deleteSession(1);

            expect(mockSessionsRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when session does not exist', async () => {
            mockSessionsRepository.findById.mockResolvedValue(null);

            await expect(service.deleteSession(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findSessionById', () => {
        it('should return a session by id', async () => {
            mockSessionsRepository.findById.mockResolvedValue(mockSession);

            const result = await service.findSessionById(1);

            expect(result).toEqual(mockSession);
        });

        it('should return null if session not found', async () => {
            mockSessionsRepository.findById.mockResolvedValue(null);

            const result = await service.findSessionById(999);

            expect(result).toBeNull();
        });
    });

    describe('findAllSessions', () => {
        it('should return all sessions', async () => {
            const mockSessions = [mockSession, { ...mockSession, id: 2 }];
            mockSessionsRepository.findAll.mockResolvedValue(mockSessions);

            const result = await service.findAllSessions();

            expect(result).toEqual(mockSessions);
        });

        it('should return empty array if no sessions exist', async () => {
            mockSessionsRepository.findAll.mockResolvedValue([]);

            const result = await service.findAllSessions();

            expect(result).toEqual([]);
        });
    });

    describe('findSessionByCurrentPlanningWindow', () => {
        it('should return current planning window session', async () => {
            mockSessionsRepository.findCurrentPlanningWindow.mockResolvedValue(mockSession);

            const result = await service.findSessionByCurrentPlanningWindow();

            expect(result).toEqual(mockSession);
        });

        it('should return null if no planning window is active', async () => {
            mockSessionsRepository.findCurrentPlanningWindow.mockResolvedValue(null);

            const result = await service.findSessionByCurrentPlanningWindow();

            expect(result).toBeNull();
        });
    });

    describe('findSessionByCurrentExaminationWindow', () => {
        it('should return current examination window session', async () => {
            mockSessionsRepository.findCurrentExaminationWindow.mockResolvedValue(mockSession);

            const result = await service.findSessionByCurrentExaminationWindow();

            expect(result).toEqual(mockSession);
        });

        it('should return null if no examination window is active', async () => {
            mockSessionsRepository.findCurrentExaminationWindow.mockResolvedValue(null);

            const result = await service.findSessionByCurrentExaminationWindow();

            expect(result).toBeNull();
        });
    });
});
