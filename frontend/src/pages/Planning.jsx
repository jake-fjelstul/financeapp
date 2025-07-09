// src/pages/Planning.jsx
import React, { useState } from "react";
import { Tabs, Tab, Card, Form, Button, Table } from "react-bootstrap";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function Planning() {
  const [activeTab, setActiveTab] = useState("budget");

  const pieData = [
    { name: "Needs", value: 1200 },
    { name: "Wants", value: 500 },
    { name: "Savings", value: 800 },
  ];
  const pieColors = ["#60a5fa", "#facc15", "#34d399"];

  return (
    <div className="container py-4 text-light">
      <h1 className="text-center mb-4">Financial Planning</h1>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4 custom-tabs bg-dark text-light border-bottom"
        variant="underline"
        justify
      >
        <Tab eventKey="budget" title={<span className="text-light">Budget</span>}>
          <Card bg="dark" text="light" className="mb-4 shadow w-100">
            <Card.Body>
              <Card.Title>Monthly Budget Summary</Card.Title>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>

          <Card bg="dark" text="light" className="shadow w-100">
            <Card.Body>
              <Card.Title>Track Spending Plan</Card.Title>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Expected Income</Form.Label>
                  <Form.Control type="number" placeholder="$4000" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Spending Goals</Form.Label>
                  <Form.Control as="textarea" rows={3} placeholder="E.g., Groceries - $500, Dining - $200..." />
                </Form.Group>
                <Button variant="outline-light">Save Plan</Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="investments" title={<span className="text-light">Investments</span>}>
          <Card bg="dark" text="light" className="shadow w-100">
            <Card.Body>
              <Card.Title>Investment Strategy</Card.Title>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Monthly Investment Amount</Form.Label>
                  <Form.Control type="number" placeholder="$500" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Target Goals</Form.Label>
                  <Form.Control as="textarea" rows={3} placeholder="E.g., $20,000 in Roth IRA by 2027..." />
                </Form.Group>
                <Button variant="outline-light">Save Strategy</Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}

