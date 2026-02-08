// components/StatsCards.js
const StatsCards = () => {
  const stats = [
    {
      title: 'Total Views',
      value: '3.5K',
      change: '+0.43%',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#3FD97F" />
          <path d="M26.562 29a2.437 2.437 0 114.875 0 2.437 2.437 0 01-4.875 0z" fill="#fff" />
          <path fillRule="evenodd" clipRule="evenodd" d="M18.166 29c0 1.776.46 2.374 1.382 3.57 1.838 2.389 4.922 5.097 9.452 5.097s7.614-2.708 9.452-5.096c.92-1.197 1.381-1.795 1.381-3.57 0-1.777-.46-2.375-1.381-3.571-1.838-2.389-4.922-5.096-9.452-5.096s-7.614 2.707-9.452 5.096c-.921 1.196-1.381 1.794-1.381 3.57zM29 24.938a4.063 4.063 0 100 8.125 4.063 4.063 0 000-8.125z" fill="#fff" />
        </svg>
      ),
      color: 'text-green-600'
    },
    {
      title: 'Total Profit',
      value: '$4.2K',
      change: '+4.35%',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#FF9C55" />
          <path fillRule="evenodd" clipRule="evenodd" d="M29 39.833c5.983 0 10.833-4.85 10.833-10.833 0-5.983-4.85-10.834-10.833-10.834-5.983 0-10.834 4.85-10.834 10.834 0 5.983 4.85 10.833 10.834 10.833zm.812-17.333a.812.812 0 10-1.625 0v.343c-1.766.316-3.25 1.643-3.25 3.448 0 2.077 1.964 3.521 4.063 3.521 1.491 0 2.437.982 2.437 1.896 0 .915-.946 1.896-2.437 1.896-1.491 0-2.438-.981-2.438-1.896a.812.812 0 10-1.625 0c0 1.805 1.484 3.132 3.25 3.449v.343a.812.812 0 101.625 0v-.343c1.767-.317 3.25-1.644 3.25-3.449 0-2.077-1.963-3.52-4.062-3.52-1.491 0-2.438-.982-2.438-1.896 0-.915.947-1.896 2.438-1.896s2.437.98 2.437 1.895a.813.813 0 001.625 0c0-1.805-1.483-3.132-3.25-3.448V22.5z" fill="#fff" />
        </svg>
      ),
      color: 'text-green-600'
    },
    {
      title: 'Total Products',
      value: '3.5K',
      change: '+2.59%',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#8155FF" />
          <path d="M35.043 20.8l-2.167-1.136c-1.902-.998-2.853-1.498-3.876-1.498-1.023 0-1.974.5-3.876 1.498L22.958 20.8c-1.922 1.008-3.051 1.6-3.752 2.394L29 28.09l9.794-4.896c-.7-.793-1.83-1.386-3.751-2.394zM39.56 24.628l-9.747 4.874v10.227c.777-.194 1.662-.658 3.063-1.393l2.167-1.137c2.33-1.223 3.496-1.835 4.143-2.934.647-1.099.647-2.467.647-5.202v-.127c0-2.05 0-3.332-.272-4.308zM28.188 39.73V29.501l-9.749-4.874c-.272.976-.272 2.258-.272 4.308v.127c0 2.735 0 4.103.647 5.202.647 1.1 1.813 1.71 4.144 2.934l2.166 1.137c1.4.735 2.286 1.2 3.064 1.393z" fill="#fff" />
        </svg>
      ),
      color: 'text-green-600'
    },
    {
      title: 'Total Users',
      value: '3.5K',
      change: '-0.95%',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#18BFFF" />
          <ellipse cx="25.7511" cy="22.4998" rx="4.33333" ry="4.33333" fill="#fff" />
          <ellipse cx="25.7511" cy="34.4178" rx="7.58333" ry="4.33333" fill="#fff" />
          <path d="M38.75 34.417c0 1.795-2.206 3.25-4.898 3.25.793-.867 1.339-1.955 1.339-3.248 0-1.295-.547-2.384-1.342-3.252 2.693 0 4.9 1.455 4.9 3.25zM35.5 22.501a3.25 3.25 0 01-4.364 3.054 6.163 6.163 0 00.805-3.055c0-1.11-.293-2.152-.804-3.053A3.25 3.25 0 0135.5 22.5z" fill="#fff" />
        </svg>
      ),
      color: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
          <div className="flex items-center">
            {stat.icon}
            <div className="ml-6 flex-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
            </div>
          </div>
          <div className={`mt-4 flex items-center text-sm font-medium ${stat.color}`}>
            {stat.change.startsWith('+') ? (
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 10 10">
                <path d="M4.357 2.393L.91 5.745 0 4.861 5 0l5 4.861-.909.884-3.448-3.353V10H4.357V2.393z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 10 10">
                <path d="M5.643 7.607L9.09 4.255l.909.884L5 10 0 5.139l.909-.884 3.448 3.353V0h1.286v7.607z" />
              </svg>
            )}
            {stat.change}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;