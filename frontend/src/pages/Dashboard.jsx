import { useAuthStore, api, serverUrl } from "../lib/axios"
import { Link, useNavigate } from "react-router";
import Downloader from "../components/Downloader";
import Library from "../components/Library";
import LibraryCounts from "../components/LibraryCounts";
import SearchBar from "../components/SearchBar";
import { useState, useEffect, useLayoutEffect } from "react";
import LegacyUserInstructions from "../components/LegacyUserInstruction";

const Dashboard = () => {
    const { accessToken, isAuthenticated, getNewAccessToken } = useAuthStore();
    const [legacyUser, setLegacyUser] = useState(false);
    const [legacyAppUpdated, setlegacyAppUpdated] = useState(false);
    const navigate = useNavigate();

    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    const [videoLibrary, setVideoLibrary] = useState([]);
    const [mp3Library, setMp3Library] = useState([]);
    const [numberOfItems, setNumberOfItems] = useState(10);

    async function checkLegacyApp() {
      // TODO - There is still a bug in here where if the user goes from the Legacy page back to the dashboard, it loses state somehow...I don't know why.
      const legacyAppUserRes = await api.get('/initialize/checkLegacyAppUser');
      const legacyAppUpdatedRes = await api.get('/initialize/checkLegacyAppUpdated');

      setLegacyUser(legacyAppUserRes.data[0].legacyAppUser == 1 ? true : false);
      setlegacyAppUpdated(legacyAppUpdatedRes.data[0].legacyAppUpdated == 1 ? true : false);
    }

    async function loadLibrary() {
      const videoApiResponse = await api.get('/videos');
      const mp3ApiResponse = await api.get('/mp3s');

      setVideoLibrary(videoApiResponse.data);
      setMp3Library(mp3ApiResponse.data);
    }

    async function checkAuthentication() {
      await checkLegacyApp();
      if (legacyUser && !legacyAppUpdated) {
        navigate('/legacy')
      } else {
        if (isAuthenticated && !accessToken) await getNewAccessToken();
        await loadLibrary();
      }
    }

    useEffect(() => {
      checkAuthentication();
    }, [legacyUser, legacyAppUpdated])

  return (
    <div className="container-fluid">
        { legacyUser && !legacyAppUpdated && (
          <div className="row justify-content-center">
            <div className="col-6">
              <LegacyUserInstructions setLegacyUser={setLegacyUser} />
            </div>
          </div>
        )}
        <LibraryCounts videoCount={videoLibrary.length} mp3Count={mp3Library.length} />
        <Downloader api={api} loadLibrary={loadLibrary}/>
        <SearchBar videoLibrary={videoLibrary} setVideoLibrary={setVideoLibrary} mp3Library={mp3Library} setMp3Library={setMp3Library} api={api} loadLibrary={loadLibrary}/>
        <Library api={api} serverUrl={serverUrl} videoLibrary={videoLibrary} setVideoLibrary={setVideoLibrary} mp3Library={mp3Library} setMp3Library={setMp3Library} numberOfItems={numberOfItems} />
        <Link to="/">Home</Link>
    </div>
  )
}
export default Dashboard