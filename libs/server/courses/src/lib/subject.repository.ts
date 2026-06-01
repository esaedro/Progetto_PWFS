import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Subject } from "./subject.entity";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Professor } from "@server/people";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { UpdateSubjectDto } from "./dto/update-subject.dto";

@Injectable()
export class SubjectRepository { 
    constructor(
        @InjectRepository(Subject)
        private readonly repository: Repository<Subject>
    ) {}


    findAll(): Promise<Subject[]> {
        return this.repository.find({relations: ['professors'], order: {id: "ASC"}}); // includi professori
    }

    findByID(id: number): Promise<Subject | null> {
        return this.repository.findOne({where: {id}, relations: ['professors']});
    }

    findSubjectsByProfessor(professorId: number): Promise<Subject[] | null> {
        return this.repository.createQueryBuilder("subject")
            .leftJoinAndSelect('subject.professors', 'professor')
            .where('professor.professor_id = :professorId', { professorId })
            .orderBy("subject.id", "ASC")
            .getMany();
    } 

    async createSubject(dto: CreateSubjectDto, professors: Professor[]): Promise<Subject> {
        const subject = this.repository.create({
            name: dto.name,
            professors
        });
        return this.repository.save(subject);
    }

    async upgradeSubject(id: number, dto: UpdateSubjectDto, professors?: Professor[]): Promise<Subject|null> {
        const subject = await this.findByID(id);
        if(!subject)
            return null;
        if (dto.name !== undefined) subject.name = dto.name;
        if (professors !== undefined) subject.professors = professors;
        
        return this.repository.save(subject);
    }

    async deleteSubject(id:number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }
 

    // create e update con i loro DTO?


}