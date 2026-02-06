import React, { useState, useEffect } from 'react';
import { UserPlus, User, BookOpen, LogOut, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as API from '../api/api';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ firstName: '', lastName: '' });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const res = await API.fetchMembers();
    setMembers(res.data);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    await API.addMember(newMember);
    setIsModalOpen(false);
    setNewMember({ firstName: '', lastName: '' });
    loadMembers();
  };

  const handleTakeBack = async (bookId, memberName, bookTitle) => {
    try {
      const res = await API.returnBook(bookId);
      toast.success(res.data.message || "Book returned successfully!");
      loadMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error taking back book");
    }
  };

  const handleDeleteMember = async (memberId, memberName, hasLoans) => {
    if (hasLoans) {
      toast.error("Cannot delete member with active loans");
      return;
    }
    
    try {
      const res = await API.deleteMember(memberId);
      toast.success(res.data.message || "Member deleted successfully!");
      loadMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting member");
    }
  };

  return (
    <div className="p-8 h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-bold text-navy">Member Directory</h2>
           <p className="text-textSub">Manage members and their active loans</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-navy hover:bg-opacity-90 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition"
        >
          <UserPlus size={18} /> Add Member
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
            <tr>
              <th className="p-4 pl-6 font-semibold w-1/4">Name</th>
              <th className="p-4 font-semibold w-1/2">Active Loans (Take Back)</th>
              <th className="p-4 font-semibold w-1/5">Status</th>
              <th className="p-4 font-semibold w-[100px] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map(member => (
              <tr key={member._id} className="hover:bg-gray-50 transition group">
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold">
                      {member.firstName[0]}
                    </div>
                    <div>
                      <span className="font-medium text-navy block">{member.firstName} {member.lastName}</span>
                      <span className="text-xs text-gray-400">ID: {member._id.slice(-4)}</span>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  {member.activeLoans && member.activeLoans.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {member.activeLoans.map((loan) => (
                        <div key={loan._id} className="flex items-center justify-between bg-blue-50/50 border border-blue-100 p-2 rounded-lg max-w-md">
                           <div className="flex items-center gap-2 overflow-hidden">
                              <BookOpen size={14} className="text-blue-400 shrink-0" />
                              <span className="text-sm text-navy font-medium truncate" title={loan.book?.title}>
                                {loan.book ? loan.book.title : "Unknown Title"}
                              </span>
                           </div>
                           
                           <button 
                             onClick={() => handleTakeBack(loan.book?._id, member.firstName, loan.book?.title)}
                             className="bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 shadow-sm ml-2 shrink-0"
                             title="Take back book"
                           >
                             <LogOut size={12} /> Take Back
                           </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm italic">No books borrowed</span>
                  )}
                </td>

                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                    member.activeLoans.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {member.activeLoans.length > 0 ? <CheckCircle size={12}/> : <User size={12}/>}
                    {member.activeLoans.length > 0 ? 'Active' : 'Idle'}
                  </span>
                </td>
                
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleDeleteMember(member._id, `${member.firstName} ${member.lastName}`, member.activeLoans.length > 0)}
                    className={`p-2 rounded-lg transition ${
                      member.activeLoans.length > 0 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-red-500 hover:bg-red-50'
                    }`}
                    title={member.activeLoans.length > 0 ? "Cannot delete member with active loans" : "Delete member"}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add New Member</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <input 
                placeholder="First Name" required 
                className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary" 
                onChange={e => setNewMember({...newMember, firstName: e.target.value})} 
              />
              <input 
                placeholder="Last Name" required 
                className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary" 
                onChange={e => setNewMember({...newMember, lastName: e.target.value})} 
              />
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-primary text-white font-medium rounded-xl hover:bg-blue-600">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;