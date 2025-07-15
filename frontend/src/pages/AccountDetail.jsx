import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Tabs, Tab, Card } from "react-bootstrap";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Table from "react-bootstrap/Table";

export default function AccountDetail() {
  const { accountName } = useParams();
  const decodedName = decodeURIComponent(accountName);

  const [groupedTransactions, setGroupedTransactions] = useState({});
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState(null);

  const [selectedYear, setSelectedYear] = useState("All");
  const [allYears, setAllYears] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${API_BASE_URL}/api/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("Fetched data:", res.data);
        const filtered = res.data.filter(
          (t) =>
            t.account &&
            t.account.toLowerCase() === decodedName.toLowerCase()
        );

        const grouped = {};
        const yearSet = new Set();
        let total = 0;

        filtered.forEach((t) => {
          console.log("Transaction:", t);
          const dateObj = new Date(t.date);
          const year = dateObj.getFullYear();
          const month = dateObj.toLocaleString("default", { month: "long" });
          yearSet.add(year);

          const key = `${month} ${year}`;
          if (!grouped[key]) {
            grouped[key] = { spent: 0, saved: 0, transactions: [] };
          }

          grouped[key].transactions.push({
            id: t.id,
            date: dateObj.toLocaleDateString(),
            description: t.title,
            amount: t.amount,
            type: t.type,
          });

          if (t.type === "expense") grouped[key].spent += t.amount;
          else if (t.type === "income") grouped[key].saved += t.amount;

          if (t.type === "income") total += t.amount;
          else if (t.type === "expense") total -= t.amount;
        });
        
        setAllYears(["All", ...Array.from(yearSet).sort((a, b) => b - a)]);
        setGroupedTransactions(grouped);
        setBalance(total);
        setActiveTab(Object.keys(grouped)[0]);
      })
      .catch((err) => console.error(err));
  }, [decodedName]);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;

    axios
      .delete(`/api/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(() => {
        // Re-fetch or filter out the deleted transaction from state
        setGroupedTransactions((prev) => {
          const updated = {};

          for (const [month, group] of Object.entries(prev)) {
            const filtered = group.transactions.filter(t => t.id !== id);
            if (filtered.length > 0) {
              const spent = filtered
                .filter(t => t.type === "expense")
                .reduce((sum, t) => sum + t.amount, 0);
              const saved = filtered
                .filter(t => t.type === "income")
                .reduce((sum, t) => sum + t.amount, 0);
              updated[month] = {
                ...group,
                transactions: filtered,
                spent,
                saved
              };
            }
          }

          return updated;
        });
      })
      .catch((err) => console.error("Delete failed:", err));
  };

  const colors = ["#f87171", "#4ade80"];

  if (Object.keys(groupedTransactions).length === 0) {
    return (
      <div className="text-center text-light mt-5">
        No transactions found for <strong>{decodedName}</strong>.
      </div>
    );
  }

  return (
    <div className="container py-4 text-light rounded-pill">
      <h1 className="mb-4 text-center">{decodedName}</h1>

      <div className="d-flex justify-content-center mb-4 rounded-pill">
        <select
          className="form-select w-auto rounded-pill"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {allYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <Tabs
        id="account-tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="glass-card mb-4 justify-content-center p-2 rounded-4"
        variant="pills"
        style={cardStyle}
      >
        {Object.entries(groupedTransactions)
          .filter(([monthYear]) =>
            selectedYear === "All" || monthYear.endsWith(selectedYear)
          )
          .map(([month, { spent, saved, transactions }]) => (
            <Tab
              eventKey={month}
              title={month}
              key={month}
              tabClassName={
                activeTab === month
                  ? "bg-white text-dark fw-bold rounded-pill px-4 py-2"
                  : "text-light fw-semibold rounded-pill px-4 py-2"
              }
            >
              <div className="row mb-4">
                <div className="col-md-6">
                  <Card
                    style={cardStyle}
                    text="light"
                    className="glass-card rounded-4 shadow mb-4 mb-md-0"
                  >
                    <Card.Body className="d-flex flex-column justify-content-start">
                      <Card.Title className="fs-5 mb-3">{month} Summary</Card.Title>
                        <ResponsiveContainer width="100%" height={250}>
                          <div className="fs-4">
                            <p>
                              <strong>Balance:</strong> ${balance.toFixed(2)}
                            </p>
                            <p>
                              <strong>Spent:</strong> ${spent.toFixed(2)}
                            </p>
                            <p>
                              <strong>Saved:</strong> ${saved.toFixed(2)}
                            </p>
                          </div>
                        </ResponsiveContainer>
                    </Card.Body>
                  </Card>
                </div>

                <div className="col-md-6">
                  <Card
                    style={cardStyle}
                    text="light"
                    className="glass-card rounded-4 shadow h-100"
                  >
                    <Card.Body>
                      <Card.Title className="fs-5 mb-3">Spending Breakdown</Card.Title>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Spent", value: parseFloat(spent.toFixed(2)) },
                              { name: "Saved", value: parseFloat(saved.toFixed(2)) },
                            ]}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                          >
                            {[spent, saved].map((_, i) => (
                              <Cell key={i} fill={colors[i]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card.Body>
                  </Card>
                </div>
              </div>

              <Card
                style={cardStyle}
                text="light"
                className="glass-card rounded-4 shadow"
              >
                <Card.Body>
                  <Card.Title className="fs-5">{month} Transactions</Card.Title>
                  <Table
                    striped
                    bordered
                    hover
                    variant="dark"
                    responsive
                    className="mt-3 rounded-4"
                  >
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length > 0 ? (
                        transactions.map((t, i) => (
                          <tr key={i}>
                            <td>{t.date}</td>
                            <td>{t.description}</td>
                            <td style={{ color: t.type === "expense" ? "#f87171" : "#4ade80" }}>
                              {t.type === "expense" ? "-" : "+"}${t.amount}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-danger rounded-pill"
                                onClick={() => handleDelete(t.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            No transactions this month.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Tab>
          )
        )}
      </Tabs>
    </div>
  );
}