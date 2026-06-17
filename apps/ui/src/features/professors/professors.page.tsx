import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import book_styles from '../css/books.module.css';
import { ProfessorListItem } from '@server/people';
import { deleteProfessor, fetchProfessors } from './professors.api';

export function ProfessorsPage() {
  const [professors, setProfessors] = useState<ProfessorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleDelete(id: number) {
    const confirmed = window.confirm('Vuoi davvero eliminare questo professore?');

    if(!confirmed)
      return;

    try {
      await deleteProfessor(id);
      setProfessors((professors) => professors.filter((professor) => professor.id != id));
    } catch(err: any) {
      setError(err.message);
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
                    className="whitespace-nowrap rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition"
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
        {/* Page Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Catalogo professori</h1>
            <p className="text-sm text-slate-600">
              Lista dei professori registrati nel sistema.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/professors/new')}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition"
          >
            Nuovo professore
          </button>
        </div>

      {/* Content Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {professors.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500">Nessun professore registrato.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 text-right font-semibold">Azioni</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {professors.map((professor) => (
                  <tr key={professor.id} className="group hover:bg-slate-50/70 transition">
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {professor.name}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {professor.email}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                          onClick={() => navigate(`/professors/${professor.id}/edit`)}
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                          onClick={() => handleDelete(professor.id)}
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
    </main>
  );
}