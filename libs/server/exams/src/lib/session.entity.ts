import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Exam } from './exam.entity';


@Entity('Sessions')
export class Session {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date', nullable: false })
    dateStartExamination: Date;

    @Column({ type: 'date', nullable: false })
    dateEndExamination: Date;

    @Column({ type: 'date', nullable: false })
    dateStartInsertion: Date;

    @Column({ type: 'date', nullable: false })
    dateEndInsertion: Date;

    @Column({ type: 'json', nullable: true })
    holidays: string[];

    @OneToMany(() => Exam, (exam) => exam.session)
    exams: Exam[];

}
