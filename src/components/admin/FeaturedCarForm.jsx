/**
 * Featured Car Form Component
 * Used for creating featured cars
 */

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function FeaturedCarForm({ onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    car_id: '',
    duration: '',
    start_at: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      car_id: parseInt(formData.car_id),
      duration: parseInt(formData.duration),
      start_at: formData.start_at || new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Car ID *</Label>
        <Input
          type="number"
          name="car_id"
          value={formData.car_id}
          onChange={handleChange}
          required
          placeholder="Enter car ID"
        />
      </div>

      <div>
        <Label>Duration (Days) *</Label>
        <Input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          required
          min="1"
          max="365"
          placeholder="30"
        />
        <p className="text-xs text-muted-foreground mt-1">Number of days to feature (1-365)</p>
      </div>

      <div>
        <Label>Start Date/Time</Label>
        <Input
          type="datetime-local"
          name="start_at"
          value={formData.start_at}
          onChange={handleChange}
          placeholder="Leave empty to start now"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Creating...' : 'Create Featured Car'}
        </Button>
      </div>
    </form>
  );
}
