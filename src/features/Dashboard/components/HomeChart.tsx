import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ChartData } from "../services/dashboardApis";

interface HomeChartProps {
  dataKey1: string;
  dataKey2?: string;
  label1: string;
  label2?: string;
  dataSource: "students" | "learningPaths" | "certificates";
  chartData?: ChartData;
}

// Match each series by its `name` from the API response instead of by position.
// This way the order the backend returns series doesn't matter.
function transformChartData(
  chartData: ChartData,
  label1: string,
  label2?: string,
  dataKey1?: string,
  dataKey2?: string,
): Record<string, string | number>[] {
  // Find series by the label names that match what the API returns
  const series1 = chartData?.series?.find((s) => s.name === label1);
  const series2 = label2
    ? chartData?.series?.find((s) => s.name === label2)
    : undefined;

  return chartData?.categories?.map((category, index) => {
    const entry: Record<string, string | number> = { month: category };

    if (series1 && dataKey1) {
      entry[dataKey1] = series1.data[index] ?? 0;
    }
    if (series2 && dataKey2) {
      entry[dataKey2] = series2.data[index] ?? 0;
    }

    return entry;
  });
}

export default function HomeChart({
  dataKey1,
  dataKey2,
  label1,
  label2,
  chartData,
}: HomeChartProps) {
  const data = chartData
    ? transformChartData(chartData, label1, label2, dataKey1, dataKey2)
    : [];

  const hasSecondLine = !!dataKey2 && !!label2;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="month"
          tickLine={false}
          interval={0}
          angle={-35}
          textAnchor="end"
          tick={{ fontSize: 11 }}
        />
        <YAxis tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, backgroundColor: "#f9f9f9" }}
        />
        <Legend verticalAlign="top" height={36} />

        <Line
          type="monotone"
          dataKey={dataKey1}
          name={label1}
          stroke="#017BBC"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 8 }}
        />

        {hasSecondLine && (
          <Line
            type="monotone"
            dataKey={dataKey2}
            name={label2}
            stroke="#FCB737"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 8 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
