// components/admin/DataTable.js
import { useState } from 'react';
import { Icon } from '@iconify/react';

export default function DataTable({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  onView, 
  pagination = true,
  searchable = true 
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search term
  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      {searchable && (
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((column) => (
                <th key={column.key} className="py-3 px-4 text-left">
                  {column.title}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="py-3 px-4 text-left">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                {columns.map((column) => (
                  <td key={column.key} className="py-3 px-4">
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                  </td>
                ))}
                {(onEdit || onDelete || onView) && (
                  <td className="py-3 px-4">
                    {onView && (
                      <button 
                        onClick={() => onView(item)} 
                        className="text-blue-400 hover:text-blue-300 mr-2"
                      >
                        <Icon icon="mdi:eye" className="w-5 h-5" />
                      </button>
                    )}
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(item)} 
                        className="text-yellow-400 hover:text-yellow-300 mr-2"
                      >
                        <Icon icon="mdi:pencil" className="w-5 h-5" />
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(item)} 
                        className="text-red-400 hover:text-red-300"
                      >
                        <Icon icon="mdi:delete" className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pagination && filteredData.length > itemsPerPage && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-gray-400 text-sm">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} items
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-3 py-1 rounded-lg"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === page 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-3 py-1 rounded-lg"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}