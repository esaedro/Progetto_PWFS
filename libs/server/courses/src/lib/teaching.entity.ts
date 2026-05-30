import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn, Index } from "typeorm";
import type { Relation } from "typeorm";

import { Degree } from "./degree.entity";
import { Subject } from "./subject.entity";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Exam } from '@server/exams';
import { Min } from "class-validator";


@Entity("Teachings")
@Index("uq_teaching_degree_subject_year", ["degree", "subject", "year"], { unique: true })
export class Teaching {

    //id, anno, frequenza
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int", nullable: false /*, comment: "Accettati numeri da 1 a 5" */})  // vincoli 1-5/6?
    @Min(1)
    year: number; 
    // Validazione max dinamica in service in base a degree.durationYears

    //Many to one verso Subject e Degree
    @ManyToOne(()=>Subject,(subject)=>subject.teachings,{nullable:false, eager:true,onDelete:'RESTRICT'}) //check proprietà
    @JoinColumn() // optional on OneToMany relations
    subject: Subject;

    @ManyToOne(()=>Degree,(degree)=>degree.teachings,{nullable:false, eager:true,onDelete:'RESTRICT'}) //check proprietà
    @JoinColumn()
    degree: Degree;

    //one to many verso Exam
    @OneToMany(() => Exam, (exam) => exam.teaching)
    exams : Relation<Exam[]>;

}