// src/pages/Settings.jsx
import React, { useState, useRef } from "react";
import axios from "axios";
import { Card, Button, Container, Form, Table, Alert } from "react-bootstrap";

export default function Settings() {
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [exportMessage, setExportMessage] = useState(null);
  const [importMessage, setImportMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleExport = async () => {
    try {
      setLoading(true);
      setExportMessage(null);
      
      const response = await axios.get(`${API_BASE_URL}/api/transactions/export`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      const data = response.data;

      if (!data || data.length === 0) {
        setExportMessage({
          variant: "warning",
          title: "No Data to Export",
          message: "You don't have any transactions to export. Please add some transactions first.",
        });
        setLoading(false);
        return;
      }

      // Create CSV with proper formatting
      const headers = ['Date', 'Amount', 'Title', 'Category', 'Type', 'Account', 'Notes'];
      const csvRows = [
        headers.join(","),
        ...data.map(row => {
          return headers.map(header => {
            const fieldMap = {
              'Date': row.date || '',
              'Amount': row.amount || '',
              'Title': row.title || '',
              'Category': row.category || '',
              'Type': row.type || '',
              'Account': row.account || '',
              'Notes': row.notes || ''
            };
            const value = fieldMap[header] || '';
            // Escape quotes and wrap in quotes if contains comma or quote
            if (value.toString().includes(',') || value.toString().includes('"') || value.toString().includes('\n')) {
              return `"${value.toString().replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',');
        })
      ];

      const csvData = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(csvData);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setExportMessage({
        variant: "success",
        title: "Export Successful",
        message: `Successfully exported ${data.length} transaction(s) to CSV file.`,
      });
      
      setTimeout(() => setExportMessage(null), 5000);
    } catch (error) {
      console.error("Export error:", error);
      
      let errorMessage = "Failed to export transactions.";
      let errorDetails = "";
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = "Authentication failed.";
          errorDetails = "Your session may have expired. Please sign in again.";
        } else if (status === 403) {
          errorMessage = "Access denied.";
          errorDetails = "You don't have permission to export transactions.";
        } else if (status === 500) {
          errorMessage = "Server error.";
          errorDetails = "The server encountered an error. Please try again later.";
        } else {
          errorMessage = `Export failed (Status: ${status}).`;
          errorDetails = error.response.data?.error || error.response.data?.message || "Please check your connection and try again.";
        }
      } else if (error.request) {
        errorMessage = "Network error.";
        errorDetails = "Could not connect to the server. Please check your internet connection and ensure the backend is running.";
      } else {
        errorMessage = "Export failed.";
        errorDetails = error.message || "An unexpected error occurred.";
      }
      
      setExportMessage({
        variant: "danger",
        title: "Export Failed",
        message: errorMessage,
        details: errorDetails,
      });
      
      setTimeout(() => setExportMessage(null), 8000);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setImportMessage({
        variant: "warning",
        title: "No File Selected",
        message: "Please select a CSV or JSON file to import.",
      });
      setTimeout(() => setImportMessage(null), 5000);
      return;
    }

    // Validate file type
    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.json')) {
      setImportMessage({
        variant: "danger",
        title: "Invalid File Type",
        message: "Please select a CSV (.csv) or JSON (.json) file.",
        details: `Selected file: ${selectedFile.name}`,
      });
      setTimeout(() => setImportMessage(null), 8000);
      return;
    }

    setLoading(true);
    setImportMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/transactions/import`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Handle both string and object responses from backend
      const responseData = response.data;
      
      // Debug logging
      console.log("Import response:", responseData);
      console.log("Response type:", typeof responseData);
      
      // Check if response is a string (simple success message)
      if (typeof responseData === 'string') {
        if (responseData.toLowerCase().includes('success') || responseData.toLowerCase().includes('imported')) {
          setImportMessage({
            variant: "success",
            title: "Import Successful",
            message: responseData,
            details: "Transaction count not available from server response.",
          });
          // Clear file selection
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          // String response but not success
          setImportMessage({
            variant: "warning",
            title: "Import Notice",
            message: responseData,
          });
        }
      } else {
        // Response is an object with detailed information
        const importedCount = responseData?.imported;
        const message = responseData?.message || "Import successful!";
        const details = responseData?.details;
        const error = responseData?.error;

        console.log("Imported count:", importedCount, "Type:", typeof importedCount);

        // If there's an error field, it's a failure
        if (error) {
          setImportMessage({
            variant: "danger",
            title: "Import Failed",
            message: error,
            details: details || "Please check your file format and try again.",
          });
        } else if (importedCount !== undefined && importedCount !== null && importedCount === 0) {
          // Explicitly 0 transactions imported
          setImportMessage({
            variant: "warning",
            title: "No Transactions Imported",
            message: `0 transactions were imported. No valid transactions were found in the file.`,
            details: details || "Please check that your file contains valid data with the required columns (Amount, Type, Account).",
          });
        } else if (importedCount !== undefined && importedCount !== null && importedCount > 0) {
          // Success with valid count
          const count = Number(importedCount);
          const successMessage = `Successfully imported ${count} transaction${count !== 1 ? 's' : ''}!`;
          
          setImportMessage({
            variant: "success",
            title: "Import Successful",
            message: successMessage,
            details: details || `${count} transaction${count !== 1 ? 's' : ''} ${count === 1 ? 'was' : 'were'} added to your account.`,
          });
          // Clear file selection
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          // No count available but no error - treat as success
          setImportMessage({
            variant: "success",
            title: "Import Successful",
            message: message || "Transactions imported successfully.",
            details: details || "Transaction count not available, but import completed.",
          });
          // Clear file selection
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      }
      
      setTimeout(() => setImportMessage(null), 8000);
    } catch (err) {
      console.error("Import failed:", err);
      
      let errorMessage = "Failed to import transactions.";
      let errorDetails = "";
      
      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;
        
        if (status === 401) {
          errorMessage = "Authentication failed.";
          errorDetails = "Your session may have expired. Please sign in again.";
        } else if (status === 400) {
          errorMessage = errorData?.error || "Invalid file format.";
          errorDetails = errorData?.details || errorData?.message || "Please check your file format and ensure it matches the required structure.";
          
          if (errorData?.details && typeof errorData.details === 'string') {
            errorDetails = errorData.details;
          }
        } else if (status === 413) {
          errorMessage = "File too large.";
          errorDetails = "The file you're trying to import is too large. Please try a smaller file.";
        } else if (status === 500) {
          errorMessage = "Server error.";
          errorDetails = "The server encountered an error while processing your file. Please try again later.";
        } else {
          errorMessage = `Import failed (Status: ${status}).`;
          errorDetails = errorData?.error || errorData?.message || "Please check your file and try again.";
        }
      } else if (err.request) {
        errorMessage = "Network error.";
        errorDetails = "Could not connect to the server. Please check your internet connection and ensure the backend is running.";
      } else {
        errorMessage = "Import failed.";
        errorDetails = err.message || "An unexpected error occurred.";
      }
      
      setImportMessage({
        variant: "danger",
        title: "Import Failed",
        message: errorMessage,
        details: errorDetails,
      });
      
      setTimeout(() => setImportMessage(null), 10000);
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
    padding: "2rem",
  };

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card style={cardStyle} className="glass-card text-light shadow-lg w-100" >
        <Card.Body>
          <Card.Title className="mb-4 text-center fs-3">Settings</Card.Title>

          {/* Export Banner */}
          {exportMessage && (
            <Alert 
              variant={exportMessage.variant} 
              dismissible 
              onClose={() => setExportMessage(null)}
              className="mb-4"
            >
              <Alert.Heading>{exportMessage.title}</Alert.Heading>
              <div>{exportMessage.message}</div>
              {exportMessage.details && (
                <div className="mt-2" style={{ fontSize: "0.9em", opacity: 0.9 }}>
                  {exportMessage.details}
                </div>
              )}
            </Alert>
          )}

          <div className="mb-4 text-center">
            <Button 
              variant="outline-light" 
              onClick={handleExport} 
              className="rounded-pill"
              disabled={loading}
            >
              {loading ? "Exporting..." : "Export Transactions"}
            </Button>
          </div>

          {/* Import Banner */}
          {importMessage && (
            <Alert 
              variant={importMessage.variant} 
              dismissible 
              onClose={() => setImportMessage(null)}
              className="mb-4"
            >
              <Alert.Heading>{importMessage.title}</Alert.Heading>
              <div>{importMessage.message}</div>
              {importMessage.details && (
                <div className="mt-2" style={{ fontSize: "0.9em", opacity: 0.9, whiteSpace: "pre-line" }}>
                  {importMessage.details}
                </div>
              )}
            </Alert>
          )}

          <Form onSubmit={(e) => { e.preventDefault(); handleImport(); }} className="text-center">
            <Form.Group controlId="importFile" className="mb-3">
                <Form.Label>Import CSV or JSON File</Form.Label>
                <Form.Control
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    disabled={loading}
                />
                {selectedFile && (
                  <Form.Text className="text-muted d-block mt-2">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </Form.Text>
                )}
            </Form.Group>
            <Button 
              variant="outline-light" 
              type="submit" 
              className="rounded-pill"
              disabled={loading || !selectedFile}
            >
              {loading ? "Importing..." : "Import Transactions"}
            </Button>
          </Form>

          {/* CSV Format Guide */}
          <div className="mb-4 mt-4">
            <h5 className="mb-3">CSV Import Format Guide</h5>
            <Alert variant="info" className="mb-3">
              <strong>Note:</strong> Column order and capitalization do not matter. Your CSV must include the required columns below.
            </Alert>
            <Table striped bordered hover variant="dark" responsive className="mb-3">
              <thead>
                <tr>
                  <th>Column Name</th>
                  <th>Required</th>
                  <th>Description</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Amount</strong></td>
                  <td className="text-danger">✓ Required</td>
                  <td>Transaction amount (numeric)</td>
                  <td>150.50</td>
                </tr>
                <tr>
                  <td><strong>Type</strong></td>
                  <td className="text-danger">✓ Required</td>
                  <td>Transaction type: income, expense, or transfer</td>
                  <td>expense</td>
                </tr>
                <tr>
                  <td><strong>Account</strong></td>
                  <td className="text-danger">✓ Required</td>
                  <td>Account name</td>
                  <td>Checking</td>
                </tr>
                <tr>
                  <td><strong>Date</strong></td>
                  <td className="text-warning">Optional</td>
                  <td>Transaction date (M/d/yyyy format)</td>
                  <td>12/1/2025</td>
                </tr>
                <tr>
                  <td><strong>Title</strong> or <strong>Description</strong></td>
                  <td className="text-warning">Optional</td>
                  <td>Transaction description</td>
                  <td>Grocery Shopping</td>
                </tr>
                <tr>
                  <td><strong>Category</strong></td>
                  <td className="text-warning">Optional</td>
                  <td>Transaction category</td>
                  <td>Food</td>
                </tr>
                <tr>
                  <td><strong>Notes</strong> or <strong>Note</strong></td>
                  <td className="text-warning">Optional</td>
                  <td>Additional notes</td>
                  <td>Weekly groceries</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
