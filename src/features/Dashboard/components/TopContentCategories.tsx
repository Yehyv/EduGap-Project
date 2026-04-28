import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const DUMMY_DATA = [
  { name: "Business Analytics", value: 32 },
  { name: "Data Science", value: 28 },
  { name: "Web Development", value: 20 },
  { name: "Cybersecurity", value: 12 },
  { name: "Cloud Computing", value: 8 },
];

const COLORS = ["#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd", "#1e293b"];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-md">
      <span className="text-sm font-semibold text-blue-700">
        {payload[0].name} : {payload[0].value}
      </span>
    </div>
  );
};

const TopContentCategories = () => {
  const total = DUMMY_DATA.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-custom overflow-hidden p-5">
      {/* Header */}
      <h5 className="text-lg font-semibold text-gray-900 mb-0.5">
        Top Content Categories
      </h5>
      <p className="text-sm text-gray-400 mb-4">
        Most consumed skill tracks. Total share: {total}%
      </p>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={DUMMY_DATA}
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={120}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {DUMMY_DATA.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-2">
        {DUMMY_DATA.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs text-gray-500">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopContentCategories;
