import React, { useState, useEffect } from 'react';
import { UserPlus, User } from 'lucide-react';
import * as API from '../api/api';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ firstName: '', lastName: '' });

  useEffect(() => {
    API.fetchMembers().then(res => setMembers(res.data));
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    await API.addMember(newMember);
    setIsModalOpen(false);
    setNewMember({ firstName: '', lastName: '' });
    API.fetchMembers().then(res => setMembers(res.data));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-navy">Member Directory</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-navy text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition"
        >
          <UserPlus size={18} /> Add Member
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
            <tr>
              <th className="p-4 pl-6 font-semibold">Name</th>
              <th className="p-4 font-semibold">Active Loans</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map(member => (
              <tr key={member._id} className="hover:bg-gray-50 transition">
                <td className="p-4 pl-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold">
                    {member.firstName[0]}
                  </div>
                  <span className="font-medium text-navy">{member.firstName} {member.lastName}</span>
                </td>
                <td className="p-4 text-textSub">
                  {member.activeLoans.length > 0 ? (
                    <span className="text-primary font-medium">{member.activeLoans.length} Books Borrowed</span>
                  ) : (
                    <span className="text-gray-400">No active loans</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    member.activeLoans.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {member.activeLoans.length > 0 ? 'Active' : 'Idle'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add Member</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <input placeholder="First Name" required className="w-full p-3 border rounded-xl bg-gray-50" onChange={e => setNewMember({...newMember, firstName: e.target.value})} />
              <input placeholder="Last Name" required className="w-full p-3 border rounded-xl bg-gray-50" onChange={e => setNewMember({...newMember, lastName: e.target.value})} />
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-primary text-white font-medium rounded-xl hover:bg-blue-600">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;