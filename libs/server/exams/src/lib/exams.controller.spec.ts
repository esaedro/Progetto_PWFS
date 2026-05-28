import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ServerExamsController } from './exams.controller';
import { ServerExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam, ExamType } from './exam.entity';

describe('ServerExamsController', () => {
    let controller: ServerExamsController;
    let examsService: ServerExamsService;

    const mockExam: Exam = {
        id: 1,
        dateTimeStart: new Date('2026-07-01T09:00:00Z'),
        dateTimeEnd: new Date('2026-07-01T12:00:00Z'),
        room: 'A1',
        description: 'Esame di Algoritmi',
        partial: false,
        type: ExamType.ORALE,
        teaching: { id: 5 } as any,
        session: { id: 2 } as any,
        professor: { professor_id: 3 } as any,
    } as Exam;

    const mockCreateExamDto: CreateExamDto = {
        dateTimeStart: new Date('2026-07-01T09:00:00Z'),
        dateTimeEnd: new Date('2026-07-01T12:00:00Z'),
        room: 'A1',
        description: 'Esame di Algoritmi',
        partial: false,
        type: ExamType.ORALE,
        teachingId: 5,
        sessionId: 2,
        professorId: 3,
    };

    const mockCurrentUser = {
        professor_id: 3,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ServerExamsController],
            providers: [
                {
                    provide: ServerExamsService,
                    useValue: {
                        createExam: jest.fn(),
                        updateExam: jest.fn(),
                        deleteExam: jest.fn(),
                        findExamById: jest.fn(),
                        findAllExams: jest.fn(),
                        findExamsBySessionAndDegree: jest.fn(),
                        findExamsBySession: jest.fn(),
                        findExamsByProfessor: jest.fn(),
                        findExamsByTeaching: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<ServerExamsController>(ServerExamsController);
        examsService = module.get<ServerExamsService>(ServerExamsService);
    });

    describe('create', () => {
        it('should create an exam successfully when professorId matches authenticated professor', async () => {
            (examsService.createExam as jest.Mock).mockResolvedValue(mockExam);

            const result = await controller.create(mockCreateExamDto, mockCurrentUser);

            expect(result).toEqual(mockExam);
            expect(examsService.createExam).toHaveBeenCalledWith({
                ...mockCreateExamDto,
                professorId: 3,
            });
        });

        it('should throw ForbiddenException when professorId in DTO does not match authenticated professor', async () => {
            const wrongProfessorDto: CreateExamDto = {
                ...mockCreateExamDto,
                professorId: 999, // Professore diverso
            };

            await expect(controller.create(wrongProfessorDto, mockCurrentUser)).rejects.toThrow(
                ForbiddenException
            );

            expect(examsService.createExam).not.toHaveBeenCalled();
        });

        it('should create an exam when no professorId is provided in DTO (uses authenticated professor)', async () => {
            const dtoWithoutProfessor: CreateExamDto = {
                dateTimeStart: new Date('2026-07-01T09:00:00Z'),
                dateTimeEnd: new Date('2026-07-01T12:00:00Z'),
                room: 'A1',
                description: 'Esame di Algoritmi',
                partial: false,
                type: ExamType.ORALE,
                teachingId: 5,
                sessionId: 2,
            } as CreateExamDto;

            (examsService.createExam as jest.Mock).mockResolvedValue(mockExam);

            const result = await controller.create(dtoWithoutProfessor, mockCurrentUser);

            expect(result).toEqual(mockExam);
            expect(examsService.createExam).toHaveBeenCalledWith({
                ...dtoWithoutProfessor,
                professorId: 3,
            });
        });

        it('should use professor_id from currentUser when id field is not available', async () => {
            const currentUserWithoutProfessorId = { id: 5 };
            (examsService.createExam as jest.Mock).mockResolvedValue(mockExam);

            const dtoWithMatchingId: CreateExamDto = {
                ...mockCreateExamDto,
                professorId: 5,
            };

            const result = await controller.create(dtoWithMatchingId, currentUserWithoutProfessorId);

            expect(result).toEqual(mockExam);
        });
    });

    describe('update', () => {
        it('should update an exam successfully when professorId matches authenticated professor', async () => {
            const updateDto: UpdateExamDto = {
                type: ExamType.SCRITTO,
                professorId: 3,
            };
            const updatedExam = { ...mockExam, type: ExamType.SCRITTO };
            (examsService.updateExam as jest.Mock).mockResolvedValue(updatedExam);

            const result = await controller.update(1, updateDto, mockCurrentUser);

            expect(result).toEqual(updatedExam);
            expect(examsService.updateExam).toHaveBeenCalledWith(1, updateDto, 3);
        });

        it('should throw ForbiddenException when professorId in DTO does not match authenticated professor', async () => {
            const wrongProfessorDto: UpdateExamDto = {
                type: ExamType.SCRITTO,
                professorId: 999, // Professore diverso
            };

            await expect(controller.update(1, wrongProfessorDto, mockCurrentUser)).rejects.toThrow(
                ForbiddenException
            );

            expect(examsService.updateExam).not.toHaveBeenCalled();
        });

        it('should update an exam when no professorId is provided in DTO', async () => {
            const updateDto: UpdateExamDto = {
                type: ExamType.SCRITTO,
            };
            const updatedExam = { ...mockExam, type: ExamType.SCRITTO };
            (examsService.updateExam as jest.Mock).mockResolvedValue(updatedExam);

            const result = await controller.update(1, updateDto, mockCurrentUser);

            expect(result).toEqual(updatedExam);
            expect(examsService.updateExam).toHaveBeenCalledWith(1, updateDto, 3);
        });
    });

    describe('delete', () => {
        it('should delete an exam successfully', async () => {
            (examsService.deleteExam as jest.Mock).mockResolvedValue(undefined);

            await controller.delete(1, mockCurrentUser);

            expect(examsService.deleteExam).toHaveBeenCalledWith(1, 3);
        });
    });
});
