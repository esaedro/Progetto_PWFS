import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchDegreeById, updateDegree } from './degrees.api';

export function EditDegreePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [durationYears, setDurationYears] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (!id) return;

        fetchDegreeById(Number(id))
            .then((degree) => {
                setName(degree.name);
                setDurationYears(String(degree.duration));
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!id) return;

        setError(null);
        setSaving(true);

        try {
            await updateDegree(Number(id), {
                name,
                durationYears: Number(durationYears),
            });

            navigate('/degrees');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-500">Caricamento corso di laurea...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Modifica corso di laurea</h1>
                        <p className="text-sm text-slate-500">
                            Aggiorna i dati del corso di laurea
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/degrees')}
                        className="rounded-lg border border-slate-500 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition"
                    >
                        Annulla
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-900">Dettagli corso</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Nome e durata del corso di laurea
                        </p>

                        <div className="mt-4 space-y-4">
                            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                                Nome
                                <input
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
                                    minLength={4}
                                    required
                                />
                            </label>

                            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                                Durata (anni)
                                <input
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                                    type="number"
                                    min={1}
                                    max={5}
                                    step={1}
                                    value={durationYears}
                                    onChange={(e) => { setDurationYears(e.target.value); setIsDirty(true); }}
                                    required
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
                        {/* <button
                            type="button"
                            onClick={() => navigate('/degrees')}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                        >
                            Annulla
                        </button> */}
                        <button
                            type="submit"
                            disabled={saving || !isDirty}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-base font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {saving ? 'Salvataggio...' : 'Salva modifiche'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}