import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Sessione } from './sessione.entity';

@Entity('appello')
export class Appello {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', nullable: false })
  data_ora: Date;

  @Column({ type: 'varchar', length: 255, nullable: false })
  aula: string;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  descrizione: string;

  @Column({ type: 'boolean', nullable: false })
  parziale: boolean;

  @Column({ type: 'varchar', length: 255, nullable: false })
  tipologia: 'Scritto' | 'Orale' | 'Verbalizzazione';

  @ManyToOne(() => Insegnamento, (insegnamento) => insegnamento.appelli)
  @JoinColumn({ name: 'insegnamento_id' })
  insegnamento: Insegnamento;

  @ManyToOne(() => Docente, (docente) => docente.appelli)
  @JoinColumn({ name: 'docente_id' })
  docente: Docente;

  @ManyToOne(() => Sessione, (sessione) => sessione.appelli)
  @JoinColumn({ name: 'sessione_id' })
  sessione: Sessione;
}
