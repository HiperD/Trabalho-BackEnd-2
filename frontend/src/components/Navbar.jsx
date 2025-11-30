import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          🏨 Hotel Manager
        </Link>
        <ul className={styles.navLinks}>
          <li><Link to="/">Início</Link></li>
          <li><Link to="/clientes">Clientes</Link></li>
          <li><Link to="/quartos">Quartos</Link></li>
          <li><Link to="/reservas">Reservas</Link></li>
        </ul>
        <div className={styles.userInfo}>
          <span>Olá, {user?.nome}</span>
          <button onClick={toggleTheme} className={styles.themeBtn} title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
