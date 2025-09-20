import { Link } from "react-router"
import { useEffect, useState } from "react"
import { useAuthStore } from "../lib/axios"
// import { Container, Row, Col, Button, Form } from "react-bootstrap"

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validated, setValidated] = useState(false);

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
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      setValidated(true);
      await login(email, password);
    }
  }

  return (
    <div className="h-100vh container">
      <div className="row justify-content-center h-100">
        <div className="col-12 text-center align-self-end">
          <h1 className="mb-5">Login</h1>
        </div>
        <div className="col-5 align-self-start">
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="text" className="form-control" name="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="true" />
            </div>
            <div className="mb-3">
              <label htmlFor="passowrd" className="form-label">Password</label>
              <input type="password" className="form-control" name="password" id="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  )
}
export default Login