import { Link } from "react-router"
import Logout from "./Logout"
const Navbar = ({ isAuthenticated, accessToken}) => {
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
                    <form className="d-flex">
                        <Logout />
                    </form>
                </div>
            </div>
        </nav>
    )
}
export default Navbar