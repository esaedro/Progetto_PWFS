import { Address } from "./address.entity";
import { Book } from "./book.entity";
import { PrimaryGeneratedColumn, Column, ManyToMany, OneToOne, JoinColumn, Entity } from 'typeorm';

@Entity('authors')
export class Author {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type:'varchar', length: 255, nullable: false})
    firstName: string;

    @Column({type:'varchar', length: 255, nullable: false})
    lastName: string;

    @ManyToMany(()=>Book,(book)=>book.authors)
    books: Book[];

    @OneToOne(()=>Address, (address)=>address.author,{cascade:true, eager: true})
    @JoinColumn()
    address: Address;
}
