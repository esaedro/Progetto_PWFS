import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from './sessions.api';

type SessionForm = {
    dateStartInsertion: string;
    dateEndInsertion: string;
    dateStartExamination: string;
    dateEndExamination: string;
};

const initialForm: SessionForm = {
    dateStartInsertion: '',
    dateEndInsertion: '',
    dateStartExamination: '',
    dateEndExamination: '',
};

function toPayload(form: SessionForm) {
    return {
        dateStartInsertion: new Date(form.dateStartInsertion).toISOString(),
        dateEndInsertion: new Date(form.dateEndInsertion).toISOString(),
        dateStartExamination: new Date(form.dateStartExamination).toISOString(),
        dateEndExamination: new Date(form.dateEndExamination).toISOString(),
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

export function CreateSessionPage() {
    const [form, setForm] = useState<SessionForm>(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const validationError = validateForm(form);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setLoading(true);

        try {
            await createSession(toPayload(form));
            navigate('/sessions');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore nella creazione della sessione');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Nuova sessione</h1>
                        <p className="text-sm text-slate-600">
                            Inserisci le finestre di inserimento ed esaminazione.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/sessions')}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
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

                    {error && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {loading ? 'Salvataggio...' : 'Crea sessione'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
