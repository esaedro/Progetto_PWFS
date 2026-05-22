import { Controller, Get, Param, Post } from '@nestjs/common';
import { ServerExamsService } from './exams.service';
import { Exam } from './exam.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Exams APIs')
@Controller('exams')
export class ServerExamsController {
    constructor(private serverExamsService: ServerExamsService) { }

    @Get()
    async findAll(): Promise<Exam[]> {
        return this.serverExamsService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: number): Promise<Exam | null> {
        return this.serverExamsService.findById(id);
    }

    @Get('session/:sessionId/degree/:degreeId/year/:degreeYear')
    async findBySessionAndDegree(
        @Param('sessionId') sessionId: number,
        @Param('degreeId') degreeId: number,
        @Param('degreeYear') degreeYear: number
    ): Promise<Exam[]> {
        return this.serverExamsService.findBySessionAndDegree(sessionId, degreeId, degreeYear);
    }

    @Get('session/:sessionId')
    async findBySession(@Param('sessionId') sessionId: number): Promise<Exam[] | null> {
        return this.serverExamsService.findBySession(sessionId);
    }

    @Get('professor/:professorId')
    async findByProfessor(@Param('professorId') professorId: number): Promise<Exam[]> {
        return this.serverExamsService.findByProfessor(professorId);
    }

    @Get('teaching/:teachingId')
    async findByTeaching(@Param('teachingId') teachingId: number): Promise<Exam[]> {
        return this.serverExamsService.findByTeaching(teachingId);
    }

    @Post('create')
    async create(): Promise<void> {
        // Implementa la logica per creare un esame
    }

    @Post('update/:id')
    async update(@Param('id') id: number): Promise<void> {
        // Implementa la logica per aggiornare un esame
    }

    @Post('delete/:id')
    async delete(@Param('id') id: number): Promise<void> {
        // Implementa la logica per eliminare un esame
    }
}
