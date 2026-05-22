import { Body, Controller, Get, Param, Post, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ServerExamsService } from './exams.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { Session } from './session.entity';
import { UpdateSessionDto } from './dto/update-session.dto';

@ApiTags('Sessions APIs')
@Controller('sessions')
export class ServerSessionsController {
    constructor(private serverExamsService: ServerExamsService) { }

    @Get()
    async findAll() {
        return this.serverExamsService.findAllSessions();
    }

    @Get(':id')
    async findById(@Param('id') id: number) {
        return this.serverExamsService.findSessionById(id);
    }

    @Get('current-planning-window')
    async findCurrentPlanningWindow() {
        return this.serverExamsService.findSessionByCurrentPlanningWindow();
    }

    @Get('current-examination-window')
    async findCurrentExaminationWindow() {
        return this.serverExamsService.findSessionByCurrentExaminationWindow();
    }

    @Post('create')
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

    @Post('update/:id')
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

    @Post('delete/:id')
    async delete(@Param('id') id: number): Promise<void> {
        return this.serverExamsService.deleteSession(id);
    }
}
