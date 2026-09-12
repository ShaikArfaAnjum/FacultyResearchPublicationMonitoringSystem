import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LogOut, 
  LayoutDashboard, 
  User, 
  FileText, 
  CheckSquare, 
  TrendingUp, 
  ShieldAlert, 
  Search, 
  Network, 
  Bot, 
  FileBarChart, 
  Bell, 
  Settings, 
  Menu,
  CheckCheck,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Activity
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

const sidebarSections = [
  {
    title: "MY RESEARCH",
    items: [
      { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { path: '/profile', label: 'My Profile', icon: <User size={18} /> },
      { path: '/publications', label: 'My Publications', icon: <FileText size={18} /> },
      { path: '/verification', label: 'Verification Queue', icon: <CheckSquare size={18} /> },
      { path: '/impact', label: 'Research Impact', icon: <TrendingUp size={18} /> },
      { path: '/integrity', label: 'Research Integrity', icon: <ShieldAlert size={18} /> },
    ]
  },
  {
    title: "EXPLORE",
    items: [
      { path: '/search', label: 'Research Search', icon: <Search size={18} /> },
      { path: '/areas', label: 'Research Areas', icon: <FileText size={18} /> },
      { path: '/collaborations', label: 'Collaborations', icon: <Network size={18} /> },
      { path: '/opportunities', label: 'Opportunities', icon: <Network size={18} /> },
    ]
  },
  {
    title: "INTELLIGENCE",
    items: [
      { path: '/pipeline', label: 'Research Pipeline', icon: <Bot size={18} /> },
      { path: '/graph', label: 'Knowledge Graph', icon: <Network size={18} /> },
      { path: '/assistant', label: 'Research Assistant', icon: <Bot size={18} /> },
    ]
  },
  {
    title: "REPORTS",
    items: [
      { path: '/reports', label: 'Reports', icon: <FileBarChart size={18} /> },
      { path: '/analytics', label: 'Analytics', icon: <TrendingUp size={18} /> },
    ]
  },
  {
    title: "SYSTEM",
    items: [
      { path: '/monitoring', label: 'System Monitoring', icon: <Activity size={18} /> },
      { path: '/notifications', label: 'Notifications', icon: <Bell size={18} /> },
      { path: '/settings', label: 'Settings', icon: <Settings size={18} /> },
    ]
  }
];

interface QuickNotification {
  id: string;
  title: string;
  message: string;
  severity: string;
  category: string;
  is_read: boolean;
  action_url?: string;
  created_at?: string;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState<QuickNotification[]>([]);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/api/v1/notifications/unread-count');
      setUnreadCount(res.data.unread_count || 0);
    } catch {
      // Ignore unauthenticated or offline errors
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      const res = await api.get('/api/v1/notifications/?limit=5');
      setRecentNotifs(res.data.data || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showNotifs) {
      fetchRecentNotifications();
    }
  }, [showNotifs]);

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = async (notif: QuickNotification) => {
    setShowNotifs(false);
    if (!notif.is_read) {
      try {
        await api.post(`/api/v1/notifications/${notif.id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {
        // Ignore
      }
    }
    if (notif.action_url) {
      navigate(notif.action_url);
    } else {
      navigate('/notifications');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/api/v1/notifications/read-all');
      setUnreadCount(0);
      setRecentNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen flex bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-fixed bg-center relative">
      <div className="absolute inset-0 bg-blue-50/90 backdrop-blur-[2px] z-0"></div>
      
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 transition-all duration-300 flex flex-col border-r border-white/10 z-40 sidebar-bg shadow-2xl`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {sidebarOpen ? (
            <img 
              src="/vignan-logo.png" 
              alt="VFSTR" 
              className="h-8 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-800 text-white font-bold flex items-center justify-center mx-auto text-xs">V</div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
            <Menu size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {sidebarSections.map((section, idx) => (
            <div key={idx} className="mb-6">
              {sidebarOpen && (
                <p className="px-4 text-xs font-bold text-gray-500 mb-2">{section.title}</p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-600/30 text-white border border-blue-400/50 shadow-sm' 
                            : 'text-gray-300 hover:bg-white/10 hover:text-white border border-transparent'
                        }`
                      }
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <span className="flex-shrink-0 relative">
                        {item.icon}
                        {item.path === '/notifications' && unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </span>
                      {sidebarOpen && (
                        <span className="text-sm font-medium whitespace-nowrap flex items-center justify-between w-full">
                          {item.label}
                          {item.path === '/notifications' && unreadCount > 0 && (
                            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                              {unreadCount}
                            </span>
                          )}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
          
          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search publications, researchers, topics, journals..."
                className="w-full bg-gray-50 border border-gray-200 rounded-full pl-10 pr-4 py-1.5 text-sm text-gray-800 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* User Profile & Notification Bell */}
          <div className="flex items-center gap-4 ml-4">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifDropdownRef}>
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100/80 rounded-full transition-colors"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center rounded-full ring-2 ring-white animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                      >
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                    {recentNotifs.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <Bell size={24} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-xs font-semibold">No new research monitoring events</p>
                      </div>
                    ) : (
                      recentNotifs.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3.5 hover:bg-blue-50/50 cursor-pointer transition-colors flex items-start gap-3 ${
                            !n.is_read ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-gray-50 mt-0.5 shrink-0">
                            {n.severity === 'critical' ? (
                              <ShieldAlert size={16} className="text-red-500" />
                            ) : n.severity === 'warning' ? (
                              <AlertTriangle size={16} className="text-amber-500" />
                            ) : n.severity === 'success' ? (
                              <CheckCircle size={16} className="text-emerald-500" />
                            ) : (
                              <Sparkles size={16} className="text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <p className="text-xs font-bold text-gray-900 truncate">{n.title}</p>
                              {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>}
                            </div>
                            <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-3 pt-2 pb-1 border-t border-gray-100 text-center">
                    <button
                      onClick={() => {
                        setShowNotifs(false);
                        navigate('/notifications');
                      }}
                      className="w-full py-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      <span>View All Notifications</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{user?.full_name}</p>
                <p className="text-xs text-gray-500 font-medium">{user?.role.replace('_', ' ')}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              
              <button onClick={handleLogout} className="ml-2 text-gray-400 hover:text-red-500 transition-colors" title="Log out">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
