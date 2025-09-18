import { Link } from "react-router"
import { useAuthStore } from "../lib/axios"
const Home = () => {
  const { accessToken, isAuthenticated } = useAuthStore();
  return (
    <div>
        <h1>Welcome to Yt-dlp Library</h1>
    </div>
  )
}
export default Home