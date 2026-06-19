import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSessionById, updateSession } from './sessions.api';

type SessionForm = {
    dateStartInsertion: string;
    dateEndInsertion: string;
    dateStartExamination: string;
    dateEndExamination: string;
    holidays: string[];
};

const emptyForm: SessionForm = {
    dateStartInsertion: '',
    dateEndInsertion: '',
    dateStartExamination: '',
    dateEndExamination: '',
    holidays: [],
};

function toInputDate(value: string | Date) {
    const date = value instanceof Date ? value : new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function toPayload(form: SessionForm) {
    return {
        dateStartInsertion: new Date(form.dateStartInsertion),
        dateEndInsertion: new Date(form.dateEndInsertion),
        dateStartExamination: new Date(form.dateStartExamination),
        dateEndExamination: new Date(form.dateEndExamination),
        holidays: form.holidays.length > 0 ? form.holidays : undefined,
    };
}

function validateForm(form: SessionForm): string | null {
    if (!form.dateStartInsertion || !form.dateEndInsertion || !form.dateStartExamination || !form.dateEndExamination) {
        return 'Compila tutte le date richieste.';
    }

    const startInsertion = new Date(form.dateStartInsertion);
    const endInsertion = new Date(form.dateEndInsertion);
    const startExamination = new Date(form.dateStartExamination);
    const endExamination = new Date(form.dateEndExamination);

    if (Number.isNaN(startInsertion.getTime()) || Number.isNaN(endInsertion.getTime()) || Number.isNaN(startExamination.getTime()) || Number.isNaN(endExamination.getTime())) {
        return 'Le date inserite non sono valide.';
    }

    if (startInsertion > endInsertion) {
        return 'La data di inizio inserimento deve essere precedente alla data di fine inserimento.';
    }

    if (startExamination > endExamination) {
        return 'La data di inizio esaminazione deve essere precedente alla data di fine esaminazione.';
    }

    return null;
}

export function EditSessionPage() {
    const { id } = useParams();
    const [form, setForm] = useState<SessionForm>(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newHoliday, setNewHoliday] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;

        if (!id) {
            setError('Sessione non valida');
            setLoading(false);
            return;
        }

        setLoading(true);
        fetchSessionById(Number(id))
            .then((data) => {
                if (!active) return;
                setForm({
                    dateStartInsertion: toInputDate(data.dateStartInsertion),
                    dateEndInsertion: toInputDate(data.dateEndInsertion),
                    dateStartExamination: toInputDate(data.dateStartExamination),
                    dateEndExamination: toInputDate(data.dateEndExamination),
                    holidays: data.holidays ?? [],
                });
            })
            .catch((err) => {
                if (active) {
                    setError(err instanceof Error ? err.message : 'Errore nel caricamento della sessione');
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [id]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const addHoliday = () => {
        if (!newHoliday) return;
        if (form.holidays.includes(newHoliday)) return;
        setForm((prev) => ({
            ...prev,
            holidays: [...prev.holidays, newHoliday].sort(),
        }));
        setNewHoliday('');
    };

    const removeHoliday = (date: string) => {
        setForm((prev) => ({
            ...prev,
            holidays: prev.holidays.filter((d) => d !== date),
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!id) {
            setError('Sessione non valida');
            return;
        }

        const validationError = validateForm(form);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setSaving(true);

        try {
            await updateSession(Number(id), toPayload(form) as any);
            navigate('/sessions');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento della sessione');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <main className="min-h-screen bg-slate-50 p-6">Caricamento...</main>;
    }

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Modifica sessione</h1>
                        <p className="text-sm text-slate-600">
                            Aggiorna le finestre di inserimento ed esaminazione.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/sessions')}
                        className="rounded-lg border border-slate-500 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition"
                    >
                        Annulla
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                            Data inizio inserimento
                            <input
                                type="date"
                                name="dateStartInsertion"
                                value={form.dateStartInsertion}
                                onChange={handleChange}
                                required
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                            Data fine inserimento
                            <input
                                type="date"
                                name="dateEndInsertion"
                                value={form.dateEndInsertion}
                                onChange={handleChange}
                                required
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                            />
                        </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                            Data inizio esaminazione
                            <input
                                type="date"
                                name="dateStartExamination"
                                value={form.dateStartExamination}
                                onChange={handleChange}
                                required
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                            Data fine esaminazione
                            <input
                                type="date"
                                name="dateEndExamination"
                                value={form.dateEndExamination}
                                onChange={handleChange}
                                required
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                            />
                        </label>
                    </div>

                    {/* Giorni festivi */}
                    <div className="rounded-xl border border-slate-200 p-4">
                        <h3 className="text-sm font-semibold text-slate-900">Giorni festivi</h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Aggiungi i giorni in cui non è possibile fissare appelli (es. festività nazionali).
                            Sabato e domenica sono già esclusi automaticamente.
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                            <input
                                type="date"
                                value={newHoliday}
                                onChange={(e) => setNewHoliday(e.target.value)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={addHoliday}
                                disabled={!newHoliday}
                                className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                                Aggiungi
                            </button>
                        </div>

                        {form.holidays.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {form.holidays.map((date) => (
                                    <span
                                        key={date}
                                        className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200"
                                    >
                                        {new Date(date + 'T12:00:00').toLocaleDateString('it-IT', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                        <button
                                            type="button"
                                            onClick={() => removeHoliday(date)}
                                            className="ml-1 text-red-500 hover:text-red-700"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-base font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {saving ? 'Salvataggio...' : 'Salva modifiche'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
