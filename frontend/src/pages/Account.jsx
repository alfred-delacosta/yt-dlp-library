import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../lib/axios';
import { useTheme } from '../hooks/useTheme';
import styles from './pages.module.scss';

export default function Account() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  }

  return (
    <div className={styles.stack}>
      <div className={styles.header}>
        <h1 className={styles.title}>Account</h1>
      </div>
      <div className={styles.accountCard}>
        <div>
          <div className={styles.count}>Signed in</div>
          <strong>{user?.email || 'Library user'}</strong>
        </div>
        <button type="button" className="btn btn-ghost" onClick={toggle}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button type="button" className="btn btn-danger" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  );
}
