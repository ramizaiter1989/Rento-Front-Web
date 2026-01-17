/**
 * React Hook: Featured Cars
 * 
 * Fetches featured cars from the public API endpoint.
 * No authentication required.
 * 
 * Usage:
 * ```jsx
 * function HomePage() {
 *   const { cars, loading, error } = useFeaturedCars();
 * 
 *   if (loading) return <Loading />;
 *   if (error) return <Error message={error} />;
 * 
 *   return <CarGrid cars={cars} />;
 * }
 * ```
 */

import { useState, useEffect } from 'react';
import { getFeaturedCars } from '@/lib/api';

export function useFeaturedCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        setLoading(true);
        const response = await getFeaturedCars();
        // Response structure: { data: [{ car_id, car: {...} }] }
        const featuredCars = response.data?.data || [];
        setCars(featuredCars);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured cars:', err);
        setError(err.message || 'Failed to load featured cars');
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

  return { cars, loading, error };
}

export default useFeaturedCars;
