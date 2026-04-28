import { ConflictException, Injectable, InternalServerErrorException, UnprocessableEntityException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Book } from './book.entity';
import { Author } from './author.entity';
import { Category } from './category.entity';

type PgError = {
  code?: string;
  detail?: string;
  table?: string;
  column?: string;
  constraint?: string;
};

@Injectable()
export class OrgBooksService {
    constructor(
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,

        @InjectRepository(Author)
        private readonly authorRepository: Repository<Author>,

        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>
    ) {}

    async seed() {
        try{
            const category = this.categoryRepository.create({
                name: 'Fantascienza'
            });
            const savedCategory = await this.categoryRepository.save(category);

            const author1 = this.authorRepository.create({
                firstName: 'Isaac',
                lastName: 'Asimov',
                address: {
                    street: 'Via Roma 10',
                    city: 'Milan',
                    zipCode: '20100',
                    country: 'Italy'
                }
            });

            const author2 = this.authorRepository.create({
                firstName: 'Arthur',
                lastName: 'Clarke',
                address: {
                    street: 'Corso Torino 22',
                    city: 'Turin',
                    zipCode: '10100',
                    country: 'Italy'
                }
            });

            const savedAuthors = await this.authorRepository.save([author1,author2]);

            const book = this.bookRepository.create({
                title: 'Antology of the Sci-Fi',
                publishedYear: 2025,
                category: savedCategory,
                authors: savedAuthors
            });

            return await this.bookRepository.save(book);
        } catch(error) {
            this.handleDatabaseError(error);
        }
    }

    private readonly dbErrorFactories: Record<string, (e: PgError) => Error> = {
        '23505': (e) =>
        new ConflictException(
            this.formatMessage(
            'Violazione di unicità',
            e,
            'Esiste già un record con questi valori univoci',
            ),
        ),

        '23502': (e) =>
        new UnprocessableEntityException(
            this.formatMessage(
            'Campo obbligatorio mancante',
            e,
            `Il campo ${e.column ?? 'richiesto'} non può essere null`,
            ),
        ),

        '23503': (e) =>
        new BadRequestException(
            this.formatMessage(
            'Violazione di foreign key',
            e,
            'La relazione richiesta non è valida',
            ),
        ),

        '23514': (e) =>
        new UnprocessableEntityException(
            this.formatMessage(
            'Violazione di check constraint',
            e,
            'I dati non rispettano una regola del database',
            ),
        ),

        '23P01': (e) =>
        new ConflictException(
            this.formatMessage(
            'Violazione di exclusion constraint',
            e,
            'Il record è in conflitto con un altro record esistente',
            ),
        ),

        '40001': () =>
        new ServiceUnavailableException(
            'Conflitto concorrente sul database. Riprova.',
        ),

        '40P01': () =>
        new ServiceUnavailableException(
            'Deadlock rilevato sul database. Riprova.',
        ),
    };

    private handleDatabaseError(error: unknown): never {
        if (error instanceof QueryFailedError) {
            const e = error.driverError as PgError;

            const factory = e.code
                ? this.dbErrorFactories[e.code]
                : undefined;

            if (factory) {
                throw factory(e);
            }
        }

        throw new InternalServerErrorException('Error during database seeding');
    }

    private formatMessage(title: string,error: PgError,fallback: string): string {
        const parts = [title];

        if (error.constraint) {
        parts.push(`constraint: ${error.constraint}`);
        }

        if (error.table) {
        parts.push(`tabella: ${error.table}`);
        }

        if (error.column) {
        parts.push(`colonna: ${error.column}`);
        }

        if (error.detail) {
        parts.push(`dettaglio: ${error.detail}`);
        } else {
        parts.push(fallback);
        }

        return parts.join(' - ');
    }

    async findAllBooks() {
        return await this.bookRepository.find({
            relations: {
                authors: true
            }
        });
    }
}
