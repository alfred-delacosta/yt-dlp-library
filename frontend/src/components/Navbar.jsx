import { Link } from "react-router"
import Logout from "./Logout"
import { Moon } from "lucide-react"
import { useState, useEffect } from "react"
import { api } from "../lib/axios"
const Navbar = ({ isAuthenticated, accessToken}) => {
    const [legacyUser, setLegacyUser] = useState(false);
    const [legacyAppUpdated, setlegacyAppUpdated] = useState(false);

    // TODO Turn the function into a module to export
    async function checkLegacyApp() {
      const legacyAppUserRes = await api.get('/initialize/checkLegacyAppUser');
      const legacyAppUpdatedRes = await api.get('/initialize/checkLegacyAppUpdated');

      setLegacyUser(legacyAppUserRes.data[0].legacyAppUser == 1 ? true : false);
      setlegacyAppUpdated(legacyAppUpdatedRes.data[0].legacyAppUpdated == 1 ? true : false);
    }

    useEffect(() => {
        checkLegacyApp();
    }, [])

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
                    <Link to="/" className="navbar-brand">Yt-dlp Library</Link>
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link to="/" className="nav-link">Home</Link>
                        </li>
                        {!legacyAppUpdated && (
                            <li className="nav-item">
                                <Link to="/legacy" className="nav-link">Legacy Updates</Link>
                            </li>
                        )}
                        { isAuthenticated && (
                            <li className="nav-item">
                                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            </li>
                        )}
                        { !isAuthenticated && (
                            <li className="nav-item">
                                <Link to="/login" className="nav-link">Login</Link>
                            </li>
                        )}
                        { !isAuthenticated && (
                            <li className="nav-item">
                                <Link to="/signup" className="nav-link">Signup</Link>
                            </li>
                        )}
                    </ul>
                    <div className="d-flex">
                        <button data-bs-theme-value className="btn btn-dark">Toggle Dark Mode <Moon /></button>
                    </div>
                    <form className="d-flex">
                        <Logout />
                    </form>
                </div>
            </div>
        </nav>
    )
}
export default Navbar