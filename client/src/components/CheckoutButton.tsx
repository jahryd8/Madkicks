// src/components/CheckoutButton.tsx
import React from 'react';
import { useCheckout } from '../hooks/useCheckout';
import type { CheckoutPayload } from '../hooks/useCheckout';

interface CheckoutButtonProps {
  checkoutData: CheckoutPayload;
  disabled?: boolean;
  onSuccess?: (orderId: string) => void;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  checkoutData,
  disabled = false,
  onSuccess,
}) => {
  const { processCheckout, loading, error } = useCheckout();

  const handleCheckout = async () => {
    const result = await processCheckout(checkoutData);
    if (result && onSuccess) {
      onSuccess(result.orderId);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-3 p-3 bg-red-950/50 border border-red-800 text-red-400 text-sm rounded-lg">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading || disabled}
        className="w-full py-4 px-6 bg-white hover:bg-zinc-200 text-black font-bold text-sm tracking-wide rounded-lg shadow-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <span className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Redirecting to Stripe...</span>
          </span>
        ) : (
          <span>Proceed to Checkout</span>
        )}
      </button>
    </div>
  );
};