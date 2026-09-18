import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { api } from '../lib/axios';
import styles from './pages.module.scss';

export default function Legacy() {
  const [updateLegacyTablesButtonDisabled, setUpdateLegacyTablesButtonDisabled] = useState(false);
  const [updateVideosTableButtonDisabled, setUpdateVideosTableButtonDisabled] = useState(false);
  const [legacyEnabled, setLegacyEnabled] = useState(false);
  const [optionsRevealed, setOptionsRevealed] = useState(false);
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

  return (
    <div className={styles.stack}>
      <h1 className={styles.title}>Legacy application functions</h1>
      {legacyEnabled && !optionsRevealed && (
        <button className="btn btn-primary" type="button" onClick={() => setOptionsRevealed(true)}>
          Reveal legacy options
        </button>
      )}
      {legacyEnabled && optionsRevealed && (
        <div className={styles.actions}>
          <button className="btn btn-primary" type="button" disabled={updateLegacyTablesButtonDisabled} onClick={handleUpdateLegacyTablesClick}>
            Update legacy tables
          </button>
          <button className="btn btn-ghost" type="button" disabled={updateVideosTableButtonDisabled} onClick={handleUpdateVideosMp3sAndThumbnailsClick}>
            Update videos, MP3s, and thumbnails
          </button>
        </div>
      )}
    </div>
  );
}
