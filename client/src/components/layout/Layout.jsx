import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LuLayoutDashboard, LuChartPie, LuSparkles, LuRepeat, LuList, LuSettings, LuLogOut, LuUser, LuMenu, LuPanelLeftClose } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
import styles from './Layout.module.css';

const navLinks = [
  { path: '/', label: 'Dashboard', icon: LuLayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: LuList },
  { path: '/budget', label: 'Budget', icon: LuChartPie },
  { path: '/recurring', label: 'Recurring', icon: LuRepeat },
  { path: '/ai-insights', label: 'AI Insights', icon: LuSparkles },
];

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      {!isSidebarOpen && (
        <button className={styles.menuBtn} onClick={() => setIsSidebarOpen(true)}>
          <LuMenu />
        </button>
      )}

      <aside className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarClosed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>FinTrack</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ThemeToggle />
            <button className={styles.closeBtn} onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar">
              <LuPanelLeftClose />
            </button>
          </div>
        </div>

        <nav className={styles.nav}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink 
                key={link.path} 
                to={link.path}
                onClick={() => { if (window.innerWidth <= 768) setIsSidebarOpen(false); }}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <Icon className={styles.navIcon} />
                <span className={styles.navLabel}>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userSection}>
            <div className={styles.avatar}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" />
              ) : (
                <LuUser />
              )}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.nickname || user?.username || 'User'}</div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          
          <div className={styles.footerActions}>
            <NavLink 
              to="/settings"
              className={({ isActive }) => `${styles.footerAction} ${isActive ? styles.footerActionActive : ''}`}
            >
              <LuSettings /> Settings
            </NavLink>
            <button onClick={handleLogout} className={styles.footerAction}>
              <LuLogOut /> Logout
            </button>
          </div>
        </div>
      </aside>

      <main className={`${styles.main} ${!isSidebarOpen ? styles.mainExpanded : ''}`}>
        {children}
      </main>
    </div>
  );
}
