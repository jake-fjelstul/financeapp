import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import AddTransaction from "./pages/AddTransaction";
import AccountDetail from "./pages/AccountDetail";
import Planning from "./pages/Planning";
import NavigationBar from "./components/Navbar";

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <NavigationBar />
      <Routes>
        {!user ? (
          <>
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/accounts/:accountName" element={<AccountDetail />} />
            <Route path="/add" element={<AddTransaction />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;