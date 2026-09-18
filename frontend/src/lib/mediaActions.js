import toast from 'react-hot-toast';
import { api } from './axios';
import { readSseStream } from './sse';

const LONG_TIMEOUT = 30 * 60 * 1000;

const sseOptions = {
  responseType: 'stream',
  adapter: 'fetch',
  timeout: LONG_TIMEOUT,
  headers: {
    Accept: 'text/event-stream',
    'Cache-Control': 'no-cache',
  },
};

export async function generateLocalSubtitles(videoId, onLog) {
  const response = await api.post(`/videos/generatesubtitles/${videoId}`, {}, sseOptions);
  return readSseStream(response, onLog);
}

export async function whisperXGenerateSubtitles(videoId) {
  return api.post(`/videos/whisperx/generateSubtitles/${videoId}`, null, { timeout: LONG_TIMEOUT });
}

export async function whisperXConvertToMp3(videoId) {
  return api.post(`/videos/whisperx/convertvideo/${videoId}`, null, { timeout: LONG_TIMEOUT });
}

export async function transferToJellyfin(videoId) {
  return api.post(`/videos/transfertojellyfin/${videoId}`);
}

export async function deleteVideo(videoId) {
  return api.delete(`/videos/${videoId}`);
}

export async function deleteMp3(mp3Id) {
  return api.delete(`/mp3s/${mp3Id}`);
}

export async function fetchVideoById(id) {
  const { data } = await api.get(`/videos/${id}`);
  return Array.isArray(data) ? data[0] : data;
}

export async function fetchMp3ById(id) {
  const { data } = await api.get(`/mp3s/${id}`);
  return Array.isArray(data) ? data[0] : data;
}

export function toastAction(promise, messages) {
  return toast.promise(promise, messages);
}
