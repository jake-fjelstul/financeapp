// src/pages/Planning.jsx
import React, { useState } from "react";
import { Card, Form, Button, Row, Col, Nav } from "react-bootstrap";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function Planning() {
  const [activeTab, setActiveTab] = useState("budget");

  const pieData = [
    { name: "Needs", value: 1200 },
    { name: "Wants", value: 500 },
    { name: "Savings", value: 800 },
  ];
  const pieColors = ["#60a5fa", "#facc15", "#34d399"];

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
    <div className="container py-4 text-light">
      <h1 className="text-center mb-4">Financial Planning</h1>

      <Nav
        variant="pills"
        className="justify-content-center mb-4 rounded-4 p-2"
        style={{
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "2rem",
        }}
        >
        <Nav.Item>
            <Nav.Link
            eventKey="budget"
            active={activeTab === "budget"}
            onClick={() => setActiveTab("budget")}
            className={`rounded-pill fw-bold ${
                activeTab === "budget" ? "bg-white text-dark" : "text-white"
            }`}
            style={{ padding: "0.5rem 1.25rem" }}
            >
            Budget
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link
            eventKey="investments"
            active={activeTab === "investments"}
            onClick={() => setActiveTab("investments")}
            className={`rounded-pill fw-bold ${
                activeTab === "investments" ? "bg-white text-dark" : "text-white"
            }`}
            style={{ padding: "0.5rem 1.25rem" }}
            >
            Investments
            </Nav.Link>
        </Nav.Item>
        </Nav>

      {activeTab === "budget" && (
        <>
          <Row className="mb-4">
            <Col md={6}>
              <Card style={cardStyle} className="glass-card text-light rounded-4 shadow mb-3 mb-md-0">
                <Card.Body>
                  <Card.Title className="mb-3">Monthly Budget Summary</Card.Title>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card style={cardStyle} className="glass-card text-light rounded-4 shadow h-100">
                <Card.Body>
                  <Card.Title className="mb-3">Track Spending Plan</Card.Title>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Expected Income</Form.Label>
                      <Form.Control type="number" placeholder="$4000" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Spending Goals</Form.Label>
                      <Form.Control as="textarea" rows={3} placeholder="E.g., Groceries - $500, Dining - $200..." />
                    </Form.Group>
                    <Button variant="outline-light">Save Plan</Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {activeTab === "investments" && (
        <Row className="mb-4 justify-content-center">
          <Col md={8}>
            <Card className="glass-card text-light rounded-4 shadow" style={cardStyle}>
              <Card.Body>
                <Card.Title className="mb-3">Investment Strategy</Card.Title>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Monthly Investment Amount</Form.Label>
                    <Form.Control type="number" placeholder="$500" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Target Goals</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="E.g., $20,000 in Roth IRA by 2027..." />
                  </Form.Group>
                  <Button variant="outline-light">Save Strategy</Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
