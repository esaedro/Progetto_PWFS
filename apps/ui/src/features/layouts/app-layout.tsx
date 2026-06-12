import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../auth/auth.api';
import { IoIosLogOut } from 'react-icons/io';
import { FaKey, FaUser } from 'react-icons/fa';
import { IoMdArrowDropdown } from 'react-icons/io';
import { UserListItem } from '@server/users';

export function AppLayout() {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserListItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        fetchCurrentUser()
            .then((data) => {
                setUser(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching user data:', err);
                setUser(null);
                setLoading(false);
            });
    }, []);

    // Chiude il dropdown cliccando fuori
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <p className="text-sm text-slate-500">Caricamento...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    Accesso negato. Effettua il login.
                </p>
            </div>
        );
    }

    const isProfessor = user.role === 'PROFESSOR';
    const isSecretary = user.role === 'SECRETARY';

    return (
        <>
            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
                <div className="flex items-center justify-between gap-4">

                    {/* Brand */}
                    <button
                        type="button"
                        onClick={() => navigate('/home')}
                        className="text-xl font-semibold text-slate-900 hover:text-slate-600"
                    >
                        Home
                    </button>

                    {/* Nav links + user */}
                    <div className="flex items-center gap-1">
                        {isProfessor && (
                            <>
                                <NavButton label="Materie" onClick={() => navigate('/subjects')} />
                                <NavButton label="Corsi di Laurea" onClick={() => navigate('/degrees')} />
                                <NavButton label="Appelli" onClick={() => navigate('/exams')} />
                            </>
                        )}
                        {isSecretary && (
                            <>
                                <NavButton label="Materie" onClick={() => navigate('/subjects')} />
                                <NavButton label="Corsi di Laurea" onClick={() => navigate('/degrees')} />
                                <NavButton label="Insegnamenti" onClick={() => navigate('/teachings')} />
                                <NavButton label="Appelli" onClick={() => navigate('/exams')} />
                                <NavButton label="Sessioni" onClick={() => navigate('/sessions')} />
                                <NavButton label="Professori" onClick={() => navigate('/professors')} />
                            </>
                        )}

                        {/* User dropdown */}
                        <div className="relative ml-2" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setMenuOpen((prev) => !prev)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-lg font-medium text-slate-700 hover:shadow-[0_0_0_1px_#e2e8f0] hover:bg-slate-50 transition-all"
                            >
                                <FaUser className="h-3.5 w-3.5 text-slate-500" />
                                <span className="max-w-[120px] truncate">
                                    {user.name ? user.name : user.email ?? 'Utente'}
                                </span>
                                <IoMdArrowDropdown
                                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-md">
                                    <button
                                        type="button"
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                        onClick={() => navigate('/logout')}
                                    >
                                        <IoIosLogOut className="h-4 w-4 text-slate-400" />
                                        Logout
                                    </button>
                                    <button
                                        type="button"
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                        onClick={() => navigate('/changepassword')}
                                    >
                                        <FaKey className="h-3.5 w-3.5 text-slate-400" />
                                        Cambia password
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <Outlet />
        </>
    );
}

// Componente bottone navbar riutilizzabile
function NavButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-lg px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-[0_0_0_1px_#e2e8f0] transition-all"
        >
            {label}
        </button>
    );
}