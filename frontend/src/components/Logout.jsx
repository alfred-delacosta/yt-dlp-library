import { useAuthStore } from "../lib/axios";
import toast from 'react-hot-toast'

const Logout = () => {
    const { logout } = useAuthStore();
    async function handleClick() {
        await logout();
        toast.success("Successfully loggedout!")
    }

  return (
    <button className="bg-black text-blue-300" onClick={handleClick}>Logout</button>
  )
}
export default Logout