/**
 * Payment/Invoice Form Component
 * Used for creating new payments/invoices
 */

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PaymentForm({ onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    amount: '',
    source: 'bank',
    type: 'income',
    status: 'pending',
    due_date: '',
    description: '',
    metadata: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      user_id: parseInt(formData.user_id),
      amount: parseFloat(formData.amount),
      due_date: formData.due_date || new Date().toISOString().slice(0, 19).replace('T', ' '),
      ...(formData.metadata && { metadata: JSON.parse(formData.metadata) })
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>User ID *</Label>
        <Input
          type="number"
          name="user_id"
          value={formData.user_id}
          onChange={handleChange}
          required
          placeholder="Enter user ID"
        />
      </div>

      <div>
        <Label>Name/Description *</Label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Payment name"
          maxLength={100}
        />
      </div>

      <div>
        <Label>Amount *</Label>
        <Input
          type="number"
          step="0.01"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          placeholder="99.99"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Source *</Label>
          <Select value={formData.source} onValueChange={(value) => handleSelectChange('source', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wish">Wish</SelectItem>
              <SelectItem value="omt">OMT</SelectItem>
              <SelectItem value="bank">Bank</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Type *</Label>
          <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="debit">Debit</SelectItem>
              <SelectItem value="upcoming_income">Upcoming Income</SelectItem>
              <SelectItem value="credit">Credit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Due Date</Label>
          <Input
            type="datetime-local"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Additional description"
        />
      </div>

      <div>
        <Label>Metadata (JSON)</Label>
        <Textarea
          name="metadata"
          value={formData.metadata}
          onChange={handleChange}
          placeholder='{"key": "value"}'
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Issuing...' : 'Issue Payment/Invoice'}
        </Button>
      </div>
    </form>
  );
}
