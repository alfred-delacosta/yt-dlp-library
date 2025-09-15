import { useAuthStore, api } from "../lib/axios"
import { Link } from "react-router";
import Downloader from "../components/Downloader";
import Library from "../components/Library";
import LibraryCounts from "../components/LibraryCounts";
import { useLayoutEffect, useEffect } from "react";

const Dashboard = () => {
    const { accessToken, user, isAuthenticated, checkAuth } = useAuthStore();

    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

  return (
    <div>
        <h1>Dashboard</h1>
        <LibraryCounts api={api} />
        <Downloader api={api} />
        <Library api={api} />
        <Link to="/">Home</Link>
    </div>
  )
}
export default Dashboard