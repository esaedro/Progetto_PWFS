import { PrimaryGeneratedColumn, Column, OneToOne, Entity } from 'typeorm';
import { Author } from "./author.entity";

@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type:'varchar', length: 255})
    street: string;

    @Column({type:'varchar', length: 255})
    city: string;

    @Column({type:'varchar', length: 10})
    zipCode: string;

    @Column({type:'varchar', length: 255})
    country: string;

    @OneToOne(()=>Author, (author)=>author.address)
    author: Author;
}
