import { Controller, Get, Param, Post } from '@nestjs/common';
import { ServerSessionsService } from './sessions.service';

@Controller('sessions')
export class ServerSessionsController {
    constructor(private serverSessionsService: ServerSessionsService) { }

    @Get()
    async findAll() {
        return this.serverSessionsService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: number) {
        return this.serverSessionsService.findById(id);
    }

    @Get('current-planning-window')
    async findCurrentPlanningWindow() {
        return this.serverSessionsService.findCurrentPlanningWindow();
    }

    @Get('current-examination-window')
    async findCurrentExaminationWindow() {
        return this.serverSessionsService.findCurrentExaminationWindow();
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
