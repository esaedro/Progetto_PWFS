import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Teaching } from "./teaching.entity";
import { Degree } from "./degree.entity";
import { Subject } from "./subject.entity";

@Injectable()
export class TeachingRepository {
    constructor(
        @InjectRepository(Teaching)
        private readonly repository: Repository<Teaching>
    ) {}

    findAll(): Promise<Teaching[]> {
        return this.repository.find({order: {id: "ASC"}}); 
    }

    findByID(id: number): Promise<Teaching | null> {
        return this.repository.findOne({where: {id}});
    }
    
    async findDegreeByTeachingId(teachingId: number): Promise<Degree | null> {
        const teaching = await this.repository.findOne({ where: { id: teachingId }, relations: ['degree'] });
        return teaching ? teaching.degree : null;
    }

    async findSubjectByTeachingId(teachingId: number): Promise<Subject | null> {
        const teaching = await this.repository.findOne({ where: { id: teachingId }, relations: ['subject'] });
        return teaching ? teaching.subject : null;
    }

    // In exams mettere findExamsByTeachingId con un filtro

    async deleteTeaching(id:number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    // create e update con i loro DTO?

}