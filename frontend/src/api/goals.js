import axios from '../axios';

export const getAllGoals = () => 
  axios.get('/api/goals');

export const addGoal = (goal) => 
  axios.post('/api/goals', goal);

export const updateGoal = (id, goal) => 
  axios.put(`/api/goals/${id}`, goal);

export const completeGoal = (id) => 
  axios.put(`/api/goals/${id}/complete`);

export const deleteGoal = (id) => 
  axios.delete(`/api/goals/${id}`);

