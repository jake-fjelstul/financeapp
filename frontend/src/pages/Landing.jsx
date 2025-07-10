// src/pages/Landing.jsx
import React from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Landing() {
  const cardStyle = {
    background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), rgba(255,255,255,0.03))",
    backdropFilter: "blur(30px)",
    WebkitBackdropFilter: "blur(30px)",
    borderRadius: "2rem",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
    color: "#fff",
    padding: "2rem",
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center text-light min-vh-100 px-3">
      <Container className="text-center mb-5">
        <h1 className="fw-bold mb-3">💰 Finance Tracker</h1>
        <p className="lead" style={{ maxWidth: "600px", margin: "0 auto" }}>
          Track your spending, set financial goals, and get visual insights into your money — all in one modern, secure place.
        </p>
        <Link to="/signin">
          <Button variant="light" size="lg" className="rounded-pill mt-4 px-4 fw-semibold">
            Get Started
          </Button>
        </Link>
      </Container>

      <Container>
        <Row className="g-4 justify-content-center">
          <Col md={4}>
            <Card style={cardStyle} className="glass-card text-light h-100">
              <Card.Body>
                <Card.Title className="fw-bold fs-5 mb-3">📊 Visual Dashboard</Card.Title>
                <Card.Text>
                  Instantly see your balances, expenses, and savings trends with clean, interactive visuals.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card style={cardStyle} className="glass-card text-light h-100">
              <Card.Body>
                <Card.Title className="fw-bold fs-5 mb-3">🧠 Smart Planning</Card.Title>
                <Card.Text>
                  Plan budgets, investment goals, and track progress effortlessly with guided tools.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card style={cardStyle} className="glass-card text-light h-100">
              <Card.Body>
                <Card.Title className="fw-bold fs-5 mb-3">🔒 Secure & Private</Card.Title>
                <Card.Text>
                  Your financial data stays private. Everything is protected with top-level encryption.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
