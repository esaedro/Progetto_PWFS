import { Entity, JoinColumn, OneToOne, OneToMany, ManyToMany } from "typeorm";
import type { Relation } from "typeorm";

import { UserEntity } from '@server/users';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Exam } from '@server/exams';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Subject } from "@server/courses";


@Entity("Professors")
export class Professor extends UserEntity {

    @OneToOne(() => UserEntity, (user) => user.id, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @JoinColumn()
    professor_id: number;

    @OneToMany(() => Exam, (exam) => exam.professor)
    exams : Relation<Exam[]>;

    @ManyToMany(() => Subject, (subject) => subject.professors)
    subjects: Relation<Subject[]>;

}