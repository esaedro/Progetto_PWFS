import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSubjectById, updateSubject, fetchProfessors } from './subjects.api';
import { ProfessorListItem } from '@server/people';

export function EditSubjectPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [professors, setProfessors] = useState<ProfessorListItem[]>([]);
    const [professorSearch, setProfessorSearch] = useState('');
    const [selectedProfessors, setSelectedProfessors] = useState<ProfessorListItem[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        Promise.all([fetchSubjectById(Number(id)), fetchProfessors()])
            .then(([subject, allProfessors]) => {
                setName(subject.name);
                setSelectedProfessors(subject.professors);
                setProfessors(allProfessors);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    const filteredProfessors = professors.filter((prof) => {
        const search = professorSearch.toLowerCase();
        const already = selectedProfessors.some((s) => s.id === prof.id);
        return (
            !already &&
            (prof.name.toLowerCase().includes(search) ||
                (prof.email || '').toLowerCase().includes(search))
        );
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!id) return;

        setError(null);
        setSaving(true);

        if (selectedProfessors.length === 0) {
            setError('Seleziona almeno un professore');
            setSaving(false);
            return;
        }

        try {
            await updateSubject(Number(id), {
                name,
                professorIds: selectedProfessors.map((p) => p.id),
            });

            navigate('/subjects');
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
                    <p className="text-sm text-slate-500">Caricamento materia...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Modifica materia</h1>
                        <p className="text-sm text-slate-500">
                            Aggiorna il nome e i professori associati
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/subjects')}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                    >
                        Annulla
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nome materia */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-900">Dettagli materia</h2>
                        <p className="mt-0.5 text-xs text-slate-500">Nome identificativo della materia</p>

                        <div className="mt-4">
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
                        </div>
                    </div>

                    {/* Professori */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-900">Professori</h2>
                        <p className="mt-0.5 text-xs text-slate-500">Cerca e seleziona i professori associati</p>

                        <div className="mt-4 space-y-3">
                            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                                Cerca professore
                                <input
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                                    placeholder="Cerca per nome o email"
                                    value={professorSearch}
                                    onChange={(e) => setProfessorSearch(e.target.value)}
                                />
                            </label>

                            {filteredProfessors.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {filteredProfessors.slice(0, 8).map((prof) => (
                                        <button
                                            key={prof.id}
                                            type="button"
                                            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                            onClick={() => {
                                                setSelectedProfessors((current) => [...current, prof]);
                                                setProfessorSearch('');
                                            }}
                                        >
                                            {prof.name} {prof.email ? `(${prof.email})` : ''}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedProfessors.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Professori selezionati
                                </p>
                                {selectedProfessors.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
                                    >
                                        <span className="text-sm font-medium text-slate-900">{p.name}</span>
                                        <button
                                            type="button"
                                            className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                                            onClick={() =>
                                                setSelectedProfessors((current) =>
                                                    current.filter((item) => item.id !== p.id)
                                                )
                                            }
                                        >
                                            Rimuovi
                                        </button>
                                    </div>
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
                        {/* <button
                            type="button"
                            onClick={() => navigate('/subjects')}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                        >
                            Annulla
                        </button> */}
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