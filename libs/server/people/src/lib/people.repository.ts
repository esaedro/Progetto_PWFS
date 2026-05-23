import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professor } from './professor.entity';
// import { UpdateExmaDto } from './dto/update-exam.dto';

@Injectable()
export class PeopleRepository {
    constructor(
        @InjectRepository(Professor)
        private readonly repository: Repository<Professor>) { }

    findById(professor_id: number): Promise<Professor | null> {
        return this.repository.findOne({ where: { professor_id } });
    }

    findAll(): Promise<Professor[] | null> {
        return this.repository.find();
    }

    async findByEmail(email: string): Promise<Professor | null> {
        return this.repository.findOne({
            where: {
                user: {
                    email: email
                }
            },
            relations: ['user'] 

        });
    }

    async findByUsername(username: string): Promise<Professor | null> {
        return this.repository.findOne({
            where: {
                user: {
                    name: username
                }
            },
            relations: ['user'] 
        });
    }

    async canManageOwnExam(professor_id: number, exam_id: number): Promise<boolean> {
        const count = await this.repository.count({
            where: {
                professor_id: professor_id,
                exams: { 
                    id: exam_id
                }
            }
        });
        return count > 0;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    async create(professor_id: number) {
        const professor = this.repository.create({
            professor_id : professor_id
        });
        return this.repository.save(professor);
    }
}
