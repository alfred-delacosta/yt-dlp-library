import { Link } from "react-router"
import { useAuthStore } from "../lib/axios"
const Home = () => {
  const { accessToken, isAuthenticated } = useAuthStore();
  return (
    <div>
        <h1>Home</h1>
        <p>Welcome to yt-dlp-library</p>
    </div>
  )
}
export default Home