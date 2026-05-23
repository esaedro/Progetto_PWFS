import { Controller, Get, Query } from '@nestjs/common';
import { ServerPeopleService } from './people.service';
import { Professor } from './professor.entity';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('People APIs')
@Controller('People APIs')
export class ServerPeopleController {
    constructor(private serverPeopleService: ServerPeopleService) {}

    @Get(':id')
    @ApiQuery({ name:'professor_id', required:true })
    async findById(@Query('professor_id') professor_id: number): Promise<Professor | null> {
        return await this.serverPeopleService.findById(professor_id)
    }

    @Get('professor/:id/exam/:examid')
    async canManageOwnExam(professor_id: number, examId: number): Promise<boolean> {
        return this.serverPeopleService.canManageOwnExame(professor_id, examId);
    }
}
