import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function AppNavbar() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-none border-0">
      <Container>
        <Navbar.Brand as={Link} to="/">💰 FinanceApp</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/accounts">Accounts</Nav.Link>
            <Nav.Link as={Link} to="/add">Add Transaction</Nav.Link>
            <Nav.Link as={Link} to="/planning">Planning</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
