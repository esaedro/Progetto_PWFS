import { useEffect, useState, useRef } from 'react';
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
    const [noProfessors, setNoProfessors] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!id) return;

        Promise.all([fetchSubjectById(Number(id)), fetchProfessors()])
            .then(([subject, allProfessors]) => {
                setName(subject.name);
                setSelectedProfessors(subject.professors);
                setProfessors(allProfessors);
            })
            .catch((err) => {
                if (err.message === 'Non sono stati trovati professori') {
                    setNoProfessors(true);
                } else {
                    setError(err.message);
                }
            })
            .finally(() => setLoading(false));
    }, [id]);

    // Chiude il dropdown cliccando fuori
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                        className="rounded-lg border border-slate-500 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition"
                    >
                        Annulla
                    </button>
                </div>

                {/* Banner nessun professore disponibile */}
                {noProfessors && (
                    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <p className="font-medium">
                            Non è possibile modificare questa materia finché non si inserisce un professore nel sistema.
                        </p>
                        <p className="mt-1">
                            <button
                                type="button"
                                onClick={() => navigate('/professors/new')}
                                className="font-semibold underline underline-offset-2 hover:text-amber-900"
                            >
                                Clicca qui per aggiungere un professore
                            </button>
                        </p>
                    </div>
                )}


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
                                    onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
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
                            </label>
                            <div
                                className="relative"
                                ref={dropdownRef}
                            >
                                <input
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                                    placeholder="Cerca per nome o email"
                                    value={professorSearch}
                                    onFocus={() => setDropdownOpen(true)}
                                    onChange={(e) => {
                                        setProfessorSearch(e.target.value);
                                        setDropdownOpen(true);
                                    }}
                                />

                                {dropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-md">
                                        {filteredProfessors.length === 0 ? (
                                            <p className="px-3 py-2 text-sm text-slate-500">
                                                Nessun professore disponibile
                                            </p>
                                        ) : (
                                            <ul className="max-h-48 overflow-y-auto py-1">
                                                {filteredProfessors.map((prof) => (
                                                    <li key={prof.id}>
                                                        <button
                                                            type="button"
                                                            className="w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50"
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => {
                                                                setSelectedProfessors((current) => [...current, prof]);
                                                                setProfessorSearch('');
                                                                setDropdownOpen(false);
                                                                setIsDirty(true);
                                                            }}
                                                        >
                                                            <span className="font-medium">{prof.name}</span>
                                                            {prof.email && (
                                                                <span className="ml-2 text-xs text-slate-400">
                                                                    {prof.email}
                                                                </span>
                                                            )}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
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
                                            onClick={() => {
                                                setSelectedProfessors((current) =>
                                                    current.filter((item) => item.id !== p.id)
                                                );
                                                setIsDirty(true);
                                            }}
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
                            disabled={saving || noProfessors || !isDirty}
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