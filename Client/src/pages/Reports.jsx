import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';
import * as API from '../api/api';

const Reports = () => {
  const [overdue, setOverdue] = useState([]);
  const [topBooks, setTopBooks] = useState([]);

  useEffect(() => {
    API.fetchOverdue().then(res => setOverdue(res.data));
    API.fetchTopBooks().then(res => setTopBooks(res.data));
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-navy mb-8">Library Insights</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Overdue Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 p-2 rounded-lg text-red-600">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-navy">Overdue Loans</h3>
          </div>
          
          <div className="space-y-4">
            {overdue.length === 0 && <p className="text-gray-400">No overdue books. Great job!</p>}
            {overdue.map((loan, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-red-50/50 rounded-xl border border-red-100">
                <div>
                  <p className="font-bold text-navy">{loan.book.title}</p>
                  <p className="text-sm text-textSub">Borrowed by: {loan.member.firstName} {loan.member.lastName}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold text-red-500 uppercase">Overdue</p>
                   <p className="text-sm text-gray-500">{new Date(loan.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Books Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-bold text-navy">Top Performing Books</h3>
          </div>

          <div className="space-y-4">
            {topBooks.map((book, index) => (
              <div key={book._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition">
                <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full font-bold text-gray-500">
                  #{index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-bold text-navy">{book.title}</p>
                  <p className="text-xs text-textSub">{book.author}</p>
                </div>
                <div className="bg-blue-50 text-primary px-3 py-1 rounded-lg text-sm font-bold">
                  {book.checkoutCount} Loans
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;