import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/payments');
      setPayments(response.data.payments);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to load payments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id) => {
    if (!window.confirm('Delete this payment?')) return;

    try {
      await api.delete('/payments/' + id);
      await load();
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to delete payment.');
    }
  };

  return (
    <>
      <h2>Payments / Jama</h2>
      <section className="card">
        {error && <div className="error">{error}</div>}

        {loading ? (
          <p className="muted">Loading payments...</p>
        ) : payments.length === 0 ? (
          <p className="muted">No payments recorded.</p>
        ) : (
          payments.map((payment) => (
            <div className="expense" key={payment._id}>
              <div>
                <Link to={payment.expenseId?._id ? '/expense/' + payment.expenseId._id : '#'}>
                  <strong>{payment.expenseId?.itemName || 'Expense'}</strong>
                </Link>
                <span>{new Date(payment.paymentDate).toLocaleDateString('en-IN')} · {payment.paymentMethod}</span>
              </div>
              <div>
                <b>{money(payment.amount)}</b>
                <button type="button" onClick={() => remove(payment._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}