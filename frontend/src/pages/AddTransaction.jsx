// src/pages/AddTransaction.jsx
import React, { useState } from "react";
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";

export default function AddTransaction() {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "",
    account: "",
    date: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Transaction:", formData);
    // TODO: Send formData to backend
  };

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card bg="dark" text="light" className="p-4 shadow-lg" style={{ maxWidth: "600px", width: "100%" }}>
        <Card.Body>
          <Card.Title className="mb-4 text-center fs-3">Add New Transaction</Card.Title>
          <Form onSubmit={handleSubmit} className="space-y-3">
            <Form.Group className="mb-3" controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Grocery Shopping"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="amount">
                  <Form.Label>Amount</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="type">
                  <Form.Label>Type</Form.Label>
                  <Form.Select name="type" value={formData.type} onChange={handleChange}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="transfer">Transfer</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Food, Travel, Rent"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="account">
                <Form.Label>Account</Form.Label>
                <Form.Select
                    name="account"
                    value={formData.account}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select an account</option>
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                    <option value="Investing">Investing</option>
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="date">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="notes">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Optional notes..."
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="outline-light" type="submit" size="lg">
                Submit Transaction
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}