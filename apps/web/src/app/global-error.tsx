'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error caught:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
          <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
          <p className="mb-4 text-gray-400">
            {error.message || 'An unexpected error occurred.'}
          </p>
          <button
            className="rounded bg-white px-4 py-2 text-black font-semibold hover:bg-gray-200 transition-colors"
            onClick={() => reset()}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
