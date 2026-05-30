import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Teaching } from "./teaching.entity";
import { Subject } from "./subject.entity";
import { Degree } from "./degree.entity";
import { CreateTeachingDto } from "./dto/create-teaching.dto";
import { UpdateTeachingDto } from "./dto/update-teaching.dto";

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

    findByDegreeSubjectYear(degreeId: number, subjectId: number, year: number): Promise<Teaching | null> {
        return this.repository.findOne({
            where: {
                degree: { id: degreeId },
                subject: { id: subjectId },
                year: year
            }
        });
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

    async createTeaching(dto: CreateTeachingDto): Promise<Teaching> {
        const teaching = this.repository.create({
            year: dto.year,
            subject: {id: dto.subjectId},
            degree: {id: dto.degreeId}
        });
        return this.repository.save(teaching);
    }

    async updateTeaching(id: number, dto: UpdateTeachingDto, subject?: Subject, degree?: Degree): Promise<Teaching | null> {
        const teaching = await this.findByID(id);
        if (!teaching)
            return null;
        if (dto.year !== undefined) teaching.year = dto.year;
        if (subject !== undefined) teaching.subject = subject;
        if (degree !== undefined) teaching.degree = degree;
        
        return this.repository.save(teaching);
    }

    async deleteTeaching(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }

}