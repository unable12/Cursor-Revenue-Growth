import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// Custom dot component with adjacent labels
const CustomizedDot = (props) => {
  const { cx, cy, payload } = props;
  const isKeyMilestone = payload.event !== '';
  
  if (!isKeyMilestone) {
    return (
      <circle cx={cx} cy={cy} r={2.5} fill="#FF8200" stroke="#FFFFFF" strokeWidth={1} />
    );
  }

  const getLabelPosition = () => {
    if (payload.revenue === 48) {
      return { x: cx - 5, y: cy - 15, anchor: "middle" };
    }
    if (payload.revenue === 50) {
      return { x: cx + 12, y: cy - 5, anchor: "start" };
    }
    if (payload.revenue === 1) {
      return { x: cx + 10, y: cy - 15, anchor: "start" };
    }
    if (payload.revenue === 4) {
      return { x: cx + 10, y: cy - 25, anchor: "start" };
    }
    if (payload.revenue === 0) {
      return { x: cx, y: cy - 15, anchor: "middle" };
    }
    return { x: cx + 12, y: cy, anchor: "start" };
  };

  const position = getLabelPosition();

  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill="#FF8200" stroke="#FFFFFF" strokeWidth={1.5} />
      <text
        x={position.x}
        y={position.y}
        textAnchor={position.anchor}
        fill="#FF8200"
        fontWeight="bold"
        fontSize="13"
      >
        {payload.revenue > 0 ? `$${payload.revenue}M` : 'Founded'}
      </text>
    </g>
  );
};

export default function RevenueChart() {
  const generateMonthlyData = () => {
    const startDate = new Date('2022-01-01');
    const endDate = new Date('2025-04-30');
    const data = [];
    
    const keyEvents = {
      '2022-01': { revenue: 0, event: 'Founded' },
      '2023-10': { revenue: 1, event: '$1M ARR' },
      '2024-04': { revenue: 4, event: '$4M ARR' },
      '2024-11': { revenue: 50, event: '$50M ARR' },
      '2024-12': { revenue: 100, event: '$100M ARR' },
      '2025-03': { revenue: 200, event: '$200M ARR' },
      '2025-04': { revenue: 300, event: '$300M ARR' }
    };

    const interpolateRevenue = (date) => {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (keyEvents[key]) return keyEvents[key].revenue;

      // Linear interpolation between key events
      const dateValue = date.getTime();
      let prevEvent = null;
      let nextEvent = null;

      // Find surrounding events
      Object.entries(keyEvents).forEach(([eventKey, event]) => {
        const eventDate = new Date(eventKey + '-01');
        if (eventDate <= date && (!prevEvent || new Date(prevEvent.key + '-01') < eventDate)) {
          prevEvent = { key: eventKey, ...event };
        }
        if (eventDate > date && (!nextEvent || new Date(nextEvent.key + '-01') > eventDate)) {
          nextEvent = { key: eventKey, ...event };
        }
      });

      if (!prevEvent) return 0;
      if (!nextEvent) return prevEvent.revenue;

      const prevDate = new Date(prevEvent.key + '-01').getTime();
      const nextDate = new Date(nextEvent.key + '-01').getTime();
      const progress = (dateValue - prevDate) / (nextDate - prevDate);
      
      return prevEvent.revenue + (nextEvent.revenue - prevEvent.revenue) * progress;
    };

    // Start exactly at Jan 2022
    let currentDate = new Date(2022, 0, 1); // January 1, 2022
    while (currentDate <= endDate) {
      const key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const month = currentDate.toLocaleString('default', { month: 'short' });
      const year = currentDate.getFullYear();
      const formattedDate = `${month} ${year}`;
      
      const revenue = interpolateRevenue(currentDate);
      data.push({
        date: formattedDate,
        name: formattedDate,
        revenue: Number(revenue.toFixed(2)),
        event: keyEvents[key]?.event || ''
      });

      currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    }
    
    return data;
  };

  const data = generateMonthlyData();
  const ANTHROPIC_ORANGE = '#FF8200';

  const formatYAxis = (value) => {
    if (value === 0) return '$0';
    return `$${value}M`;
  };

  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem.replace(' ', ' 1, '));
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    
    // Show January with year and April, July, October without year
    if (month === 'Jan') {
      return `${month} ${year}`;
    }
    if (['Apr', 'Jul', 'Oct'].includes(month)) {
      return month;
    }
    return '';
  };

  return (
    <div className="flex flex-col bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Cursor Revenue Growth Timeline</h2>
      <p className="text-center text-gray-600 mb-6">From founding to $300M ARR in just over 3 years</p>

      <div className="h-[500px] w-full bg-white">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 40, right: 60, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.6} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#4b5563' }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
              tickFormatter={formatXAxis}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
              padding={{ left: 0, right: 10 }}
              domain={['Jan 2022', 'dataMax']}
              scale="point"
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: '#4b5563' }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
              domain={[0, 320]}
              ticks={[0, 80, 160, 240, 320]}
            />
            <Line
              type="monotoneX"
              dataKey="revenue"
              name="Annual Recurring Revenue"
              stroke={ANTHROPIC_ORANGE}
              strokeWidth={3}
              dot={<CustomizedDot />}
              isAnimationActive={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Founded in 2022 by Michael Truell, Sualeh Asif, Arvid Lunnemark, and Aman Sanger</p>
      </div>
    </div>
  );
} 