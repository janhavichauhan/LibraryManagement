import React, { useState, useEffect } from 'react';
import { Search, Plus, Book, DownloadCloud, Loader, X, CheckCircle, Clock } from 'lucide-react';
import * as API from '../api/api';

const Catalog = () => {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMember, setSelectedMember] = useState('');
  
  // Modals
  const [isLendModalOpen, setIsLendModalOpen] = useState(false);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isPopulateOpen, setIsPopulateOpen] = useState(false);
  
  // External API (Udacity)
  const [importQuery, setImportQuery] = useState('');
  const [externalBooks, setExternalBooks] = useState([]);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set()); 

  const [newBook, setNewBook] = useState({ title: '', author: '', tags: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [booksRes, membersRes] = await Promise.all([API.fetchBooks(), API.fetchMembers()]);
      setBooks(booksRes.data);
      setMembers(membersRes.data);
    } catch (error) { console.error("Failed to load data", error); }
  };

  // --- Handlers ---

  const handleReturn = async (bookId) => {
    // Confirmation Dialog
    if(!window.confirm("Return this book early? It will be made available to the library immediately.")) return;
    
    try {
      const res = await API.returnBook(bookId);
      alert(res.data.message); 
      loadData(); 
    } catch (err) {
      alert('Error returning book');
    }
  };

  const handleLend = async () => {
    if (!selectedMember) return alert('Please select a member');
    try {
      const res = await API.lendBook(selectedBook._id, selectedMember);
      alert(res.data.message);
      setIsLendModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error lending book');
    }
  };
  
  // ... (Keep handleOpenImport, saveExternalBook, handleManualAdd from previous code) ...
  const handleOpenImport = async () => {
    setIsPopulateOpen(true); setIsLoadingExternal(true);
    try { const res = await API.fetchUdacityBooks(); setExternalBooks(res.data.books); } 
    catch (err) { alert("Failed to fetch"); } finally { setIsLoadingExternal(false); }
  };

  const saveExternalBook = async (item) => {
     try {
       await API.addBook({ title: item.title, author: item.authors ? item.authors.join(', ') : 'Unknown', tags: item.categories || [] });
       setAddedIds(prev => new Set(prev).add(item.id)); loadData();
     } catch (err) { alert(err.response?.data?.message); }
  }

  const handleManualAdd = async (e) => {
    e.preventDefault();
    try { await API.addBook({...newBook, tags: newBook.tags.split(',')}); setIsAddBookOpen(false); loadData(); }
    catch(err) { alert(err.message); }
  }

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));
  const filteredExternal = externalBooks.filter(b => b.title.toLowerCase().includes(importQuery.toLowerCase()));

  return (
    <div className="p-8 h-screen overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-bold text-navy">Library Catalog</h2>
           <p className="text-textSub">Manage books, loans, and waitlists</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleOpenImport} className="bg-white border border-gray-200 text-navy hover:bg-gray-50 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm">
            <DownloadCloud size={18} /> Import Books
          </button>
          <button onClick={() => setIsAddBookOpen(true)} className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-200">
            <Plus size={18} /> Add Manual
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative w-full max-w-md">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input type="text" placeholder="Search local library..." className="pl-10 pr-4 py-3 w-full rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-primary outline-none" onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <div key={book._id} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col h-full relative group">
            
            {/* Book Cover Area */}
            <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
               <Book className="text-gray-300 w-12 h-12" />
               
               {/* Status Badge */}
               <div className={`absolute top-2 right-2 px-2 py-1 text-[10px] font-bold rounded-lg uppercase ${
                 book.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
               }`}>
                 {book.status}
               </div>

               {/* Waitlist Badge */}
               {book.waitlist.length > 0 && (
                 <div className="absolute bottom-2 left-2 px-2 py-1 text-[10px] bg-red-100 text-red-600 font-bold rounded-lg">
                   Waitlist: {book.waitlist.length}
                 </div>
               )}
            </div>

            <h3 className="font-bold text-navy text-lg leading-tight mb-1 truncate">{book.title}</h3>
            <p className="text-textSub text-sm mb-3 truncate">by {book.author}</p>
            
            <div className="flex flex-wrap gap-2 mb-4 h-6 overflow-hidden">
              {book.tags.map((tag, i) => (
                <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase tracking-wide">{tag}</span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-auto pt-4 border-t border-gray-50 flex gap-2">
              <button 
                onClick={() => { setSelectedBook(book); setIsLendModalOpen(true); }}
                className="flex-1 bg-navy text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
              >
                {book.status === 'AVAILABLE' ? 'Lend' : 'Join Waitlist'}
              </button>
              
              {/* RETURN EARLY BUTTON */}
              {book.status === 'BORROWED' && (
                <button 
                  onClick={() => handleReturn(book._id)}
                  className="flex-1 bg-white border border-red-200 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-50 transition flex items-center justify-center gap-1"
                  title="Return to library immediately"
                >
                  <Clock size={14} /> Return Early
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- Keep Existing Modals (Import, Lend, Add) --- */}
      {/* (These modals remain exactly the same as the previous response) */}
      {isLendModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Lend Book</h3>
            <select className="w-full p-3 border rounded-xl mb-6 bg-gray-50 outline-none" onChange={(e) => setSelectedMember(e.target.value)}>
              <option value="">-- Choose Member --</option>
              {members.map(m => (<option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setIsLendModalOpen(false)} className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={handleLend} className="flex-1 py-2 bg-primary text-white font-medium rounded-xl hover:bg-blue-600">Confirm</button>
            </div>
          </div>
        </div>
      )}
      
      {isPopulateOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
             <div className="p-6 border-b flex justify-between bg-gray-50">
               <h3 className="font-bold text-navy text-xl">Import Books</h3>
               <button onClick={() => setIsPopulateOpen(false)}><X/></button>
             </div>
             <div className="p-4 border-b"><input className="w-full p-3 border rounded-xl" placeholder="Search..." onChange={e => setImportQuery(e.target.value)} /></div>
             <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExternal.map(item => (
                   <div key={item.id} className="bg-white p-4 border rounded-xl flex gap-3 shadow-sm">
                      <div className="w-12 h-16 bg-gray-200 rounded shrink-0">
                        {item.imageLinks?.thumbnail && <img src={item.imageLinks.thumbnail} className="w-full h-full object-cover rounded"/>}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm line-clamp-1">{item.title}</h4>
                        <button disabled={addedIds.has(item.id)} onClick={() => saveExternalBook(item)} className="mt-2 text-xs bg-gray-100 px-2 py-1 rounded hover:bg-primary hover:text-white transition w-full">
                          {addedIds.has(item.id) ? "Added" : "Add"}
                        </button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {isAddBookOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add Manual Book</h3>
            <form onSubmit={handleManualAdd} className="space-y-4">
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