import React, { useEffect, useState } from 'react';
import {
  getAllTransactions,
  addTransaction,
  deleteTransaction,
} from '../api/transactions';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    account: '',
    description: '',
    amount: '',
    date: '',
    categories: [],
  });

  useEffect(() => {
    getAllTransactions()
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleAdd = () => {
    addTransaction(newTransaction)
      .then(() => {
        return getAllTransactions().then((res) => setTransactions(res.data));
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = (id) => {
    deleteTransaction(id)
      .then(() => {
        setTransactions(transactions.filter((t) => t.id !== id));
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="p-4">
      <h2 className="text-light mb-4">Transactions</h2>

      <Row xs={1} md={2} lg={3} className="g-4">
        {transactions.map((t) => (
          <Col key={t.id}>
            <Card bg="dark" text="light" className="glass-card">
              <Card.Body>
                <Card.Title>{t.description}</Card.Title>
                <Card.Text>
                  <strong>Account:</strong> {t.account} <br />
                  <strong>Amount:</strong> ${t.amount.toFixed(2)} <br />
                  <strong>Date:</strong> {t.date}
                </Card.Text>
                <Button variant="danger" onClick={() => handleDelete(t.id)}>Delete</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <hr className="text-light my-5" />

      <h4 className="text-light mb-3">Add New Transaction</h4>
      <Form className="glass-card p-4 text-light" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
        <Row className="mb-3">
          <Col><Form.Control placeholder="Account" value={newTransaction.account} onChange={(e) => setNewTransaction({ ...newTransaction, account: e.target.value })} /></Col>
          <Col><Form.Control placeholder="Description" value={newTransaction.description} onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })} /></Col>
        </Row>
        <Row className="mb-3">
          <Col><Form.Control type="number" placeholder="Amount" value={newTransaction.amount} onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })} /></Col>
          <Col><Form.Control type="date" value={newTransaction.date} onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })} /></Col>
        </Row>
        <Button variant="success" onClick={handleAdd}>Add Transaction</Button>
      </Form>
    </div>
  );
}

export default TransactionList;