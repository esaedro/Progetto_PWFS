import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn, Index } from "typeorm";
import type { Relation } from "typeorm";

import { Degree } from "./degree.entity";
import { Subject } from "./subject.entity";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Exam } from '@server/exams/exam.entity';
import { Min } from "class-validator";


@Entity("Teachings")
@Index("uq_teaching_degree_subject_year", ["degree", "subject", "year"], { unique: true })
export class Teaching {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int", nullable: false})
    @Min(1)
    // Validazione max dinamica in service in base a degree.durationYears
    year: number; 
    
    //Many to one verso Subject e Degree
    @ManyToOne(()=>Subject,(subject)=>subject.teachings,{nullable:false, eager:true,onDelete:'CASCADE'})
    @JoinColumn() // optional on OneToMany relations
    subject: Relation<Subject>;

    @ManyToOne(()=>Degree,(degree)=>degree.teachings,{nullable:false, eager:true,onDelete:'CASCADE'})
    @JoinColumn()
    degree: Relation<Degree>;

    //one to many verso Exam
    @OneToMany(() => Exam, (exam) => exam.teaching)
    exams : Relation<Exam[]>;

}