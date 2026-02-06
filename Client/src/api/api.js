import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// ... existing backend exports (fetchBooks, addBook, etc.) ...
export const fetchBooks = () => API.get('/books/getBooks');
export const addBook = (data) => API.post('/books/addBook', data);
export const lendBook = (bookId, memberId) => API.post(`/books/${bookId}/lend`, { memberId });
export const returnBook = (bookId) => API.post(`/books/${bookId}/return`);
export const fetchMembers = () => API.get('/members/getMembers');
export const addMember = (data) => API.post('/members/addMember', data);
export const fetchOverdue = () => API.get('/reports/overdue');
export const fetchTopBooks = () => API.get('/reports/top-books');

// NEW: Udacity API Fetcher
export const fetchUdacityBooks = () => 
  axios.get("https://reactnd-books-api.udacity.com/books", {
    headers: { "Authorization": "whatever-you-want" }
  });