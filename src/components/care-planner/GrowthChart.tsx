import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface Milestone {
  id: string;
  measurement_value?: number;
  measurement_unit?: string;
  created_at: string;
  title: string;
}

interface GrowthChartProps {
  milestones: Milestone[];
}

const GrowthChart = ({ milestones }: GrowthChartProps) => {
  // Sort by date ascending for chart
  const sortedData = [...milestones]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((m) => ({
      date: format(new Date(m.created_at), "MMM d"),
      value: m.measurement_value,
      fullDate: m.created_at,
      title: m.title,
      unit: m.measurement_unit,
    }));

  if (sortedData.length === 0) return null;

  const unit = sortedData[0]?.unit || "";
  const firstValue = sortedData[0]?.value || 0;
  const lastValue = sortedData[sortedData.length - 1]?.value || 0;
  const totalGrowth = lastValue - firstValue;
  const growthPercent = firstValue > 0 ? ((totalGrowth / firstValue) * 100).toFixed(1) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Growth Analytics</CardTitle>
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <TrendingUp className="w-5 h-5" />
            <span className="text-lg font-semibold">
              +{growthPercent}% growth
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Starting</div>
            <div className="text-2xl font-bold">
              {firstValue} {unit}
            </div>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Growth</div>
            <div className="text-2xl font-bold text-primary">
              +{totalGrowth.toFixed(1)} {unit}
            </div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Current</div>
            <div className="text-2xl font-bold">
              {lastValue} {unit}
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "currentColor" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "currentColor" }}
              label={{ value: unit, angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value} ${unit}`, "Measurement"]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", r: 6 }}
              activeDot={{ r: 8 }}
              name="Growth"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default GrowthChart;
