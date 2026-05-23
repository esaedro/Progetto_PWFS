import { Injectable, NotFoundException } from '@nestjs/common';
import { PeopleRepository } from './people.repository';
import { Professor } from './professor.entity';
import { ServerUsersService } from '@server/users';
import { CreatePeopleDto } from './dto/create-people.dto';

@Injectable()
export class ServerPeopleService {

    constructor(private readonly peopleRepository: PeopleRepository, 
        private readonly serverUsersService: ServerUsersService
    ){}

    async findById(professor_id: number): Promise<Professor | null> {
        const professor = await this.peopleRepository.findById(professor_id);

        if (!professor) {
            throw new NotFoundException(`Non è stato trovato il professore con id = ${professor_id}`);
        }

        return professor
    }

    async canManageOwnExame(professor_id: number, examId: number): Promise<boolean>{
        return await this.peopleRepository.canManageOwnExam(professor_id, examId);
    }

    async getProfessorsByIds(professorIds: number[]): Promise<Professor[]> {
        const professors: Professor[] = [];

        for (const professorId of professorIds) {
            const professor = await this.findById(professorId);
            if (professor)
                professors.push(professor);
        }

        return professors;
    }

    async create(professorDto: CreatePeopleDto) {
        const createdUser = await this.serverUsersService.create({
            name: professorDto.name,
            email: professorDto.email,
            password: professorDto.password,
            role: professorDto.role
        });

        await this.peopleRepository.create(createdUser.id);
        return createdUser;
    }

}
