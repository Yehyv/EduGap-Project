const StatusMessage = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center w-full h-full bg-gray-600 text-white font-semibold">
    {message}
  </div>
);

export default StatusMessage;
