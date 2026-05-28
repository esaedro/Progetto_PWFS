# Update: Validazione del ProfessorId nei Dati Inviati dal Client

## Sommario delle Modifiche

Hai identificato un problema molto importante: quando il client invia un `professorId` **sbagliato** nel JSON della richiesta, il sistema **silenziosamente lo ignorava** senza avvertire l'utente.

Questo è stato risolto aggiungendo una **validazione nel controller** che verifica che il `professorId` inviato dal client corrisponda al professore autenticato dal token.

## File Modificati

| File | Cambio | Descrizione |
|------|--------|------------|
| `exams.controller.ts` | ✏️ Modificato | Aggiunta validazione del mismatch tra DTO e token |
| `exams.controller.spec.ts` | ✨ Nuovo | Test completi del controller con casi di errore |
| `PROFESSOR_ID_VALIDATION.md` | ✨ Nuovo | Documentazione del nuovo comportamento |

## Cosa Fa Ora

### Nel metodo `create`

```typescript
// Estrai l'ID del professore loggato
const authenticatedProfessorId = currentUser?.professor_id || currentUser?.id;

// ✅ NUOVO: Valida che il professorId nel DTO corrisponda
if (dto.professorId && dto.professorId !== authenticatedProfessorId) {
    throw new ForbiddenException(
        `Il professorId nel corpo della richiesta (${dto.professorId}) ` +
        `non corrisponde al professore autenticato (${authenticatedProfessorId})`
    );
}

return this.serverExamsService.createExam({
    ...dto,
    professorId: authenticatedProfessorId
});
```

### Nel metodo `update`

Same logic as create - verifica il mismatch se fornito.

## Comportamento

### ✅ Accettati

| Caso | Esempio | Risultato |
|------|---------|-----------|
| ID Corretto | `professorId: 3` con token prof_3 | ✅ Procede normalmente |
| ID Omesso | Nessun `professorId` nel DTO | ✅ Usa quello dal token |
| Update senza ID | Nessun `professorId` nell'update | ✅ Procede normalmente |

### ❌ Rifiutati

| Caso | Esempio | Errore |
|------|---------|--------|
| ID Sbagliato | `professorId: 999` con token prof_3 | `ForbiddenException` |
| ID Sbagliato Update | `professorId: 999` nell'update | `ForbiddenException` |

## Errore Lanciato

```json
{
  "statusCode": 403,
  "message": "Il professorId nel corpo della richiesta (999) non corrisponde al professore autenticato (3)",
  "error": "Forbidden"
}
```

## Test Aggiunti

Nel file `exams.controller.spec.ts` sono stati aggiunti test per:

1. ✅ Creazione con `professorId` corretto
2. ❌ Creazione con `professorId` sbagliato
3. ✅ Creazione senza `professorId`
4. ✅ Creazione con fallback su `id` se `professor_id` non c'è
5. ✅ Update con `professorId` corretto
6. ❌ Update con `professorId` sbagliato
7. ✅ Update senza `professorId`
8. ✅ Delete con validazione

## Benefici

| Aspetto | Valore |
|---------|--------|
| **Bug Detection** | Errori nel client vengono catturati subito, non ignorati |
| **User Feedback** | Messaggio chiaro dice esattamente quale dato è sbagliato |
| **Data Integrity** | Impossibile inviare dati incoerenti |
| **Developer Experience** | Debug diventa più facile con errori espliciti |

## Raccomandazione per i Client

**Non inviare il `professorId`** nel DTO. È completamente opzionale e il server lo estrarrà dal token:

```bash
# ✅ CONSIGLIATO
POST /exams/create
{
  "teachingId": 5,
  "sessionId": 2,
  "dateTimeStart": "2026-07-01T09:00:00Z",
  ...
}

# ⚠️ Accettabile ma non necessario
POST /exams/create
{
  "professorId": 3,  # ← Deve corrispondere al token
  "teachingId": 5,
  ...
}
```

## Validazione

✅ TypeScript compila senza errori
✅ Controller test completo con tutti i casi
✅ Nessun breaking change per client corretti
⚠️ Breaking change solo se il client inviava `professorId` sbagliato

## Documento Complementare

Vedi `PROFESSOR_ID_VALIDATION.md` per:
- Esempi dettagliati di richieste
- Casi di errore e come risolverli
- FAQ
