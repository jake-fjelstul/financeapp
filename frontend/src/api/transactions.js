import axios from 'axios';

const API_URL = 'https://finance-backend-l974.onrender.com/api/transactions';

export const getAllTransactions = () => axios.get(API_URL);

export const getTransactionsByAccount = (account) =>
  axios.get(`${API_URL}/account/${account}`);

export const addTransaction = (transaction) =>
  axios.post(API_URL, transaction);

export const deleteTransaction = (id) =>
  axios.delete(`${API_URL}/${id}`);