import { Link } from "react-router"
import { useAuthStore } from "../lib/axios"
const Home = () => {
  const { accessToken, isAuthenticated } = useAuthStore();
  return (
    <div>
        <h1>Home</h1>
        <p>Welcome to yt-dlp-library</p>
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
        {accessToken && isAuthenticated && 
          <Link to="/dashboard">
            <button>Dashboard</button>
          </Link>
        }
    </div>
  )
}
export default Home