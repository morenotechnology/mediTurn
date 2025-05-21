import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiBookmark, FiBell } from 'react-icons/fi';
import styles from './Menu.module.scss';

const Menu = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.brand}>
          <span className={styles.logoIcon}>●●</span> MediTurn
        </Link>

        <div className={styles.navIcons}>
          <FiSearch className={styles.icon} />
          <FiBookmark className={styles.icon} />
          <FiBell className={styles.icon} />
          {user ? (
            <div className={styles.avatar} onClick={logout}>
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
          ) : (
            <>
              <Link to="/login" className={styles.loginButton}>Login</Link>
              <Link to="/registro" className={styles.loginButton}>Registro</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Menu;