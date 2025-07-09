// src/pages/AccountDetail.jsx
import React from "react";
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

export default function AccountDetail() {
  const { accountName } = useParams();
  const decodedName = decodeURIComponent(accountName);
  const account = mockAccounts[decodedName];

  if (!account) {
    return <div className="text-center text-light mt-5">Account not found.</div>;
  }

  const colors = ["#f87171", "#4ade80"];

  return (
    <div className="container py-4 text-light">
      <h1 className="mb-4 text-center">{decodedName}</h1>

      <Tabs
        defaultActiveKey={Object.keys(account.monthlyTransactions)[0]}
        className="mb-4"
        variant="pills"
        justify
        style={{
          backgroundColor: "#1f2937",
          borderRadius: "0.5rem",
          padding: "0.5rem",
        }}
      >
        {Object.entries(account.monthlyTransactions).map(
          ([month, { spent, saved, transactions }]) => (
            <Tab
              eventKey={month}
              title={
                <span className="text-light" style={{ fontWeight: "bold" }}>
                  {month}
                </span>
              }
              key={month}
            >
              <div className="row mb-4">
                <div className="col-md-6">
                  <Card bg="dark" text="light" className="shadow">
                    <Card.Body>
                      <Card.Title>{month} Summary</Card.Title>
                      <Card.Text>
                        Balance: <strong>${account.balance}</strong>
                      </Card.Text>
                      <Card.Text>Spent: ${spent}</Card.Text>
                      <Card.Text>Saved: ${saved}</Card.Text>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-6">
                  <Card bg="dark" text="light" className="shadow">
                    <Card.Body>
                      <Card.Title>Spending Breakdown</Card.Title>
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

              <Card bg="dark" text="light" className="shadow">
                <Card.Body>
                  <Card.Title>{month} Transactions</Card.Title>
                  <Table striped bordered hover variant="dark" responsive className="mt-3">
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
