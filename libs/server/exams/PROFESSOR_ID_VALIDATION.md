# Validation Update: Professor ID Mismatch Detection

## Cosa è Cambiato

Precedentemente, quando un client inviava un `professorId` **sbagliato** nel DTO della richiesta, il sistema **silenziosamente lo ignorava** e creava l'esame comunque con il professore autenticato.

**Esempio di prima:**
```bash
# Il token appartiene al professore con id=3
# Ma la richiesta invia un professorId sbagliato
POST /exams/create
{
  "professorId": 999,           # ← SBAGLIATO
  "teachingId": 5,
  "sessionId": 2,
  ...
}

# PRIMA: ✅ Creava l'esame con prof_id=3 (ignora l'errore silenziosamente)
# DOPO:  ❌ ForbiddenException - il cliente sa che c'è un errore
```

## Nuovo Comportamento

Ora il sistema **valida che il `professorId` nel DTO corrisponda al professore autenticato**.

### ✅ Casi che Funzionano

#### 1. Il `professorId` corrisponde al professore autenticato
```bash
POST /exams/create
Authorization: Bearer token_prof_3

{
  "professorId": 3,           # ✅ Corrisponde al token
  "teachingId": 5,
  "sessionId": 2,
  ...
}

# Risultato: ✅ Esame creato con successo
```

#### 2. Il `professorId` è **omesso** (consigliato)
```bash
POST /exams/create
Authorization: Bearer token_prof_3

{
  "teachingId": 5,            # ← professorId omesso
  "sessionId": 2,
  ...
}

# Risultato: ✅ Esame creato con prof_id=3 (da token)
# Questo è il comportamento ideale - non mandare professorId
```

### ❌ Casi che Non Funzionano Più

#### 1. Il `professorId` non corrisponde
```bash
POST /exams/create
Authorization: Bearer token_prof_3

{
  "professorId": 999,         # ❌ Non corrisponde
  "teachingId": 5,
  "sessionId": 2,
  ...
}

# Risultato: ❌ ForbiddenException
{
  "statusCode": 403,
  "message": "Il professorId nel corpo della richiesta (999) non corrisponde al professore autenticato (3)",
  "error": "Forbidden"
}
```

#### 2. Stesso problema con UPDATE
```bash
PATCH /exams/update/1
Authorization: Bearer token_prof_3

{
  "professorId": 999,         # ❌ Non corrisponde
  "type": "scritto"
}

# Risultato: ❌ ForbiddenException
```

## Vantaggi

1. **Bug Detection**: Errori nel client vengono **catturati subito**, non ignorati silenziosamente
2. **Data Integrity**: Impossibile inviare dati inconsistenti
3. **Clear Feedback**: Il client sa esattamente quale dato è sbagliato
4. **Security**: Non ci sono ambiguità su quale professore è proprietario dell'esame

## Per i Client

### Raccomandazione: Non Inviare `professorId`

È consigliato **non inviare il `professorId`** nel corpo della richiesta. Il server lo estrarrà dal token:

```bash
# ✅ CONSIGLIATO - Non inviare professorId
POST /exams/create
{
  "teachingId": 5,
  "sessionId": 2,
  "dateTimeStart": "2026-07-01T09:00:00Z",
  "dateTimeEnd": "2026-07-01T12:00:00Z",
  "partial": false,
  "type": "orale"
}
```

### Alternativa: Inviare il Valore Corretto

Se il tuo client ha il `professorId`, assicurati che corrisponda al token:

```bash
# ✅ Accettabile - Inviare professorId se corrisponde al token
POST /exams/create
{
  "professorId": 3,     # ← Stesso del token
  "teachingId": 5,
  ...
}
```

## Dove Si Applica

| Endpoint | Comportamento |
|----------|--------------|
| `POST /exams/create` | Valida che `professorId` corrisponda al token (se fornito) |
| `PATCH /exams/update/:id` | Valida che `professorId` corrisponda al token (se fornito) |
| `DELETE /exams/delete/:id` | Non accetta `professorId` nel DTO |

## Error Handling

Quando ricevi l'errore di mismatch:

```json
{
  "statusCode": 403,
  "message": "Il professorId nel corpo della richiesta (999) non corrisponde al professore autenticato (3)",
  "error": "Forbidden"
}
```

**Cosa fare:**
1. Verifica che il token sia quello del professore corretto
2. Verifica che il `professorId` nel DTO corrisponda
3. **Opzione ideale**: Rimuovi il `professorId` dal DTO

## Domande Frequenti

### Q: Perché il sistema non mi permette più di inviare un `professorId` sbagliato?

**A:** Perché era una fonte di confusione. In passato, il sistema silenziosamente lo ignorava, causando:
- Errori non individuati nel client
- Debugging difficile
- Inconsistenza nei dati

Ora il feedback è chiaro e immediato.

### Q: Posso ancora omettere il `professorId`?

**A:** Sì! È addirittura **consigliato**. Il server lo estrarrà dal token.

### Q: Il token potrebbe essere sbagliato?

**A:** Se il token è stato compromesso, il sistema non può fare molto. Ma con questo cambiamento, almeno il client non aggiungerà confusione ulteriore inviando dati incoerenti.

### Q: Cosa succede se non inviare `professorId` nel DELETE?

**A:** Il server controlla comunque che il professore autenticato sia il proprietario dell'esame. Non è necessario inviare nulla nel DTO per il DELETE.
