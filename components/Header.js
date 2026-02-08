// components/Header.js
import Image from 'next/image';

const Header = ({ setSidebarOpen }) => {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center">
          <button
            className="p-1 mr-2 text-gray-600 rounded-md hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-400 dark:hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Next.js Admin Dashboard Solution</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 bg-gray-100 rounded-full hover:text-gray-900 dark:text-gray-400 dark:bg-gray-700 dark:hover:text-white">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>

          <button className="p-2 text-gray-600 bg-gray-100 rounded-full hover:text-gray-900 dark:text-gray-400 dark:bg-gray-700 dark:hover:text-white">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Image className="w-8 h-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User profile" />
              <span className="hidden ml-2 text-gray-700 dark:text-gray-300 md:block">John Smith</span>
              <svg className="hidden w-4 h-4 ml-1 text-gray-500 dark:text-gray-400 md:block" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;