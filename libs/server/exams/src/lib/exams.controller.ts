import { Body, Controller, Get, Param, Post, ValidationPipe } from '@nestjs/common';
import { ServerExamsService } from './exams.service';
import { Exam } from './exam.entity';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@ApiTags('Exams APIs')
@Controller('exams')
export class ServerExamsController {
    constructor(private serverExamsService: ServerExamsService) { }

    @Get()
    async findAll(): Promise<Exam[]> {
        return this.serverExamsService.findAllExams();
    }

    @Get(':id')
    async findById(@Param('id') id: number): Promise<Exam | null> {
        return this.serverExamsService.findExamById(id);
    }

    @Get('session/:sessionId/degree/:degreeId/year/:degreeYear')
    async findBySessionAndDegree(
        @Param('sessionId') sessionId: number,
        @Param('degreeId') degreeId: number,
        @Param('degreeYear') degreeYear: number
    ): Promise<Exam[]> {
        return this.serverExamsService.findExamsBySessionAndDegree(sessionId, degreeId, degreeYear);
    }

    @Get('session/:sessionId')
    async findBySession(@Param('sessionId') sessionId: number): Promise<Exam[] | null> {
        return this.serverExamsService.findExamsBySession(sessionId);
    }

    @Get('professor/:professorId')
    async findByProfessor(@Param('professorId') professorId: number): Promise<Exam[]> {
        return this.serverExamsService.findExamsByProfessor(professorId);
    }

    @Get('teaching/:teachingId')
    async findByTeaching(@Param('teachingId') teachingId: number): Promise<Exam[]> {
        return this.serverExamsService.findExamsByTeaching(teachingId);
    }

    @Post('create')
    @ApiBody({
        type: CreateExamDto,
        examples: {
            create: {
                value: {
                    dateTimeStart: '2024-07-01T09:00:00Z',
                    dateTimeEnd: '2024-07-01T12:00:00Z',
                    teachingId: 5,
                    sessionId: 2,
                    professorId: 3
                },
            },
        },
    })
    async create(@Body(ValidationPipe) dto: CreateExamDto): Promise<Exam> {
        return this.serverExamsService.createExam(dto);
    }

    @Post('update/:id')
    @ApiBody({
        type: UpdateExamDto,
        examples: {
            update: {
                value: {
                    dateTimeStart: '2024-07-01T09:00:00Z',
                    dateTimeEnd: '2024-07-01T12:00:00Z',
                    teachingId: 5,
                    sessionId: 2,
                    professorId: 3
                },
            },
        },
    })
    async update(@Param('id') id: number, @Body(ValidationPipe) dto: UpdateExamDto): Promise<Exam> {
        return this.serverExamsService.updateExam(id, dto);
    }

    @Post('delete/:id')
    async delete(@Param('id') id: number): Promise<void> {
        return this.serverExamsService.deleteExam(id);
    }
}
