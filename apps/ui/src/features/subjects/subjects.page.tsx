import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubjectItem, TeachingItem } from '@server/courses';
import { fetchSubjects, deleteSubject } from './subjects.api';
import { fetchTeachingsBySubject } from '../teachings/teachings.api';
import { fetchCurrentUser } from '../auth/auth.api';
import { UserListItem } from '@server/users';
import { IoMdArrowDropdown } from 'react-icons/io';
import { ConfirmModal } from '../shared/confirm-modal';

export function SubjectsPage() {
    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [user, setUser] = useState<UserListItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [teachingsMap, setTeachingsMap] = useState<Record<number, TeachingItem[]>>({});
    const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const navigate = useNavigate();


    async function handleDelete(id: number) {
        if (deleteTarget === null) return;
        //const confirmed = window.confirm('Vuoi davvero cancellare questa materia?');
        //if (!confirmed) return;
        try {
            await deleteSubject(deleteTarget);
            setDeleteTarget(null);
            const data = await fetchSubjects(); 
            setSubjects(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setDeleteTarget(null);
            setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione');
        }
    }

    async function toggleExpand(subjectId: number) {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(subjectId)) {
                next.delete(subjectId);
            } else {
                next.add(subjectId);
            }
            return next;
        });

        if (!teachingsMap[subjectId] && !loadingMap[subjectId]) {
            setLoadingMap((prev) => ({ ...prev, [subjectId]: true }));
            try {
                const teachings = await fetchTeachingsBySubject(subjectId);
                setTeachingsMap((prev) => ({ ...prev, [subjectId]: teachings }));
            } catch {
                setTeachingsMap((prev) => ({ ...prev, [subjectId]: [] }));
            } finally {
                setLoadingMap((prev) => ({ ...prev, [subjectId]: false }));
            }
        }
    }


    useEffect(() => {  // necessario cambiare useEffect perchè devo caricare l'utente anche quando non ci sono materie
        async function loadData() {
            try {
                const userData = await fetchCurrentUser();
                setUser(userData);
            } catch {
                // L'utente non si carica, ma non bloccare il resto
            }

            try {
                const subjectsData = await fetchSubjects();
                setSubjects(subjectsData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    const canManageSubjects = user?.role === 'SECRETARY';

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-500">Caricamento materie...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {error && (
                            <p className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                                {error}
                            </p>
                        )}
        
                        {canManageSubjects && (
                        <div className="sm:ml-auto">
                        <button
                            type="button"
                            onClick={() => navigate('/subjects/new')}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                        >
                            Nuova materia
                        </button>
                        </div>
                        )}
                    </div>
                </div>
            </main>
        );
    }


    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900">Elenco materie</h1>
                        <p className="text-sm text-slate-600">
                            Lista delle materie presenti e dei relativi professori.
                        </p>
                    </div>
                    {canManageSubjects && (
                        <button
                            type="button"
                            className="rounded-lg bg-slate-900 px-4 py-2 text-base font-medium text-white hover:bg-slate-700"
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
                                        <th className="py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Azioni
                                        </th>
                                    )}
                                    <th className="py-3 pr-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        {/* Icona */}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map((sub) => {
                                    const isExpanded = expandedIds.has(sub.id);
                                    const teachings = teachingsMap[sub.id];
                                    const isLoadingTeachings = loadingMap[sub.id];

                                    return (
                                        <>
                                            {/* Riga principale: tutta cliccabile (tranne Azioni) */}
                                            <tr
                                                key={sub.id}
                                                className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                                                onClick={() => toggleExpand(sub.id)}
                                            >
                                                <td className="py-3 pr-4 text-base font-medium text-slate-900">
                                                    {sub.name}
                                                </td>
                                                <td className="py-3 pr-4 text-base text-slate-600">
                                                    {sub.professors?.length
                                                        ? sub.professors.map((p) => p.name).join(', ')
                                                        : 'N/D'}
                                                </td>

                                                {canManageSubjects && (
                                                    <td
                                                        className="py-3"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                className="rounded-lg border border-slate-400 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-300 transition"
                                                                onClick={() => navigate(`/subjects/${sub.id}/edit`)}
                                                            >
                                                                Modifica
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="rounded-lg border border-red-300 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200 transition"
                                                                onClick={() => setDeleteTarget(sub.id)}
                                                            >
                                                                Elimina
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}

                                                <td className="py-3 pr-2 text-right">
                                                    <IoMdArrowDropdown
                                                        className={`ml-auto h-5 w-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                    />
                                                </td>
                                            </tr>

                                            {/* Riga di dettaglio subito sotto */}
                                            {isExpanded && (
                                                <tr className="border-b border-slate-100">
                                                    <td
                                                        colSpan={canManageSubjects ? 4 : 3}
                                                        className="pb-3 pl-6 pr-4"
                                                    >
                                                        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                Corsi di laurea
                                                            </p>
                                                            {isLoadingTeachings ? (
                                                                <p className="text-xs text-slate-500">
                                                                    Caricamento...
                                                                </p>
                                                            ) : !teachings || teachings.length === 0 ? (
                                                                <p className="text-xs text-slate-500">
                                                                    La materia attualmente non è erogata in nessun corso di laurea.
                                                                </p>
                                                            ) : (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {teachings.map((t) => (
                                                                        <button
                                                                            key={t.id}
                                                                            type="button"
                                                                            onClick={() => navigate(`/degrees/${t.degree.id}`)}
                                                                            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300"
                                                                        >
                                                                            {t.degree.name}
                                                                            <span className="text-slate-400">
                                                                                · Anno {t.year}
                                                                            </span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <ConfirmModal
                open={deleteTarget !== null}
                title="Elimina Materia"
                message="Sei sicuro di voler eliminare questa materia? L'operazione non può essere annullata."
                confirmLabel="Elimina"
                cancelLabel="Annulla"
                onConfirm={() => {
                    void handleDelete(deleteTarget as number);
                }}
                onCancel={() => setDeleteTarget(null)}
            />

        </main>
    );
}