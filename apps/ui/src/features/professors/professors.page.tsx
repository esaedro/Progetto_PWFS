import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfessorListItem } from '@server/people';
import { deleteProfessor, fetchProfessors } from './professors.api';
import { ConfirmModal } from '../shared/confirm-modal';

export function ProfessorsPage() {
  const [professors, setProfessors] = useState<ProfessorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const navigate = useNavigate();

  async function handleDelete(id: number) {
    if (deleteTarget === null) return;

    try {
      await deleteProfessor(deleteTarget);
      setDeleteTarget(null);
      const data = await fetchProfessors(); 
      setProfessors(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setDeleteTarget(null);
      setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione');
    }
  }

  useEffect(() => {
    fetchProfessors()
      .then(setProfessors)
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {error && (
                  <p className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
                <div className="sm:ml-auto">
                  <button
                    type="button"
                    onClick={() => navigate('/professors/new')}
                    className="whitespace-nowrap rounded-lg bg-slate-900 px-4 py-2 text-base font-medium text-white hover:bg-slate-700 transition"
                  >
                    Nuovo professore
                  </button>
                </div>

                </div>
              </div>
            </main>
          );
      }


    return (
      <main className="min-h-screen bg-slate-50 p-6">
        
      {/* Content Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        
        {/* Page Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Elenco professori</h1>
            <p className="text-sm text-slate-600">
              Lista dei professori registrati nel sistema.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/professors/new')}
            className="rounded-lg bg-slate-900 px-4 py-2 text-base font-medium text-white hover:bg-slate-700 transition"
          >
            Nuovo professore
          </button>
        </div>
        
        {professors.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500">Nessun professore registrato.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 pr-4 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">Nome</th>
                  <th className="py-3 pr-4 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">Email</th>
                  <th className="py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Azioni</th>
                </tr>
              </thead>

              <tbody>
                {professors.map((professor) => (
                  <tr key={professor.id} className="group hover:bg-slate-50/70 transition">
                    <td className="py-3 pr-4 text-base font-medium text-slate-900">
                      {professor.name}
                    </td>
                    <td className="py-3 pr-4 text-sm font-medium text-slate-600">
                      {professor.email}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-400 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-300 transition"
                          onClick={() => navigate(`/professors/${professor.id}/edit`)}
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-red-300 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200 transition"
                          onClick={() => setDeleteTarget(professor.id)}
                        >
                          Elimina
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Elimina Professore"
        message="Sei sicuro di voler eliminare questo professore? L'operazione non può essere annullata."
        confirmLabel="Elimina"
        cancelLabel="Annulla"
        destructive
        onConfirm={() => {
            void handleDelete(deleteTarget as number);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  );
}