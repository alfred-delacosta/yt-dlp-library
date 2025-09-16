import { Link } from "react-router"
import { useState, useEffect } from "react"
import { useAuthStore } from "../lib/axios";
const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, getNewAccessToken, isLoading, error, accessToken } = useAuthStore();

  async function handleSubmit(e) {
    e.preventDefault();
  }

    useEffect(() => {
      async function getAccessToken() {
        await getNewAccessToken();
      }
      getAccessToken();
    }, [accessToken])

  return (
    <div className="bg-slate-500 h-screen">
      <h1>Signup Page</h1>
      <form onSubmit={handleSubmit} className="my-10">
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
export default Signup