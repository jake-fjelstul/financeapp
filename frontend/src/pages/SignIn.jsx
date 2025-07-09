// src/pages/SignIn.jsx
import React, { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // TEMP: Dummy credentials
    if (email === "test@example.com" && password === "password") {
      navigate("/"); // Redirect to dashboard
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark text-light">
      <Card className="p-4 shadow-lg" style={{ width: "100%", maxWidth: "400px" }}>
        <Card.Body>
          <h2 className="mb-4 text-center">Sign In</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100">
              Sign In
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}