import React from 'react';
import { useCheckout } from '../hooks/useCheckout';
import type { CheckoutPayload } from '../hooks/useCheckout';

interface CheckoutButtonProps {
  checkoutData: CheckoutPayload;
  onSuccess?: (orderId: string) => void;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({ checkoutData, onSuccess }) => {
  const { processCheckout, loading, error } = useCheckout();

  const handleCheckout = async () => {
    const result = await processCheckout(checkoutData);
    if (result && onSuccess) {
      onSuccess(result.orderId);
    }
  };

  return (
    <div className="w-full">
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-black text-white font-bold py-3 px-6 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Proceed to Checkout'}
      </button>
    </div>
  );
};