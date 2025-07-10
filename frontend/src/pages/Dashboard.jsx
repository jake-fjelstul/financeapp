// src/pages/Dashboard.jsx
import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1f2937",
        color: "#f9fafb",
        padding: "10px 14px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
      }}>
        <p className="mb-1 fw-bold">{label}</p>
        <p className="mb-0">${payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const barData = [
    { name: "2021", balance: 5200 },
    { name: "2022", balance: 6800 },
    { name: "2023", balance: 7800 },
  ];
  const barColors = ["#60a5fa", "#f472b6", "#4ade80"];

  const lineData = [
    { month: "Jan", savings: 300 },
    { month: "Feb", savings: 450 },
    { month: "Mar", savings: 700 },
    { month: "Apr", savings: 600 },
  ];

  const pieData = [
    { name: "Personal", value: 500 },
    { name: "Travel", value: 300 },
    { name: "Food", value: 200 },
  ];

  const pieColors = ["#0d6efd", "#6610f2", "#198754"];

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
    <div
      className="container py-4"
      style={{
        minHeight: "100vh",
      }}
    >
        <Container fluid style={{minHeight: "100vh", color: "white", paddingTop: "2rem" }}>
        <h1 className="mb-5 text-center">Dashboard Overview</h1>

        <Row className="mb-4">
            <Col md={4} className="mb-4 mb-md-0">
            <Card style={cardStyle} text="light" className="glass-card rounded-4 text-center">
                <Card.Body>
                <Card.Title>Total Balance</Card.Title>
                <Card.Text className="fs-3 text-center">$7,800</Card.Text>
                </Card.Body>
            </Card>
            </Col>
            <Col md={4} className="mb-4 mb-md-0">
            <Card style={cardStyle} text="light" className=" glass-card rounded-4 text-center">
                <Card.Body>
                <Card.Title>Total Expenses</Card.Title>
                <Card.Text className="fs-3 text-center">$1,200</Card.Text>
                </Card.Body>
            </Card>
            </Col>
            <Col md={4}>
            <Card style={cardStyle} text="light" className="glass-card rounded-4 text-center">
                <Card.Body>
                <Card.Title>Total Savings</Card.Title>
                <Card.Text className="fs-3 text-center">$3,400</Card.Text>
                </Card.Body>
            </Card>
            </Col>
        </Row>

        <Row className="mb-4">
            <Col md={6}>
            <Card style={cardStyle} text="light" className="glass-card rounded-4 mb-4 mb-md-0">
                <Card.Body>
                <Card.Title>Yearly Balance (Bar Chart)</Card.Title>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                    <XAxis dataKey="name" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="balance" radius={[4, 4, 0, 0]}>
                        {barData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={barColors[index % barColors.length]} />
                        ))}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </Card.Body>
            </Card>
            </Col>

            <Col md={6}>
            <Card style={cardStyle} text="light" className="glass-card rounded-4">
                <Card.Body>
                <Card.Title>Monthly Savings (Line Chart)</Card.Title>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={lineData}>
                    <XAxis dataKey="month" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="savings" stroke="#4ade80" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
                </Card.Body>
            </Card>
            </Col>
        </Row>

        <Row className="justify-content-center">
            <Col md={6}>
            <Card style={cardStyle} text="light" className="glass-card rounded-4">
                <Card.Body>
                <Card.Title>Spending by Category (Pie Chart)</Card.Title>
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
                    <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                </Card.Body>
            </Card>
            </Col>
        </Row>
        </Container>
    </div>
  );
}







