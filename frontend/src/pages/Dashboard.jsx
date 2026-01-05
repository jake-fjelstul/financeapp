import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
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
  ReferenceLine,
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
  const [budgetData, setBudgetData] = useState(null);
  const currentYear = new Date().getFullYear();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_BASE_URL}/api/transactions`, {
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

  // Load and calculate current month budget
  useEffect(() => {
    const calculateCurrentMonthBudget = () => {
      const savedBudgets = localStorage.getItem("budgets");
      if (!savedBudgets) {
        setBudgetData(null);
        return;
      }

      const budgets = JSON.parse(savedBudgets);
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const monthBudget = budgets[currentMonth];

      if (!monthBudget) {
        setBudgetData(null);
        return;
      }

      // Get all unique categories from transactions
      const categories = new Set();
      transactions.forEach((t) => {
        if (t.type === "expense" && t.category && t.category.trim()) {
          categories.add(t.category.trim());
        }
      });

      // Get categories from budget
      const budgetCategories = monthBudget.categories ? Object.keys(monthBudget.categories) : [];
      const allCategories = Array.from(new Set([...budgetCategories, ...Array.from(categories)])).sort();

      // Calculate expected spending per category
      const expectedIncome = monthBudget.expectedIncome || 0;
      const categoryDetails = allCategories.map((cat) => {
        const catData = monthBudget.categories?.[cat] || { value: 0, isPercentage: false };
        let expected = 0;
        if (catData.isPercentage) {
          expected = (expectedIncome * catData.value) / 100;
        } else {
          expected = catData.value || 0;
        }

        // Calculate actual spending for this category
        let actual = 0;
        transactions.forEach((t) => {
          const date = new Date(t.date);
          const transactionMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          if (transactionMonth === currentMonth && t.type === "expense" && t.category?.trim() === cat) {
            actual += parseFloat(t.amount || 0);
          }
        });

        return {
          name: cat,
          expected,
          actual,
          isPercentage: catData.isPercentage,
          value: catData.value,
        };
      });

      // Calculate totals
      const expectedSpent = categoryDetails.reduce((sum, cat) => sum + cat.expected, 0);
      const actualSpent = categoryDetails.reduce((sum, cat) => sum + cat.actual, 0);

      // Calculate actual income for current month
      let actualIncome = 0;
      transactions.forEach((t) => {
        const date = new Date(t.date);
        const transactionMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (transactionMonth === currentMonth && t.type === "income") {
          actualIncome += parseFloat(t.amount || 0);
        }
      });

      const expectedSaved = expectedIncome - expectedSpent;
      const actualSaved = actualIncome - actualSpent;

      setBudgetData({
        expectedIncome,
        expectedSpent,
        actualSpent,
        actualIncome,
        expectedSaved,
        actualSaved,
        monthName: now.toLocaleString("default", { month: "long", year: "numeric" }),
        categories: categoryDetails,
      });
    };

    calculateCurrentMonthBudget();
  }, [transactions]);

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
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  };

  const handleCardClick = () => {
    navigate("/accounts");
  };

  const handleCardHover = (e, isEntering) => {
    if (isEntering) {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 15px 50px rgba(0, 0, 0, 0.7)";
    } else {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.6)";
    }
  };

  return (
    <div className="container py-4" style={{ minHeight: "100vh" }}>
      <Container fluid style={{ minHeight: "100vh", color: "white", paddingTop: "2rem" }}>
        <h1 className="mb-5 text-center">Dashboard Overview</h1>

        {/* Totals */}
        <Row className="mb-4 align-items-center">
          <Col md={4} className="mb-4 mb-md-0 d-flex">
            <Card 
              style={cardStyle} 
              text="light" 
              className="glass-card rounded-4 text-center w-100"
              onClick={handleCardClick}
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
            >
              <Card.Body>
                <Card.Title>Total Expenses</Card.Title>
                <Card.Text className="fs-3 text-center">${totalExpenses.toFixed(2)}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4 mb-md-0 d-flex">
            <Card 
              style={{...cardStyle, minHeight: "140px"}} 
              text="light" 
              className="glass-card rounded-4 text-center w-100"
              onClick={handleCardClick}
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
            >
              <Card.Body style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "140px" }}>
                <Card.Title>Total Balance</Card.Title>
                <Card.Text className="fs-1 text-center">${totalBalance.toFixed(2)}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="d-flex">
            <Card 
              style={cardStyle} 
              text="light" 
              className="glass-card rounded-4 text-center w-100"
              onClick={handleCardClick}
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
            >
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
            <Card 
              style={cardStyle} 
              text="light" 
              className="glass-card rounded-4 mb-4 mb-md-0"
              onClick={handleCardClick}
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
            >
              <Card.Body>
                <Card.Title>Yearly Balance </Card.Title>
                {yearlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={yearlyData}>
                      <XAxis dataKey="name" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip content={<CustomTooltip />} />
                      {yearlyData.some(item => item.value < 0) && (
                        <ReferenceLine 
                          y={0} 
                          stroke="#ccc" 
                          strokeDasharray="5 5" 
                          strokeWidth={1.5}
                        />
                      )}
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
            <Card 
              style={cardStyle} 
              text="light" 
              className="glass-card rounded-4"
              onClick={handleCardClick}
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
            >
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

        <Row className="mt-4">
          <Col md={6} className="mb-4 mb-md-0">
            <Card 
              style={cardStyle} 
              text="light" 
              className="glass-card rounded-4"
              onClick={handleCardClick}
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
            >
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
          <Col md={6}>
            <Card 
              style={cardStyle} 
              text="light" 
              className="glass-card rounded-4"
              onClick={() => navigate("/planning")}
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
            >
              <Card.Body>
                <Card.Title>Current Monthly Budget</Card.Title>
                {budgetData ? (
                  <div style={{ height: "250px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <style>{`
                      .dashboard-budget-table {
                        --bs-table-bg: rgba(255, 255, 255, 0.05) !important;
                        --bs-table-color: white !important;
                        --bs-table-border-color: rgba(255, 255, 255, 0.2) !important;
                        --bs-table-hover-bg: rgba(255, 255, 255, 0.1) !important;
                        --bs-table-hover-color: white !important;
                        background-color: rgba(255, 255, 255, 0.05) !important;
                        color: white !important;
                      }
                      .dashboard-budget-table > :not(caption) > * > * {
                        background-color: transparent !important;
                        color: white !important;
                        border-color: rgba(255, 255, 255, 0.2) !important;
                      }
                      .dashboard-budget-table > tbody > tr {
                        background-color: transparent !important;
                        color: white !important;
                      }
                      .dashboard-budget-table > tbody > tr:hover {
                        background-color: rgba(255, 255, 255, 0.08) !important;
                        color: white !important;
                      }
                      .dashboard-budget-table > tbody > tr > td {
                        background-color: transparent !important;
                        color: white !important;
                        border-color: rgba(255, 255, 255, 0.2) !important;
                      }
                    `}</style>
                    <Table 
                      responsive 
                      bordered 
                      hover 
                      className="text-light dashboard-budget-table" 
                      style={{ 
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "1rem",
                        overflow: "hidden",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        color: "white",
                        border: "2px solid rgba(255, 255, 255, 0.2)",
                        fontSize: "1rem",
                        width: "100%"
                      }}
                    >
                      <tbody>
                        <tr style={{ 
                          background: "rgba(255, 255, 255, 0.05)", 
                          fontWeight: "bold",
                          borderTop: "2px solid rgba(255, 255, 255, 0.2)"
                        }}>
                          <td style={{ 
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderLeft: "none",
                            borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                            padding: "1rem"
                          }}>Expected Income</td>
                          <td style={{ 
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderRight: "none",
                            color: "#4ade80",
                            padding: "1rem"
                          }}>
                            ${budgetData.expectedIncome.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ 
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderLeft: "none",
                            borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                            padding: "1rem"
                          }}>Expected Spending</td>
                          <td style={{ 
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderRight: "none",
                            color: "#f87171",
                            padding: "1rem"
                          }}>
                            ${budgetData.expectedSpent.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ 
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderLeft: "none",
                            borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                            padding: "1rem"
                          }}>Actual Spending</td>
                          <td style={{ 
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderRight: "none",
                            color: "#f87171",
                            padding: "1rem"
                          }}>
                            ${budgetData.actualSpent.toFixed(2)}
                          </td>
                        </tr>
                        <tr 
                          style={{ 
                            background: "rgba(255, 255, 255, 0.1)", 
                            fontWeight: "bold",
                            borderTop: "2px solid rgba(255, 255, 255, 0.2)",
                            borderBottom: "none"
                          }}
                        >
                          <td style={{ 
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderLeft: "none",
                            borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                            borderBottom: "none",
                            padding: "1rem",
                            background: "rgba(255, 255, 255, 0.1) !important"
                          }}>Saved</td>
                          <td style={{ 
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderRight: "none",
                            borderBottom: "none",
                            color: budgetData.actualSaved >= 0 ? "#4ade80" : "#f87171",
                            padding: "1rem",
                            background: "rgba(255, 255, 255, 0.1) !important"
                          }}>
                            ${budgetData.actualSaved.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center" style={{ height: "250px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <p className="text-white-50 mb-3">No budget set for this month.</p>
                    <p className="text-white-50 small">Go to Planning to create a budget.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}