import { useAuthStore, api, serverUrl } from "../lib/axios"
import { Link, useNavigate } from "react-router";
import Downloader from "../components/Downloader";
import Library from "../components/Library";
import LibraryCounts from "../components/LibraryCounts";
import SearchBar from "../components/SearchBar";
import { useState, useEffect } from "react";

const Dashboard = () => {
    const { accessToken, isAuthenticated, getNewAccessToken } = useAuthStore();
    const navigate = useNavigate();

    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    const [videoLibrary, setVideoLibrary] = useState([]);
    const [mp3Library, setMp3Library] = useState([]);
    const [numberOfItems, setNumberOfItems] = useState(10);

    async function loadLibrary() {
      const videoApiResponse = await api.get('/videos');
      const mp3ApiResponse = await api.get('/mp3s');

      setVideoLibrary(videoApiResponse.data);
      setMp3Library(mp3ApiResponse.data);
    }

    async function checkAuthentication() {
      if (isAuthenticated && !accessToken) await getNewAccessToken();
      await loadLibrary();
    }

    useEffect(() => {
      checkAuthentication();
    }, [])

  return (
    <div className="container-fluid">
        <LibraryCounts videoCount={videoLibrary.length} mp3Count={mp3Library.length} />
        <Downloader api={api} loadLibrary={loadLibrary}/>
        <SearchBar videoLibrary={videoLibrary} setVideoLibrary={setVideoLibrary} mp3Library={mp3Library} setMp3Library={setMp3Library} api={api} loadLibrary={loadLibrary}/>
        <Library api={api} serverUrl={serverUrl} videoLibrary={videoLibrary} setVideoLibrary={setVideoLibrary} mp3Library={mp3Library} setMp3Library={setMp3Library} numberOfItems={numberOfItems} />
        <Link to="/">Home</Link>
    </div>
  )
}
export default Dashboard