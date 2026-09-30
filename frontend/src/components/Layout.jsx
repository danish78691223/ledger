import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    ['/', 'Dashboard'],
    ['/daily', 'Daily Expenses'],
    ['/monthly', 'Monthly Expenses'],
    ['/payments', 'Payments']
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app">
      <aside>
        <h1>Ledger</h1>
        <p className="muted">Expense Manager</p>

        <nav>
          {links.map(([to, label]) => (
            <Link
              className={location.pathname === to ? 'active' : ''}
              to={to}
              key={to}
            >
              {label}
            </Link>
          ))}
        </nav>

        <button className="logout" onClick={handleLogout}>Logout</button>
      </aside>

      <main>
        <header>
          <div>
            <strong>Welcome, {user?.name}</strong>
            <span className="muted"> Manage your expenses and jama</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}