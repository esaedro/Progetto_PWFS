import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Subject } from "./subject.entity";

@Injectable()
export class SubjectRepository { 
    constructor(
        @InjectRepository(Subject)
        private readonly repository: Repository<Subject>
    ) {}


    findAll(): Promise<Subject[]> {
        return this.repository.find({order: {id: "ASC"}}); // ordinamento per id crescente
    }

    findByID(id: number): Promise<Subject | null> {
        return this.repository.findOne({where: {id}});
    }

    findSubjectsByProfessor(professorId: number): Promise<Subject[] | null> {
        return this.repository.createQueryBuilder("subject")
            .innerJoin("subject.professors", "professor", "professor.id = :professorId", { professorId })
            .orderBy("subject.id", "ASC")
            .getMany();
    } 

    async deleteSubject(id:number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }
 

    // create e update con i loro DTO?


}