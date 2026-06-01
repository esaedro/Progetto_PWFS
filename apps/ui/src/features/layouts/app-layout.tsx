import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../auth/auth.api';
import styles from '../css/books.module.css';
import { IoIosLogOut } from "react-icons/io";
import { FaKey } from 'react-icons/fa';
import { FaUser } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";

export function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser()
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
        setUser(null);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className={styles.loading}>Caricamento...</div>;
  }

  if (!user) {
    return <div className={styles.error}>Accesso negato. Effettua il login.</div>;
  }

  const isProfessor = user.role === "PROFESSOR";

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navBrand} onClick={() => navigate('/home')}>
          Home
        </div>

        <div className={styles.navLinks}>
          {isProfessor ? (
            <button onClick={() => navigate('/books')}>Appelli</button>
          ) : (
            <>
              <button onClick={() => navigate('/professors')}>Professori</button>
              <button onClick={() => navigate('/sessions')}>Sessioni</button>
              <button onClick={() => navigate('/subjects')}>Materia</button>
              <button onClick={() => navigate('/degrees')}>Corsi di Laurea</button>
              <button onClick={() => navigate('/teachings')}>Insegnamenti</button>
            </>
          )}
          {/* CONDITIONAL LINKS END HERE */}
          
          <div className={styles.userSection}>
            <button
              className={styles.userButton}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <FaUser/>

              <span className={styles.userName}>
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email ?? 'Utente'}
              </span>

              <IoMdArrowDropdown />
            </button>

            {menuOpen && (
              <div className={styles.dropdownMenu}>
                <button
                  className={styles.dropdownItem}
                  onClick={() => navigate('/logout')}
                >
                  <IoIosLogOut /> Logout
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={() => navigate('/changepassword')}
                >
                  <FaKey/> Cambia password
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <Outlet />
    </>
  );
}