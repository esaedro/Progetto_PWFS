import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ServerExamsService } from './exams.service';

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
    async create() {
        // Implementa la logica per creare una sessione
    }

    @Post('update/:id')
    async update(@Param('id') id: number) {
        // Implementa la logica per aggiornare una sessione
    }

    @Post('delete/:id')
    async delete(@Param('id') id: number) {
        // Implementa la logica per eliminare una sessione
    }
}
