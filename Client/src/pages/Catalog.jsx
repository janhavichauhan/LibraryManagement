import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Book, DownloadCloud, Loader, X, CheckCircle, ArrowLeftRight, UserMinus, Sparkles, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as API from '../api/api';

const POPULAR_GENRES = ["Sci-Fi", "Cybersecurity", "Business", "Mystery", "History", "Romance", "Python", "Self Help"];

const Catalog = () => {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMember, setSelectedMember] = useState('');
  
  const [isLendModalOpen, setIsLendModalOpen] = useState(false);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isPopulateOpen, setIsPopulateOpen] = useState(false);
  
  const [webQuery, setWebQuery] = useState('');
  const [webResults, setWebResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set()); 

  const [newBook, setNewBook] = useState({ title: '', author: '', tags: '', coverImage: '' });
  const [coverCache, setCoverCache] = useState({});
  const [brokenCovers, setBrokenCovers] = useState({});
  const requestedCoversRef = useRef(new Set());

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const missing = books.filter((book) => (
      !book.coverImage &&
      !coverCache[book._id] &&
      !requestedCoversRef.current.has(book._id) &&
      book.title
    ));

    if (!missing.length) return;

    let isMounted = true;

    const fetchFallbackCovers = async () => {
      const updates = {};

      await Promise.all(missing.map(async (book) => {
        requestedCoversRef.current.add(book._id);
        try {
          const query = `${book.title} ${book.author || ''}`.trim();
          const res = await API.searchOpenLibrary(query);
          const docWithCover = res.data?.docs?.find((doc) => doc.cover_i);

          if (docWithCover?.cover_i) {
            updates[book._id] = `https://covers.openlibrary.org/b/id/${docWithCover.cover_i}-M.jpg`;
          }
        } catch (error) {
        }
      }));

      if (isMounted && Object.keys(updates).length) {
        setCoverCache((prev) => ({ ...prev, ...updates }));
      }
    };

    fetchFallbackCovers();

    return () => { isMounted = false; };
  }, [books, coverCache]);

  const loadData = async () => {
    try {
      const [booksRes, membersRes] = await Promise.all([API.fetchBooks(), API.fetchMembers()]);
      setBooks(booksRes.data);
      setMembers(membersRes.data);
    } catch (error) { 
      toast.error("Failed to load data. Please refresh the page.");
    }
  };

  const handleWebSearch = async (queryOverride) => {
    const query = queryOverride || webQuery;
    if(!query) return;
    if(queryOverride) setWebQuery(queryOverride);

    setIsSearching(true);
    try {
      const res = await API.searchOpenLibrary(query);
      setWebResults(res.data.docs || []);
    } catch (err) { toast.error("Web search failed. Please try again."); } 
    finally { setIsSearching(false); }
  };

  const saveWebBook = async (item) => {
     try {
       const coverUrl = item.cover_i 
         ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` 
         : ""; 

       const bookData = { 
         title: item.title, 
         author: item.author_name ? item.author_name[0] : 'Unknown', 
         tags: item.subject ? item.subject.slice(0, 3) : ['General'],
         coverImage: coverUrl
       };
       
       await API.addBook(bookData);
       setAddedIds(prev => new Set(prev).add(item.key));
       toast.success(`"${item.title}" added to library!`);
       loadData(); 
     } catch (err) { toast.error(err.response?.data?.message || "Error adding book"); }
  }

  const handleManualAdd = async (e) => {
    e.preventDefault();
    try { 
        await API.addBook({...newBook, tags: newBook.tags.split(',')}); 
        toast.success(`"${newBook.title}" added successfully!`);
        setIsAddBookOpen(false); 
        loadData(); 
    } catch(err) { toast.error(err.response?.data?.message || "Error adding book"); }
  }

  const handleTakeBack = async (bookId, bookTitle) => {
    try { 
      const res = await API.returnBook(bookId); 
      toast.success(res.data.message || "Book returned successfully!"); 
      loadData(); 
    } catch (err) { 
      toast.error(err.response?.data?.message || "Error returning book"); 
    }
  };

  const handleLend = async () => {
    if (!selectedMember) return toast.error('Please select a member');
    try { 
      const res = await API.lendBook(selectedBook._id, selectedMember); 
      toast.success(res.data.message || "Book action completed successfully!"); 
      setIsLendModalOpen(false); 
      loadData(); 
    } catch (err) { 
      toast.error(err.response?.data?.message || "Operation failed"); 
    }
  };

  const handleCoverError = (bookId) => {
    setBrokenCovers((prev) => (prev[bookId] ? prev : { ...prev, [bookId]: true }));
  };

  const handleDelete = async (bookId, bookTitle) => {
    try {
      await API.deleteBook(bookId);
      toast.success(`"${bookTitle}" deleted successfully!`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting book");
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-bold text-navy">Library Catalog</h2>
           <p className="text-textSub">Manage books, loans, and waitlists</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsPopulateOpen(true)} className="bg-white border border-gray-200 text-navy hover:bg-gray-50 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition">
            <DownloadCloud size={18} /> Populate Library
          </button>
          <button onClick={() => setIsAddBookOpen(true)} className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-200 transition">
            <Plus size={18} /> Add Manual
          </button>
        </div>
      </div>

      <div className="mb-6 relative w-full max-w-md">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input type="text" placeholder="Search local library..." className="pl-10 pr-4 py-3 w-full rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-primary outline-none" onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => {
          const coverSrc = book.coverImage || coverCache[book._id];
          const showCover = coverSrc && !brokenCovers[book._id];

          return (
            <div key={book._id} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col h-full relative group">
            
            <div className="h-48 rounded-xl mb-4 relative overflow-visible group/cover bg-gray-50 flex items-center justify-center">
               {showCover ? (
                 <img 
                   src={coverSrc} 
                   alt={book.title} 
                   className="w-full h-full object-cover rounded-xl shadow-inner"
                   onError={() => handleCoverError(book._id)}
                 />
               ) : (
                 <Book className="text-gray-300 w-12 h-12" />
               )}
               
               <button
                 onClick={() => handleDelete(book._id, book.title)}
                 className="absolute top-2 left-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                 title="Delete book"
               >
                 <Trash2 size={14} />
               </button>
               
               <div className={`absolute top-2 right-2 px-2 py-1 text-[10px] font-bold rounded-lg uppercase shadow-sm ${book.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                 {book.status}
               </div>
               
               {book.waitlist?.length > 0 && (
                 <div className="absolute bottom-2 left-2 z-10 group/tooltip">
                   <div className="px-2 py-1 text-[10px] bg-red-100 text-red-600 font-bold rounded-lg cursor-help shadow-sm">
                     Waitlist: {book.waitlist.length}
                   </div>
                   <div className="hidden group-hover/tooltip:block absolute bottom-full left-0 mb-2 w-max min-w-[100px] bg-navy text-white text-xs p-2 rounded-lg shadow-xl z-20">
                      <div className="font-bold border-b border-gray-600 pb-1 mb-1 text-[10px] uppercase opacity-75">Queue</div>
                      {book.waitlist.map((m, i) => <div key={i}>{i+1}. {m.firstName} {m.lastName}</div>)}
                      <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-navy"></div>
                   </div>
                 </div>
               )}
            </div>

            <h3 className="font-bold text-navy text-lg leading-tight mb-1 truncate" title={book.title}>{book.title}</h3>
            <p className="text-textSub text-sm mb-3 truncate">by {book.author}</p>
            
            <div className="flex flex-wrap gap-2 mb-4 h-6 overflow-hidden">
              {book.tags && book.tags.map((tag, i) => (
                <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase tracking-wide">{tag}</span>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-50 flex gap-2">
              {book.status === 'AVAILABLE' ? (
                <button onClick={() => { setSelectedBook(book); setIsLendModalOpen(true); }} className="w-full bg-navy text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2">
                  <ArrowLeftRight size={16} /> Lend Book
                </button>
              ) : (
                <>
                  <button onClick={() => handleTakeBack(book._id, book.title)} className="flex-1 bg-white border border-orange-200 text-orange-600 py-2 rounded-lg text-xs font-bold hover:bg-orange-50 transition flex items-center justify-center gap-1">
                    <UserMinus size={14} /> Take Back
                  </button>
                  <button onClick={() => { setSelectedBook(book); setIsLendModalOpen(true); }} className="flex-1 bg-gray-50 border border-gray-200 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition">
                    Waitlist
                  </button>
                </>
              )}
            </div>
            </div>
          );
        })}
      </div>

      {isPopulateOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
             
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <div><h3 className="text-xl font-bold text-navy">Populate Library</h3><p className="text-sm text-gray-500">Search the web</p></div>
               <button onClick={() => setIsPopulateOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20} className="text-gray-500" /></button>
             </div>

             <div className="p-6 border-b border-gray-100 flex gap-4 bg-white">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                 <input className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary" placeholder="Enter topic..." value={webQuery} onChange={e => setWebQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleWebSearch()} />
               </div>
               <button onClick={() => handleWebSearch()} disabled={isSearching} className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition flex items-center gap-2">
                 {isSearching ? <Loader className="animate-spin" size={20} /> : "Search"}
               </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                {webResults.length === 0 && !isSearching ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-center mb-8"><Sparkles size={48} className="mx-auto mb-4 text-primary opacity-50" /><h4 className="text-xl font-bold text-navy mb-2">Quick Explore</h4></div>
                    <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                      {POPULAR_GENRES.map((genre) => (
                        <button key={genre} onClick={() => handleWebSearch(genre)} className="px-6 py-3 bg-white border border-gray-200 hover:border-primary hover:text-primary rounded-full shadow-sm text-gray-600 font-medium transition-all transform hover:-translate-y-1">{genre}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {webResults.map((item) => {
                        const isAdded = addedIds.has(item.key);
                        const coverUrl = item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : null;
                        
                        return (
                           <div key={item.key} className={`bg-white p-4 border rounded-xl flex gap-3 shadow-sm transition ${isAdded ? 'border-green-200 bg-green-50' : 'hover:shadow-md border-gray-100'}`}>
                              
                              <div className="w-16 h-24 bg-gray-200 rounded-lg shrink-0 overflow-hidden relative">
                                {coverUrl ? <img src={coverUrl} alt="cover" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center w-full h-full text-gray-400"><Book size={20} /></div>}
                              </div>
                              
                              <div className="flex-1 flex flex-col">
                                <h4 className="font-bold text-navy text-sm line-clamp-2 leading-tight mb-1" title={item.title}>{item.title}</h4>
                                <p className="text-xs text-textSub mb-2 line-clamp-1">{item.author_name ? item.author_name[0] : 'Unknown'}</p>
                                <div className="mt-auto">
                                  <button disabled={isAdded} onClick={() => saveWebBook(item)} className={`w-full py-1.5 text-xs font-bold rounded-lg transition flex justify-center items-center gap-2 ${isAdded ? 'bg-green-200 text-green-800 cursor-default' : 'bg-gray-100 hover:bg-primary hover:text-white text-navy'}`}>
                                    {isAdded ? <><CheckCircle size={14}/> Added</> : <><Plus size={14}/> Add</>}
                                  </button>
                                </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {isLendModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{selectedBook?.status === 'AVAILABLE' ? 'Lend Book' : 'Add to Waitlist'}</h3>
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

      {isAddBookOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add Manual Book</h3>
            <form onSubmit={handleManualAdd} className="space-y-4">
              <input placeholder="Title" required className="w-full p-3 border rounded-xl bg-gray-50" onChange={e => setNewBook({...newBook, title: e.target.value})} />
              <input placeholder="Author" required className="w-full p-3 border rounded-xl bg-gray-50" onChange={e => setNewBook({...newBook, author: e.target.value})} />
              <input placeholder="Tags (comma separated)" className="w-full p-3 border rounded-xl bg-gray-50" onChange={e => setNewBook({...newBook, tags: e.target.value})} />
              <input placeholder="Cover Image URL (Optional)" className="w-full p-3 border rounded-xl bg-gray-50" onChange={e => setNewBook({...newBook, coverImage: e.target.value})} />
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