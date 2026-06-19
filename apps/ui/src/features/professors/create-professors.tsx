import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createProfessor } from "./professors.api"; 
import { FaCopy, FaCheck } from "react-icons/fa6"; // Imported copy icons
import { UserRole } from "./professors.api";

function generateRandomPassword(): string {
  const length = 12;
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const specialChars = "?^!#@";
  
  let password = "";
  password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];
  
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

export function CreateProfessorPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false); // Track copy success state

  const navigate = useNavigate();

  useEffect(() => {
    setPassword(generateRandomPassword());
  }, []);

  // Clipboard handler
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset icon/text after 2 seconds
    } catch (err) {
      console.error("Impossibile copiare la password: ", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
        <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Nuovo professore</h1>
                        <p className="text-sm text-slate-500">
                            Registra un nuovo account per un docente
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

          {/* Password Display with Copy Button Inline */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Password Generata</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border border-slate-200 bg-amber-50/40 font-mono px-3 py-2 text-sm text-amber-900 focus:outline-none select-all cursor-not-allowed"
                value={password}
                readOnly
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition ${
                  copied 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                }`}
                title="Copia negli appunti"
              >
                {copied ? (
                  <>
                    <FaCheck className="text-emerald-600 text-xs" />
                    <span>Copiato!</span>
                  </>
                ) : (
                  <>
                    <FaCopy className="text-slate-400 text-xs" />
                    <span>Copia</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed bg-amber-50 border border-amber-100 rounded px-2 py-1">
              Nota: Copia questa password prima di salvare. È stata generata rispettando i criteri di sicurezza.
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