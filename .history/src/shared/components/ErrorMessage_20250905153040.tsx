type ErrorMessageProps = {
  message?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
};

export default function ErrorMessage({
  message,
  onRetry,
  children,
}: ErrorMessageProps) {
  return (
    <div className="tw-bg-red-100 tw-border tw-border-red-400 tw-text-red-700 tw-p-4 tw-rounded-lg tw-flex tw-flex-col tw-items-center tw-gap-2">
      <p>{message || "Something went wrong. Please try again."}</p>
      {children}
      {onRetry && (
        <button
          onClick={onRetry}
          className="tw-bg-red-500 tw-text-white tw-px-4 tw-py-2 tw-rounded-lg hover:tw-bg-red-600"
        >
          Retry
        </button>
      )}
    </div>
  );
}
