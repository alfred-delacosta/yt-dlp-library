import { api } from './axios';

export async function fetchTags() {
  const { data } = await api.get('/tags');
  return Array.isArray(data) ? data : [];
}

export async function createTag(name) {
  const { data } = await api.post('/tags', { name });
  return data;
}

export async function renameTag(id, name) {
  const { data } = await api.patch(`/tags/${id}`, { name });
  return data;
}

export async function deleteTag(id) {
  const { data } = await api.delete(`/tags/${id}`);
  return data;
}

export async function setMediaTags(item, tagIds) {
  const audio = item?.mediaType === 'mp3';
  const path = audio ? `/mp3s/${item.id}/tags` : `/videos/${item.id}/tags`;
  const { data } = await api.put(path, { tagIds });
  return Array.isArray(data?.tags) ? data.tags : [];
}

export async function fetchStats() {
  const { data } = await api.get('/stats');
  return data;
}
