// components/PaymentsOverview.js
const PaymentsOverview = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payments Overview</h2>
        <div className="relative">
          <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600">
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Yearly</option>
          </select>
        </div>
      </div>
      
      <div className="h-64 bg-gray-100 rounded-md dark:bg-gray-700 flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Chart would be rendered here</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-6 text-center">
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">$580.00</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Received Amount</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">$628.00</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Due Amount</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentsOverview;