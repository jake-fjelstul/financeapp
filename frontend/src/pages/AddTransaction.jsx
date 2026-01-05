// src/pages/AddTransaction.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  InputGroup,
  Alert,
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
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryInputMode, setCategoryInputMode] = useState("select"); // "select" or "input"

  // Debug component mount
  useEffect(() => {
    console.log("=== AddTransaction component mounted ===");
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log("Success message state changed:", successMessage);
  }, [successMessage]);

  useEffect(() => {
    console.log("Error message state changed:", errorMessage);
  }, [errorMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category" && value === "__NEW__") {
      setCategoryInputMode("input");
      setFormData((data) => ({ ...data, [name]: "" }));
    } else {
      setFormData((data) => ({ ...data, [name]: value }));
    }
  };

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Fetch existing categories from transactions
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Extract unique categories from expenses
        const uniqueCategories = new Set();
        response.data.forEach((t) => {
          if (t.type === "expense" && t.category && t.category.trim()) {
            uniqueCategories.add(t.category.trim());
          }
        });
        setCategories(Array.from(uniqueCategories).sort());
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, [API_BASE_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("=== FORM SUBMITTED ===");
    console.log("Form data:", formData);
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    console.log("State cleared, loading set to true");

    try {
      console.log("Token being sent:", localStorage.getItem("token"));
      console.log("API URL:", `${API_BASE_URL}/api/transactions`);
      const response = await axios.post(
        `${API_BASE_URL}/api/transactions`,
        {
          ...formData,
          title: formData.title.trim(),
          category: formData.category.trim(),
          notes: formData.notes.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Backend response:", response.data);

      // Show success message first
      setSuccessMessage("Transaction successful! Your transaction has been added.");
      console.log("Success message set");
      
      // Reset the form
      setFormData({
        title: "",
        amount: "",
        type: "expense",
        category: "",
        account: "",
        date: "",
        notes: "",
      });

      // Scroll to show the alert after a brief delay to ensure state is updated
      setTimeout(() => {
        const alertElement = document.querySelector('.alert');
        if (alertElement) {
          alertElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error("Error submitting transaction:", error);
      
      let errorMsg = "Failed to submit transaction. Please try again.";
      if (error.response) {
        if (error.response.status === 401) {
          errorMsg = "Authentication failed. Please sign in again.";
        } else if (error.response.status === 400) {
          errorMsg = error.response.data?.error || "Invalid transaction data. Please check your inputs.";
        } else {
          errorMsg = error.response.data?.error || `Error: ${error.response.status}. Please try again.`;
        }
      } else if (error.request) {
        errorMsg = "Cannot connect to server. Please check if the backend is running.";
      }
      
      setErrorMessage(errorMsg);
      console.log("Error message set:", errorMsg);
      
      // Scroll to show the alert after a brief delay
      setTimeout(() => {
        const alertElement = document.querySelector('.alert');
        if (alertElement) {
          alertElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
      
      // Clear error message after 8 seconds
      setTimeout(() => {
        setErrorMessage(null);
      }, 8000);
    } finally {
      setLoading(false);
    }
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

  return (
    <Container className="d-flex flex-column align-items-center" style={{ minHeight: 'calc(100vh - 80px)', paddingTop: '1rem', paddingBottom: '2rem' }}>
      {/* Alerts at the top */}
      <div className="w-100" style={{ maxWidth: "600px", marginBottom: '1rem' }}>
        {successMessage && (
          <Alert 
            variant="success" 
            dismissible 
            onClose={() => {
              console.log("Closing success alert");
              setSuccessMessage(null);
            }} 
            className="mb-3"
            style={{ 
              display: 'block',
              opacity: 1,
              visibility: 'visible',
              position: 'relative',
              zIndex: 1000
            }}
          >
            <Alert.Heading>✅ Success!</Alert.Heading>
            <div>{successMessage}</div>
          </Alert>
        )}
        
        {errorMessage && (
          <Alert 
            variant="danger" 
            dismissible 
            onClose={() => {
              console.log("Closing error alert");
              setErrorMessage(null);
            }} 
            className="mb-3"
            style={{ 
              display: 'block',
              opacity: 1,
              visibility: 'visible',
              position: 'relative',
              zIndex: 1000
            }}
          >
            <Alert.Heading>❌ Error</Alert.Heading>
            <div>{errorMessage}</div>
          </Alert>
        )}
      </div>

      <div className="d-flex justify-content-center w-100">
      <Card
        style={cardStyle}
        className="glass-card text-light shadow-lg p-4"
      >
        <Card.Body>
          <Card.Title className="mb-4 text-center fs-3">
            Add New Transaction
          </Card.Title>
          
          <Form onSubmit={(e) => {
            console.log("Form onSubmit triggered");
            console.log("Form valid:", e.currentTarget.checkValidity());
            if (!e.currentTarget.checkValidity()) {
              console.log("Form validation failed");
              e.currentTarget.reportValidity();
              return;
            }
            handleSubmit(e);
          }} noValidate>
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
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="transfer">Transfer</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="category">
              <Form.Label>Category</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                  onFocus={(e) => {
                    if (e.target.value === "") {
                      setCategoryInputMode("input");
                    }
                  }}
                >
                  <option value="">Select or type new category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                  <option value="__NEW__">+ Add New Category</option>
                </Form.Select>
                {categoryInputMode === "input" && (
                  <Form.Control
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Enter new category"
                    autoFocus
                    onBlur={() => {
                      if (formData.category === "") {
                        setCategoryInputMode("select");
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                )}
              </div>
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
              <Button 
                variant="outline-light" 
                type="submit" 
                size="lg" 
                className="w-100 rounded-pill"
                disabled={loading}
                onClick={(e) => {
                  console.log("Button clicked!");
                  // Don't prevent default here, let form handle it
                }}
              >
                {loading ? "Submitting..." : "Submit Transaction"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      </div>
    </Container>
  );
}