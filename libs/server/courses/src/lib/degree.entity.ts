import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Teaching } from "./teaching.entity";

@Entity("Degrees")
export class Degree {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 255, nullable: false})
    name: string;

    // Aggiungere un codice identificativo per il corso di laurea, diverso dall'id autoincrementale?

    // One to many verso Teaching
    @OneToMany(() => Teaching, (teaching) => teaching.degree)
    teachings : Teaching[];

}