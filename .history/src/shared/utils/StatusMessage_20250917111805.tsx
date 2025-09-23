const StatusMessage = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center w-full h-full bg-gray-100 text-red-500 font-medium">
    {message}
  </div>
);

export default StatusMessage;
