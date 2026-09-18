import { useState } from 'react';
import { Link } from 'react-router';
import { Eye, EyeOff, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../lib/axios';
import { useTheme } from '../hooks/useTheme';
import styles from './pages.module.scss';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const signup = useAuthStore((s) => s.signup);
  const isLoading = useAuthStore((s) => s.isLoading);
  const { theme, toggle } = useTheme();

  async function handleSubmit(e) {
    e.preventDefault();
    await toast.promise(signup(email, password), {
      loading: 'Creating account…',
      success: 'Account created',
      error: 'Could not sign up',
    });
  }

  return (
    <div className={styles.auth}>
      <button type="button" className={styles.themeCorner} onClick={toggle} aria-label="Toggle theme">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Sign up</h1>
        <form className={styles.authForm} onSubmit={handleSubmit}>
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
                autoComplete="new-password"
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
            {isLoading ? 'Please wait…' : 'Create account'}
          </button>
        </form>
        <p className={styles.mutedLink}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
