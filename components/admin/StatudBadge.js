// components/admin/StatusBadge.js
export default function StatusBadge({ status }) {
  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    inactive: 'bg-red-500/20 text-red-400',
    approved: 'bg-blue-500/20 text-blue-400',
    rejected: 'bg-red-500/20 text-red-400',
    completed: 'bg-green-500/20 text-green-400',
    processing: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}