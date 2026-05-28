import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../auth/auth.api';
import styles from '../css/books.module.css';
import { IoIosLogOut } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";

export function AppLayout() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch((err) => setUser(null));
  }, []);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navBrand} onClick={() => navigate('/books')}>
           Library
        </div>

        <div className={styles.navLinks}>
          <button onClick={() => navigate('/books')}>Catalogo</button>
          <button onClick={() => navigate('/books/new')}>Nuovo libro</button>
          <button onClick={() => navigate('/authors')}>Autori</button>
          <button onClick={() => navigate('/categories')}>Categorie</button>
          
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
              </div>
            )}
          </div>
        </div>
      </nav>

      <Outlet />
    </>
  );
}