// src/pages/Planning.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Nav,
  CloseButton,
} from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import axios from "axios";

export default function Planning() {
  const [activeTab, setActiveTab] = useState("budget");

  // Budget Tab State
  const [checkingBalance, setCheckingBalance] = useState(0);
  const [purchases, setPurchases] = useState([]);
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");

  // Investment Tab State
  const [initialInvestment, setInitialInvestment] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [years, setYears] = useState(0);
  const [growthData, setGrowthData] = useState([]);
  const [finalValue, setFinalValue] = useState(0);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    axios
      .get("${API_BASE_URL}/api/transactions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        const data = res.data.filter(
          (t) => t.account && t.account.toLowerCase() === "checking"
        );
        let balance = 0;
        data.forEach((t) => {
          if (t.type === "income") balance += t.amount;
          else if (t.type === "expense") balance -= t.amount;
        });
        setCheckingBalance(balance);
      })
      .catch((err) => console.error("Failed to fetch transactions", err));
  }, []);

  const handleAddPurchase = () => {
    if (!newDesc || isNaN(parseFloat(newAmount))) return;
    setPurchases([...purchases, { desc: newDesc, amount: parseFloat(newAmount) }]);
    setNewDesc("");
    setNewAmount("");
  };

  const handleDeletePurchase = (index) => {
    setPurchases(purchases.filter((_, i) => i !== index));
  };

  const totalPlanned = purchases.reduce((sum, p) => sum + p.amount, 0);
  const updatedBalance = checkingBalance - totalPlanned;

  const pieData = [
    { name: "Remaining Balance", value: Math.max(updatedBalance, 0) },
    { name: "Planned Budget", value: totalPlanned },
  ];

  const pieColors = ["#34d399", "#f87171"];

  const calculateInvestmentGrowth = () => {
    const data = [];
    let total = parseFloat(initialInvestment);
    const monthlyRate = 0.07 / 12;
    for (let i = 1; i <= years * 12; i++) {
      total = total * (1 + monthlyRate) + parseFloat(monthlyContribution);
      if (i % 12 === 0) {
        data.push({ year: i / 12, value: total });
      }
    }
    setFinalValue(total.toFixed(2));
    setGrowthData(data);
  };

  const cardStyle = {
    background:
      "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03))",
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
        <Row className="mb-4">
          <Col md={6}>
            <Card style={cardStyle} className="glass-card text-light rounded-4 shadow mb-3 mb-md-0">
              <Card.Body>
                <Card.Title className="mb-3">Checking Account Budget</Card.Title>
                <p><strong>Current Balance:</strong> ${checkingBalance.toFixed(2)}</p>
                <p><strong>Planned Spending:</strong> ${totalPlanned.toFixed(2)}</p>
                <p><strong>Hypothetical Remaining:</strong> ${updatedBalance.toFixed(2)}</p>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
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
                <Card.Title className="mb-3">Potential Purchases</Card.Title>
                <Form className="mb-3 d-flex gap-2">
                  <Form.Control
                    placeholder="Description"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                  <Form.Control
                    type="number"
                    placeholder="$0.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                  />
                  <Button
                    variant="outline-light"
                    onClick={handleAddPurchase}
                    disabled={!newDesc || isNaN(parseFloat(newAmount))}
                  >
                    Add
                  </Button>
                </Form>
                <ul className="list-unstyled">
                  {purchases.map((p, i) => (
                    <li key={i} className="d-flex justify-content-between mb-2">
                      <span>{p.desc} - ${p.amount.toFixed(2)}</span>
                      <Button variant="danger" size="sm" onClick={() => handleDeletePurchase(i)}>×</Button>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {activeTab === "investments" && (
        <Row className="mb-4 justify-content-center">
          <Col md={8}>
            <Card className="glass-card text-light rounded-4 shadow" style={cardStyle}>
              <Card.Body>
                <Card.Title className="mb-3">S&P 500 Investment Calculator</Card.Title>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Initial Investment</Form.Label>
                    <Form.Control
                      type="number"
                      value={initialInvestment}
                      onChange={(e) => setInitialInvestment(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Monthly Contribution</Form.Label>
                    <Form.Control
                      type="number"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Years to Grow</Form.Label>
                    <Form.Control
                      type="number"
                      value={years}
                      onChange={(e) => setYears(e.target.value)}
                    />
                  </Form.Group>
                  <Button variant="outline-light" onClick={calculateInvestmentGrowth}>Calculate Growth</Button>
                </Form>

                {growthData.length > 0 && (
                  <>
                    <h5 className="mt-4">Projected Value: ${finalValue}</h5>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={growthData}>
                        <XAxis dataKey="year" stroke="#ccc" />
                        <YAxis stroke="#ccc" />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#4ade80" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}


