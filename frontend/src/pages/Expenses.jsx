import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ExpenseForm from '../components/ExpenseForm';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function Expenses({ type }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/expenses', {
        params: {
          type,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(month ? { month } : {})
        }
      });
      setItems(response.data.expenses);
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to load expenses.');
    } finally {
      setLoading(false);
    }
  }, [type, search, month]);

  useEffect(() => {
    load();
  }, [load]);

  const del = async (id) => {
    if (!window.confirm('Delete this expense and its payment history?')) return;

    try {
      await api.delete('/expenses/' + id);
      await load();
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to delete expense.');
    }
  };

  return (
    <>
      <h2>{type === 'daily' ? 'Daily' : 'Monthly'} Expenses</h2>

      <ExpenseForm type={type} onCreated={load} />

      <section className="card">
        <div className="toolbar">
          <input
            placeholder="Search expense..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          {(search || month) && (
            <button type="button" onClick={() => { setSearch(''); setMonth(''); }}>
              Clear
            </button>
          )}
        </div>

        <h3>History</h3>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <p className="muted">Loading expenses...</p>
        ) : items.length === 0 ? (
          <p className="muted">No expenses found.</p>
        ) : (
          items.map((e) => (
            <div className="expense" key={e._id}>
              <div>
                <Link to={'/expense/' + e._id}><strong>{e.itemName}</strong></Link>
                <span>{e.category} · {new Date(e.expenseDate).toLocaleDateString('en-IN')}</span>
              </div>

              <div>
                <b>{money(e.totalAmount)}</b>
                <em className={e.status}>{e.status}</em>
                <button type="button" onClick={() => del(e._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}