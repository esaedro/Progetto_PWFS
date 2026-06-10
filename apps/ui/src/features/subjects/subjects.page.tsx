import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubjectItem } from '@server/courses';
import { fetchSubjects, deleteSubject } from './subjects.api';
import { fetchCurrentUser } from '../auth/auth.api';
import { UserListItem } from '@server/users';

export function SubjectsPage() {
    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [user, setUser] = useState<UserListItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    async function handleDelete(id: number) {
        const confirmed = window.confirm('Vuoi davvero cancellare questa materia?');

        if (!confirmed) return;

        try {
            await deleteSubject(id);
            setSubjects((s) => s.filter((sub) => sub.id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    }

    useEffect(() => {
        Promise.all([fetchSubjects(), fetchCurrentUser()])
            .then(([subjectsData, userData]) => {
                setSubjects(subjectsData);
                setUser(userData);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-500">Caricamento materie...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                        {error}
                    </p>
                </div>
            </main>
        );
    }

    const canManageSubjects = user?.role === 'SECRETARY';

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900">Elenco materie</h1>
                        <p className="text-sm text-slate-600">Elenco delle materie e dei relativi professori.</p>
                    </div>

                    {canManageSubjects && (
                        <button
                            type="button"
                            className="rounded-lg bg-slate-900 px-4 py-2 text-base font-bold text-white hover:bg-slate-700"
                            onClick={() => navigate('/subjects/new')}
                        >
                            Nuova materia
                        </button>
                    )}
                </header>

                {subjects.length === 0 ? (
                    <p className="text-sm text-slate-500">Nessuna materia disponibile.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="py-3 pr-4 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
                                        Nome
                                    </th>
                                    <th className="py-3 pr-4 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
                                        Professori
                                    </th>
                                    {canManageSubjects && (
                                        <th className="py-3 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
                                            Azioni
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map((sub) => (
                                    <tr key={sub.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                        <td className="py-3 pr-4 text-base font-medium text-slate-900">{sub.name}</td>
                                        <td className="py-3 pr-4 text-base text-slate-600">
                                            {sub.professors?.length
                                                ? sub.professors.map((p) => p.name).join(', ')
                                                : 'N/D'}
                                        </td>
                                        {canManageSubjects && (
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-300"
                                                        onClick={() => navigate(`/subjects/${sub.id}/edit`)}
                                                    >
                                                        Modifica
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="rounded-lg border border-red-300 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
                                                        onClick={() => handleDelete(sub.id)}
                                                    >
                                                        Elimina
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}