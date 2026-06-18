import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDegree } from './degrees.api';

export function CreateDegreePage() {
    const [name, setName] = useState('');
    const [durationYears, setDurationYears] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError(null);
        setLoading(true);

        try {
            await createDegree({
                name,
                durationYears: Number(durationYears),
            });

            navigate('/degrees');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Nuovo corso di laurea</h1>
                        <p className="text-sm text-slate-500">
                            Inserisci i dati del nuovo corso di laurea
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/degrees')}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
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
                                    onChange={(e) => setName(e.target.value)}
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
                                    onChange={(e) => setDurationYears(e.target.value)}
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
                            disabled={loading}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-base font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {loading ? 'Salvataggio...' : 'Crea corso di laurea'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}