import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Teaching } from "./teaching.entity";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Professor } from "@server/people/professor.entity";

//id, nome 
@Entity("Subjects")
export class Subject {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 255, nullable: false})
    name: string;
    
    @ManyToMany(() => Professor, (professor) => professor.subjects, {
        onDelete: "CASCADE",
    })  
    @JoinTable({
        name: "professor_subject", // nome della tabella di join
        joinColumn: {
            name: "subject_id",
            referencedColumnName: "id",
        }, // colonna che fa riferimento alla materia
        inverseJoinColumn: {
            name: "professor_id",
            referencedColumnName: "professor_id",
        }, // colonna che fa riferimento al docente
    })
    professors: Professor[];

    @OneToMany(() => Teaching, (teaching) => teaching.subject)
    teachings : Teaching[];

}