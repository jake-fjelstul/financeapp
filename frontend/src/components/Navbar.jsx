import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserContext";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const cardStyle = {
  background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03))",
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.6)",
  color: "#fff",
  padding: "1.5rem",
};

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Navbar
      expand="lg"
      className={`px-3 py-2 transition-all ${scrolled ? "shadow-sm" : ""}`}
      style={cardStyle}
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          className="fw-bold text-white"
          style={{ fontSize: "1.25rem" }}
        >
          💰 Finance Tracker
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="bg-light" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto align-items-center">
            {user && (
              <>
                <Nav.Link as={Link} to="/dashboard" className="nav-underline text-white px-3">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/accounts" className="nav-underline text-white px-3">
                  Accounts
                </Nav.Link>
                <Nav.Link as={Link} to="/add" className="nav-underline text-white px-3">
                  Transaction
                </Nav.Link>
                <Nav.Link as={Link} to="/planning" className="nav-underline text-white px-3">
                  Planning
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav className="align-items-center gap-2 mt-3 mt-lg-0">
            {!user ? (
              <>
                <Nav.Link as={Link} to="/signin" className="nav-underline text-white px-3 rounded-pill">
                  Sign In
                </Nav.Link>
                <Nav.Link as={Link} to="/signup" className="nav-underline text-white px-3 rounded-pill">
                  Sign Up
                </Nav.Link>
              </>
            ) : (
              <>
                <Navbar.Text className="me-3 text-white">
                  Signed in as: {user.username || user.email}
                </Navbar.Text>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                  className="px-3 rounded-pill"
                >
                  Log Out
                </Button>
                <Nav.Link as={Link} to="/settings" className="nav-underline text-white px-3">
                  ⚙️
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
