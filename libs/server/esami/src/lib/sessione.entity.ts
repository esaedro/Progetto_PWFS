import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { Appello } from './appello.entity';

@Entity('sessione')
export class Sessione {
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

  @OneToMany(() => Appello, (appello) => appello.sessione)
  appelli: Appello[];

  @ManyToOne(() => Segreteria, (segreteria) => segreteria.sessioni)
  @JoinColumn({ name: 'segreteria_id' })
  segretario: Segreteria;
}
