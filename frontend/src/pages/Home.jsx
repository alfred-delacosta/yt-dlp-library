import { Link } from "react-router"
import { useEffect, useRef, useState } from "react";
import { useAuthStore, api } from "../lib/axios"
import toast from "react-hot-toast";
import LegacyUserInstructionsModal from "../components/LegacyUserInstructionsModal";
const Home = () => {
  const { accessToken, isAuthenticated } = useAuthStore();
  const { legacyUser, setLegacyUser } = useState(false);

  async function intialize() {
    try {
      const checkInitResults = await api.get('/initialize/checkInitialization');
      if (checkInitResults.data.appInit == false) {
        toast.loading('Checking for app initiliazation...');
        const dbResults = await api.get('/initialize/db');
        const foldersResults = await api.get('/initialize/folders');
        const checkForUsersTableResult = await api.get('/initialize/checkForUsersTable');

        if (dbResults.data.dbInitialized && foldersResults.data.foldersInitialized && checkForUsersTableResult.data.length > 0) {
          // The users table and folders have already been created.
          toast.dismiss();
          toast.success('App has been initialized! Have fun! 😁');
        } else {
          toast.dismiss();
          toast.loading('App is being initialized! 🔍');
          const maintenanceTableResult = await api.get('/initialize/maintenance');
          const usersTableResult = await api.get('/initialize/users');
          const videosTableResult = await api.get('/initialize/videos');
          const thumbnailsTableResult = await api.get('/initialize/thumbnails');
          const mp3sTableResult = await api.get('/initialize/mp3s');
          const createMaintenanceTableEntryResults = await api.post('/initialize/maintenance');
          toast.dismiss();
        }
      }
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("Uh oh! There was an error! 😭")
    }
  }

  useEffect(() => {
    intialize();
  }, [])

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <h1>Welcome to Yt-dlp Library</h1>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-6">
          <LegacyUserInstructionsModal />
        </div>
      </div>
    </div>
  )
}
export default Home