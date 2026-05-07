import { Injectable, NotFoundException } from '@nestjs/common';
import { PeopleRepository } from './people.repository';
import { Professor } from './professor.entity';

@Injectable()
export class ServerPeopleService {
 
    constructor(private readonly peopleRepository: PeopleRepository){}

    async findById(professor_id: number): Promise<Professor | null> {
        const professor = await this.peopleRepository.findById(professor_id);

        if (!professor) {
            throw new NotFoundException("Non è stato trovato il professore con id = ${professor_id}");
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

}
