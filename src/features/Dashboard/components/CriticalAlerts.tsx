interface Alert {
  id: number;
  title: string;
  description: string;
  tag: string;
}

const DUMMY_ALERTS: Alert[] = [
  {
    id: 1,
    title: "Institutions expiring soon",
    description:
      "3 institutions have subscriptions expiring within the next 14 days.",
    tag: "Expires in 14 days",
  },
  {
    id: 2,
    title: "Students at risk",
    description:
      "124 students flagged for low activity and may need intervention.",
    tag: "Low activity",
  },
];

const WarningIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path
      d="M8 1.5L14.5 13H1.5L8 1.5Z"
      fill="#BA7517"
      stroke="#BA7517"
      strokeWidth="0.5"
      strokeLinejoin="round"
    />
    <rect x="7.25" y="6" width="1.5" height="3.5" rx="0.75" fill="#fff" />
    <rect x="7.25" y="10.75" width="1.5" height="1.5" rx="0.75" fill="#fff" />
  </svg>
);

const CriticalAlerts = () => {
  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-custom overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100">
        <div>
          <span className="text-xl font-semibold text-gray-900">
            Critical alerts
          </span>
          <p className="text-gray-400">Items requiring immediate attention</p>
        </div>
        <span className="ml-auto text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
          {DUMMY_ALERTS.length} alerts
        </span>
      </div>

      {/* Alert list */}
      <div className="flex gap-2 p-3 flex-col divide-y divide-gray-100">
        {DUMMY_ALERTS.map((alert, index) => (
          <div
            key={alert.id}
            className="flex gap-3 px-4 py-2 items-center bg-yellow-50 rounded-2xl border border-yellow-200"
          >
            <WarningIcon size={16} />
            <p className="text text-gray-500 leading-relaxed">
              {alert.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CriticalAlerts;
