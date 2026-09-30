import { useState } from 'react';
import api from '../services/api';
export default function ExpenseForm({ type, onCreated }) {
  const [form,setForm]=useState({itemName:'',category:'Other',quantity:1,price:'',expenseDate:new Date().toISOString().slice(0,10),dueDate:'',notes:''});
  const change=e=>setForm({...form,[e.target.name]:e.target.value});
  const submit=async e=>{e.preventDefault(); await api.post('/expenses',{...form,type,quantity:Number(form.quantity),price:Number(form.price)}); setForm({...form,itemName:'',price:'',notes:''}); onCreated();};
  return <form className="card form" onSubmit={submit}><h3>Add {type==='daily'?'Daily':'Monthly'} Expense</h3><div className="grid"><input name="itemName" placeholder="Item name e.g. Milk" value={form.itemName} onChange={change} required/><input name="category" placeholder="Category" value={form.category} onChange={change}/><input name="quantity" type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={change}/><input name="price" type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={change} required/><input name="expenseDate" type="date" value={form.expenseDate} onChange={change} required/>{type==='monthly'&&<input name="dueDate" type="date" value={form.dueDate} onChange={change}/>}</div><textarea name="notes" placeholder="Notes (optional)" value={form.notes} onChange={change}/><button className="primary">Add Expense</button></form>;
}
