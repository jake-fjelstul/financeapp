// src/pages/Landing.jsx
import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center text-light vh-100 bg-dark">
      <h1 className="mb-3">Welcome to Finance Tracker</h1>
      <p className="mb-4 text-center" style={{ maxWidth: "500px" }}>
        Track your expenses, plan your future, and visualize your financial life with ease.
      </p>
      <Link to="/signin">
        <Button variant="primary">Sign In</Button>
      </Link>
    </div>
  );
}
