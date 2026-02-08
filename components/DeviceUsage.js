// components/DeviceUsage.js
const DeviceUsage = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Used Devices</h2>
        <div className="relative">
          <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600">
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Yearly</option>
          </select>
        </div>
      </div>
      
      <div className="h-64 bg-gray-100 rounded-md dark:bg-gray-700 flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Pie chart would be rendered here</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Desktop: 65%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Tablet: 10%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Mobile: 20%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-300 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Unknown: 5%</span>
        </div>
      </div>
    </div>
  );
};

export default DeviceUsage;