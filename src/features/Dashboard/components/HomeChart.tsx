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

const data = [
  { month: "Jan", students: 120, activeStudents: 90 },
  { month: "Feb", students: 200, activeStudents: 150 },
  { month: "Mar", students: 150, activeStudents: 120 },
  { month: "Apr", students: 220, activeStudents: 180 },
  { month: "May", students: 300, activeStudents: 250 },
  { month: "Jun", students: 270, activeStudents: 230 },
  { month: "Jul", students: 350, activeStudents: 300 },
  { month: "Aug", students: 400, activeStudents: 350 },
  { month: "Sep", students: 380, activeStudents: 320 },
  { month: "Oct", students: 420, activeStudents: 380 },
  { month: "Nov", students: 450, activeStudents: 400 },
  { month: "Dec", students: 500, activeStudents: 450 },
];

export default function HomeChart() {
  return (
    <ResponsiveContainer width="100%" height={"100%"}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="month" tickLine={false} />
        <YAxis tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, backgroundColor: "#f9f9f9" }}
        />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="students"
          name="Students"
          stroke="#017BBC"
          strokeWidth={3}
          dot={false} // disables all dots
          activeDot={{ r: 8 }} // only show dot on hover
        />
        <Line
          type="monotone"
          dataKey="activeStudents"
          name="Active Students"
          stroke="#FCB737"
          strokeWidth={3}
          dot={false} // disables all dots
          activeDot={{ r: 8 }} // only show dot on hover
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
