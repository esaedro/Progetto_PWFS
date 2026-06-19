import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DegreeItem } from '@server/courses';
import { fetchDegrees, deleteDegree } from './degrees.api';
import { fetchCurrentUser } from '../auth/auth.api';
import { UserListItem } from '@server/users';
import { ConfirmModal } from '../shared/confirm-modal';

export function DegreesPage() {
  const [degrees, setDegrees] = useState<DegreeItem[]>([]);
  const [user, setUser] = useState<UserListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const navigate = useNavigate();

  const canManageDegrees = user?.role === 'SECRETARY';

  async function handleDelete(id: number) {
    if (deleteTarget === null) return;

    try {
      await deleteDegree(deleteTarget);
      setDeleteTarget(null);
      const data = await fetchDegrees(); 
      setDegrees(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setDeleteTarget(null);
      setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione');
    }
  }

  useEffect(() => {  // necessario cambiare useEffect perchè devo caricare l'utente anche quando non ci sono corsi
      async function loadData() {
          try {
              const userData = await fetchCurrentUser();
              setUser(userData);
          } catch {
              // L'utente non si carica, ma non bloccare il resto
          }

          try {
              const degreesData = await fetchDegrees();
              setDegrees(degreesData);
          } catch (err: any) {
              setError(err.message);
          } finally {
              setLoading(false);
          }
      }

      loadData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Caricamento corsi di laurea...</p>
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
      
                      {canManageDegrees && (
                      <div className="sm:ml-auto">
                      <button
                          type="button"
                          onClick={() => navigate('/degrees/new')}
                          className="rounded-lg bg-slate-900 px-4 py-2 text-base font-medium text-white hover:bg-slate-700"
                      >
                          Nuovo corso di laurea
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
            <h1 className="text-3xl font-semibold text-slate-900">Elenco corsi di laurea</h1>
            <p className="text-sm text-slate-600">
              Lista dei corsi di laurea presenti nel sistema.
            </p>
          </div>

          {canManageDegrees && (
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-4 py-2 text-base font-medium text-white hover:bg-slate-700"
              onClick={() => navigate('/degrees/new')}
            >
              Nuovo corso
            </button>
          )}
        </header>

        {degrees.length === 0 ? (
          <p className="text-sm text-slate-500">Nessun corso di laurea disponibile.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 pr-4 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Nome
                  </th>
                  <th className="py-3 pr-4 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Durata (anni)
                  </th>
                  {canManageDegrees && (
                    <th className="py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Azioni
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {degrees.map((deg) => (
                  <tr key={deg.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="py-3 pr-4 text-base font-medium text-slate-900">{deg.name}</td>
                    <td className="py-3 pr-4 text-base text-slate-600">{deg.duration}</td>

                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-600 px-4 py-1.5 text-base font-medium text-slate-900 hover:bg-slate-300 transition"
                            onClick={() => navigate(`/degrees/${deg.id}`)}
                          >
                            Dettagli
                          </button>

                          {canManageDegrees && (
                            <button
                              type="button"
                              className="rounded-lg border border-slate-400 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-300 transition"
                              onClick={() => navigate(`/degrees/${deg.id}/edit`)}
                            >
                              Modifica
                            </button>
                          )}

                          {canManageDegrees && (
                            <button
                              type="button"
                              className="rounded-lg border border-red-300 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200 transition"
                              onClick={() => setDeleteTarget(deg.id)}
                            >
                              Elimina
                            </button>
                          )}
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
        title="Elimina Corso di laurea"
        message="Sei sicuro di voler eliminare questa corso? L'operazione non può essere annullata."
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