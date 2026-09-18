import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { api } from '../lib/axios';
import styles from './pages.module.scss';

export default function Legacy() {
  const [updateLegacyTablesButtonDisabled, setUpdateLegacyTablesButtonDisabled] = useState(false);
  const [updateVideosTableButtonDisabled, setUpdateVideosTableButtonDisabled] = useState(false);
  const [legacyEnabled, setLegacyEnabled] = useState(false);
  const [backupDisabled, setBackupDisabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/initialize/checkLegacyUpdateEnabled').then((r) => setLegacyEnabled(!!r.data.enabled)).catch(() => setLegacyEnabled(false));
  }, []);

  async function handleUpdateLegacyTablesClick() {
    toast.loading('Tables are being updated.');
    try {
      await api.get('/initialize/updateLegacyTables');
      toast.dismiss();
      toast.success('Tables updated');
      setUpdateLegacyTablesButtonDisabled(true);
      setUpdateVideosTableButtonDisabled(false);
    } catch (error) {
      toast.dismiss();
      toast.error('There was an error updating tables.');
      console.log(error.message);
    }
  }

  async function handleUpdateVideosMp3sAndThumbnailsClick() {
    toast.loading('Tables are being updated.');
    try {
      await api.get('/initialize/updateVideosTable');
      await api.get('/initialize/updateMp3sTable');
      await api.get('/initialize/updateThumbnailsTable');
      toast.dismiss();
      toast.success('Tables updated');
      setUpdateLegacyTablesButtonDisabled(true);
      navigate('/');
    } catch (error) {
      toast.dismiss();
      toast.error('There was an error updating tables.');
      console.log(error.message);
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

  return (
    <div className={styles.stack}>
      <h1 className={styles.title}>Legacy application functions</h1>
      <div className={styles.actions}>
        {legacyEnabled && (
          <button className="btn btn-primary" type="button" disabled={updateLegacyTablesButtonDisabled} onClick={handleUpdateLegacyTablesClick}>
            Update legacy tables
          </button>
        )}
        <button className="btn btn-ghost" type="button" disabled={updateVideosTableButtonDisabled} onClick={handleUpdateVideosMp3sAndThumbnailsClick}>
          Update videos, MP3s, and thumbnails
        </button>
        <button className="btn btn-primary" type="button" disabled={backupDisabled} onClick={handleBackupClick}>
          Backup database
        </button>
      </div>
    </div>
  );
}
