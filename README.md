# Progetto per il corso di Progettazione di Applicazioni Web Full Stack

Progetto realizzato da G. Saleri, L. A. Stefini e L. Viola.

## Sistema di pianificazione degli appelli

L'applicazione web permette ai docenti di un corso di laurea di coordinarsi nella pianificazione degli appelli.

Il sistema prevede una pagina in cui il docente può scegliere la data del proprio appello:
- La pagina permette la scelta del corso di laurea e relativo anno di frequenza (es, «INFLM-I»)
- Il docente vede le date del periodo di appelli e, per ogni data, vede gli appelli già inseriti dai colleghi
- Il docente può inserire un appello solo in una data libera e può cancellare/modificare la propria scelta

## Vincoli
- Non è possibile inserire più di un appello per ogni giornata e per ogni corso di laurea con relativo anno di frequenza
- Gli inserimenti e le modifiche possono essere effettuati in un periodo di inizio-fine pianificazione determinato a priori
- Ogni docente ha visibilità su tutti gli appelli inseriti, ma può modificare solo i suoi
- I giorni disponibili per fissare un appello non devono prevedere i sabati e le domeniche (Opzionale: si potrebbe prevedere un sistema che esclude anche i festivi diversi da sabato e domenica, basandosi su un elenco di festività prestabilito)

## Ruoli
- Segreteria: configura a sistema la sessione d’esame, impostando la data di inizio e fine sessione, la data di inizio e fine inserimento, i corsi di laurea e relativi anni di frequenza
- Docente: inserisce nel sistema le proprie preferenze, che può modificare a suo piacimento fino al termine del periodo di inserimento

## Tecnologie utilizzate
- Frontend: React.js
- Backend: Node.js con Nest.js
- Database: PostgreSQL