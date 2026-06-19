import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaPencil } from "react-icons/fa6";
import { fetchProfessorById, updateProfessor} from './professors.api';

enum UserRole {
  PROFESSOR = 'PROFESSOR',
  SECRETARY = 'SECRETARY'
}


export function EditProfessorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PROFESSOR);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
    if (!id) return;

    setError(null);
    setLoading(true);
    setName('');      
    setEmail(''); 
    setRole(UserRole.PROFESSOR); 
    console.log(id)
    fetchProfessorById(Number(id))
        .then((professor) => {
        if (!professor) {
            throw new Error('Professore non trovato.');
        }
        console.log(professor)
        setName(professor.name ?? '');
        setEmail(professor.email ?? '');
        setRole(professor.role ?? UserRole.PROFESSOR);
        })
        .catch((err) => {
        console.error("Error fetching professor data:", err);
        setError(err.message || 'Errore nel caricamento dei dati.');
        })
        .finally(() => setLoading(false));
    }, [id]); 

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!id) return;

        setError(null);
        setSaving(true);

        try {
            const payload = { name, email, role };
            console.log(`Updating professor ${id} with:`, payload);
            
            const success = await updateProfessor(Number(id), payload);

            if (success) {
                navigate('/professors');
            } else {
                throw new Error('Il server non ha salvato le modifiche. Controlla i dati immessi.');
            }

        } catch (err: any) {
            console.error("Errore durante il salvataggio:", err);
            setError(err.message || 'Errore durante il salvataggio.');
        } finally {
            setSaving(false);
        }
    }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 flex items-start justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mt-8 text-center">
          <p className="text-sm text-slate-500 animate-pulse">Caricamento professore...</p>
        </div>
      </main>
    );
  }

  return (
    <main key={location.key} className="min-h-screen bg-slate-50 p-6 flex items-start justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mt-8">
        
        {/* Header Block */}
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
            <FaPencil className="text-sm" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Modifica Professore</h1>
            <p className="text-xs text-slate-500">Aggiorna le informazioni dell'account</p>
          </div>
        </div>

        {/* Form Elements */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Full Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Nome e Cognome</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Indirizzo Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Role Select Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Ruolo Sistema</label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none transition"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              required
            >
              <option value={UserRole.PROFESSOR}>PROFESSOR</option>
              <option value={UserRole.SECRETARY}>SECRETARY</option>
            </select>
          </div>

          {/* Error Message Section */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Action Row Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/professors')}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              disabled={saving}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-base font-medium text-white hover:bg-slate-700 disabled:bg-slate-400 transition"
              disabled={saving}
            >
              {saving ? 'Salvataggio...' : 'Salva modifiche'}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}