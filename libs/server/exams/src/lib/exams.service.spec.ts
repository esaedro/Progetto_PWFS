import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ServerExamsService } from './exams.service';
import { ExamValidationService } from './exam-validation.service';
import { SessionValidationService } from './session-validation.service';
import { ExamsRepository } from './exams.repository';
import { SessionsRepository } from './sessions.repository';
import { ServerCoursesService } from '@server/courses';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam } from './exam.entity';
import { ExamType } from './dto/exam-type.enum';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session } from './session.entity';

describe('ServerExamsService', () => {
    let service: ServerExamsService;
    let examValidationService: ExamValidationService;
    let sessionValidationService: SessionValidationService;
    let examsRepository: ExamsRepository;
    let sessionsRepository: SessionsRepository;
    let coursesService: ServerCoursesService;

    const mockSession = {
        id: 2,
        dateStartExamination: new Date('2026-07-01T00:00:00Z'),
        dateEndExamination: new Date('2026-07-31T23:59:59Z'),
    };

    const mockTeaching = {
        id: 5,
        name: 'Algoritmi',
        degree: { id: 1 },
        year: 1,
    };

    const mockExam: Exam = {
        id: 1,
        dateTimeStart: new Date('2026-07-01T09:00:00Z'),
        dateTimeEnd: new Date('2026-07-01T12:00:00Z'),
        description: 'Esame di Algoritmi',
        partial: false,
        type: ExamType.ORALE,
        teaching: { id: 5, degree: { id: 1 }, year: 1 } as any,
        session: { id: 2 } as any,
        professor: { professor_id: 3 } as any,
    } as Exam;

    const mockCreateExamDto: CreateExamDto = {
        dateTimeStart: new Date('2026-07-01T09:00:00Z'),
        dateTimeEnd: new Date('2026-07-01T12:00:00Z'),
        description: 'Esame di Algoritmi',
        partial: false,
        type: ExamType.ORALE,
        teachingId: 5,
        sessionId: 2,
        professorId: 3,
    };

    const mockCurrentUser = { id: 3 };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ServerExamsService,
                ExamValidationService,
                SessionValidationService,
                {
                    provide: ExamsRepository,
                    useValue: {
                        create: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                        findById: jest.fn(),
                        findAll: jest.fn(),
                        findBySessionAndDegree: jest.fn(),
                        findBySession: jest.fn(),
                        findByProfessor: jest.fn(),
                        findbyTeaching: jest.fn(),
                    },
                },
                {
                    provide: SessionsRepository,
                    useValue: {
                        create: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                        findById: jest.fn(),
                        findAll: jest.fn(),
                        findCurrentPlanningWindow: jest.fn(),
                        findCurrentExaminationWindow: jest.fn(),
                    },
                },
                {
                    provide: ServerCoursesService,
                    useValue: {
                        getTeachingByID: jest.fn(),
                        getTeachingsByProfessor: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ServerExamsService>(ServerExamsService);
        examValidationService = module.get<ExamValidationService>(ExamValidationService);
        sessionValidationService = module.get<SessionValidationService>(SessionValidationService);
        examsRepository = module.get<ExamsRepository>(ExamsRepository);
        sessionsRepository = module.get<SessionsRepository>(SessionsRepository);
        coursesService = module.get<ServerCoursesService>(ServerCoursesService);

        jest.clearAllMocks();
        // Set default mock returns
        (examsRepository.findBySessionAndDegree as jest.Mock).mockResolvedValue([]);
        (coursesService.getTeachingByID as jest.Mock).mockResolvedValue(mockTeaching);
    });

    describe('createExam', () => {
        it('should create an exam successfully when all parameters are valid and no conflicts exist', async () => {
            (coursesService.getTeachingsByProfessor as jest.Mock).mockResolvedValue([mockTeaching]);
            (sessionsRepository.findById as jest.Mock).mockResolvedValue(mockSession);
            (examsRepository.create as jest.Mock).mockResolvedValue(mockExam);

            const result = await service.createExam(mockCreateExamDto, mockCurrentUser);

            expect(result).toEqual(mockExam);
            expect(examsRepository.create).toHaveBeenCalledWith(mockCreateExamDto);
        });

        it('should throw ForbiddenException with all errors when multiple validations fail', async () => {
            (coursesService.getTeachingsByProfessor as jest.Mock).mockRejectedValue(new NotFoundException('Professor not found'));

            await expect(service.createExam(mockCreateExamDto, mockCurrentUser)).rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException when professor is not teaching the subject', async () => {
            const otherTeaching = { id: 6, degree: { id: 1 }, year: 1 };
            (coursesService.getTeachingsByProfessor as jest.Mock).mockResolvedValue([otherTeaching]);

            await expect(service.createExam(mockCreateExamDto, mockCurrentUser)).rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException when session does not exist', async () => {
            (coursesService.getTeachingsByProfessor as jest.Mock).mockResolvedValue([mockTeaching]);
            (sessionsRepository.findById as jest.Mock).mockResolvedValue(null);

            await expect(service.createExam(mockCreateExamDto, mockCurrentUser)).rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException when exam dates are outside session window', async () => {
            const sessionOutOfRange = {
                ...mockSession,
                dateStartExamination: new Date('2026-08-01T00:00:00Z'),
                dateEndExamination: new Date('2026-08-31T23:59:59Z'),
            };
            (coursesService.getTeachingsByProfessor as jest.Mock).mockResolvedValue([mockTeaching]);
            (sessionsRepository.findById as jest.Mock).mockResolvedValue(sessionOutOfRange);

            await expect(service.createExam(mockCreateExamDto, mockCurrentUser)).rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException when start date is after end date', async () => {
            const invalidDto: CreateExamDto = {
                ...mockCreateExamDto,
                dateTimeStart: new Date('2026-07-01T15:00:00Z'),
                dateTimeEnd: new Date('2026-07-01T12:00:00Z'),
            };
            (coursesService.getTeachingsByProfessor as jest.Mock).mockResolvedValue([mockTeaching]);
            (sessionsRepository.findById as jest.Mock).mockResolvedValue(mockSession);

            await expect(service.createExam(invalidDto, mockCurrentUser)).rejects.toThrow(ForbiddenException);
        });

        it('should throw ConflictException when exam conflicts with existing exam', async () => {
            (coursesService.getTeachingsByProfessor as jest.Mock).mockResolvedValue([mockTeaching]);
            (sessionsRepository.findById as jest.Mock).mockResolvedValue(mockSession);
            (coursesService.getTeachingByID as jest.Mock).mockResolvedValue(mockTeaching);
            (examsRepository.findBySessionAndDegree as jest.Mock).mockResolvedValue([mockExam]);

            await expect(service.createExam(mockCreateExamDto, mockCurrentUser)).rejects.toThrow(ConflictException);
        });

        it('should create exam with optional fields undefined (description)', async () => {
            const dtoWithoutOptionalFields: CreateExamDto = {
                dateTimeStart: new Date('2026-07-02T09:00:00Z'),
                dateTimeEnd: new Date('2026-07-02T12:00:00Z'),
                partial: false,
                type: ExamType.SCRITTO,
                teachingId: 5,
                sessionId: 2,
                professorId: 3,
            };
            (coursesService.getTeachingsByProfessor as jest.Mock).mockResolvedValue([mockTeaching]);
            (sessionsRepository.findById as jest.Mock).mockResolvedValue(mockSession);
            (examsRepository.create as jest.Mock).mockResolvedValue({ ...mockExam, description: undefined });

            const result = await service.createExam(dtoWithoutOptionalFields, mockCurrentUser);

            expect(result).toBeDefined();
            expect(examsRepository.create).toHaveBeenCalled();
        });
    });

    describe('updateExam', () => {
        it('should update an exam successfully when all parameters are valid', async () => {
            const updateDto: UpdateExamDto = {
                type: ExamType.SCRITTO,
            };
            const updatedExam = { ...mockExam, type: ExamType.SCRITTO };

            (examsRepository.findById as jest.Mock).mockResolvedValue(mockExam);
            (coursesService.getTeachingByID as jest.Mock).mockResolvedValue(mockTeaching);
            (coursesService.getTeachingsByProfessor as jest.Mock).mockResolvedValue([mockTeaching]);
            (sessionsRepository.findById as jest.Mock).mockResolvedValue(mockSession);
            (examsRepository.update as jest.Mock).mockResolvedValue(updatedExam);

            const result = await service.updateExam(1, updateDto, mockCurrentUser);

            expect(result).toEqual(updatedExam);
            expect(examsRepository.update).toHaveBeenCalled();
        });

        it('should throw NotFoundException when exam does not exist', async () => {
            (examsRepository.findById as jest.Mock).mockResolvedValue(null);

            await expect(service.updateExam(999, {}, mockCurrentUser)).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when professor is not the owner of the exam', async () => {
            const otherUser = { id: 999 };
            (examsRepository.findById as jest.Mock).mockResolvedValue(mockExam);

            await expect(service.updateExam(1, {}, otherUser)).rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException when updated dates are invalid', async () => {
            const updateDto: UpdateExamDto = {
                dateTimeStart: new Date('2026-07-01T15:00:00Z'),
                dateTimeEnd: new Date('2026-07-01T12:00:00Z'),
            };

            (examsRepository.findById as jest.Mock).mockResolvedValue(mockExam);

            await expect(service.updateExam(1, updateDto, mockCurrentUser)).rejects.toThrow(ForbiddenException);
        });

        it('should throw ConflictException when updating creates a conflict', async () => {
            const updateDto: UpdateExamDto = {
                dateTimeStart: new Date('2026-07-01T10:00:00Z'),
            };
            const conflictingExam = {
                ...mockExam,
                id: 2,
                dateTimeStart: new Date('2026-07-01T11:00:00Z'),
                dateTimeEnd: new Date('2026-07-01T14:00:00Z'),
            };

            (examsRepository.findById as jest.Mock).mockResolvedValue(mockExam);
            (coursesService.getTeachingsByProfessor as jest.Mock).mockResolvedValue([mockTeaching]);
            (sessionsRepository.findById as jest.Mock).mockResolvedValue(mockSession);
            (coursesService.getTeachingByID as jest.Mock).mockResolvedValue(mockTeaching);
            (examsRepository.findBySessionAndDegree as jest.Mock).mockResolvedValue([conflictingExam]);

            await expect(service.updateExam(1, updateDto, mockCurrentUser)).rejects.toThrow(ConflictException);
        });

        it('should successfully update optional fields (description)', async () => {
            const updateDto: UpdateExamDto = {
                description: 'Updated description',
            };
            const updatedExam = {
                ...mockExam,
                description: 'Updated description'
            };

            (examsRepository.findById as jest.Mock).mockResolvedValue(mockExam);
            (coursesService.getTeachingsByProfessor as jest.Mock).mockResolvedValue([mockTeaching]);
            (sessionsRepository.findById as jest.Mock).mockResolvedValue(mockSession);
            (examsRepository.update as jest.Mock).mockResolvedValue(updatedExam);

            const result = await service.updateExam(1, updateDto, mockCurrentUser);

            expect(result).toEqual(updatedExam);
        });
    });

    describe('deleteExam', () => {
        it('should delete an exam successfully', async () => {
            (examsRepository.findById as jest.Mock).mockResolvedValue(mockExam);
            (examsRepository.delete as jest.Mock).mockResolvedValue(undefined);

            await service.deleteExam(1, mockCurrentUser);

            expect(examsRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when exam does not exist', async () => {
            (examsRepository.findById as jest.Mock).mockResolvedValue(null);

            await expect(service.deleteExam(999, mockCurrentUser)).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when professor is not the owner of the exam', async () => {
            const otherUser = { id: 999 };
            (examsRepository.findById as jest.Mock).mockResolvedValue(mockExam);

            await expect(service.deleteExam(1, otherUser)).rejects.toThrow(ForbiddenException);
        });
    });

    describe('findExamById', () => {
        it('should return an exam by id', async () => {
            (examsRepository.findById as jest.Mock).mockResolvedValue(mockExam);

            const result = await service.findExamById(1);

            expect(result).toEqual(mockExam);
        });

        it('should return null if exam not found', async () => {
            (examsRepository.findById as jest.Mock).mockResolvedValue(null);

            const result = await service.findExamById(999);

            expect(result).toBeNull();
        });
    });

    describe('findAllExams', () => {
        it('should return all exams', async () => {
            const mockExams = [mockExam, { ...mockExam, id: 2 }];
            (examsRepository.findAll as jest.Mock).mockResolvedValue(mockExams);

            const result = await service.findAllExams();

            expect(result).toEqual(mockExams);
        });
    });

    describe('findExamsBySessionAndDegree', () => {
        it('should return exams filtered by session and degree', async () => {
            const mockExams = [mockExam];
            (examsRepository.findBySessionAndDegree as jest.Mock).mockResolvedValue(mockExams);

            const result = await service.findExamsBySessionAndDegree(2, 1, 1);

            expect(result).toEqual(mockExams);
            expect(examsRepository.findBySessionAndDegree).toHaveBeenCalledWith(2, 1, 1);
        });
    });

    describe('findExamsBySession', () => {
        it('should return exams for a session', async () => {
            const mockExams = [mockExam];

            (sessionsRepository.findById as jest.Mock).mockResolvedValue(mockSession);
            (examsRepository.findBySession as jest.Mock).mockResolvedValue(mockExams);

            const result = await service.findExamsBySession(2);

            expect(result).toEqual(mockExams);
        });

        it('should throw NotFoundException if session does not exist', async () => {
            (sessionsRepository.findById as jest.Mock).mockResolvedValue(null);

            await expect(service.findExamsBySession(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findExamsByProfessor', () => {
        it('should return exams for a professor', async () => {
            const mockExams = [mockExam];
            (examsRepository.findByProfessor as jest.Mock).mockResolvedValue(mockExams);

            const result = await service.findExamsByProfessor(3);

            expect(result).toEqual(mockExams);
        });
    });

    describe('findExamsByTeaching', () => {
        it('should return exams for a teaching', async () => {
            const mockExams = [mockExam];
            (examsRepository.findbyTeaching as jest.Mock).mockResolvedValue(mockExams);

            const result = await service.findExamsByTeaching(5);

            expect(result).toEqual(mockExams);
        });
    });
});

describe('SessionValidationService', () => {
    let sessionValidationService: SessionValidationService;

    beforeEach(() => {
        sessionValidationService = new SessionValidationService();
    });

    describe('validateForCreate', () => {
        it('should validate a session successfully when all dates are valid and not in the past', async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 10);
            const laterDate = new Date(futureDate);
            laterDate.setDate(laterDate.getDate() + 5);

            const dto: CreateSessionDto = {
                dateStartInsertion: futureDate,
                dateEndInsertion: laterDate,
                dateStartExamination: new Date(laterDate),
                dateEndExamination: new Date(laterDate),
            } as any;
            dto.dateStartExamination.setDate(dto.dateStartExamination.getDate() + 1);
            dto.dateEndExamination.setDate(dto.dateEndExamination.getDate() + 5);

            await expect(sessionValidationService.validateForCreate(dto)).resolves.toBeUndefined();
        });

        it('should throw ForbiddenException when dates are in the past', async () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 10);

            const dto: CreateSessionDto = {
                dateStartInsertion: pastDate,
                dateEndInsertion: new Date(),
                dateStartExamination: new Date(),
                dateEndExamination: new Date(),
            } as any;

            await expect(sessionValidationService.validateForCreate(dto)).rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException when insertion period overlaps with examination period', async () => {
            const date1 = new Date();
            date1.setDate(date1.getDate() + 10);
            const date2 = new Date(date1);
            date2.setDate(date2.getDate() + 5);
            const date3 = new Date(date2);
            date3.setDate(date3.getDate() - 1);
            const date4 = new Date(date2);
            date4.setDate(date4.getDate() + 5);

            const dto: CreateSessionDto = {
                dateStartInsertion: date1,
                dateEndInsertion: date2,
                dateStartExamination: date3,
                dateEndExamination: date4,
            } as any;

            await expect(sessionValidationService.validateForCreate(dto)).rejects.toThrow(ForbiddenException);
        });
    });

    describe('validateForUpdate', () => {
        it('should validate updated session successfully', async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 10);
            const laterDate = new Date(futureDate);
            laterDate.setDate(laterDate.getDate() + 5);

            const session: Session = {
                dateStartInsertion: futureDate,
                dateEndInsertion: laterDate,
                dateStartExamination: new Date(laterDate),
                dateEndExamination: new Date(laterDate),
            } as any;
            session.dateStartExamination.setDate(session.dateStartExamination.getDate() + 1);
            session.dateEndExamination.setDate(session.dateEndExamination.getDate() + 5);

            const dto: UpdateSessionDto = {};

            await expect(sessionValidationService.validateForUpdate(dto, session)).resolves.toBeUndefined();
        });
    });
});
