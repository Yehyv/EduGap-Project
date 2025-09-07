type ErrorMessageProps = {
  message?: string;
};

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center min-h-[100vh]">
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm text-center max-w-md w-full">
        <svg
          className="w-10 h-10 mx-auto mb-3 text-red-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 
              0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 
              0L4.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-red-600 mt-1">
          {message || "Please try again later."}
        </p>
      </div>
    </div>
  );
}
