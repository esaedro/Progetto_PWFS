import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeachingItem } from '@server/courses';
import { fetchTeachings, deleteTeaching } from './teachings.api';
import { fetchCurrentUser } from '../auth/auth.api';
import { UserListItem } from '@server/users';

export function TeachingsPage() {
    const [teachings, setTeachings] = useState<TeachingItem[]>([]);
    const [user, setUser] = useState<UserListItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const canManageTeachings = user?.role === 'SECRETARY';

    async function handleDelete(id: number) {
        const confirmed = window.confirm('Vuoi davvero cancellare questo insegnamento?');

        if (!confirmed) return;

        try {
            await deleteTeaching(id);
            setTeachings((t) => t.filter((te) => te.id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    }

    useEffect(() => {
        Promise.all([fetchTeachings(), fetchCurrentUser()])
            .then(([teachingData, userData]) => {
                setTeachings(teachingData);
                setUser(userData);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-500">Caricamento insegnamenti...</p>
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
                Gli insegnamenti vengono creati dalla pagina di dettaglio del corso di laurea quando si salva un piano di studi.
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900">Elenco insegnamenti</h1>
                        <p className="text-base text-slate-600">
                            {/* Elenco degli insegnamenti tenuti dall'Università. <br/> */}
                            Lista di tutti gli insegnamenti presenti. <br/> Per crearne di nuovi, modificarli o eliminarli è necessario accedere alla pagina di dettaglio del corso di laurea e salvare un piano di studi.
                        </p>
                    </div>

                  {/*   {canManageTeachings && (
                        <button
                            type="button"
                            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                            onClick={() => navigate('/teachings/new')}
                        >
                            Nuovo insegnamento
                        </button>
                    )} */}
                </header>

                {teachings.length === 0 ? (
                    <p className="text-sm text-slate-500">Nessun insegnamento disponibile.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="py-3 pr-4 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
                                        Materia
                                    </th>
                                    <th className="py-3 pr-4 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
                                        Corso di laurea
                                    </th>
                                    <th className="py-3 pr-4 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
                                        Anno
                                    </th>
                                    {/* {canManageTeachings && (
                                        <th className="py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Azioni
                                        </th>
                                    )} */}
                                </tr>
                            </thead>
                            <tbody>
                                {teachings.map((t) => (
                                    <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                        <td className="py-3 pr-4 text-base font-medium text-slate-900">
                                            {t.subject.name}
                                        </td>
                                        <td className="py-3 pr-4 text-base text-slate-600">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/degrees/${t.degree.id}`)}
                                                className="text-slate-600 hover:text-slate-900 hover:underline underline-offset-2"
                                            >
                                                {t.degree.name}
                                            </button>
                                        </td>
                                        <td className="py-3 pr-4 text-base text-slate-600">{t.year}</td>
{/* 
                                        {canManageTeachings && (
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-medium text-slate-200 hover:bg-slate-100"
                                                        onClick={() => navigate(`/teachings/${t.id}/edit`)}
                                                    >
                                                        Modifica
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="rounded-lg border border-red-200 px-3 py-1 text-sm font-medium text-red-200 hover:bg-red-50"
                                                        onClick={() => handleDelete(t.id)}
                                                    >
                                                        Elimina
                                                    </button>
                                                </div>
                                            </td>
                                        )} */}
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