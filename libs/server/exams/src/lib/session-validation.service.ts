import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session } from './session.entity';

@Injectable()
export class SessionValidationService {
    /**
     * Valida una sessione per la creazione.
     * Raccoglie TUTTI gli errori prima di lanciarli.
     */
    async validateForCreate(dto: CreateSessionDto): Promise<void> {
        const errors: string[] = [];

        // 1. Validazione che le date non siano nel passato
        this.validateDatesNotInPast(
            [dto.dateStartInsertion, dto.dateEndInsertion, dto.dateStartExamination, dto.dateEndExamination],
            ['inizio inserimento', 'fine inserimento', 'inizio esaminazione', 'fine esaminazione'],
            errors
        );

        // 2. Validazione della logica temporale e della non sovrapposizione
        this.validateDateLogic(
            dto.dateStartInsertion,
            dto.dateEndInsertion,
            dto.dateStartExamination,
            dto.dateEndExamination,
            errors
        );

        if (errors.length > 0) {
            throw new ForbiddenException(errors);
        }
    }

    /**
     * Valida una sessione per l'aggiornamento.
     * Raccoglie TUTTI gli errori prima di lanciarli.
     */
    async validateForUpdate(dto: UpdateSessionDto, session: Session): Promise<void> {
        // Estrae i valori effettivi (aggiornati o attuali)
        const dateStartInsertion = dto.dateStartInsertion !== undefined ? dto.dateStartInsertion : session.dateStartInsertion;
        const dateEndInsertion = dto.dateEndInsertion !== undefined ? dto.dateEndInsertion : session.dateEndInsertion;
        const dateStartExamination = dto.dateStartExamination !== undefined ? dto.dateStartExamination : session.dateStartExamination;
        const dateEndExamination = dto.dateEndExamination !== undefined ? dto.dateEndExamination : session.dateEndExamination;

        const errors: string[] = [];

        // 1. Validazione che le date non siano nel passato
        this.validateDatesNotInPast(
            [dateStartInsertion, dateEndInsertion, dateStartExamination, dateEndExamination],
            ['inizio inserimento', 'fine inserimento', 'inizio esaminazione', 'fine esaminazione'],
            errors
        );

        // 2. Validazione della logica temporale e della non sovrapposizione
        this.validateDateLogic(
            dateStartInsertion,
            dateEndInsertion,
            dateStartExamination,
            dateEndExamination,
            errors
        );

        if (errors.length > 0) {
            throw new ForbiddenException(errors);
        }
    }

    /**
     * Valida che tutte le date non siano nel passato.
     * Controlla solo il giorno, non l'ora, per evitare problemi di timezone.
     */
    private validateDatesNotInPast(
        dates: (Date | string)[],
        labels: string[],
        errors: string[]
    ): void {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        dates.forEach((date, index) => {
            try {
                const dateObj = new Date(date);
                if (isNaN(dateObj.getTime())) {
                    errors.push(`La data di ${labels[index]} non è valida`);
                } else if (dateObj < todayStart) {
                    errors.push(`La data di ${labels[index]} non può essere nel passato`);
                }
            } catch (error) {
                errors.push(`Errore nella validazione della data di ${labels[index]}`);
            }
        });
    }

    /**
     * Valida la logica temporale delle date:
     * - inizio inserimento < fine inserimento
     * - inizio esaminazione < fine esaminazione
     * - fine inserimento <= inizio esaminazione (non sovrapposizione)
     */
    private validateDateLogic(
        dateStartInsertion: Date | string,
        dateEndInsertion: Date | string,
        dateStartExamination: Date | string,
        dateEndExamination: Date | string,
        errors: string[]
    ): void {
        try {
            const start1 = new Date(dateStartInsertion);
            const end1 = new Date(dateEndInsertion);
            const start2 = new Date(dateStartExamination);
            const end2 = new Date(dateEndExamination);

            // Controlla che tutte le date siano valide
            if (isNaN(start1.getTime()) || isNaN(end1.getTime()) || isNaN(start2.getTime()) || isNaN(end2.getTime())) {
                // Gli errori sono già stati aggiunti da validateDatesNotInPast
                return;
            }

            // 1. Validazione: inizio inserimento < fine inserimento
            if (start1 >= end1) {
                errors.push('La data di inizio inserimento deve essere precedente alla data di fine inserimento');
            }

            // 2. Validazione: inizio esaminazione < fine esaminazione
            if (start2 >= end2) {
                errors.push('La data di inizio esaminazione deve essere precedente alla data di fine esaminazione');
            }

            // 3. Validazione: fine inserimento <= inizio esaminazione (non sovrapposizione)
            if (end1 > start2) {
                errors.push('La fase di inserimento non può sovrapporsi con la fase di esaminazione');
            }
        } catch (error) {
            errors.push('Errore nella validazione della logica temporale delle date');
        }
    }
}
