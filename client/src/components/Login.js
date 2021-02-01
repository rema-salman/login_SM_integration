import React, { useRef, useState } from "react";
import { Card, Button, Form, Alert } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, signinWithGoogle, signinWithTwitter } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lengthRest, setLengthRest] = useState(false);
  const history = useHistory();

  // handel submit
  async function handelSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);

      await login(emailRef.current.value, passwordRef.current.value);
      history.push("/");
    } catch {
      setError("INVALID PASSWORD, failed to log in");
    }
    setLoading(false);
  }

  async function handelsigninWithGoogle(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signinWithGoogle();
      history.push("/");
    } catch (error) {
      setError("failed to log in with google");
    }
    setLoading(false);
  }

  async function handelsigninWithTwitter(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signinWithTwitter()
        .then((res) => {
          var token = res.credential.accessToken;
          var secret = res.credential.secret;
          localStorage.setItem("twitterToken", token);
          localStorage.setItem("twitterSecret", secret);
        })
        .catch((err) => {
          console.log(err);
        });
      history.push("/");
    } catch (error) {
      setError("failed to log in with twitter");
    }

    setLoading(false);
  }

  function handelPasswordCheck(e) {
    e.preventDefault();
    if (e.target.value.length < 7) {
      setLengthRest(true);
    }
    if (passwordRef.current.value.length >= 6) setLengthRest(false);
  }
  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Log In</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handelSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="name@example.com"
                ref={emailRef}
                required
              />
            </Form.Group>
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter Password"
                ref={passwordRef}
                required
                onChange={handelPasswordCheck}
              />
              {lengthRest ? (
                <Form.Text style={{ color: "red" }}>
                  Password should be at least 6 characters
                </Form.Text>
              ) : (
                ""
              )}
            </Form.Group>
            <Button
              variant="dark"
              disabled={loading}
              className="w-100"
              type="submit"
            >
              Log In
            </Button>
          </Form>
          <div className="w-100 text-center mt-3">
            <Link to="/forgot-password"> Forgot Password?</Link>
          </div>
          <div className="w-100 text-center mt-4">Or Log In with</div>

          <Button
            style={{
              color: "white",
              border: "none",
              backgroundColor: "#ff0000",
            }}
            disabled={loading}
            onClick={handelsigninWithGoogle}
            className="w-100 mt-2"
          >
            Google
          </Button>
          <Button
            style={{
              color: "white",
              border: "none",
              backgroundColor: "#1DA1F2",
            }}
            disabled={loading}
            onClick={handelsigninWithTwitter}
            className="w-100 mt-2"
          >
            Twitter
          </Button>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
    </>
  );
}
