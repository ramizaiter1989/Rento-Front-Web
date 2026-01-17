/**
 * React Hook: App Fees Balance (Agent)
 * 
 * Fetches app fees balance for the authenticated agent.
 * Shows total balance, breakdown, and balance by car.
 * 
 * Usage:
 * ```jsx
 * function AgentDashboard() {
 *   const { balance, loading, error } = useAppFeesBalance();
 * 
 *   if (loading) return <Loading />;
 *   if (error) return <Error message={error} />;
 * 
 *   return (
 *     <div>
 *       <h2>Total Balance: ${balance?.total_balance}</h2>
 *       <p>Remaining: ${balance?.breakdown?.remaining_balance}</p>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect } from 'react';
import { getAgentAppFeesBalance } from '@/lib/api';

export function useAppFeesBalance() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      // Check if user is authenticated
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getAgentAppFeesBalance();
        // Response structure:
        // {
        //   total_balance: 500,
        //   currency: "USD",
        //   breakdown: { total_fees, paid_amount, remaining_balance },
        //   by_car: [...]
        // }
        setBalance(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching app fees balance:', err);
        setError(err.message || 'Failed to load app fees balance');
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  return { balance, loading, error };
}

export default useAppFeesBalance;
