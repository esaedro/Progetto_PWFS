# Security Fix: Prevent Unauthorized Exam Modification & Validate Professor ID Mismatch

## Problemi Identificati

### 1️⃣ Vulnerabilità di Sicurezza: Modifica di Esami Altrui

Un professore poteva **modificare o cancellare esami di un altro professore** perché il servizio non verificava la proprietà dell'esame.

### 2️⃣ Dati Sbagliati Ignorati Silenziosamente

Quando un client invia un `professorId` nel DTO diverso dal professore autenticato, il sistema **silenziosamente lo ignora** senza avvertire l'utente. Questo è un problema perché:
- L'utente non sa che ha mandato dati sbagliati
- Potrebbe essere un errore nel client che non viene catturato
- Non c'è feedback che il dato è stato ignorato

### Scenario di Attacco / Errore

```
Professore A (token: prof_id = 1):
  - Invia POST /exams/create con { professorId: 2, ... }
  - PRIMA: Silenziosamente crea l'esame con prof_id=1 (ignora l'errore)
  - DOPO: Lancia ForbiddenException con messaggio d'errore

Professore B (token: prof_id = 2):
  - Invia PATCH /exams/update/1 per modificare l'esame di Prof A
  - PRIMA: Riusciva perché il sistema non controllava la proprietà
  - DOPO: Fallisce con ForbiddenException
```

## Soluzioni Implementate

### 1. Nel Controller: Validazione del Mismatch (`exams.controller.ts`)

Aggiunto controllo nel metodo `create` e `update` per verificare che il `professorId` nel DTO corrisponda al professore autenticato:

```typescript
@Post('create')
async create(
    @Body(ValidationPipe) dto: CreateExamDto,
    @CurrentUser() currentUser: any
): Promise<Exam> {
    // Estrai l'ID del professore loggato
    const authenticatedProfessorId = currentUser?.professor_id || currentUser?.id;
    
    // ✅ Valida che il professorId nel DTO corrisponda al professore loggato
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
}
```

**Comportamento:**
- ✅ Se `professorId` è **omesso** nel DTO → usa quello autenticato (ok)
- ✅ Se `professorId` **corrisponde** → procede normalmente
- ❌ Se `professorId` **non corrisponde** → lancia `ForbiddenException`

### 2. Nel Service: Controllo di Proprietà (`exams.service.ts`)

Aggiunto controllo in `updateExam` e `deleteExam` per verificare che il professore autenticato sia il proprietario dell'esame:

```typescript
async updateExam(examId: number, dto: UpdateExamDto, professorId?: number): Promise<Exam> {
    const exam = await this.examsRepository.findById(examId);
    if (!exam) {
        throw new NotFoundException(`Esame con id ${examId} non trovato`);
    }

    // ✅ Verifica che il professore loggato sia il proprietario
    if (professorId && exam.professor.professor_id !== professorId) {
        throw new ForbiddenException('Non puoi aggiornare un esame di un altro professore');
    }

    // ... resto della validazione
    return this.examsRepository.update(exam, dto);
}
```

### 3. Test Aggiornati

Aggiunti test nel controller (`exams.controller.spec.ts`) per verificare:
- ✅ Creazione con `professorId` corretto
- ❌ Creazione con `professorId` sbagliato → `ForbiddenException`
- ✅ Creazione senza `professorId` → usa autenticato
- ✅ Update con `professorId` corretto
- ❌ Update con `professorId` sbagliato → `ForbiddenException`

## Flow di Sicurezza

```
┌─────────────────────────────────────────────────────┐
│ Client invia POST /exams/create                     │
│ { professorId: 999, teachingId: 5, ... }           │
└─────────────┬───────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────┐
│ JwtAuthGuard estrae token                           │
│ → currentUser.professor_id = 3                      │
└─────────────┬───────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────┐
│ Controller verifica:                                │
│ if (dto.professorId && dto.professorId !== 3)      │
│   → 999 !== 3 ❌                                    │
└─────────────┬───────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────┐
│ 🔒 ForbiddenException                               │
│ "Il professorId nel corpo della richiesta (999)    │
│  non corrisponde al professore autenticato (3)"    │
└─────────────────────────────────────────────────────┘
```

## Errori Lanciati

### ❌ Mismatch nel Controller

**Tipo**: `ForbiddenException` (403)

**Messaggio**:
```
Il professorId nel corpo della richiesta (999) non corrisponde al professore autenticato (3)
```

**Quando**: Quando il client invia un `professorId` diverso da quello autenticato.

### ❌ Modifiche Non Autorizzate nel Service

**Tipo**: `ForbiddenException` (403)

**Messaggio**:
- Per update: `"Non puoi aggiornare un esame di un altro professore"`
- Per delete: `"Non puoi cancellare un esame di un altro professore"`

**Quando**: Quando si tenta di modificare/cancellare un esame di cui non si è proprietari.

## Matrice di Sicurezza CRUD

| Operazione | Controllo | Risultato |
|-----------|-----------|-----------|
| **CREATE** | `professorId` nel DTO vs autenticato | ❌ Errore se non corrispondono |
| **CREATE** | `professorId` omesso nel DTO | ✅ Usa autenticato |
| **READ** | Nessun controllo | ✅ Tutti i professori possono leggere |
| **UPDATE** | Proprietà esame vs autenticato | ❌ Errore se non corrispondono |
| **UPDATE** | `professorId` nel DTO vs autenticato | ❌ Errore se non corrispondono |
| **DELETE** | Proprietà esame vs autenticato | ❌ Errore se non corrispondono |

## Benefici

| Aspetto | Valore |
|---------|--------|
| **Sicurezza** | Impossibile modificare esami altrui o inviare dati sbagliati silenziosamente |
| **Data Integrity** | I dati rimangono consistenti |
| **User Feedback** | Errori chiari quando il `professorId` non corrisponde |
| **Audit Trail** | Chiaro quale professore ha fatto quale azione |
| **API Contract** | Il client sa che deve inviare il `professorId` corretto |

## Testing

Esegui i test per verificare:
```bash
# Test controller
npm test libs/server/exams -- exams.controller.spec.ts

# Test service
npm test libs/server/exams -- exams.service.spec.ts

# Verifica TypeScript
npx tsc --noEmit
```

## Deployment Notes

- **Breaking change**: No, solo fix di sicurezza e validazione
- **Migration**: No migration needed
- **Rollout**: Safe to deploy immediately
- **Impact**: Client che inviavano `professorId` sbagliato riceveranno ora `ForbiddenException`
