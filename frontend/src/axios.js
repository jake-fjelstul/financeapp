// src/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "https://finance-backend-l974.onrender.com/", // "" works for same domain
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;