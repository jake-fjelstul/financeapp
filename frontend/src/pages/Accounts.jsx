import React from "react";
import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

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

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-center text-light">Accounts Overview</h1>
      <div className="d-flex flex-wrap justify-content-center gap-4">
        {accounts.map((acc, index) => (
          <Card
            key={index}
            bg="dark"
            text="light"
            style={{ width: "20rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            className="shadow"
          >
            <Card.Body className="d-flex flex-column justify-content-between">
              <div>
                <Card.Title>{acc.name}</Card.Title>
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
                <Button variant="outline-light" className="w-100">
                  View Details
                </Button>
              </Link>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
}

