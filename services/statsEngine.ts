
import { Transaction, Translations } from '../types';

export interface DetailedStats {
    tripCount: number;
    sortedDays: [string, number][]; // Top 5 Days
    sortedMonths: { name: string, count: number }[]; // Top 5 Months
    topStopsAll: [string, number][]; // Top 10 Stops
    topStopsMonthly: { month: string, stops: [string, number][] }[]; // Top 3 per month
    topOperators: [string, number][]; // All operators sorted
    maxStreak: number;
    maxStreakTrips: number;
    streakList: { days: number, trips: number, start: string, end: string }[]; // Top 3 Streaks
    totalSpent: number;
    monthlySpendingList: { name: string, amount: number, rawDate: Date }[];
    topSpendingDays: [string, number][]; // Top 5
    topSpendingOperators: [string, number][]; // Top 5
    operatorTrips: Record<string, number>;
    // New stats
    timeOfDay: { name: string, value: number, color: string }[];
    weekdayUsage: { name: string, value: number }[];
    chronologicalTrips: { name: string, trips: number, rawDate: Date }[];
}

export const calculateStats = (transactions: Transaction[], t: Translations): DetailedStats => {
  // 1. Total Trips Logic
  let tripCount = 0;
  
  const isTrip = (type: string) => {
      const lower = type.toLowerCase();
      return (lower.includes('validacionentrada') || lower.includes('validacionunica')) && !lower.includes('validacionsalida');
  };

  transactions.forEach(tx => {
    if (isTrip(tx.type)) {
      tripCount++;
    }
  });

  // 2. Date Aggregations
  const tripsByDate: Record<string, number> = {};
  const tripsByMonth: Record<string, number> = {};
  const tripsByMonthKey: Record<string, number> = {}; // For chart
  
  // Time of Day buckets
  // Morning: 06-14, Afternoon: 14-22, Night: 22-06
  let morningCount = 0;
  let afternoonCount = 0;
  let nightCount = 0;

  // Weekday 0-6
  const tripsByWeekday = [0, 0, 0, 0, 0, 0, 0];

  const getDayKey = (d: Date) => d.toISOString().split('T')[0];
  const getMonthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

  transactions.forEach(tx => {
    if (isTrip(tx.type)) {
      const dayKey = getDayKey(tx.date);
      const monthKey = getMonthKey(tx.date);
      
      tripsByDate[dayKey] = (tripsByDate[dayKey] || 0) + 1;
      tripsByMonth[monthKey] = (tripsByMonth[monthKey] || 0) + 1;
      tripsByMonthKey[monthKey] = (tripsByMonthKey[monthKey] || 0) + 1;

      // Time of Day
      const h = tx.date.getHours();
      if (h >= 6 && h < 14) morningCount++;
      else if (h >= 14 && h < 22) afternoonCount++;
      else nightCount++;

      // Weekday
      tripsByWeekday[tx.date.getDay()]++;
    }
  });

  const sortedDays = Object.entries(tripsByDate)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([dateStr, count]) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        return [`${d}/${m}/${y}`, count] as [string, number];
    });

  const sortedMonths = Object.entries(tripsByMonth)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([key, count]) => {
        const [y, m] = key.split('-');
        return { name: `${t.month_names[parseInt(m)]} ${y}`, count };
    });

  // Chronological chart data
  const chronologicalTrips = Object.entries(tripsByMonthKey).map(([key, count]) => {
      const [y, m] = key.split('-');
      return { 
          name: `${t.month_names[parseInt(m)].substring(0,3)} ${y.substring(2)}`,
          trips: count,
          rawDate: new Date(parseInt(y), parseInt(m))
      };
  })
  .sort((a,b) => a.rawDate.getTime() - b.rawDate.getTime());

  // Time of Day Data
  const timeOfDay = [
      { name: t.morning, value: morningCount, color: '#FFB347' }, // Pastel Orange
      { name: t.afternoon, value: afternoonCount, color: '#da291c' }, // Barik Red
      { name: t.night, value: nightCount, color: '#2C3E50' } // Dark Blue/Gray
  ];

  // Weekday Data
  const weekdayUsage = tripsByWeekday.map((val, idx) => ({
      name: t.weekday_names[idx],
      value: val
  }));

  // 3. Stops
  const stopsAll: Record<string, number> = {};
  const stopsByMonth: Record<string, Record<string, number>> = {};

  transactions.forEach(tx => {
    const stop = tx.location.trim();
    if (!stop || stop.length < 2) return;

    stopsAll[stop] = (stopsAll[stop] || 0) + 1;

    const monthKey = getMonthKey(tx.date);
    if (!stopsByMonth[monthKey]) stopsByMonth[monthKey] = {};
    stopsByMonth[monthKey][stop] = (stopsByMonth[monthKey][stop] || 0) + 1;
  });

  const topStopsAll = Object.entries(stopsAll)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const topStopsMonthly = Object.entries(stopsByMonth).map(([key, stops]) => {
    const [y, m] = key.split('-');
    const top3 = Object.entries(stops)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);
    return {
        month: `${t.month_names[parseInt(m)]} ${y}`,
        stops: top3,
        rawDate: new Date(parseInt(y), parseInt(m))
    };
  })
  .sort((a,b) => b.rawDate.getTime() - a.rawDate.getTime())
  .map(({month, stops}) => ({month, stops}));

  // 4. Operators
  const operatorTrips: Record<string, number> = {};
  transactions.forEach(tx => {
      if (isTrip(tx.type)) {
        operatorTrips[tx.operator] = (operatorTrips[tx.operator] || 0) + 1;
      }
  });
  const topOperators = Object.entries(operatorTrips)
    .sort(([, a], [, b]) => b - a);

  // 5. Streaks
  const datesWithTrips = new Set<string>();
  transactions.forEach(tx => {
      if (isTrip(tx.type)) {
        datesWithTrips.add(getDayKey(tx.date));
      }
  });
  const sortedDateStrings = Array.from(datesWithTrips).sort();

  let streakList: { days: number, trips: number, start: string, end: string }[] = [];
  
  if (sortedDateStrings.length > 0) {
      let currentStart = sortedDateStrings[0];
      let currentCount = 1;
      let currentTrips = tripsByDate[sortedDateStrings[0]];
      let prevDate = new Date(sortedDateStrings[0]);

      for (let i = 1; i < sortedDateStrings.length; i++) {
          const currStr = sortedDateStrings[i];
          const currDate = new Date(currStr);
          const diffTime = currDate.getTime() - prevDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 3600 * 24)); 

          if (diffDays === 1) {
              currentCount++;
              currentTrips += tripsByDate[currStr];
          } else {
              streakList.push({ 
                  days: currentCount, 
                  trips: currentTrips, 
                  start: currentStart, 
                  end: sortedDateStrings[i-1] 
              });
              currentStart = currStr;
              currentCount = 1;
              currentTrips = tripsByDate[currStr];
          }
          prevDate = currDate;
      }
      streakList.push({ 
          days: currentCount, 
          trips: currentTrips, 
          start: currentStart, 
          end: sortedDateStrings[sortedDateStrings.length-1] 
      });
  }

  streakList.sort((a, b) => {
      if (b.days !== a.days) return b.days - a.days;
      return b.trips - a.trips;
  });

  const top3Streaks = streakList.slice(0, 3);
  const maxStreak = top3Streaks[0]?.days || 0;
  const maxStreakTrips = top3Streaks[0]?.trips || 0;

  // 6. Money
  let totalSpent = 0;
  const spendingByMonth: Record<string, number> = {};
  const spendingByDay: Record<string, number> = {};
  const spendingByOperator: Record<string, number> = {};

  transactions.forEach(tx => {
    totalSpent += tx.amount;
    
    const monthKey = getMonthKey(tx.date);
    spendingByMonth[monthKey] = (spendingByMonth[monthKey] || 0) + tx.amount;

    const dayKey = getDayKey(tx.date);
    spendingByDay[dayKey] = (spendingByDay[dayKey] || 0) + tx.amount;

    spendingByOperator[tx.operator] = (spendingByOperator[tx.operator] || 0) + tx.amount;
  });

  const topSpendingDays = Object.entries(spendingByDay)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([dateStr, amount]) => {
         const [y, m, d] = dateStr.split('-').map(Number);
         return [`${d}/${m}/${y}`, amount] as [string, number];
    });

  const topSpendingOperators = Object.entries(spendingByOperator)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const monthlySpendingList = Object.entries(spendingByMonth).map(([key, amount]) => {
      const [y, m] = key.split('-');
      return { 
          name: `${t.month_names[parseInt(m)]} ${y}`, 
          amount,
          rawDate: new Date(parseInt(y), parseInt(m))
      };
  })
  .sort((a,b) => a.rawDate.getTime() - b.rawDate.getTime());

  return {
    tripCount,
    sortedDays,
    sortedMonths,
    topStopsAll,
    topStopsMonthly,
    topOperators,
    maxStreak,
    maxStreakTrips,
    streakList: top3Streaks,
    totalSpent,
    monthlySpendingList,
    topSpendingDays,
    topSpendingOperators,
    operatorTrips,
    timeOfDay,
    weekdayUsage,
    chronologicalTrips
  };
};
