import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Degree } from "./degree.entity";

@Injectable()
export class DegreeRepository {
    constructor(
        @InjectRepository(Degree)
        private readonly repository: Repository<Degree>) {}

    // Implementazione dei metodi per la gestione dei corsi di laurea, ad esempio:
    findAll(): Promise<Degree[]> {
        return this.repository.find({order: {id: "ASC"}}); // ordinamento per id crescente
    }
    
    // - findByID(id: number): Promise<Degree | null>
    findByID(id: number): Promise<Degree | null> {
        return this.repository.findOne({where: {id}});
    }
 

    // - deleteDegree(id: number): Promise<void>
    async deleteDegree(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    // Li creiamo a mano dal database oppure attraverso il sito? in questo caso servono i metodi create-update
    // - createDegree(name: string): Promise<Degree>
    // serve il suo CreateDegreeDto

    // - updateDegree(id: number, name: string): Promise<Degree>

}