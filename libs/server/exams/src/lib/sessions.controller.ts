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

    @Post('create')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiBody({
        type: CreateSessionDto,
        examples: {
            create: {
                value: {
                    dateStartInsertion: '2024-06-01T00:00:00Z',
                    dateEndInsertion: '2024-06-30T23:59:59Z',
                    dateStartExamination: '2024-07-01T00:00:00Z',
                    dateEndExamination: '2024-07-31T23:59:59Z'
                },
            },
        },
    })
    async create(@Body(ValidationPipe) dto: CreateSessionDto): Promise<Session> {
        return this.serverExamsService.createSession(dto);
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
                    dateStartInsertion: '2024-06-01T00:00:00Z',
                    dateEndInsertion: '2024-06-30T23:59:59Z',
                    dateStartExamination: '2024-07-01T00:00:00Z',
                    dateEndExamination: '2024-07-31T23:59:59Z'
                },
            },
        },
    })
    async update(@Param('id') id: number, @Body(ValidationPipe) dto: UpdateSessionDto): Promise<Session> {
        return this.serverExamsService.updateSession(id, dto);
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    async delete(@Param('id') id: number): Promise<void> {
        return this.serverExamsService.deleteSession(id);
    }
}
