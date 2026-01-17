/**
 * Ad Form Component
 * Used for creating new ads
 */

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function AdForm({ onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    user_id: '',
    website: '',
    company_type: '',
    image_url: '',
    target_url: '',
    ads_text: '',
    amount_cost: '',
    start_at: '',
    expire_at: '',
    online: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      user_id: parseInt(formData.user_id),
      amount_cost: formData.amount_cost ? parseFloat(formData.amount_cost) : 0,
      start_at: formData.start_at || new Date().toISOString().slice(0, 19).replace('T', ' '),
      expire_at: formData.expire_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date/Time *</Label>
          <Input
            type="datetime-local"
            name="start_at"
            value={formData.start_at}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Expire Date/Time *</Label>
          <Input
            type="datetime-local"
            name="expire_at"
            value={formData.expire_at}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div>
        <Label>Website</Label>
        <Input
          type="text"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="example.com"
        />
      </div>

      <div>
        <Label>Company Type</Label>
        <Input
          type="text"
          name="company_type"
          value={formData.company_type}
          onChange={handleChange}
          placeholder="rental"
        />
      </div>

      <div>
        <Label>Image URL</Label>
        <Input
          type="text"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg or /path/to/image.jpg"
        />
      </div>

      <div>
        <Label>Target URL</Label>
        <Input
          type="text"
          name="target_url"
          value={formData.target_url}
          onChange={handleChange}
          placeholder="https://example.com"
        />
      </div>

      <div>
        <Label>Ad Text</Label>
        <Textarea
          name="ads_text"
          value={formData.ads_text}
          onChange={handleChange}
          placeholder="Advertisement text content"
        />
      </div>

      <div>
        <Label>Amount Cost</Label>
        <Input
          type="number"
          step="0.01"
          name="amount_cost"
          value={formData.amount_cost}
          onChange={handleChange}
          placeholder="0.00"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Online</Label>
        <Switch
          checked={formData.online}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, online: checked }))}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Creating...' : 'Create Ad'}
        </Button>
      </div>
    </form>
  );
}
