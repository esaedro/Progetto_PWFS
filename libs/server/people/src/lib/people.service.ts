import { Injectable, NotFoundException } from '@nestjs/common';
import { PeopleRepository } from './people.repository';
import { Professor } from './professor.entity';

@Injectable()
export class ServerPeopleService {
 
    constructor(private readonly peopleRepository: PeopleRepository){}

    async findById(professor_id: number): Promise<Professor | null> {
        const professor = await this.peopleRepository.findById(professor_id);

        if (!professor) {
            throw new NotFoundException("Professor not found");
        }

        return professor
    }

    async canManageOwnExame(professor_id: number, examId: number): Promise<boolean>{
        return await this.peopleRepository.canManageOwnExam(professor_id, examId);
    }

}
