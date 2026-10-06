import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore, api } from '../lib/axios';
import { useTheme } from '../hooks/useTheme';
import styles from './pages.module.scss';

export default function Account() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [adminEnabled, setAdminEnabled] = useState(false);
  const [backupDisabled, setBackupDisabled] = useState(false);
  const [restoreDisabled, setRestoreDisabled] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsBusy, setSessionsBusy] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/initialize/checkLegacyUpdateEnabled').then((r) => setAdminEnabled(!!r.data.enabled)).catch(() => setAdminEnabled(false));
    api.get('/auth/sessions').then((r) => setSessions(r.data.sessions || [])).catch(() => setSessions([]));
  }, []);

  async function handleLogout() {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  }

  async function handleLogoutOthers() {
    if (!window.confirm('Sign out every device except this one?')) return;
    setSessionsBusy(true);
    try {
      await api.post('/auth/logout-others');
      const response = await api.get('/auth/sessions');
      setSessions(response.data.sessions || []);
      toast.success('Other devices were signed out');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not sign out other devices.');
    } finally {
      setSessionsBusy(false);
    }
  }

  async function handleBackupClick() {
    setBackupDisabled(true);
    toast.loading('Creating database backup...');
    try {
      const response = await api.get('/initialize/backupDatabase', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/sql' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cd = response.headers['content-disposition'] || '';
      const match = cd.match(/filename="([^"]+)"/);
      link.download = match ? match[1] : 'backup.sql';
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('Backup downloaded');
    } catch (error) {
      toast.dismiss();
      toast.error('Database backup failed.');
      console.log(error);
    } finally {
      setBackupDisabled(false);
    }
  }

  function triggerRestore() {
    if (fileInputRef.current) fileInputRef.current.click();
  }

  async function handleRestoreFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!window.confirm('WARNING: This will completely overwrite the current database. All data will be lost. Continue?')) {
      e.target.value = '';
      return;
    }
    const formData = new FormData();
    formData.append('backup', file);
    setRestoreDisabled(true);
    toast.loading('Restoring database...');
    try {
      const response = await api.post('/initialize/restoreDatabase', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30 * 60 * 1000
      });
      toast.dismiss();
      toast.success(response.data.message || 'Restore successful');
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Database restore failed.');
    } finally {
      setRestoreDisabled(false);
      if (e.target) e.target.value = '';
    }
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
      <div className={styles.accountCard}>
        <div>
          <div className={styles.count}>Sessions</div>
          <strong>Devices signed in</strong>
        </div>
        <ul className={styles.sessionList}>
          {sessions.map((session) => (
            <li key={session.id} className={styles.sessionItem}>
              <span>{session.current ? 'This device' : 'Other device'}</span>
              <span className={styles.count}>{session.userAgent || 'Unknown browser'}</span>
              <span className={styles.count}>{session.createdAt ? new Date(session.createdAt).toLocaleString() : ''}</span>
            </li>
          ))}
          {sessions.length === 0 && <li className={styles.count}>No active sessions.</li>}
        </ul>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={sessionsBusy || sessions.filter((session) => !session.current).length === 0}
          onClick={handleLogoutOthers}
        >
          Log out other devices
        </button>
      </div>
      {adminEnabled && (
        <div className={styles.accountCard}>
          <div>
            <div className={styles.count}>Administration</div>
            <strong>Database tools</strong>
          </div>
          <button type="button" className="btn btn-ghost" disabled={backupDisabled} onClick={handleBackupClick}>
            Backup database
          </button>
          <button type="button" className="btn btn-danger" disabled={restoreDisabled} onClick={triggerRestore}>
            Restore database
          </button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".sql,application/sql,text/plain" onChange={handleRestoreFile} />
        </div>
      )}
    </div>
  );
}
