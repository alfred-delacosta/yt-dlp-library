import { useAuthStore, api, serverUrl } from "../lib/axios"
import { Link } from "react-router";
import Downloader from "../components/Downloader";
import Library from "../components/Library";
import LibraryCounts from "../components/LibraryCounts";
import SearchBar from "../components/SearchBar";
import { useState, useEffect, useLayoutEffect } from "react";

const Dashboard = () => {
    const { accessToken, isAuthenticated, getNewAccessToken } = useAuthStore();

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
      <div className="row">
        <div className="col-12 col-sm-2">
          <label htmlFor="items" className="form-label">Number of Items to Show Per Page</label>
          <input type="number" name="items" id="items" className="form-control" value={numberOfItems} onChange={(e) => { setNumberOfItems(Math.max(1, Number(e.target.value) || 1))}} min={1} />
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