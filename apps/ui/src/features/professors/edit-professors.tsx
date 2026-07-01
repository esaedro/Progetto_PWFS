import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { fetchProfessorById, updateProfessor} from './professors.api';
import { UserRole } from './professors.api';
import { ConfirmModal } from '../shared/confirm-modal';

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
  const [isDirty, setIsDirty] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

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

    async function handleSave() {
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

      function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setShowSaveConfirm(true);
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
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
              <h1 className="text-2xl font-semibold text-slate-900">Modifica professore</h1>
              <p className="text-sm text-slate-500">
                  Aggiorna le informazioni dell'account
              </p>
          </div>
          <button
              type="button"
              onClick={() => navigate('/degrees')}
              className="rounded-lg border border-slate-500 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition"
          >
              Annulla
          </button>
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
              onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
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
              onChange={(e) => { setEmail(e.target.value); setIsDirty(true); }}
              required
            />
          </div>

          {/* Role Select Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Ruolo Sistema</label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none transition"
              value={role}
              onChange={(e) => { setRole(e.target.value as UserRole); setIsDirty(true); }}
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
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-base font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 transition"
              disabled={saving || !isDirty}
          >
              {saving ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
          </div>

        </form>
      </div>

      <ConfirmModal
        open={showSaveConfirm}
        title="Conferma modifica"
        message="Vuoi salvare le modifiche su questo professore?"
        confirmLabel="Salva modifiche"
        cancelLabel="Annulla"
        onConfirm={() => {
          setShowSaveConfirm(false);
          void handleSave();
        }}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </main>
  );
}