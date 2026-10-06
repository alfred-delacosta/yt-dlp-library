import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import toast from 'react-hot-toast';
import { api } from '../lib/axios';
import { fetchVideoById } from '../lib/mediaActions';
import { useLibraryStore } from '../stores/libraryStore';
import styles from './pages.module.scss';

export default function EditVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const loadLibrary = useLibraryStore((s) => s.loadLibrary);
  const [video, setVideo] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    (async () => {
      const record = await fetchVideoById(id);
      setVideo(record);
      setName(record?.name || '');
      setDescription(record?.description || '');
      setLink(record?.link || '');
    })();
  }, [id]);

  async function handleUpdateClick(e) {
    e.preventDefault();
    const data = { ...video, name, description, link };
    await toast.promise(api.post('/videos/update', data), {
      loading: 'Updating video',
      success: 'Video updated',
      error: 'There was an error updating the video',
    });
    await loadLibrary();
    navigate(`/video/${id}`);
  }

  if (!video) return <p className={styles.count}>Loading…</p>;

  return (
    <form className={styles.stack} onSubmit={handleUpdateClick}>
      <h1 className={styles.title}>Edit video</h1>
      <div>
        <label htmlFor="name">Video name</label>
        <input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={8} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label htmlFor="link">Original link</label>
        <input id="link" name="link" type="url" value={link} onChange={(e) => setLink(e.target.value)} />
      </div>
      <button className="btn btn-primary" type="submit">Update</button>
    </form>
  );
}
