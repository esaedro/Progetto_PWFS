import { Entity, JoinColumn, OneToOne, OneToMany, ManyToMany, PrimaryColumn } from "typeorm";
import type { Relation } from "typeorm";

import { UserEntity } from '@server/users';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Exam } from '@server/exams/exam.entity';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Subject } from "@server/courses/subject.entity";

@Entity("Professors")
export class Professor {

    @PrimaryColumn({ name: 'professor_id', type: 'int' })
    professor_id: number;

    @OneToOne(() => UserEntity, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'professor_id' }) // Points to the exact same column
    user: Relation<UserEntity>;

    @OneToMany(() => Exam, (exam) => exam.professor)
    exams : Relation<Exam[]>;

    @ManyToMany(() => Subject, (subject) => subject.professors, {
        onDelete: "CASCADE",
    })
    subjects: Relation<Subject[]>;

}