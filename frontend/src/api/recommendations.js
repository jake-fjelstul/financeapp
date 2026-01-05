import axios from '../axios';

export const getRecommendations = (page = 0, size = 12) => 
  axios.get(`/api/recommendations?page=${page}&size=${size}`);

