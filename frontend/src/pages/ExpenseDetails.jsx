import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export default function ExpenseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [d, setD] = useState(null);
  const [f, setF] = useState({
    amount: '',
    paymentDate: localDate(),
    paymentMethod: 'cash',
    notes: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await api.get('/expenses/' + id);
      setD(response.data);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to load expense.');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      await api.post('/payments', {
        ...f,
        expenseId: id,
        amount: Number(f.amount)
      });
      setF((current) => ({ ...current, amount: '', notes: '' }));
      await load();
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to save payment.');
    } finally {
      setSaving(false);
    }
  };

  const removePayment = async (paymentId) => {
    if (!window.confirm('Delete this payment?')) return;

    try {
      await api.delete('/payments/' + paymentId);
      await load();
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to delete payment.');
    }
  };

  const deleteExpense = async () => {
    if (!window.confirm('Delete this expense and all its payments?')) return;

    try {
      await api.delete('/expenses/' + id);
      navigate('/' + (d.expense.type === 'daily' ? 'daily' : 'monthly'), { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to delete expense.');
    }
  };

  if (error && !d) {
    return (
      <>
        <div className="error">{error}</div>
        <Link to="/daily">Back to expenses</Link>
      </>
    );
  }

  if (!d) return <div className="center">Loading...</div>;

  return (
    <>
      <div className="page-heading">
        <div>
          <Link to={d.expense.type === 'daily' ? '/daily' : '/monthly'}>← Back</Link>
          <h2>{d.expense.itemName}</h2>
          <p className="muted">{d.expense.category} · {d.expense.type === 'daily' ? 'Daily' : 'Monthly'}</p>
        </div>
        <button type="button" onClick={deleteExpense}>Delete Expense</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="stats">
        <div><span>Total</span><b>{money(d.expense.totalAmount)}</b></div>
        <div><span>Paid</span><b>{money(d.paid)}</b></div>
        <div><span>Remaining</span><b>{money(d.remaining)}</b></div>
      </div>

      <div className="two">
        <form className="card form" onSubmit={submit}>
          <h3>Add Jama / Payment</h3>
          <input type="number" min="0.01" max={d.remaining || undefined} step="0.01" placeholder="Amount" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} required disabled={d.remaining <= 0} />
          <input type="date" value={f.paymentDate} onChange={(e) => setF({ ...f, paymentDate: e.target.value })} required disabled={d.remaining <= 0} />
          <select value={f.paymentMethod} onChange={(e) => setF({ ...f, paymentMethod: e.target.value })} disabled={d.remaining <= 0}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank</option>
            <option value="card">Card</option>
            <option value="other">Other</option>
          </select>
          <textarea placeholder="Notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          <button className="primary" type="submit" disabled={saving || d.remaining <= 0}>
            {saving ? 'Saving...' : d.remaining <= 0 ? 'Fully Paid' : 'Save Payment'}
          </button>
        </form>

        <section className="card">
          <h3>Payment History</h3>
          {d.payments.length === 0 ? (
            <p className="muted">No payments recorded.</p>
          ) : (
            d.payments.map((p) => (
              <div className="row" key={p._id}>
                <span>
                  {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                  <small>{p.paymentMethod}{p.notes ? ' · ' + p.notes : ''}</small>
                </span>
                <span>
                  <strong>{money(p.amount)}</strong>
                  <button type="button" onClick={() => removePayment(p._id)}>Delete</button>
                </span>
              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
}