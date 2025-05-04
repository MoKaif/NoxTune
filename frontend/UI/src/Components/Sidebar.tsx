import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/artists', label: 'Artists' },
    { path: '/albums', label: 'Albums' },
    { path: '/genres', label: 'Genres' },
    { path: '/playlists', label: 'Playlists' },
    { path: '/insights', label: 'Insights (Soon)', disabled: true },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-800 p-4 sidebar ${isOpen ? '' : 'sidebar-mobile-hidden'} md:translate-x-0 z-40`}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-500">NoxTune</h1>
        <button
          className="md:hidden text-white"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <button
                className="w-full text-left py-2 px-4 rounded hover:bg-gray-700 focus:bg-gray-700 focus:outline-none disabled:opacity-50"
                onClick={() => {
                  if (!item.disabled) {
                    navigate(item.path);
                    if (window.innerWidth < 768) toggleSidebar();
                  }
                }}
                disabled={item.disabled}
                aria-label={item.disabled ? `${item.label} (coming soon)` : item.label}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;