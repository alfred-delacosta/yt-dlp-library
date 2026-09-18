import { useState } from 'react';
import { Link } from 'react-router';
import { Eye, EyeOff, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../lib/axios';
import { useTheme } from '../hooks/useTheme';
import styles from './pages.module.scss';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const { theme, toggle } = useTheme();

  async function handleLogin(e) {
    e.preventDefault();
    setInvalid(false);
    try {
      await toast.promise(login(email, password), {
        loading: 'Logging in…',
        success: 'Logged in',
        error: 'Invalid email or password',
      });
    } catch {
      setInvalid(true);
    }
  }

  return (
    <div className={styles.auth}>
      <button type="button" className={styles.themeCorner} onClick={toggle} aria-label="Toggle theme">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Log in</h1>
        {invalid && <div className={styles.error}>Invalid email and password. Please try again.</div>}
        <form className={styles.authForm} onSubmit={handleLogin}>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordWrap}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className={styles.eye} onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={isLoading}>
            {isLoading ? 'Please wait…' : 'Log in'}
          </button>
        </form>
        <p className={styles.mutedLink}>
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
