import axios from 'axios';

const API_URL = 'http://localhost:8080/api/transactions';

export const getAllTransactions = () => axios.get(API_URL);

export const getTransactionsByAccount = (account) =>
  axios.get(`${API_URL}/account/${account}`);

export const addTransaction = (transaction) =>
  axios.post(API_URL, transaction);

export const deleteTransaction = (id) =>
  axios.delete(`${API_URL}/${id}`);