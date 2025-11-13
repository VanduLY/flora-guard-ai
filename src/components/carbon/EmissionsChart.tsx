import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface ChartData {
  date: string;
  emissions: number;
}

export const EmissionsChart = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      setIsLoading(true);
      
      // Get last 30 days of activities
      const endDate = new Date();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const { data: activities, error } = await supabase
        .from('carbon_activities')
        .select('created_at, co2_emissions')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by day
      const groupedData: { [key: string]: number } = {};
      
      activities?.forEach((activity) => {
        const date = new Date(activity.created_at).toISOString().split('T')[0];
        if (!groupedData[date]) {
          groupedData[date] = 0;
        }
        groupedData[date] += Number(activity.co2_emissions) || 0;
      });

      // Convert to chart format
      const chartData = Object.entries(groupedData).map(([date, emissions]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        emissions: Number(emissions.toFixed(3)),
      }));

      // Fill in missing days with 0
      const allDays: ChartData[] = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existingData = chartData.find(d => d.date === dateStr);
        allDays.unshift({
          date: dateStr,
          emissions: existingData?.emissions || 0,
        });
      }

      setData(allDays);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Loading chart data...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No activity data yet. Start logging activities to see your emissions trend.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Line 
          type="monotone" 
          dataKey="emissions" 
          stroke="hsl(142 76% 36%)" 
          strokeWidth={2}
          dot={{ fill: 'hsl(142 76% 36%)' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
