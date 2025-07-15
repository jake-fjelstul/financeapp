import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card, Container, Alert } from "react-bootstrap";
import { useAuth } from "../context/UserContext";
import axios from "axios";

export default function SignUp() {
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter a username and password.");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: username.trim(),
          password: password.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Registration failed.");
      }

      const data = await res.json();
      const token = data.token;

      localStorage.setItem("token", token); // Save JWT
      setUser({ username: username.trim() }); // Update frontend state
      navigate("/dashboard");
    } catch (err) {
      console.error("Sign up error:", err);
      setError("Sign up failed. Try a different username.");
    }
  };

  const cardStyle = {
    background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03))",
    backdropFilter: "blur(30px)",
    WebkitBackdropFilter: "blur(30px)",
    borderRadius: "2rem",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.6)",
    color: "#fff",
    padding: "1.5rem",
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <Card className="glass-card p-4 bg-dark text-light shadow" style={cardStyle}>
        <Card.Body>
          <h2 className="mb-4 text-center">Sign Up</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="signupUsername">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="signupPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Sign Up
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
