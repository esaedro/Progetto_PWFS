import { Controller, Get } from '@nestjs/common';
import { ServerPeopleService } from './people.service';
import { Professor } from './professor.entity';

@Controller('people')
export class ServerPeopleController {
    constructor(private serverPeopleService: ServerPeopleService) {}

    @Get()
    async findById(professor_id: number): Promise<Professor | null> {
        return await this.serverPeopleService.findById(professor_id)
    }

    @Get()
    async canManageOwnExam(professor_id: number, examId: number): Promise<boolean> {
        return this.serverPeopleService.canManageOwnExame(professor_id, examId);
    }
}
