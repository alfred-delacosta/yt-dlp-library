import { Link } from "react-router"
import { useEffect } from "react"
import { useAuthStore } from "../lib/axios"
import { useState } from "react"

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, getNewAccessToken, isLoading, error, accessToken, isAuthenticated, checkRefreshToken } = useAuthStore();

  async function checkAuth() {
    try {
      await checkRefreshToken();
      if (isAuthenticated) await getNewAccessToken(); 
    } catch (error) {
      return;
    }
  }

  useEffect(() => {
    checkAuth();
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(email, password);
  }

  return (
    <div className="bg-slate-500 h-screen">
      <h1>Login Page</h1>
      <form onSubmit={handleLogin} className="my-10">
        <label htmlFor="email" className="mx-5">Email</label>
        <input type="text" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="true" />
        <label htmlFor="passowrd" className="mx-5">Password</label>
        <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Submit</button>
      </form>



      <Link to="/">Home</Link>
    </div>
  )
}
export default Login