import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';

//import { UserEntity } from '@server/users';
import { Session } from './session.entity';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Teaching } from '@server/courses/teaching.entity';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Professor } from '@server/people/professor.entity';
import { ExamType } from './dto/exam-type.enum';


@Entity('Exams')
export class Exam {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamptz', nullable: false })
    dateTimeStart: Date;

    @Column({ type: 'timestamptz', nullable: false })
    dateTimeEnd: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    room: string;

    @Column({ type: 'varchar', length: 1000, nullable: true })
    description: string;

    @Column({ type: 'boolean', nullable: false })
    partial: boolean;

    @Column({ type: 'enum', enum: ExamType, nullable: false })
    type: ExamType;

    @ManyToOne(() => Teaching, (teaching) => teaching.exams)
    @JoinColumn({ name: 'teaching_id' })
    teaching: Relation<Teaching>;

    @ManyToOne(() => Professor, (professor) => professor.exams)
    @JoinColumn({ name: 'professor_id' })
    professor: Relation<Professor>;

    @ManyToOne(() => Session, (session) => session.exams)
    @JoinColumn({ name: 'session_id' })
    session: Relation<Session>;
}
