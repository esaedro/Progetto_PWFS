import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { ServerExamsService } from './exams.service';
import { Exam } from './exam.entity';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Roles, JwtAuthGuard, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';

@ApiTags('Exams APIs')
@Controller('exams')
export class ServerExamsController {
    constructor(private serverExamsService: ServerExamsService) { }

    @Get('session/:sessionId/degree/:degreeId/year/:degreeYear')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR)
    @ApiBearerAuth()
    async findBySessionAndDegree(
        @Param('sessionId') sessionId: number,
        @Param('degreeId') degreeId: number,
        @Param('degreeYear') degreeYear: number
    ): Promise<Exam[]> {
        return this.serverExamsService.findExamsBySessionAndDegree(sessionId, degreeId, degreeYear);
    }

    @Get('session/:sessionId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR)
    @ApiBearerAuth()
    async findBySession(@Param('sessionId') sessionId: number): Promise<Exam[] | null> {
        return this.serverExamsService.findExamsBySession(sessionId);
    }

    @Get('professor/:professorId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR)
    @ApiBearerAuth()
    async findByProfessor(@Param('professorId') professorId: number): Promise<Exam[]> {
        return this.serverExamsService.findExamsByProfessor(professorId);
    }

    @Get('teaching/:teachingId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR)
    @ApiBearerAuth()
    async findByTeaching(@Param('teachingId') teachingId: number): Promise<Exam[]> {
        return this.serverExamsService.findExamsByTeaching(teachingId);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR)
    @ApiBearerAuth()
    async findAll(): Promise<Exam[]> {
        return this.serverExamsService.findAllExams();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR)
    @ApiBearerAuth()
    async findById(@Param('id') id: number): Promise<Exam | null> {
        return this.serverExamsService.findExamById(id);
    }

    @Post('create')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR)
    @ApiBearerAuth()
    @ApiBody({
        type: CreateExamDto,
        examples: {
            create: {
                value: {
                    dateTimeStart: '2026-07-01T09:00:00Z',
                    dateTimeEnd: '2026-07-01T12:00:00Z',
                    partial: false,
                    type: 'orale',
                    teachingId: 5,
                    sessionId: 2,
                    professorId: 3
                },
            },
        },
    })
    async create(@Body(ValidationPipe) dto: CreateExamDto): Promise<Exam> {
        try {
            return this.serverExamsService.createExam(dto);
        } catch (error) {
            console.error('Errore nella creazione dell\'esame:', error);
            throw error;
        }
    }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR)
    @ApiBearerAuth()
    @ApiBody({
        type: UpdateExamDto,
        examples: {
            update: {
                value: {
                    dateTimeStart: '2026-07-01T09:00:00Z',
                    dateTimeEnd: '2026-07-01T12:00:00Z',
                    partial: true,
                    type: 'scritto',
                    teachingId: 5,
                    sessionId: 2,
                    professorId: 3
                },
            },
        },
    })
    async update(@Param('id') id: number, @Body(ValidationPipe) dto: UpdateExamDto): Promise<Exam> {
        try {
            return this.serverExamsService.updateExam(id, dto);
        } catch (error) {
            console.error('Errore nell\'aggiornamento dell\'esame:', error);
            throw error;
        }
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR)
    @ApiBearerAuth()
    async delete(@Param('id') id: number): Promise<void> {
        try {
            return this.serverExamsService.deleteExam(id);
        } catch (error) {
            console.error('Errore nella cancellazione dell\'esame:', error);
            throw error;
        }
    }
}
