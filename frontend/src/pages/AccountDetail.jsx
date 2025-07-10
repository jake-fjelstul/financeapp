// src/pages/AccountDetail.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, Tab, Card } from "react-bootstrap";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Table from "react-bootstrap/Table";

const mockAccounts = {
  "Checking Account": {
    balance: 4800,
    monthlyTransactions: {
      January: {
        spent: 1200,
        saved: 600,
        transactions: [
          { date: "Jan 3", description: "Groceries", amount: 150 },
          { date: "Jan 7", description: "Electric Bill", amount: 90 },
          { date: "Jan 15", description: "Dining Out", amount: 60 },
        ],
      },
      February: {
        spent: 1000,
        saved: 700,
        transactions: [
          { date: "Feb 5", description: "Rent", amount: 900 },
          { date: "Feb 10", description: "Subscription", amount: 30 },
        ],
      },
    },
  },
  "Savings Account": {
    balance: 8700,
    monthlyTransactions: {
      January: {
        spent: 400,
        saved: 400,
        transactions: [
          { date: "Jan 12", description: "Transfer to Checking", amount: 200 },
        ],
      },
      February: {
        spent: 200,
        saved: 600,
        transactions: [],
      },
    },
  },
  "Investing Account": {
    balance: 12500,
    monthlyTransactions: {
      January: {
        spent: 0,
        saved: 1000,
        transactions: [
          { date: "Jan 20", description: "ETF Purchase", amount: 1000 },
        ],
      },
      February: {
        spent: 0,
        saved: 1200,
        transactions: [],
      },
    },
  },
};
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

export default function AccountDetail() {
  const { accountName } = useParams();
  const decodedName = decodeURIComponent(accountName);
  const account = mockAccounts[decodedName];

  const [activeTab, setActiveTab] = useState(Object.keys(account?.monthlyTransactions || {})[0]);

  if (!account) {
    return <div className="text-center text-light mt-5">Account not found.</div>;
  }

  const colors = ["#f87171", "#4ade80"];

  return (
    <div className="container py-4 text-light">
      <h1 className="mb-4 text-center">{decodedName}</h1>

      <Tabs
        id="account-tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="glass-card mb-4 justify-content-center p-2 rounded-4"
        variant="pills"
        style={cardStyle}
        >
        {Object.entries(account.monthlyTransactions).map(
            ([month, { spent, saved, transactions }]) => (
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
                    className="glass-card rounded-4 shadow mb-3 mb-md-0"
                  >
                    <Card.Body className="d-flex flex-column justify-content-start">
                      <Card.Title className="fs-5 mb-3">{month} Summary</Card.Title>
                        <ResponsiveContainer width="100%" height={250}>
                        <div className="fs-4">
                            <p>
                            <strong>Balance:</strong> ${account.balance}
                            </p>
                            <p>
                            <strong>Spent:</strong> ${spent}
                            </p>
                            <p>
                            <strong>Saved:</strong> ${saved}
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
                              { name: "Spent", value: spent },
                              { name: "Saved", value: saved },
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
                  <Table striped bordered hover variant="dark" responsive className="mt-3 rounded-4">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length > 0 ? (
                        transactions.map((t, i) => (
                          <tr key={i}>
                            <td>{t.date}</td>
                            <td>{t.description}</td>
                            <td>${t.amount}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center text-muted">
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




