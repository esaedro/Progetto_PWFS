import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';

//import { UserEntity } from '@server/users';
import { Session } from './session.entity';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Teaching } from '@server/courses';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Professor } from '@server/people';
import { ExamType } from './dto/exam-type.enum';


@Entity('Exams')
export class Exam {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date', nullable: false })
    dateTimeStart: Date;

    @Column({ type: 'date', nullable: false })
    dateTimeEnd: Date;

    @Column({ type: 'varchar', length: 255, nullable: false })
    room: string;

    @Column({ type: 'varchar', length: 1000, nullable: false })
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
    session: Session;
}
