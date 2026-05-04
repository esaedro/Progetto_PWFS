import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import type { Relation } from "typeorm";

import { Degree } from "./degree.entity";
import { Subject } from "./subject.entity";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Exam } from '@server/exams';
import { Max, Min } from "class-validator";


@Entity("Teachings")
export class Teaching {

    //id, anno, frequenza
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int", nullable: false /*, comment: "Accettati numeri da 1 a 5" */})  // vincoli 1-5/6?
    @Min(1)
    @Max(5)
    year: number;

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

