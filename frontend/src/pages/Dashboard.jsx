import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryResponse, expenseResponse] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/expenses')
      ]);
      setSummary(summaryResponse.data);
      setExpenses(expenseResponse.data.expenses.slice(0, 8));
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="center">Loading dashboard...</div>;

  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">Your current month expense overview</p>
        </div>
        <Link className="primary button-link" to="/daily">+ Add Expense</Link>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="stats">
        <div><span>This Month</span><b>{money(summary.totalMonth)}</b></div>
        <div><span>Today's Expense</span><b>{money(summary.today)}</b></div>
        <div><span>Total Paid</span><b>{money(summary.paid)}</b></div>
        <div><span>Pending</span><b>{money(summary.pending)}</b></div>
      </div>

      <div className="two">
        <section className="card">
          <h3>Category Summary</h3>
          {Object.keys(summary.categories || {}).length === 0 ? (
            <p className="muted">No expenses this month.</p>
          ) : (
            Object.entries(summary.categories).map(([category, amount]) => (
              <div className="row" key={category}>
                <span>{category}</span>
                <strong>{money(amount)}</strong>
              </div>
            ))
          )}
        </section>

        <section className="card">
          <h3>Recent Expenses</h3>
          {expenses.length === 0 ? (
            <p className="muted">No expenses yet.</p>
          ) : (
            expenses.map((expense) => (
              <div className="row" key={expense._id}>
                <span>
                  <Link to={'/expense/' + expense._id}>{expense.itemName}</Link>
                  <small>{new Date(expense.expenseDate).toLocaleDateString('en-IN')}</small>
                </span>
                <strong>{money(expense.totalAmount)}</strong>
              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
}