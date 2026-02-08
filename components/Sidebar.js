// components/Sidebar.js
import { useState } from 'react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState({
    dashboard: true,
    tasks: false,
    forms: false,
    tables: false,
    pages: false,
    charts: false,
    uiElements: false,
    authentication: false,
  });

  const toggleMenu = (menu) => {
    setExpandedMenus({
      ...expandedMenus,
      [menu]: !expandedMenus[menu]
    });
  };

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 17.25a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9z" />
          <path fillRule="evenodd" clipRule="evenodd" d="M12 1.25c-.725 0-1.387.2-2.11.537-.702.327-1.512.81-2.528 1.415l-1.456.867c-1.119.667-2.01 1.198-2.686 1.706C2.523 6.3 2 6.84 1.66 7.551c-.342.711-.434 1.456-.405 2.325.029.841.176 1.864.36 3.146l.293 2.032c.237 1.65.426 2.959.707 3.978.29 1.05.702 1.885 1.445 2.524.742.64 1.63.925 2.716 1.062 1.056.132 2.387.132 4.066.132h2.316c1.68 0 3.01 0 4.066-.132 1.086-.137 1.974-.422 2.716-1.061.743-.64 1.155-1.474 1.445-2.525.281-1.02.47-2.328.707-3.978l.292-2.032c.185-1.282.332-2.305.360-3.146.03-.87-.062-1.614-.403-2.325C22 6.84 21.477 6.3 20.78 5.775c-.675-.508-1.567-1.039-2.686-1.706l-1.456-.867c-1.016-.605-1.826-1.088-2.527-1.415-.724-.338-1.386-.537-2.111-.537zM8.096 4.511c1.057-.63 1.803-1.073 2.428-1.365.609-.284 1.047-.396 1.476-.396.43 0 .867.112 1.476.396.625.292 1.37.735 2.428 1.365l1.385.825c1.165.694 1.986 1.184 2.59 1.638.587.443.91.809 1.11 1.225.199.416.282.894.257 1.626-.026.75-.16 1.691-.352 3.026l-.28 1.937c-.246 1.714-.422 2.928-.675 3.845-.247.896-.545 1.415-.977 1.787-.433.373-.994.593-1.925.71-.951.119-2.188.12-3.93.12h-2.213c-1.743 0-2.98-.001-3.931-.12-.93-.117-1.492-.337-1.925-.71-.432-.372-.73-.891-.977-1.787-.253-.917-.43-2.131-.676-3.845l-.279-1.937c-.192-1.335-.326-2.277-.352-3.026-.025-.732.058-1.21.258-1.626.2-.416.521-.782 1.11-1.225.603-.454 1.424-.944 2.589-1.638l1.385-.825z" />
        </svg>
      ),
      subItems: [
        { title: 'eCommerce', badge: null },
        { title: 'Analytics', badge: 'Pro' },
        { title: 'Marketing', badge: 'Pro' },
        { title: 'CRM', badge: 'Pro' },
        { title: 'Stocks', badge: 'Pro' },
      ]
    },
    // More menu items would be defined here
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full py-6 pl-6 pr-2">
          {/* Logo */}
          <div className="flex items-center justify-between pr-4">
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              NextAdmin
            </div>
            <button 
              className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 overflow-y-auto">
            <div className="mb-6">
              <h2 className="mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">MAIN MENU</h2>
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    {item.subItems ? (
                      <div>
                        <button
                          onClick={() => toggleMenu(item.id)}
                          className={`flex items-center w-full p-3 text-left rounded-lg transition-colors duration-200 ${
                            activeMenu === item.id 
                              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200' 
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          <span className="mr-3">{item.icon}</span>
                          <span className="flex-1">{item.title}</span>
                          <svg 
                            className={`w-4 h-4 transform transition-transform duration-200 ${
                              expandedMenus[item.id] ? 'rotate-0' : 'rotate-180'
                            }`} 
                            fill="currentColor" 
                            viewBox="0 0 16 8"
                          >
                            <path fillRule="evenodd" clipRule="evenodd" d="M7.553.728a.687.687 0 01.895 0l6.416 5.5a.688.688 0 01-.895 1.044L8 2.155 2.03 7.272a.688.688 0 11-.894-1.044l6.417-5.5z" />
                          </svg>
                        </button>
                        
                        {expandedMenus[item.id] && (
                          <ul className="ml-9 mt-1 space-y-1">
                            {item.subItems.map((subItem, index) => (
                              <li key={index}>
                                <a
                                  href="#"
                                  className="block py-2 px-3 text-sm rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                                >
                                  <span>{subItem.title}</span>
                                  {subItem.badge && (
                                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-md dark:bg-indigo-900 dark:text-indigo-200">
                                      {subItem.badge}
                                    </span>
                                  )}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <a
                        href="#"
                        className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                          activeMenu === item.id 
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200' 
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.title}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;