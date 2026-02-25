import { Link, useNavigate } from "react-router"
import { useEffect, useState, useRef } from "react"
import { useAuthStore } from "../lib/axios"
import toast from "react-hot-toast";
// import { Container, Row, Col, Button, Form } from "react-bootstrap"

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validated, setValidated] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const { login, getNewAccessToken, isLoading, error, accessToken, isAuthenticated, checkRefreshToken } = useAuthStore();

  async function checkAuth() {
    try {
      await checkRefreshToken();
      if (isAuthenticated) await getNewAccessToken();
    } catch (error) {
      // Ignore error
    } finally {
      setAuthChecked(true);
    }
  }

  useEffect(() => {
    checkAuth();
  }, [])

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [authChecked, isAuthenticated, navigate])

  const handleLogin = async (e) => {
    e.preventDefault();
    setValidated(true);
    setSubmitting(true);

    toast.promise(async () => {
        const form = e.currentTarget;
        usernameRef.current.classList.toggle('is-invalid');
        passwordRef.current.classList.toggle('is-invalid');
        if (form.checkValidity() === false) {
          e.stopPropagation();
        } else {
          setValidated(true);
          await login(email, password);
        }
    }, {
      loading: "Logging in...",
      success: "Logged in!",
      error: (err) => {
        if  (err.status == 400) {
          usernameRef.current.classList.add('is-invalid');
          passwordRef.current.classList.add('is-invalid');
          setValidated(false);
          setSubmitting(false);
        }
      }
    })
  }

  if (!authChecked) {
    return (
      <div className="h-100vh container d-flex justify-content-center align-items-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-100vh container">
      <div className="row justify-content-center h-100">
        <div className="col-12 text-center align-self-end">
          <h1 className="mb-5">Login</h1>
        </div>
        <div className="col-12 col-sm-5 align-self-start">
          { !validated && (
            <div className="row">
              <div className="col-12">
                <div className="alert alert-danger" role="alert">Invalid email and password. Please try again</div>
              </div>
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="text" className="form-control" name="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} ref={usernameRef} disabled={submitting} />
            </div>
            <div className="mb-3">
              <label htmlFor="passowrd" className="form-label">Password</label>
              <input type="password" className="form-control" name="password" id="password" required value={password} onChange={(e) => setPassword(e.target.value)} ref={passwordRef} disabled={submitting} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              { submitting ? (
                <div className="spinner-border text-white" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
export default Login