import { useAuthStore, api, serverUrl } from "../lib/axios"
import { Link, useNavigate } from "react-router";
import Downloader from "../components/Downloader";
import Library from "../components/Library";
import LibraryCounts from "../components/LibraryCounts";
import SearchBar from "../components/SearchBar";
import { useState, useEffect } from "react";

const Dashboard = () => {
    const { accessToken, isAuthenticated, getNewAccessToken, checkRefreshToken } = useAuthStore();
    const navigate = useNavigate();

    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    const [videoLibrary, setVideoLibrary] = useState([]);
    const [mp3Library, setMp3Library] = useState([]);
    const [numberOfItems, setNumberOfItems] = useState(10);
    const [authChecked, setAuthChecked] = useState(false);

    async function loadLibrary() {
      const videoApiResponse = await api.get('/videos');
      const mp3ApiResponse = await api.get('/mp3s');

      setVideoLibrary(videoApiResponse.data);
      setMp3Library(mp3ApiResponse.data);
    }

    async function checkAuthentication() {
      try {
        if (!isAuthenticated) await checkRefreshToken();
        if (isAuthenticated && !accessToken) await getNewAccessToken();
      } catch (error) {
        // Auth failed
      } finally {
        setAuthChecked(true);
      }
      if (isAuthenticated) {
        await loadLibrary();
      } else {
        navigate('/login');
        return;
      }
    }

    useEffect(() => {
      checkAuthentication();
    }, [])

  if (!authChecked) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 col-sm-2">
          <label htmlFor="items" className="form-label">Number of Items to Show Per Page</label>
          <input type="number" name="items" id="items" className="form-control" value={numberOfItems} onChange={(e) => { setNumberOfItems(Math.max(0, Number(e.target.value) || 0))}} min={0} />
        </div>
      </div>
        <LibraryCounts videoCount={videoLibrary.length} mp3Count={mp3Library.length} />
        <Downloader api={api} loadLibrary={loadLibrary}/>
        <SearchBar videoLibrary={videoLibrary} setVideoLibrary={setVideoLibrary} mp3Library={mp3Library} setMp3Library={setMp3Library} api={api} loadLibrary={loadLibrary}/>
        <Library api={api} serverUrl={serverUrl} videoLibrary={videoLibrary} setVideoLibrary={setVideoLibrary} mp3Library={mp3Library} setMp3Library={setMp3Library} numberOfItems={numberOfItems} />
        <Link to="/">Home</Link>
    </div>
  )
}
export default Dashboard