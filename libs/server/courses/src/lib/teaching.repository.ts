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
    
    async findByDegreeAndYear(degreeId: number, year: number): Promise<Teaching[]> {
        return this.repository.find({
            where: {
                degree: { id: degreeId },
                year: year
            },
            relations: ['degree', 'subject'],
            order: { id: 'ASC' }
        });
    }

    async findTeachingsBySubject(subjectId: number): Promise<Teaching[]> {
        return this.repository.find({
            where: {
                subject: { id: subjectId }
            },
            relations: ['degree', 'subject'],
            order: { id: 'ASC' }
        });
    }

    // In exams mettere findExamsByTeachingId con un filtro

    async deleteTeaching(id:number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    // create e update con i loro DTO?

}