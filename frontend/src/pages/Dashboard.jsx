import { useAuthStore, api } from "../lib/axios"
import { Link } from "react-router";
import Downloader from "../components/Downloader";
import { useLayoutEffect } from "react";

const Dashboard = () => {
    const { accessToken, user, isAuthenticated, checkAuth } = useAuthStore();

    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    // useLayoutEffect(() => {
    //     async function runCheckAuth() {
    //         await checkAuth();
    //     }
    //     runCheckAuth();
    // }, [isAuthenticated])

  return (
    <div>
        <h1>Dashboard</h1>
        <Downloader api={api} />
        <Link to="/">Home</Link>
    </div>
  )
}
export default Dashboard