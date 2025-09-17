import { useAuthStore } from "../lib/axios";
import toast from 'react-hot-toast'

const Logout = () => {
    const { logout, isAuthenticated, accessToken } = useAuthStore();
    async function handleClick() {
        await logout();
        toast.success("Successfully loggedout!")
    }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 text-end">
          { isAuthenticated && <button className="btn btn-primary" onClick={handleClick}>Logout</button>}
        </div>
      </div>
    </div>
  )
}
export default Logout