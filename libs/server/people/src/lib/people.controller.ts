import { Body, Controller, Get, Post, Query, ValidationPipe } from '@nestjs/common';
import { ServerPeopleService } from './people.service';
import { Professor } from './professor.entity';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreatePeopleDto } from './dto/create-people.dto';
import { UserRole } from '@server/users';

@ApiTags('People APIs')
@Controller('people')
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

    @Post()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'gior' },
                email: { type: 'string', example: 'gio@unibs.it' },
                role: { type: 'string', enum: Object.values(UserRole), example: UserRole.PROFESSOR },
                password: { type: 'string', example: 'Password1!' },
            },
            required: ['name', 'email', 'role', 'password'],
        },
    })  
    create(@Body(ValidationPipe) professor: CreatePeopleDto) {
        return this.serverPeopleService.create(professor);
    }
}
