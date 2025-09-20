import { Link } from "react-router"
import { useEffect } from "react";
import { useAuthStore, api } from "../lib/axios"
import toast from "react-hot-toast";
const Home = () => {
  const { accessToken, isAuthenticated } = useAuthStore();

  async function intialize() {
    try {
      toast.loading('Checking for app initiliazation...')
      const dbResults = await api.get('/initialize/db');
      const foldersResults = await api.get('/initialize/folders');
      const usersTableResults = await api.get('/initialize/checkForUsersTable');
      
      if (dbResults.data.dbInitialized && foldersResults.data.foldersInitialized && usersTableResults.data.length > 0) {
        // The users table and folders have already been created.
        toast.dismiss();
        toast.success('App has been initialized! Have fun! 😁')
      } else {
        toast.dismiss();
        toast.loading('App is being initialized! 🔍')
        const usersTableResults = await api.get('/initialize/checkForUsersTable');
        const foldersResults = await api.get('/initialize/folders');
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
    <div>
        <h1>Welcome to Yt-dlp Library</h1>
    </div>
  )
}
export default Home