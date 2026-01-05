import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import axios from "axios";

export default function Accounts() {
  const [accountSummaries, setAccountSummaries] = useState([]);
  const navigate = useNavigate();

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;

        const accounts = {
          Checking: { name: "Checking Account", balance: 0, expenses: 0, savings: 0 },
          Savings: { name: "Savings Account", balance: 0, expenses: 0, savings: 0 },
          Investing: { name: "Investing Account", balance: 0, expenses: 0, savings: 0 },
        };

        data.forEach((t) => {
          const account = capitalize(t.account?.trim() || "");
          const amount = parseFloat(t.amount);
          if (!accounts[account]) return;

          if (t.type === "income") {
            accounts[account].balance += amount;
            accounts[account].savings += amount;
          } else if (t.type === "expense") {
            accounts[account].balance -= amount;
            accounts[account].expenses += amount;
          }
        });

        setAccountSummaries(Object.entries(accounts).map(([key, value]) => ({ ...value, key })));
      } catch (err) {
        console.error("Failed to load transactions:", err);
      }
    };

    fetchData();
  }, []);

  const chartData = accountSummaries.map((acc) => ({
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
    <div className="container py-4" style={{ minHeight: "100vh" }}>
      <h1 className="mb-4 text-center text-light">Accounts Overview</h1>

      <div className="d-flex flex-wrap justify-content-center gap-4 mb-5">
        {accountSummaries.map((acc, index) => (
          <Card
            key={index}
            text="light"
            style={{ 
              width: "22rem", 
              ...glassStyle,
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            className="glass-card shadow"
            onClick={() => navigate(`/accounts/${encodeURIComponent(acc.key)}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 15px 50px rgba(0, 0, 0, 0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.6)";
            }}
          >
            <Card.Body className="d-flex flex-column justify-content-between">
              <div>
                <Card.Title className="fs-4">{acc.name}</Card.Title>
                <Card.Text>
                  Balance: <strong>${acc.balance.toFixed(2)}</strong>
                </Card.Text>
                <Card.Text>
                  Monthly Expenses: <strong>${acc.expenses.toFixed(2)}</strong>
                </Card.Text>
                <Card.Text>
                  Monthly Savings: <strong>${acc.savings.toFixed(2)}</strong>
                </Card.Text>
              </div>
              <Link
                to={`/accounts/${encodeURIComponent(acc.key)}`}
                className="mt-3"
                onClick={(e) => e.stopPropagation()}
              >
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
        {chartData.length > 0 ? (
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
              {chartData.some(item => item.balance < 0) && (
                <ReferenceLine 
                  y={0} 
                  stroke="#ccc" 
                  strokeDasharray="5 5" 
                  strokeWidth={1.5}
                />
              )}
              <Bar dataKey="balance" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center mt-3">No data available.</p>
        )}
      </div>
    </div>
  );
}

