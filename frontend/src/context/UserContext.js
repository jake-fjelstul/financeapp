import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// Get base URL from environment or default to localhost
const getBaseURL = () => {
  return process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
};

// Create a separate axios instance for auth (without token interceptor)
const authAxios = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Log the configured base URL on module load
console.log("Auth API Base URL:", getBaseURL());

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const firstName = localStorage.getItem("firstName");
    console.log("Loading user from localStorage:", { email, firstName });
    if (token && email) {
      const userData = { 
        email,
        firstName: (firstName && firstName.trim()) ? firstName.trim() : ""
      };
      console.log("Setting user from localStorage:", userData);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
    console.log("Login attempt to:", baseURL);
    
    try {
      const response = await authAxios.post("/api/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });

      console.log("=== LOGIN RESPONSE DEBUG ===");
      console.log("Full response object:", response);
      console.log("Response.data:", response.data);
      console.log("Response.data type:", typeof response.data);
      console.log("Response.data keys:", Object.keys(response.data || {}));
      console.log("Response.data.firstName:", response.data?.firstName);
      console.log("Response.data.firstName type:", typeof response.data?.firstName);
      console.log("Response.data.firstName value:", response.data?.firstName);
      
      const responseData = response.data || {};
      const token = responseData.token;
      const userEmail = responseData.email;
      const firstName = responseData.firstName;

      console.log("Extracted - token:", token);
      console.log("Extracted - email:", userEmail);
      console.log("Extracted - firstName:", firstName);
      console.log("=== END LOGIN DEBUG ===");

      if (!token) {
        throw new Error("Token missing in login response");
      }

      // Store authentication data
      localStorage.setItem("token", token);
      localStorage.setItem("email", userEmail || email.trim());
      if (firstName && firstName.trim()) {
        localStorage.setItem("firstName", firstName.trim());
        console.log("Stored firstName in localStorage:", firstName.trim());
      } else {
        localStorage.removeItem("firstName");
        console.log("No firstName in response, removed from localStorage");
      }
      
      const userData = { 
        email: userEmail || email.trim(),
        firstName: (firstName && firstName.trim()) ? firstName.trim() : ""
      };
      console.log("Setting user state:", userData);
      setUser(userData);

      return response.data;
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        request: error.request ? "Request made but no response" : null,
      });

      // Handle different error types
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error || "Invalid email or password";
        throw new Error(errorMessage);
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        // Timeout error
        throw new Error(`Request timeout. Backend at ${baseURL} is not responding. Please check if it's running.`);
      } else if (error.request) {
        // Request made but no response received
        throw new Error(`Cannot connect to backend at ${baseURL}. Please check if the server is running.`);
      } else {
        // Something else happened
        throw new Error(error.message || "Login failed. Please try again.");
      }
    }
  };

  const register = async (email, password, firstName, lastName) => {
    const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
    console.log("Register attempt to:", baseURL);
    
    try {
      const response = await authAxios.post("/api/auth/register", {
        email: email.trim(),
        password: password.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      return response.data;
    } catch (error) {
      console.error("Register error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        request: error.request ? "Request made but no response" : null,
      });

      if (error.response) {
        const errorMessage = error.response.data?.error || "Registration failed";
        throw new Error(errorMessage);
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error(`Request timeout. Backend at ${baseURL} is not responding. Please check if it's running.`);
      } else if (error.request) {
        throw new Error(`Cannot connect to backend at ${baseURL}. Please check if the server is running.`);
      } else {
        throw new Error(error.message || "Registration failed. Please try again.");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("firstName");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);