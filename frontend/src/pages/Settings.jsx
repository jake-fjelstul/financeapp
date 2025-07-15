// src/pages/Settings.jsx
import React, { useState, useRef } from "react";
import axios from "axios";
import { Card, Button, Container, Form } from "react-bootstrap";

export default function Settings() {
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleExport = async () => {
    try {
        const response = await post(`${API_BASE_URL}/api/transactions`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        const data = await response.json();

        if (!data.length) {
        alert("No transactions to export.");
        return;
        }

        const headers = Object.keys(data[0]);
        const csvRows = [
        headers.join(","), // header row
        ...data.map(row =>
            headers.map(field => JSON.stringify(row[field] ?? "")).join(",")
        ),
        ];

        const csvData = new Blob([csvRows.join("\n")], { type: "text/csv" });
        const url = window.URL.createObjectURL(csvData);
        const a = document.createElement("a");
        a.href = url;
        a.download = "transactions.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        alert("Export failed");
        console.error(error);
    }
    };

    const handleImport = async () => {
        if (!selectedFile) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            await axios.post(`${API_BASE_URL}/api/transactions/import`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            alert("Import successful!");
        } catch (err) {
            console.error("Import failed:", err);
            alert("Failed to import data");
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
    padding: "2rem",
  };

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card style={cardStyle} className="glass-card text-light shadow-lg w-100" >
        <Card.Body>
          <Card.Title className="mb-4 text-center fs-3">Settings</Card.Title>

          <div className="mb-4 text-center">
            <Button variant="outline-light" onClick={handleExport} className="rounded-pill">
              Export Transactions
            </Button>
          </div>

          <Form onSubmit={(e) => { e.preventDefault(); handleImport(); }} className="text-center">
            <Form.Group controlId="importFile" className="mb-3">
                <Form.Label>Import CSV or JSON File</Form.Label>
                <Form.Control
                    type="file"
                    accept=".csv,.json"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                />
            </Form.Group>
            <Button variant="outline-light" type="submit" className="rounded-pill">
              Import Transactions
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
