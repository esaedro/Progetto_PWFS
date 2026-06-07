import { useEffect, useState } from 'react';
import { createExam } from './exams.api';
import { useNavigate } from 'react-router-dom';
import { fetchTeachings } from '../teachings/teachings.api';
import { findSessionByDate } from '../sessions/sessions.api';
import { TeachingItem } from '@server/courses';

type ExamForm = {
    teachingId: number;
    session: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    description: string;
    isPartial: boolean;
};

const initialForm: ExamForm = {
    teachingId: null,
    session: '',
    date: '',
    startTime: '',
    endTime: '',
    type: '',
    description: '',
    isPartial: false
};

function toPayload(form: ExamForm) {
    return {
        teaching: form.teachingId,
        session: form.session,
        date: new Date(form.date).toISOString(),
        startTime: form.startTime,
        endTime: form.endTime,
        type: form.type,
        description: form.description,
        isPartial: form.isPartial
    };
}

function validateForm(form: ExamForm): string | null {
    if (!form.teachingId || !form.session || !form.date || !form.startTime || !form.endTime || !form.type) {
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

export function CreateExamPage() {
    const [form, setForm] = useState<ExamForm>(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [teachings, setTeachings] = useState<TeachingItem[]>([]);
    const [selectedSession, setSelectedSession] = useState<string>('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchTeachings()
            .then((data) => {
                setTeachings(data);
            })
            .catch((err) => setError(err.message));

        if (form.date) {
            findSessionByDate(new Date(form.date).toISOString())
                .then((session) => {
                    if (session) {
                        setSelectedSession(session.id.toString());
                    } else {
                        setSelectedSession(null);
                    }
                })
                .catch((err) => setError(err.message));
        }
    }, [form.date]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setForm(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;
        setForm(prevState => ({
            ...prevState,
            [name]: value
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
            await createExam(toPayload(form));
            navigate('/exams');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante la creazione dell\'esame. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Nuovo appello</h1>
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
                    <div className="grid gap-4 sm:grid-cols-3">
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
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
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                            Ora inizio
                            <input
                                type="datetime-local"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleChange}
                                required
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                            Ora fine
                            <input
                                type="datetime-local"
                                name="endTime"
                                value={form.endTime}
                                onChange={handleChange}
                                required
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                            />
                        </label>
                    </div>

                    <div className="grid gap-4">
                        <label>
                            Corso
                            <select
                                name="teaching"
                                value={form.teachingId}
                                onChange={handleSelectChange}
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                            >
                                <option value="">Seleziona corso</option>
                                {teachings.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.subject.name} - {t.degree.name} (Anno {t.year})
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Sessione selezionata
                            <p>
                                {selectedSession || 'Imposta una data per vedere la sessione corrispondente'}
                            </p>
                        </label>
                        <label>
                            Tipo
                            <input
                                type="text"
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                            />
                        </label>
                    </div>

                    <div className="grid gap-4">
                        <label>
                            Descrizione
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleTextareaChange}
                                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
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
                            {loading ? 'Salvataggio...' : 'Crea appello'}
                        </button>
                    </div>
                </form>
            </div >
        </main >
    );
}
