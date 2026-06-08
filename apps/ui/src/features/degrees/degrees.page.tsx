import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DegreeItem } from '@server/courses';
import { fetchDegrees, deleteDegree } from './degrees.api';
import { fetchCurrentUser } from '../auth/auth.api';
import { UserListItem } from '@server/users';

export function DegreesPage() {
  const [degrees, setDegrees] = useState<DegreeItem[]>([]);
  const [user, setUser] = useState<UserListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  async function handleDelete(id: number) {
    if (user?.role !== 'SECRETARY') return;

    const confirmed = window.confirm('Vuoi davvero cancellare questo corso di laurea?');

    if (!confirmed) return;

    try {
      await deleteDegree(id);
      setDegrees((d) => d.filter((deg) => deg.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    Promise.all([fetchDegrees(), fetchCurrentUser()])
      .then(([degreesData, userData]) => {
        setDegrees(degreesData);
        setUser(userData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const canManageDegrees = user?.role === 'SECRETARY';

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
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
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
              Elenco dei corsi di laurea presenti nel sistema.
            </p>
          </div>

          {canManageDegrees && (
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-4 py-2 text-base font-bold text-white hover:bg-slate-700"
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
                    <th className="py-3 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
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

                    {canManageDegrees && (
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
                            onClick={() => navigate(`/degrees/${deg.id}`)}
                          >
                            Dettagli
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
                            onClick={() => navigate(`/degrees/${deg.id}/edit`)}
                          >
                            Modifica
                          </button>

                          <button
                            type="button"
                            className="rounded-lg border border-red-200 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(deg.id)}
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