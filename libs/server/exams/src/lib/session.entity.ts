import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Exam } from './exam.entity';


@Entity('Sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', nullable: false })
  data_inizio_esami: Date;

  @Column({ type: 'date', nullable: false })
  data_fine_esami: Date;

  @Column({ type: 'date', nullable: false })
  data_inizio_calendarizzazione: Date;

  @Column({ type: 'date', nullable: false })
  data_fine_calendarizzazione: Date;

  @OneToMany(() => Exam, (exam) => exam.session)
  exams: Exam[];

}
