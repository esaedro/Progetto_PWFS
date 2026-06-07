import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ServerExamsService } from './exams.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { Session } from './session.entity';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Roles, JwtAuthGuard, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';

@ApiTags('Sessions APIs')
@Controller('sessions')
export class ServerSessionsController {
    constructor(private serverExamsService: ServerExamsService) { }

    @Get('current-planning-window')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR, UserRole.SECRETARY)
    @ApiBearerAuth()
    async findCurrentPlanningWindow() {
        return this.serverExamsService.findSessionByCurrentPlanningWindow();
    }

    @Get('current-examination-window')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR, UserRole.SECRETARY)
    @ApiBearerAuth()
    async findCurrentExaminationWindow() {
        return this.serverExamsService.findSessionByCurrentExaminationWindow();
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR, UserRole.SECRETARY)
    @ApiBearerAuth()
    async findAll() {
        return this.serverExamsService.findAllSessions();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR, UserRole.SECRETARY)
    @ApiBearerAuth()
    async findById(@Param('id') id: number) {
        return this.serverExamsService.findSessionById(id);
    }

    @Post('create')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiBody({
        type: CreateSessionDto,
        examples: {
            create: {
                value: {
                    dateStartInsertion: '2026-06-01T00:00:00Z',
                    dateEndInsertion: '2026-06-30T23:59:59Z',
                    dateStartExamination: '2026-07-01T00:00:00Z',
                    dateEndExamination: '2026-07-31T23:59:59Z'
                },
            },
        },
    })
    async create(@Body(ValidationPipe) dto: CreateSessionDto): Promise<Session> {
        try {
            return this.serverExamsService.createSession(dto);
        } catch (error) {
            console.error('Errore nella creazione della sessione:', error);
            throw error;
        }
    }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiBody({
        type: UpdateSessionDto,
        examples: {
            update: {
                value: {
                    dateStartInsertion: '2026-06-01T00:00:00Z',
                    dateEndInsertion: '2026-06-30T23:59:59Z',
                    dateStartExamination: '2026-07-01T00:00:00Z',
                    dateEndExamination: '2026-07-31T23:59:59Z'
                },
            },
        },
    })
    async update(@Param('id') id: number, @Body(ValidationPipe) dto: UpdateSessionDto): Promise<Session> {
        try {
            return this.serverExamsService.updateSession(id, dto);
        } catch (error) {
            console.error('Errore nell\'aggiornamento della sessione:', error);
            throw error;
        }
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    async delete(@Param('id') id: number): Promise<void> {
        try {
            return this.serverExamsService.deleteSession(id);
        } catch (error) {
            console.error('Errore nella cancellazione della sessione:', error);
            throw error;
        }
    }

    @Get('find-by-date/:date')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR, UserRole.SECRETARY)
    @ApiBearerAuth()
    async findByDate(@Param("date") date: Date) {
        return this.serverExamsService.findSessionByDate(date);
    }
}
