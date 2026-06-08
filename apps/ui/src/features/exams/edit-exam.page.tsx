import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchExamById, updateExam, checkExamConflicts } from './exams.api';
import { fetchTeachings } from '../teachings/teachings.api';
import { findSessionByDate } from '../sessions/sessions.api';
import { fetchCurrentUser } from '../auth/auth.api';
import { TeachingItem } from '@server/courses';
import { ExamType } from '@server/exams/exam-type';
import type { UpdateExamDto } from '@server/exams';

const EXAM_TYPE_OPTIONS = Object.values(ExamType).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
}));

type ExamForm = {
    teachingId: number;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    description: string;
    isPartial: boolean;
};

function toPayload(form: ExamForm, sessionId: number | null, professorId: number): UpdateExamDto {
    return {
        dateTimeStart: new Date(`${form.date}T${form.startTime}:00`),
        dateTimeEnd: new Date(`${form.date}T${form.endTime}:00`),
        teachingId: Number(form.teachingId),
        sessionId: Number(sessionId),
        professorId: Number(professorId),
        type: form.type as ExamType,
        description: form.description || undefined,
        partial: form.isPartial,
    };
}

function validateForm(form: ExamForm, sessionId: number | null): string | null {
    if (!form.teachingId || !sessionId || !form.date || !form.startTime || !form.endTime || !form.type) {
        return 'Compila tutti i campi richiesti.';
    }

    const date = new Date(form.date);
    if (Number.isNaN(date.getTime())) {
        return 'La data inserita non è valida.';
    }

    if (form.startTime >= form.endTime) {
        return 'L\'orario di inizio deve essere prima di quello di fine.';
    }

    return null;
}

function toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function toTimeInputValue(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

export function EditExamPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [form, setForm] = useState<ExamForm | null>(null);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [teachings, setTeachings] = useState<TeachingItem[]>([]);
    const [selectedSession, setSelectedSession] = useState<number | null>(null);
    const [professorId, setProfessorId] = useState<number | null>(null);
    const [conflicts, setConflicts] = useState<string[]>([]);

    // Carica i dati iniziali
    useEffect(() => {
        if (!id) return;

        Promise.all([
            fetchExamById(Number(id)),
            fetchTeachings(),
            fetchCurrentUser(),
        ])
            .then(([exam, teachingsData, user]) => {
                setTeachings(teachingsData);
                setProfessorId(user.id);

                if (!exam) {
                    setError('Esame non trovato.');
                    return;
                }

                const startDate = new Date(exam.dateTimeStart);
                const endDate = new Date(exam.dateTimeEnd);

                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    setError('Date dell\'esame non valide.');
                    return;
                }

                setForm({
                    teachingId: exam.teaching?.id ?? null,
                    date: toDateInputValue(startDate),
                    startTime: toTimeInputValue(startDate),
                    endTime: toTimeInputValue(endDate),
                    type: exam.type,
                    description: exam.description ?? '',
                    isPartial: exam.partial,
                });
            })
            .catch((err) => setError(err.message))
            .finally(() => setPageLoading(false));
    }, [id]);

    // Quando la data cambia, cerca la sessione corrispondente
    useEffect(() => {
        if (form?.date) {
            findSessionByDate(new Date(form.date))
                .then((session) => {
                    setSelectedSession(session ? session.id : null);
                })
                .catch((err) => setError(err.message));
        }
    }, [form?.date]);

    // Controllo conflitti quando data, ora, corso o sessione cambiano
    useEffect(() => {
        if (!selectedSession || !form?.teachingId || !form.date || !form.startTime || !form.endTime) {
            setConflicts([]);
            return;
        }

        const dateTimeStart = new Date(`${form.date}T${form.startTime}:00`);
        const dateTimeEnd = new Date(`${form.date}T${form.endTime}:00`);

        if (dateTimeStart >= dateTimeEnd) {
            setConflicts([]);
            return;
        }

        let active = true;

        const timer = setTimeout(() => {
            checkExamConflicts(
                selectedSession,
                dateTimeStart,
                dateTimeEnd,
                Number(form.teachingId),
                Number(id)
            )
                .then((result) => { if (active) setConflicts(result); })
                .catch(() => { if (active) setConflicts([]); });
        }, 400);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [form?.date, form?.startTime, form?.endTime, form?.teachingId, selectedSession, id]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm((prev) => prev ? { ...prev, [name]: value } : prev);
    };

    const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setForm((prev) => prev ? { ...prev, [name]: value } : prev);
    };

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;
        setForm((prev) => prev ? { ...prev, [name]: value } : prev);
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setForm((prev) => prev ? { ...prev, [name]: checked } : prev);
    };

    const isSessionMissing = !!form?.date && !selectedSession;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!form) return;

        if (!professorId) {
            setError('Impossibile recuperare i dati del docente. Ricarica la pagina e riprova.');
            return;
        }

        const validationError = validateForm(form, selectedSession);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setLoading(true);

        try {
            await updateExam(Number(id), toPayload(form, selectedSession, professorId));
            navigate('/exams');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Errore durante il salvataggio. Riprova.';
            setError(message);
            console.error('Errore modifica esame:', err);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-2xl">
                    <p className="text-sm text-slate-500">Caricamento esame...</p>
                </div>
            </main>
        );
    }

    if (!form) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-2xl">
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                        {error || 'Esame non trovato.'}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/exams')}
                        className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                        Torna agli appelli
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Modifica appello</h1>
                        <p className="text-sm text-slate-500">
                            Modifica i dati dell&apos;appello d&apos;esame
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/exams')}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                    >
                        Annulla
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Data e ora */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-900">Data e ora</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Scegli la data e la fascia oraria dell&apos;appello
                        </p>

                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                                Data
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    required
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                                />
                            </label>
                            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                                Ora inizio
                                <input
                                    type="time"
                                    name="startTime"
                                    value={form.startTime}
                                    onChange={handleChange}
                                    required
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                                />
                            </label>
                            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                                Ora fine
                                <input
                                    type="time"
                                    name="endTime"
                                    value={form.endTime}
                                    onChange={handleChange}
                                    required
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                                />
                            </label>
                        </div>

                        {/* Indicatore sessione */}
                        <div className="mt-4">
                            {form.date ? (
                                selectedSession ? (
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200">
                                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                            Sessione #{selectedSession}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200 shrink-0">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                            Data non in sessione
                                        </span>
                                        <p className="text-xs text-amber-700">
                                            Scegli un&apos;altra data per poter salvare l&apos;appello.
                                        </p>
                                    </div>
                                )
                            ) : (
                                <span className="text-xs text-slate-400">
                                    Seleziona una data per vedere la sessione corrispondente
                                </span>
                            )}
                        </div>

                        {/* Avviso conflitti */}
                        {conflicts.length > 0 && (
                            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                                <p className="text-xs font-medium text-red-700">
                                    <span role="img" aria-label="Attenzione">⚠️</span> Conflitto di orario rilevato
                                </p>
                                <p className="mt-1 text-xs text-red-600">
                                    L&apos;orario scelto si sovrappone con:{' '}
                                    {conflicts.join(', ')}.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Dettagli esame */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-900">Dettagli esame</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Specifica il corso, la tipologia e le modalit&agrave;
                        </p>

                        <div className="mt-4 space-y-4">
                            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                                Corso
                                <select
                                    name="teachingId"
                                    value={form.teachingId}
                                    onChange={handleSelectChange}
                                    required
                                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                                >
                                    <option value="">Seleziona corso</option>
                                    {teachings.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.subject.name} &mdash; {t.degree.name} (Anno {t.year})
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                                    Tipo
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleSelectChange}
                                        required
                                        className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                                    >
                                        <option value="">Seleziona tipo</option>
                                        {EXAM_TYPE_OPTIONS.map(({ value, label }) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="flex items-center gap-2 pt-6 text-sm font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        name="isPartial"
                                        checked={form.isPartial}
                                        onChange={handleCheckboxChange}
                                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                                    />
                                    Appello parziale
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Descrizione */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-900">Descrizione</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Eventuali note aggiuntive per l&apos;appello
                        </p>

                        <div className="mt-4">
                            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                                Note
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleTextareaChange}
                                    rows={3}
                                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                                    placeholder="Aula, materiale consentito, informazioni utili&hellip;"
                                />
                            </label>
                        </div>
                    </div>

                    {error && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/exams')}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            disabled={loading || isSessionMissing || conflicts.length > 0}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {loading ? 'Salvataggio...' : 'Salva modifiche'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
