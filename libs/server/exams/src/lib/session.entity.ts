import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { Exam } from './exam.entity';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Secretariat } from '@server/people';

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

  @ManyToOne(() => Secretariat, (secretariat) => secretariat.sessions)
  @JoinColumn({ name: 'secretariat_id' })
  secretary: Secretariat;
}
