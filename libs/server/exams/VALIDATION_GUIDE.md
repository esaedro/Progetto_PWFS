# Exam Validation System

## Overview

Il sistema di validazione degli esami è stato rifatto per migliorare l'organizzazione del codice e raccogliere **tutti gli errori** prima di lanciarli, anziché fermarsi al primo errore riscontrato.

## Architettura

### ExamValidationService

Responsabile della validazione degli esami per creazione e aggiornamento. Raccoglie tutti gli errori in un array e li lancia insieme in un'eccezione.

#### Validazioni per createExam

1. **Professore e Insegnamento**: Verifica che il professore esista e insegni l'insegnamento specificato
2. **Sessione**: Verifica che la sessione esista
3. **Date dell'esame**: Verifica che inizio < fine e che i formati siano validi
4. **Finestra di esaminazione**: Verifica che l'esame sia all'interno della finestra della sessione
5. **Conflitti**: Verifica che non ci sia sovrapposizione con altri esami dello stesso anno della laurea

**Ordine di esecuzione**: 
- Validazioni semplici (1-4) vengono raccolte e lanciate come `ForbiddenException`
- Validazione dei conflitti (5) è lanciata come `ConflictException` solo dopo che le validazioni precedenti sono passate

#### Validazioni per updateExam

Le stesse validazioni di createExam, ma:
- Usa i valori attuali (dal DB) se non sono forniti nel DTO
- Esclude l'esame corrente dal controllo dei conflitti

### SessionValidationService

Responsabile della validazione delle sessioni. Organizza i controlli delle date in modo logico.

#### Validazioni per createSession

1. **Date nel passato**: Verifica che nessuna data sia nel passato (guarda solo il giorno, non l'ora)
2. **Logica temporale**:
   - `dateStartInsertion < dateEndInsertion`
   - `dateStartExamination < dateEndExamination`
   - `dateEndInsertion <= dateStartExamination` (non sovrapposizione)

**Nota**: La logica di validazione controlla solo il **giorno**, non l'ora, per evitare problemi di timezone.

#### Validazioni per updateSession

Le stesse di createSession, usando i valori attuali se non forniti nel DTO.

## Errori restituiti

### ForbiddenException

Lanciata quando le validazioni strutturali falliscono (errori di logica o parametri non validi).

**Contiene un array di stringhe**, una per ogni errore rilevato:

```json
{
  "statusCode": 403,
  "message": [
    "Il professore non è stato trovato o non ha insegnamenti",
    "La data di inizio dell'esame non è valida"
  ],
  "error": "Forbidden"
}
```

### ConflictException

Lanciata quando esiste un conflitto di orario con altri esami.

**Contiene un array di stringhe** con i dettagli dei conflitti:

```json
{
  "statusCode": 409,
  "message": [
    "Esame in conflitto con: Algoritmi (01/07/2026, 11:00:00), Strutture Dati (01/07/2026, 10:30:00)"
  ],
  "error": "Conflict"
}
```

### NotFoundException

Lanciata quando l'esame o la sessione da aggiornare non esiste.

## Esempi di utilizzo

### Creazione di un esame con molteplici errori

```bash
POST /exams/create
Content-Type: application/json
Authorization: Bearer <token>

{
  "dateTimeStart": "2026-07-01T15:00:00Z",
  "dateTimeEnd": "2026-07-01T12:00:00Z",    // ERRORE: inizio dopo fine
  "partial": false,
  "type": "orale",
  "teachingId": 999,                        // ERRORE: insegnamento non esiste
  "sessionId": 999,                         // ERRORE: sessione non esiste
  "professorId": 999                        // Fornito, ma ignorato (usa token)
}
```

**Risposta**: 403 Forbidden con array di errori

```json
{
  "statusCode": 403,
  "message": [
    "L'insegnamento specificato non esiste",
    "Sessione con id 999 non trovata",
    "La data di inizio dell'esame non è valida",
    "La data di inizio deve essere precedente alla data di fine"
  ],
  "error": "Forbidden"
}
```

### Aggiornamento di un esame con conflitto

```bash
PATCH /exams/update/1
Content-Type: application/json
Authorization: Bearer <token>

{
  "dateTimeStart": "2026-07-01T10:00:00Z"  // Cambia solo l'inizio
}
```

Se esiste un conflitto:

**Risposta**: 409 Conflict

```json
{
  "statusCode": 409,
  "message": [
    "Esame in conflitto con: Algoritmi (01/07/2026, 11:00:00)"
  ],
  "error": "Conflict"
}
```

## Benefici

1. **Migliore UX**: L'utente vede tutti gli errori contemporaneamente, non deve correggerli uno per uno
2. **Codice organizzato**: Responsabilità ben separate tra service di validazione e service principale
3. **Facile manutenzione**: Aggiungere/modificare validazioni è semplice e non influisce su altre
4. **Test leggibili**: Ogni metodo di validazione è testato singolarmente
5. **Errors informativi**: I conflitti elencano l'esame in conflitto con ora e nome dell'insegnamento
