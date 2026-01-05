// src/pages/Planning.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Nav,
  Table,
  InputGroup,
} from "react-bootstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { getAllGoals, addGoal, completeGoal, deleteGoal } from "../api/goals";

export default function Planning() {
  const [activeTab, setActiveTab] = useState("budget");

  // Budget Tab State
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({}); // { "2024-01": { expectedIncome: 5000, categories: { "Food": { amount: 500, isPercentage: false, value: 500 }, ... } } }
  const [selectedMonth, setSelectedMonth] = useState("");
  const [categories, setCategories] = useState([]);

  // Investment Tab State
  const [initialInvestment, setInitialInvestment] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [years, setYears] = useState(0);
  const [growthData, setGrowthData] = useState([]);
  const [finalValue, setFinalValue] = useState(0);

  // Goals Tab State
  const [goalInput, setGoalInput] = useState("");
  const [goals, setGoals] = useState([]);
  const [loadingGoal, setLoadingGoal] = useState(false);
  const [loadingGoals, setLoadingGoals] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Load budgets from localStorage
  useEffect(() => {
    const savedBudgets = localStorage.getItem("budgets");
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  // Load goals from backend API
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoadingGoals(true);
        const response = await getAllGoals();
        // Transform backend data to frontend format
        const transformedGoals = response.data.map(goal => {
          const formatDate = (dateStr) => {
            if (!dateStr) return null;
            try {
              // Handle ISO date format (YYYY-MM-DD) from backend
              const date = new Date(dateStr);
              return isNaN(date.getTime()) ? null : date.toLocaleDateString();
            } catch (e) {
              return null;
            }
          };
          
          return {
            id: goal.id,
            text: goal.text,
            steps: typeof goal.steps === 'string' ? JSON.parse(goal.steps) : goal.steps,
            timeframe: goal.timeframe,
            createdAt: formatDate(goal.createdAt) || new Date().toLocaleDateString(),
            completed: goal.completed || false,
            completedAt: formatDate(goal.completedAt)
          };
        });
        setGoals(transformedGoals);
      } catch (err) {
        console.error("Failed to fetch goals:", err);
      } finally {
        setLoadingGoals(false);
      }
    };
    fetchGoals();
  }, []);

  // Save budgets to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(budgets).length > 0) {
      localStorage.setItem("budgets", JSON.stringify(budgets));
    }
  }, [budgets]);

  // Fetch transactions and extract categories
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/transactions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        const data = res.data;
        setTransactions(data);
        
        // Extract unique categories from expenses
        const uniqueCategories = new Set();
        data.forEach((t) => {
          if (t.type === "expense" && t.category && t.category.trim()) {
            uniqueCategories.add(t.category.trim());
          }
        });
        setCategories(Array.from(uniqueCategories).sort());
        
        // Set default selected month to current month
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        setSelectedMonth(currentMonth);
      })
      .catch((err) => console.error("Failed to fetch transactions", err));
  }, [API_BASE_URL]);

  // Get actual spending by category for a given month
  const getActualSpending = (month, category) => {
    return transactions
      .filter((t) => {
        if (t.type !== "expense") return false;
        const date = new Date(t.date);
        const transactionMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        return transactionMonth === month && t.category?.trim() === category;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  };

  // Get actual income for a given month
  const getActualIncome = (month) => {
    return transactions
      .filter((t) => {
        if (t.type !== "income") return false;
        const date = new Date(t.date);
        const transactionMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        return transactionMonth === month;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  };

  // Update expected income for a month
  const updateExpectedIncome = (month, value) => {
    setBudgets((prev) => ({
      ...prev,
      [month]: {
        ...prev[month],
        expectedIncome: parseFloat(value) || 0,
        categories: prev[month]?.categories || {},
      },
    }));
  };

  // Update expected spending for a category in a month
  const updateExpectedCategory = (month, category, value, isPercentage = false) => {
    setBudgets((prev) => ({
      ...prev,
      [month]: {
        ...prev[month],
        expectedIncome: prev[month]?.expectedIncome || 0,
        categories: {
          ...prev[month]?.categories,
          [category]: {
            value: parseFloat(value) || 0,
            isPercentage: isPercentage,
          },
        },
      },
    }));
  };

  // Get expected spending for a category in a month (calculated amount)
  const getExpectedCategory = (month, category) => {
    const categoryData = budgets[month]?.categories?.[category];
    if (!categoryData) return 0;
    
    if (categoryData.isPercentage) {
      const expectedIncome = getExpectedIncome(month);
      return (expectedIncome * categoryData.value) / 100;
    }
    return categoryData.value || 0;
  };

  // Get category budget data (for display/editing)
  const getCategoryBudgetData = (month, category) => {
    return budgets[month]?.categories?.[category] || { value: 0, isPercentage: false };
  };

  // Get expected income for a month
  const getExpectedIncome = (month) => {
    return budgets[month]?.expectedIncome || 0;
  };

  // Calculate totals for a month
  const getMonthTotals = (month) => {
    const expectedIncome = getExpectedIncome(month);
    const expectedSpent = categories.reduce(
      (sum, cat) => sum + getExpectedCategory(month, cat),
      0
    );
    const actualSpent = categories.reduce(
      (sum, cat) => sum + getActualSpending(month, cat),
      0
    );
    const actualIncome = getActualIncome(month);
    const expectedSaved = expectedIncome - expectedSpent;
    const actualSaved = actualIncome - actualSpent;

    return {
      expectedIncome,
      expectedSpent,
      actualSpent,
      actualIncome,
      expectedSaved,
      actualSaved,
    };
  };

  // Generate month options (current month and next 11 months)
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = date.toLocaleString("default", { month: "long", year: "numeric" });
      options.push({ value: monthKey, label: monthLabel });
    }
    return options;
  };

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

  // AI Goal Analysis System
  const analyzeGoal = (goalText) => {
    const goal = goalText.toLowerCase();
    let steps = [];
    let timeframe = "";

    // Travel-related goals
    if (goal.includes("travel") || goal.includes("trip") || goal.includes("vacation")) {
      timeframe = "6-12 months";
      steps = [
        { step: 1, action: "Set a specific travel budget", timeframe: "Week 1", description: "Determine how much you need for your trip. Research destination costs including flights, accommodation, food, and activities." },
        { step: 2, action: "Create a dedicated savings account", timeframe: "Week 2", description: "Open a separate savings account specifically for travel funds to avoid spending it on other expenses." },
        { step: 3, action: "Set up automatic monthly transfers", timeframe: "Week 2", description: "Automate savings by transferring 10-20% of your income to your travel fund each month." },
        { step: 4, action: "Cut unnecessary expenses", timeframe: "Month 1-3", description: "Review your spending and reduce non-essential expenses like dining out, subscriptions, or impulse purchases." },
        { step: 5, action: "Track progress monthly", timeframe: "Ongoing", description: "Review your travel fund monthly and adjust your savings rate if needed to meet your goal." },
        { step: 6, action: "Book early for better deals", timeframe: "Month 4-6", description: "Start booking flights and accommodations 2-3 months in advance to get better prices." }
      ];
    }
    // House/Home goals
    else if (goal.includes("house") || goal.includes("home") || goal.includes("mortgage") || goal.includes("down payment")) {
      timeframe = "2-5 years";
      steps = [
        { step: 1, action: "Calculate down payment needed", timeframe: "Week 1", description: "Determine how much you need for a down payment (typically 20% of home price). Research home prices in your desired area." },
        { step: 2, action: "Improve credit score", timeframe: "Month 1-6", description: "Pay bills on time, reduce debt, and check your credit report for errors. Aim for a score above 720." },
        { step: 3, action: "Create a dedicated savings plan", timeframe: "Month 1", description: "Set up automatic transfers to a high-yield savings account. Save at least 20% of your income." },
        { step: 4, action: "Reduce existing debt", timeframe: "Month 1-12", description: "Pay down credit cards and loans to improve your debt-to-income ratio, which lenders consider." },
        { step: 5, action: "Build emergency fund", timeframe: "Month 1-24", description: "Save 3-6 months of expenses in an emergency fund separate from your down payment." },
        { step: 6, action: "Get pre-approved", timeframe: "Month 18-24", description: "Meet with lenders to get pre-approved for a mortgage and understand your buying power." }
      ];
    }
    // Retirement goals
    else if (goal.includes("retire") || goal.includes("retirement") || goal.includes("pension")) {
      timeframe = "20-40 years";
      steps = [
        { step: 1, action: "Calculate retirement needs", timeframe: "Week 1", description: "Estimate how much you'll need in retirement (typically 70-80% of current income). Use retirement calculators." },
        { step: 2, action: "Maximize employer 401(k) match", timeframe: "Month 1", description: "Contribute at least enough to get your employer's full match - it's free money." },
        { step: 3, action: "Open and fund an IRA", timeframe: "Month 1-2", description: "Open a Roth or Traditional IRA and contribute the maximum allowed ($6,500-$7,000 annually)." },
        { step: 4, action: "Increase contributions annually", timeframe: "Yearly", description: "Increase your retirement contributions by 1% each year or whenever you get a raise." },
        { step: 5, action: "Diversify investments", timeframe: "Month 3-6", description: "Invest in a mix of stocks, bonds, and index funds. Consider target-date funds for simplicity." },
        { step: 6, action: "Review and rebalance quarterly", timeframe: "Quarterly", description: "Review your portfolio quarterly and rebalance to maintain your target asset allocation." }
      ];
    }
    // Emergency fund goals
    else if (goal.includes("emergency") || goal.includes("safety") || goal.includes("security")) {
      timeframe = "6-12 months";
      steps = [
        { step: 1, action: "Calculate 3-6 months expenses", timeframe: "Week 1", description: "Add up all essential monthly expenses (rent, food, utilities, insurance) and multiply by 3-6." },
        { step: 2, action: "Open high-yield savings account", timeframe: "Week 2", description: "Open a separate savings account with a competitive interest rate for your emergency fund." },
        { step: 3, action: "Set up automatic savings", timeframe: "Week 2", description: "Automate transfers of 10-15% of your income directly to your emergency fund." },
        { step: 4, action: "Cut non-essential spending", timeframe: "Month 1-3", description: "Identify and reduce unnecessary expenses. Cancel unused subscriptions, reduce dining out." },
        { step: 5, action: "Use windfalls wisely", timeframe: "Ongoing", description: "Put tax refunds, bonuses, or gifts directly into your emergency fund." },
        { step: 6, action: "Track progress monthly", timeframe: "Monthly", description: "Review your emergency fund balance monthly and celebrate milestones." }
      ];
    }
    // Debt payoff goals
    else if (goal.includes("debt") || goal.includes("pay off") || goal.includes("credit card") || goal.includes("loan")) {
      timeframe = "1-3 years";
      steps = [
        { step: 1, action: "List all debts", timeframe: "Week 1", description: "Create a list of all debts with balances, interest rates, and minimum payments." },
        { step: 2, action: "Choose payoff strategy", timeframe: "Week 1", description: "Decide between debt snowball (smallest first) or debt avalanche (highest interest first)." },
        { step: 3, action: "Create a strict budget", timeframe: "Week 2", description: "Create a budget that allocates extra money toward debt payments while covering essentials." },
        { step: 4, action: "Stop using credit cards", timeframe: "Immediate", description: "Stop using credit cards and switch to cash or debit to prevent adding more debt." },
        { step: 5, action: "Make extra payments", timeframe: "Monthly", description: "Pay more than the minimum on your target debt while making minimums on others." },
        { step: 6, action: "Consider balance transfer", timeframe: "Month 2-3", description: "If eligible, transfer high-interest debt to a 0% APR card to save on interest." }
      ];
    }
    // Investment/Wealth building goals
    else if (goal.includes("invest") || goal.includes("wealth") || goal.includes("million") || goal.includes("rich")) {
      timeframe = "10-30 years";
      steps = [
        { step: 1, action: "Build emergency fund first", timeframe: "Month 1-6", description: "Before investing, ensure you have 3-6 months of expenses saved for emergencies." },
        { step: 2, action: "Maximize retirement accounts", timeframe: "Month 1", description: "Contribute to 401(k) and IRA accounts to take advantage of tax benefits and compound growth." },
        { step: 3, action: "Open brokerage account", timeframe: "Month 2", description: "Open a low-cost brokerage account for additional investments beyond retirement accounts." },
        { step: 4, action: "Start with index funds", timeframe: "Month 2-3", description: "Invest in low-cost index funds or ETFs that track the market for diversification." },
        { step: 5, action: "Invest consistently", timeframe: "Monthly", description: "Set up automatic monthly investments. Time in the market beats timing the market." },
        { step: 6, action: "Increase investment rate", timeframe: "Annually", description: "Increase your investment contributions by 1-2% each year or when you get raises." }
      ];
    }
    // General/Savings goals
    else {
      timeframe = "6-18 months";
      steps = [
        { step: 1, action: "Define specific goal amount", timeframe: "Week 1", description: "Set a clear, specific dollar amount for your goal. Make it realistic and measurable." },
        { step: 2, action: "Break down into monthly savings", timeframe: "Week 1", description: "Divide your goal by the number of months to determine how much to save each month." },
        { step: 3, action: "Create dedicated savings account", timeframe: "Week 2", description: "Open a separate savings account specifically for this goal to track progress." },
        { step: 4, action: "Automate savings", timeframe: "Week 2", description: "Set up automatic transfers from checking to savings on payday to make saving effortless." },
        { step: 5, action: "Reduce expenses", timeframe: "Month 1-3", description: "Review your spending and cut unnecessary expenses. Redirect savings to your goal." },
        { step: 6, action: "Track and adjust", timeframe: "Monthly", description: "Review your progress monthly and adjust your savings rate if needed to stay on track." }
      ];
    }

    return { steps, timeframe };
  };

  const handleAddGoal = async () => {
    if (!goalInput.trim()) return;

    setLoadingGoal(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const analysis = analyzeGoal(goalInput);
      const newGoal = {
        text: goalInput.trim(),
        steps: JSON.stringify(analysis.steps), // Store as JSON string for backend
        timeframe: analysis.timeframe,
        completed: false
      };
      
      console.log("Sending goal to backend:", newGoal);
      const response = await addGoal(newGoal);
      console.log("Backend response:", response.data);
      const savedGoal = response.data;
      
      // Transform backend response to frontend format
      const formatDate = (dateStr) => {
        if (!dateStr) return null;
        try {
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? null : date.toLocaleDateString();
        } catch (e) {
          return null;
        }
      };
      
      const transformedGoal = {
        id: savedGoal.id,
        text: savedGoal.text,
        steps: typeof savedGoal.steps === 'string' ? JSON.parse(savedGoal.steps) : savedGoal.steps,
        timeframe: savedGoal.timeframe,
        createdAt: formatDate(savedGoal.createdAt) || new Date().toLocaleDateString(),
        completed: savedGoal.completed || false,
        completedAt: formatDate(savedGoal.completedAt)
      };
      
      setGoals([transformedGoal, ...goals]);
      setGoalInput("");
    } catch (err) {
      console.error("Failed to add goal:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to add goal. Please try again.";
      alert(errorMessage);
    } finally {
      setLoadingGoal(false);
    }
  };

  const handleCompleteGoal = async (goalId) => {
    try {
      const response = await completeGoal(goalId);
      const updatedGoal = response.data;
      
      // Transform backend response to frontend format
      const formatDate = (dateStr) => {
        if (!dateStr) return null;
        try {
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? null : date.toLocaleDateString();
        } catch (e) {
          return null;
        }
      };
      
      const transformedGoal = {
        id: updatedGoal.id,
        text: updatedGoal.text,
        steps: typeof updatedGoal.steps === 'string' ? JSON.parse(updatedGoal.steps) : updatedGoal.steps,
        timeframe: updatedGoal.timeframe,
        createdAt: formatDate(updatedGoal.createdAt) || new Date().toLocaleDateString(),
        completed: updatedGoal.completed || false,
        completedAt: formatDate(updatedGoal.completedAt)
      };
      
      setGoals(goals.map(goal => 
        goal.id === goalId ? transformedGoal : goal
      ));
    } catch (err) {
      console.error("Failed to complete goal:", err);
      alert("Failed to complete goal. Please try again.");
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) {
      return;
    }
    
    try {
      await deleteGoal(goalId);
      setGoals(goals.filter(goal => goal.id !== goalId));
    } catch (err) {
      console.error("Failed to delete goal:", err);
      alert("Failed to delete goal. Please try again.");
    }
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
            eventKey="goals"
            active={activeTab === "goals"}
            onClick={() => setActiveTab("goals")}
            className={`rounded-pill fw-bold ${
              activeTab === "goals" ? "bg-white text-dark" : "text-white"
            }`}
            style={{ padding: "0.5rem 1.25rem" }}
          >
            Goals
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
        <Row className="mb-4 justify-content-center">
          <Col lg={12}>
            <Card style={cardStyle} className="glass-card text-light rounded-4 shadow">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Card.Title className="mb-0">Monthly Budget</Card.Title>
                  <Form.Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{ maxWidth: "250px", background: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                  >
                    {getMonthOptions().map((option) => (
                      <option key={option.value} value={option.value} style={{ background: "#1a1a1a" }}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                {selectedMonth && (
                  <>
                    <style>{`
                      .budget-table {
                        --bs-table-bg: rgba(255, 255, 255, 0.05) !important;
                        --bs-table-color: white !important;
                        --bs-table-border-color: rgba(255, 255, 255, 0.2) !important;
                        --bs-table-hover-bg: rgba(255, 255, 255, 0.1) !important;
                        --bs-table-hover-color: white !important;
                        background-color: rgba(255, 255, 255, 0.05) !important;
                        color: white !important;
                      }
                      .budget-table > :not(caption) > * > * {
                        background-color: transparent !important;
                        color: white !important;
                        border-color: rgba(255, 255, 255, 0.2) !important;
                      }
                      .budget-table > thead > tr > th {
                        background-color: rgba(255, 255, 255, 0.1) !important;
                        color: white !important;
                        border-color: rgba(255, 255, 255, 0.2) !important;
                      }
                      .budget-table > tbody > tr {
                        background-color: transparent !important;
                        color: white !important;
                      }
                      .budget-table > tbody > tr:hover {
                        background-color: rgba(255, 255, 255, 0.08) !important;
                        color: white !important;
                      }
                      .budget-table > tbody > tr > td {
                        background-color: transparent !important;
                        color: white !important;
                        border-color: rgba(255, 255, 255, 0.2) !important;
                      }
                      .budget-table > tbody > tr.totals-row > td,
                      .budget-table > tbody > tr.saved-row > td {
                        background-color: rgba(255, 255, 255, 0.1) !important;
                      }
                      .budget-table > tbody > tr.totals-row,
                      .budget-table > tbody > tr.saved-row {
                        background-color: rgba(255, 255, 255, 0.1) !important;
                      }
                      .budget-table input::placeholder {
                        color: rgba(255, 255, 255, 0.6) !important;
                        opacity: 1 !important;
                      }
                      .budget-table input::-webkit-input-placeholder {
                        color: rgba(255, 255, 255, 0.6) !important;
                        opacity: 1 !important;
                      }
                      .budget-table input::-moz-placeholder {
                        color: rgba(255, 255, 255, 0.6) !important;
                        opacity: 1 !important;
                      }
                      .budget-table input:-ms-input-placeholder {
                        color: rgba(255, 255, 255, 0.6) !important;
                        opacity: 1 !important;
                      }
                    `}</style>
                    <Table 
                      responsive 
                      bordered 
                      hover 
                      className="text-light budget-table" 
                      style={{ 
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "1rem",
                        overflow: "hidden",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        color: "white",
                        border: "2px solid rgba(255, 255, 255, 0.2)"
                      }}
                    >
                      <thead style={{ 
                        background: "rgba(255, 255, 255, 0.1)",
                        borderBottom: "2px solid rgba(255, 255, 255, 0.2)"
                      }}>
                        <tr>
                          <th style={{ 
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderTop: "none",
                            borderLeft: "none",
                            borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                            padding: "1rem",
                            fontWeight: "600"
                          }}>Category</th>
                          <th style={{ 
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderTop: "none",
                            borderLeft: "none",
                            borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                            padding: "1rem",
                            fontWeight: "600"
                          }}>Expected Spending</th>
                          <th style={{ 
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderTop: "none",
                            borderRight: "none",
                            padding: "1rem",
                            fontWeight: "600"
                          }}>Actual Spending</th>
                        </tr>
                      </thead>
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
                            borderLeft: "none",
                            borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                            padding: "1rem"
                          }}>
                            <InputGroup size="sm">
                              <InputGroup.Text style={{ 
                                background: "rgba(255, 255, 255, 0.1)", 
                                borderColor: "rgba(255, 255, 255, 0.3)", 
                                color: "white",
                                borderRadius: "0.5rem 0 0 0.5rem"
                              }}>$</InputGroup.Text>
                              <Form.Control
                                type="number"
                                value={getExpectedIncome(selectedMonth) || ""}
                                onChange={(e) => updateExpectedIncome(selectedMonth, e.target.value)}
                                onFocus={(e) => {
                                  const currentValue = getExpectedIncome(selectedMonth);
                                  if (currentValue === 0 || currentValue === "0") {
                                    updateExpectedIncome(selectedMonth, "");
                                    e.target.select();
                                  }
                                }}
                                style={{ 
                                  background: "rgba(255, 255, 255, 0.1)", 
                                  borderColor: "rgba(255, 255, 255, 0.3)", 
                                  color: "white",
                                  borderRadius: "0 0.5rem 0.5rem 0"
                                }}
                              />
                            </InputGroup>
                          </td>
                          <td style={{ 
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderRight: "none",
                            color: "#4ade80",
                            padding: "1rem"
                          }}>
                            ${getActualIncome(selectedMonth).toFixed(2)}
                          </td>
                        </tr>
                        {categories.length > 0 ? (
                          categories.map((category) => {
                            const expected = getExpectedCategory(selectedMonth, category);
                            const actual = getActualSpending(selectedMonth, category);
                            const categoryData = getCategoryBudgetData(selectedMonth, category);
                            
                            return (
                              <tr key={category} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                                <td style={{ 
                                  borderColor: "rgba(255, 255, 255, 0.2)",
                                  borderLeft: "none",
                                  borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                                  padding: "1rem"
                                }}>{category}</td>
                                <td style={{ 
                                  borderColor: "rgba(255, 255, 255, 0.2)",
                                  borderLeft: "none",
                                  borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                                  padding: "1rem"
                                }}>
                                  <div className="d-flex gap-2 align-items-center">
                                    <InputGroup size="sm" style={{ flex: 1 }}>
                                      <InputGroup.Text style={{ 
                                        background: "rgba(255, 255, 255, 0.1)", 
                                        borderColor: "rgba(255, 255, 255, 0.3)", 
                                        color: "white",
                                        borderRadius: "0.5rem 0 0 0.5rem"
                                      }}>
                                        {categoryData.isPercentage ? "%" : "$"}
                                      </InputGroup.Text>
                                      <Form.Control
                                        type="number"
                                        value={categoryData.value || ""}
                                        onChange={(e) => updateExpectedCategory(selectedMonth, category, e.target.value, categoryData.isPercentage)}
                                        onFocus={(e) => {
                                          const currentValue = categoryData.value;
                                          if (currentValue === 0 || currentValue === "0") {
                                            updateExpectedCategory(selectedMonth, category, "", categoryData.isPercentage);
                                            e.target.select();
                                          }
                                        }}
                                        style={{ 
                                          background: "rgba(255, 255, 255, 0.1)", 
                                          borderColor: "rgba(255, 255, 255, 0.3)", 
                                          color: "white",
                                          borderRadius: "0 0.5rem 0.5rem 0"
                                        }}
                                        placeholder={categoryData.isPercentage ? "0" : "0.00"}
                                      />
                                    </InputGroup>
                                    <Button
                                      variant={categoryData.isPercentage ? "success" : "outline-light"}
                                      size="sm"
                                      onClick={() => {
                                        const currentValue = categoryData.value;
                                        const isPercentage = !categoryData.isPercentage;
                                        // Convert value when switching modes
                                        let newValue = currentValue;
                                        if (isPercentage && getExpectedIncome(selectedMonth) > 0) {
                                          // Convert dollar to percentage
                                          newValue = (currentValue / getExpectedIncome(selectedMonth)) * 100;
                                        } else if (!isPercentage && getExpectedIncome(selectedMonth) > 0) {
                                          // Convert percentage to dollar
                                          newValue = (currentValue / 100) * getExpectedIncome(selectedMonth);
                                        }
                                        updateExpectedCategory(selectedMonth, category, newValue, isPercentage);
                                      }}
                                      style={{ 
                                        minWidth: "60px",
                                        fontSize: "0.75rem",
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.5rem",
                                        border: "1px solid rgba(255, 255, 255, 0.3)"
                                      }}
                                    >
                                      {categoryData.isPercentage ? "%" : "$"}
                                    </Button>
                                    {categoryData.isPercentage && (
                                      <span className="text-white-50" style={{ fontSize: "0.85rem" }}>
                                        = ${expected.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ 
                                  borderColor: "rgba(255, 255, 255, 0.2)",
                                  borderRight: "none",
                                  color: "#f87171",
                                  padding: "1rem"
                                }}>
                                  ${actual.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={3} className="text-center text-white-50" style={{ 
                              borderColor: "rgba(255, 255, 255, 0.2)",
                              borderLeft: "none",
                              borderRight: "none",
                              padding: "2rem"
                            }}>
                              No categories found. Add expense transactions with categories to see them here.
                            </td>
                          </tr>
                        )}
                        <tr 
                          className="totals-row"
                          style={{ 
                            background: "rgba(255, 255, 255, 0.1)", 
                            fontWeight: "bold",
                            borderTop: "2px solid rgba(255, 255, 255, 0.2)",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.2)"
                          }}
                        >
                          <td style={{ 
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderLeft: "none",
                            borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                            padding: "1rem",
                            background: "rgba(255, 255, 255, 0.1) !important"
                          }}>Totals</td>
                          <td style={{ 
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderLeft: "none",
                            borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                            padding: "1rem",
                            background: "rgba(255, 255, 255, 0.1) !important"
                          }}>
                            ${getMonthTotals(selectedMonth).expectedSpent.toFixed(2)}
                          </td>
                          <td style={{ 
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderRight: "none",
                            padding: "1rem",
                            background: "rgba(255, 255, 255, 0.1) !important"
                          }}>
                            ${getMonthTotals(selectedMonth).actualSpent.toFixed(2)}
                          </td>
                        </tr>
                        <tr 
                          className="saved-row"
                          style={{ 
                            background: "rgba(255, 255, 255, 0.1)", 
                            fontWeight: "bold",
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
                            borderLeft: "none",
                            borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                            borderBottom: "none",
                            color: "#4ade80",
                            padding: "1rem",
                            background: "rgba(255, 255, 255, 0.1) !important"
                          }}>
                            ${getMonthTotals(selectedMonth).expectedSaved.toFixed(2)}
                          </td>
                          <td style={{ 
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderRight: "none",
                            borderBottom: "none",
                            color: getMonthTotals(selectedMonth).actualSaved >= 0 ? "#4ade80" : "#f87171",
                            padding: "1rem",
                            background: "rgba(255, 255, 255, 0.1) !important"
                          }}>
                            ${getMonthTotals(selectedMonth).actualSaved.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {activeTab === "goals" && (
        <Row className="mb-4 justify-content-center">
          <Col lg={10}>
            <Card style={cardStyle} className="glass-card text-light rounded-4 shadow mb-4">
              <Card.Body>
                <Card.Title className="mb-4" style={{ color: "white" }}>Financial Goals</Card.Title>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: "white" }}>What's your financial goal?</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      id="goal-input"
                      type="text"
                      placeholder="e.g., Traveling more, Buying a house, Saving for retirement"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !loadingGoal) {
                          handleAddGoal();
                        }
                      }}
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "white"
                      }}
                    />
                    <style>{`
                      #goal-input::placeholder {
                        color: rgba(255, 255, 255, 0.5) !important;
                        opacity: 1 !important;
                      }
                      #goal-input::-webkit-input-placeholder {
                        color: rgba(255, 255, 255, 0.5) !important;
                        opacity: 1 !important;
                      }
                      #goal-input::-moz-placeholder {
                        color: rgba(255, 255, 255, 0.5) !important;
                        opacity: 1 !important;
                      }
                      #goal-input:-ms-input-placeholder {
                        color: rgba(255, 255, 255, 0.5) !important;
                        opacity: 1 !important;
                      }
                    `}</style>
                    <Button
                      variant="outline-light"
                      onClick={handleAddGoal}
                      disabled={!goalInput.trim() || loadingGoal}
                      className="rounded-pill"
                    >
                      {loadingGoal ? "Analyzing..." : "Add Goal"}
                    </Button>
                  </div>
                  <Form.Text className="text-white-50">
                    Our AI will analyze your goal and provide personalized steps to achieve it.
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>

            {goals.length > 0 && (
              <div>
                {/* Active Goals */}
                {goals.filter(goal => !goal.completed).length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-3" style={{ color: "white" }}>Active Goals</h4>
                    {goals.filter(goal => !goal.completed).map((goal) => (
                      <Card
                        key={goal.id}
                        style={cardStyle}
                        className="glass-card text-light rounded-4 shadow mb-4"
                      >
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <Card.Title className="fs-4 mb-1" style={{ color: "white" }}>{goal.text}</Card.Title>
                              <div className="text-white-50 mb-2">
                                <strong style={{ color: "rgba(255, 255, 255, 0.8)" }}>Timeframe:</strong> {goal.timeframe}
                              </div>
                              <div className="text-white-50 small">
                                Created: {goal.createdAt}
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleCompleteGoal(goal.id)}
                                className="rounded-pill"
                              >
                                Complete
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="rounded-pill"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>

                          <div className="mt-4">
                            <h5 className="mb-3" style={{ color: "white" }}>Action Plan:</h5>
                            <div className="row g-3">
                              {goal.steps.map((step, index) => (
                                <Col key={index} md={6}>
                                  <Card
                                    style={{
                                      background: "rgba(255, 255, 255, 0.05)",
                                      border: "1px solid rgba(255, 255, 255, 0.15)",
                                      borderRadius: "1rem"
                                    }}
                                    className="h-100"
                                  >
                                    <Card.Body>
                                      <div className="d-flex align-items-start gap-3">
                                        <div
                                          style={{
                                            background: "rgba(255, 255, 255, 0.1)",
                                            borderRadius: "50%",
                                            width: "32px",
                                            height: "32px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            fontWeight: "bold",
                                            color: "white"
                                          }}
                                        >
                                          {step.step}
                                        </div>
                                        <div style={{ flex: 1, color: "white" }}>
                                          <h6 className="mb-2" style={{ color: "white" }}>{step.action}</h6>
                                          <div className="text-white-50 small mb-2">
                                            <strong style={{ color: "rgba(255, 255, 255, 0.8)" }}>When:</strong> {step.timeframe}
                                          </div>
                                          <p className="text-white-50 small mb-0">
                                            {step.description}
                                          </p>
                                        </div>
                                      </div>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              ))}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Completed Goals */}
                {goals.filter(goal => goal.completed).length > 0 && (
                  <div className="mt-5">
                    <h4 className="mb-3" style={{ color: "white" }}>Completed Goals</h4>
                    {goals.filter(goal => goal.completed).map((goal) => (
                      <Card
                        key={goal.id}
                        style={{
                          ...cardStyle,
                          opacity: 0.7,
                          border: "2px solid rgba(74, 222, 128, 0.3)"
                        }}
                        className="glass-card text-light rounded-4 shadow mb-4"
                      >
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <Card.Title className="fs-4 mb-0" style={{ color: "white", textDecoration: "line-through" }}>
                                  {goal.text}
                                </Card.Title>
                                <span 
                                  className="badge rounded-pill"
                                  style={{ 
                                    background: "rgba(74, 222, 128, 0.3)",
                                    color: "#4ade80",
                                    border: "1px solid #4ade80"
                                  }}
                                >
                                  ✓ Completed
                                </span>
                              </div>
                              <div className="text-white-50 mb-2">
                                <strong style={{ color: "rgba(255, 255, 255, 0.8)" }}>Timeframe:</strong> {goal.timeframe}
                              </div>
                              <div className="text-white-50 small">
                                Created: {goal.createdAt} | Completed: {goal.completedAt}
                              </div>
                            </div>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="rounded-pill"
                            >
                              Delete
                            </Button>
                          </div>

                          <div className="mt-4">
                            <h5 className="mb-3" style={{ color: "white" }}>Action Plan:</h5>
                            <div className="row g-3">
                              {goal.steps.map((step, index) => (
                                <Col key={index} md={6}>
                                  <Card
                                    style={{
                                      background: "rgba(255, 255, 255, 0.05)",
                                      border: "1px solid rgba(255, 255, 255, 0.15)",
                                      borderRadius: "1rem",
                                      opacity: 0.8
                                    }}
                                    className="h-100"
                                  >
                                    <Card.Body>
                                      <div className="d-flex align-items-start gap-3">
                                        <div
                                          style={{
                                            background: "rgba(74, 222, 128, 0.2)",
                                            borderRadius: "50%",
                                            width: "32px",
                                            height: "32px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            fontWeight: "bold",
                                            color: "#4ade80"
                                          }}
                                        >
                                          {step.step}
                                        </div>
                                        <div style={{ flex: 1, color: "white" }}>
                                          <h6 className="mb-2" style={{ color: "white" }}>{step.action}</h6>
                                          <div className="text-white-50 small mb-2">
                                            <strong style={{ color: "rgba(255, 255, 255, 0.8)" }}>When:</strong> {step.timeframe}
                                          </div>
                                          <p className="text-white-50 small mb-0">
                                            {step.description}
                                          </p>
                                        </div>
                                      </div>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              ))}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {loadingGoals ? (
              <Card style={cardStyle} className="glass-card text-light rounded-4 shadow">
                <Card.Body className="text-center py-5">
                  <p className="text-white-50 mb-0">
                    Loading goals...
                  </p>
                </Card.Body>
              </Card>
            ) : goals.length === 0 && (
              <Card style={cardStyle} className="glass-card text-light rounded-4 shadow">
                <Card.Body className="text-center py-5">
                  <p className="text-white-50 mb-0">
                    No goals yet. Add a financial goal above to get started!
                  </p>
                </Card.Body>
              </Card>
            )}
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


