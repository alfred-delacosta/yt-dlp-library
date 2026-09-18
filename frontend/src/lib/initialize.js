import toast from 'react-hot-toast';
import { api } from './axios';

export async function initializeApp() {
  try {
    const checkInitResults = await api.get('/initialize/checkInitialization');
    if (checkInitResults.data.appInit !== false) return;
    toast.loading('Checking for app initialization...');
    const dbResults = await api.get('/initialize/db');
    const foldersResults = await api.get('/initialize/folders');
    const checkForUsersTableResult = await api.get('/initialize/checkForUsersTable');

    if (dbResults.data.dbInitialized && foldersResults.data.foldersInitialized && checkForUsersTableResult.data.length > 0) {
      toast.dismiss();
      toast.success('App has been initialized.');
      return;
    }

    toast.dismiss();
    toast.loading('App is being initialized...');
    await api.get('/initialize/maintenance');
    await api.get('/initialize/users');
    await api.get('/initialize/videos');
    await api.get('/initialize/thumbnails');
    await api.get('/initialize/mp3s');
    await api.post('/initialize/maintenance');
    toast.dismiss();
  } catch (error) {
    console.error(error);
    toast.dismiss();
    toast.error('There was an error initializing the app.');
  }
}
