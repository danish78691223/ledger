import { useState } from 'react';
import api from '../services/api';

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export default function ExpenseForm({ type, onCreated }) {
  const [form, setForm] = useState({
    itemName: '',
    category: 'Other',
    quantity: 1,
    price: '',
    expenseDate: localDate(),
    dueDate: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const change = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      await api.post('/expenses', {
        ...form,
        type,
        quantity: Number(form.quantity),
        price: Number(form.price)
      });

      setForm((current) => ({
        ...current,
        itemName: '',
        price: '',
        notes: '',
        dueDate: ''
      }));

      await onCreated();
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to save expense.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h3>Add {type === 'daily' ? 'Daily' : 'Monthly'} Expense</h3>

      <div className="grid">
        <input name="itemName" placeholder="Item name e.g. Milk" value={form.itemName} onChange={change} required />
        <input name="category" placeholder="Category" value={form.category} onChange={change} />
        <input name="quantity" type="number" min="0.01" step="0.01" placeholder="Quantity" value={form.quantity} onChange={change} required />
        <input name="price" type="number" min="0.01" step="0.01" placeholder="Price" value={form.price} onChange={change} required />
        <input name="expenseDate" type="date" value={form.expenseDate} onChange={change} required />
        {type === 'monthly' && <input name="dueDate" type="date" value={form.dueDate} onChange={change} />}
      </div>

      <textarea name="notes" placeholder="Notes (optional)" value={form.notes} onChange={change} />

      {error && <div className="error">{error}</div>}

      <button className="primary" type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Add Expense'}
      </button>
    </form>
  );
}