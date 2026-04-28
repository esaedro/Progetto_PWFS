import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Book } from './book.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type:'varchar', length: 255, nullable: false, unique: true})
    name: string;

    @OneToMany(()=>Book,(book)=>book.category)
    books: Book[];
}
