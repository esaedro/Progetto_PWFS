import { Entity, JoinColumn, OneToOne, OneToMany } from "typeorm";
import type { Relation } from "typeorm";

import { UserEntity } from '@server/users';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Session } from '@server/exams';

@Entity("Secretariat")
export class Secretariat extends UserEntity {

    @OneToOne(() => UserEntity, (user) => user.id, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @JoinColumn()
    secretariat_id: number;

    @OneToMany(() => Session, (session) => session.secretary)
    sessions: Relation<Session[]>;

}