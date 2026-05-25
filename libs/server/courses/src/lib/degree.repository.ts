import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Degree } from "./degree.entity";
import { CreateDegreeDto } from "./dto/create-degree.dto";
import { UpgradeDegreeDto } from "./dto/update-degree.dto";

@Injectable()
export class DegreeRepository {
    constructor(
        @InjectRepository(Degree)
        private readonly repository: Repository<Degree>) {}

    // Implementazione dei metodi per la gestione dei corsi di laurea
    
    findAll(): Promise<Degree[]> {
        return this.repository.find({order: {id: "ASC"}}); // ordinamento per id crescente
    }
    
    findByID(id: number): Promise<Degree | null> {
        return this.repository.findOne({where: {id}});
    }
    
    async createDegree(dto: CreateDegreeDto): Promise<Degree> {
        const degree = this.repository.create({
            name: dto.name,
            durationYears: dto.durationYears
        });
        return this.repository.save(degree);
    }

    async updateDegree(id: number, dto: UpgradeDegreeDto): Promise<Degree|null> {
        const degree = await this.findByID(id); 
        if(!degree)
            return null;
        if (dto.name !== undefined) degree.name = dto.name;
        if (dto.durationYears !== undefined) degree.durationYears = dto.durationYears;
        return this.repository.save(degree);
    }
   
    async deleteDegree(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }

}