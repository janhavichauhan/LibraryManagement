import React, { useState, useEffect } from 'react';
import { Search, Plus, Book, Calendar, User } from 'lucide-react';
import * as API from '../api/api';

const Catalog = () => {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMember, setSelectedMember] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);

  // New Book Form State
  const [newBook, setNewBook] = useState({ title: '', author: '', tags: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [booksRes, membersRes] = await Promise.all([API.fetchBooks(), API.fetchMembers()]);
    setBooks(booksRes.data);
    setMembers(membersRes.data);
  };

  const handleLend = async () => {
    if (!selectedMember) return alert('Please select a member');
    try {
      await API.lendBook(selectedBook._id, selectedMember);
      alert('Book processed successfully!');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error lending book');
    }
  };

  const handleReturn = async (bookId) => {
    if(!window.confirm("Return this book?")) return;
    try {
      await API.returnBook(bookId);
      loadData();
    } catch (err) {
      alert('Error returning book');
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await API.addBook({ ...newBook, tags: newBook.tags.split(',').map(t => t.trim()) });
      setIsAddBookOpen(false);
      setNewBook({ title: '', author: '', tags: '' });
      loadData();
    } catch (err) {
      alert('Error adding book');
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-bold text-navy">Library Catalog</h2>
           <p className="text-textSub">Manage your collection and loans</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by title..." 
              className="pl-10 pr-4 py-2.5 w-64 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-primary outline-none"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAddBookOpen(true)}
            className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
          >
            <Plus size={18} /> Add Book
          </button>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <div key={book._id} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col h-full">
            {/* Mock Cover */}
            <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden group">
               <Book className="text-gray-300 w-12 h-12 group-hover:scale-110 transition-transform" />
               <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-lg ${
                 book.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
               }`}>
                 {book.status}
               </span>
            </div>

            <h3 className="font-bold text-navy text-lg leading-tight mb-1">{book.title}</h3>
            <p className="text-textSub text-sm mb-3">by {book.author}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {book.tags.map(tag => (
                <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase tracking-wide">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-50 flex gap-2">
              <button 
                onClick={() => { setSelectedBook(book); setIsModalOpen(true); }}
                className="flex-1 bg-navy text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
              >
                Lend
              </button>
              {book.status === 'BORROWED' && (
                <button 
                  onClick={() => handleReturn(book._id)}
                  className="flex-1 bg-white border border-gray-200 text-navy py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Return
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lend Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Lend "{selectedBook?.title}"</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Member</label>
            <select 
              className="w-full p-3 border rounded-xl mb-6 bg-gray-50 outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              <option value="">-- Choose Member --</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={handleLend} className="flex-1 py-2 bg-primary text-white font-medium rounded-xl hover:bg-blue-600">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {isAddBookOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add New Book</h3>
            <form onSubmit={handleAddBook} className="space-y-4">
              <input placeholder="Title" required className="w-full p-3 border rounded-xl bg-gray-50" onChange={e => setNewBook({...newBook, title: e.target.value})} />
              <input placeholder="Author" required className="w-full p-3 border rounded-xl bg-gray-50" onChange={e => setNewBook({...newBook, author: e.target.value})} />
              <input placeholder="Tags (comma separated)" className="w-full p-3 border rounded-xl bg-gray-50" onChange={e => setNewBook({...newBook, tags: e.target.value})} />
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsAddBookOpen(false)} className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-primary text-white font-medium rounded-xl hover:bg-blue-600">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;