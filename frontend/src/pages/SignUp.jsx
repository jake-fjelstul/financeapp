import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Card, Container, Alert } from "react-bootstrap";
import { useAuth } from "../context/UserContext";

export default function SignUp() {
  const { register, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }

    if (!lastName.trim()) {
      setError("Please enter your last name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter a password.");
      return;
    }

    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Register the user
      const registerResponse = await register(email.trim(), password.trim(), firstName.trim(), lastName.trim());
      
      // Automatically log in after successful registration
      try {
        const loginResponse = await login(email.trim(), password.trim());
        // firstName should be in login response from backend
        console.log("Login response after registration:", loginResponse);
        // The login function already handles storing firstName, so we don't need to do it again
        navigate("/dashboard", { replace: true });
      } catch (loginErr) {
        // If auto-login fails, show success message and redirect
        setError("Registration successful! Redirecting to sign in...");
        setTimeout(() => {
          navigate("/signin", { replace: true });
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
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
            <Form.Group className="mb-3" controlId="signupFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="signupLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="signupEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="signupPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
            <div className="text-center mt-3">
              <span className="mb-4">Already have an account? </span>
              <Link to="/signin" className="text-decoration-none">Sign In</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
