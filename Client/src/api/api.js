import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const fetchBooks = () => API.get('/books/getBooks');
export const addBook = (data) => API.post('/books/addBook', data);
export const deleteBook = (bookId) => API.delete(`/books/${bookId}`);
export const lendBook = (bookId, memberId) => API.post(`/books/${bookId}/lend`, { memberId });
export const returnBook = (bookId) => API.post(`/books/${bookId}/return`);
export const fetchMembers = () => API.get('/members/getMembers');
export const addMember = (data) => API.post('/members/addMember', data);
export const deleteMember = (memberId) => API.delete(`/members/${memberId}`);
export const fetchOverdue = () => API.get('/reports/overdue');
export const fetchTopBooks = () => API.get('/reports/top-books');

export const searchOpenLibrary = (query) => 
  axios.get(`https://openlibrary.org/search.json?q=${query}&limit=12&fields=key,title,author_name,subject,cover_i,first_publish_year`);