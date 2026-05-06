import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Teaching } from "./teaching.entity";
import { Subject } from "./subject.entity";
import { Degree } from "./degree.entity";

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

     // In exams mettere findExamsByTeachingId con un filtro

    async findTeachingsBySubject(subjectId: number): Promise<Teaching[]> {
        return this.repository.find({
            where: {
                subject: { id: subjectId }
            },
            relations: ['degree', 'subject'],
            order: { id: 'ASC' }
        });
    }

    async createTeaching(data: { year: number; subject: Subject; degree: Degree }): Promise<Teaching> {
        const teaching = this.repository.create({
            year: data.year,
            subject: data.subject,
            degree: data.degree
        });
        return this.repository.save(teaching);
    }

    async updateTeaching(id: number, data: { year?: number; subject?: Subject; degree?: Degree }): Promise<Teaching | null> {
        const teaching = await this.findByID(id);
        if (!teaching)
            return null;
        if (data.year !== undefined) teaching.year = data.year;
        if (data.subject !== undefined) teaching.subject = data.subject;
        if (data.degree !== undefined) teaching.degree = data.degree;
        
        return this.repository.save(teaching);
    }

    async deleteTeaching(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }

}