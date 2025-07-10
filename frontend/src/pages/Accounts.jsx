import React from "react";
import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function Accounts() {
  const accounts = [
    {
      name: "Checking Account",
      balance: 4800,
      monthlyCost: 1200,
      monthlySavings: 600,
    },
    {
      name: "Savings Account",
      balance: 8700,
      monthlySavings: 400,
    },
    {
      name: "Investing Account",
      balance: 12500,
      portfolioValue: 13200,
    },
  ];

  const chartData = accounts.map((acc) => ({
    name: acc.name,
    balance: acc.balance,
  }));

  const chartColors = ["#60a5fa", "#4ade80", "#f472b6"];

  const glassStyle = {
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
      <h1 className="mb-4 text-center text-light">Accounts Overview</h1>

      <div className="d-flex flex-wrap justify-content-center gap-4 mb-5">
        {accounts.map((acc, index) => (
          <Card
            key={index}
            text="light"
            style={{ width: "22rem", ...glassStyle }}
            className="glass-card shadow"
          >
            <Card.Body className="d-flex flex-column justify-content-between">
              <div>
                <Card.Title className="fs-4">{acc.name}</Card.Title>
                <Card.Text>
                  Balance: <strong>${acc.balance}</strong>
                </Card.Text>
                {acc.monthlyCost && (
                  <Card.Text>
                    Monthly Cost: <strong>${acc.monthlyCost}</strong>
                  </Card.Text>
                )}
                {acc.monthlySavings && (
                  <Card.Text>
                    Monthly Savings: <strong>${acc.monthlySavings}</strong>
                  </Card.Text>
                )}
                {acc.portfolioValue && (
                  <Card.Text>
                    Portfolio Value: <strong>${acc.portfolioValue}</strong>
                  </Card.Text>
                )}
              </div>
              <Link to={`/accounts/${encodeURIComponent(acc.name)}`} className="mt-3">
                <Button variant="outline-light" className="w-100 rounded-pill">
                  View Details
                </Button>
              </Link>
            </Card.Body>
          </Card>
        ))}
      </div>

      <div className="glass-card p-4 text-light shadow" style={glassStyle}>
        <h4 className="text-center mb-4">Account Balance Comparison</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "10px",
                color: "#f9fafb",
              }}
            />
            <Bar dataKey="balance" radius={[6, 6, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={chartColors[index % chartColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

