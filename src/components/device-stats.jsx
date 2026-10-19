/* eslint-disable react/prop-types */
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#2563EB", "#0D9488", "#6366F1", "#F59E0B", "#EC4899"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs">
        <p className="font-semibold text-foreground capitalize">{data.name}</p>
        <p className="text-primary mt-1 font-medium">
          {data.value} {data.value === 1 ? "click" : "clicks"}
        </p>
      </div>
    );
  }
  return null;
};

export default function DeviceStats({ stats = [] }) {
  const deviceCount = (stats || []).reduce((acc, item) => {
    const device = item.device || "desktop";
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  const result = Object.keys(deviceCount).map((device) => ({
    device,
    count: deviceCount[device],
  }));

  if (result.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        No device data available yet
      </div>
    );
  }

  const total = result.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={result}
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="count"
              nameKey="device"
            >
              {result.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        {result.map((item, index) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div
              key={item.device}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="capitalize font-medium text-foreground">
                {item.device}
              </span>
              <span>({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
