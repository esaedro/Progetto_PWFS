import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProfessor } from "./professors.api"; 
import { FaPlus } from "react-icons/fa6";

enum UserRole {
    PROFESSOR = 'PROFESSOR',
    SECRETARY = 'SECRETARY'
}

export function CreateProfessorPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(false);

    if (password.length < 8) {
      setError('La password deve contenere almeno 8 caratteri.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('La password deve contenere almeno una lettera maiuscola.');
      return;
    }
    if (!/[?^!#@]/.test(password)) {
      setError('La password deve contenere almeno un simbolo tra (? ^ ! # @).');
      return;
    }

    setLoading(true);

    try {
      await createProfessor({
        name,
        email,
        password,
        role: UserRole.PROFESSOR 
      });

      navigate('/professors');
    } catch (err: any) {
      setError(err.message || 'Errore durante la creazione del professore.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 flex items-start justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mt-8">
        
        {/* Header Block */}
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
{/*           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
            <FaPlus className="text-sm" />
          </div> */}
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Nuovo Professore</h1>
            <p className="text-xs text-slate-500">Registra un nuovo account docente</p>
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
              placeholder="es. Mario Rossi"
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
              placeholder="mario.rossi@universita.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
              Richiesti: min 8 caratteri, una maiuscola e un simbolo tra <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">? ^ ! # @</span>
            </p>
          </div>

          {/* Status Message Containers */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Action Row */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/professors')}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:bg-slate-400 transition"
              disabled={loading}
            >
              {loading ? 'Salvataggio...' : 'Crea professore'}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}