import React, { useState, useEffect } from "react";
import axios from "../axios";
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
        <p className="mb-1 fw-bold">{payload[0].name}</p>
        <p className="mb-0">${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [monthlySavings, setMonthlySavings] = useState([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("/api/transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;
        setTransactions(data);

        let balance = 0;
        let expenses = 0;
        let income = 0;

        const categoryMap = {};
        const yearMap = {};
        const monthlyMap = {};

        const currentYear = new Date().getFullYear();

        data.forEach((t) => {
          const amount = parseFloat(t.amount);
          const date = new Date(t.date);
          const year = date.getFullYear();
          const month = date.toLocaleString("default", { month: "short" });

          if (t.type === "income") {
            income += amount;
            balance += amount;
          } else if (t.type === "expense") {
            expenses += amount;
            balance -= amount;
          }

          if (year === currentYear) {
            if (t.type === "expense") {
              const cat = t.category || "Uncategorized";
              categoryMap[cat] = (categoryMap[cat] || 0) + amount;
            }

            if (t.type === "income") {
              monthlyMap[month] = (monthlyMap[month] || 0) + amount;
            }
          }

          yearMap[year] = (yearMap[year] || 0) + (t.type === "income" ? amount : -amount);
        });

        setTotalBalance(balance);
        setTotalExpenses(expenses);
        setTotalSavings(income);

        setCategoryData(
          Object.entries(categoryMap).map(([name, value]) => ({
            name,
            value: parseFloat(value.toFixed(2)),
          }))
        );
        setYearlyData(Object.entries(yearMap).map(([year, value]) => ({ name: year, value })));
        setMonthlySavings(Object.entries(monthlyMap).map(([month, value]) => ({ month, savings: value })));
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      }
    };

    fetchTransactions();
  }, []);

  const pieColors = ["#0d6efd", "#6610f2", "#198754", "#eab308", "#f97316", "#ec4899"];
  const barColors = ["#60a5fa", "#4ade80", "#f472b6"];

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
    <div className="container py-4" style={{ minHeight: "100vh" }}>
      <Container fluid style={{ minHeight: "100vh", color: "white", paddingTop: "2rem" }}>
        <h1 className="mb-5 text-center">Dashboard Overview</h1>

        {/* Totals */}
        <Row className="mb-4">
          <Col md={4} className="mb-4 mb-md-0">
            <Card style={cardStyle} text="light" className="glass-card rounded-4 text-center">
              <Card.Body>
                <Card.Title>Total Balance</Card.Title>
                <Card.Text className="fs-3 text-center">${totalBalance.toFixed(2)}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4 mb-md-0">
            <Card style={cardStyle} text="light" className="glass-card rounded-4 text-center">
              <Card.Body>
                <Card.Title>Total Expenses</Card.Title>
                <Card.Text className="fs-3 text-center">${totalExpenses.toFixed(2)}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card style={cardStyle} text="light" className="glass-card rounded-4 text-center">
              <Card.Body>
                <Card.Title>Total Income</Card.Title>
                <Card.Text className="fs-3 text-center">${totalSavings.toFixed(2)}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row className="mb-4">
          <Col md={6}>
            <Card style={cardStyle} text="light" className="glass-card rounded-4 mb-4 mb-md-0">
              <Card.Body>
                <Card.Title>Yearly Balance </Card.Title>
                {yearlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={yearlyData}>
                      <XAxis dataKey="name" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {yearlyData.map((_, index) => (
                          <Cell key={index} fill={barColors[index % barColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center mt-4">No yearly data available.</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card style={cardStyle} text="light" className="glass-card rounded-4">
              <Card.Body>
                <Card.Title>Monthly Savings ({currentYear})</Card.Title>
                {monthlySavings.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlySavings}>
                      <XAxis dataKey="month" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="savings" stroke="#4ade80" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center mt-4">No monthly income data yet.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="justify-content-center mt-4">
          <Col md={6}>
            <Card style={cardStyle} text="light" className="glass-card rounded-4">
              <Card.Body>
                <Card.Title>Spending by Category</Card.Title>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={index} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center mt-4">No category breakdown yet.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}