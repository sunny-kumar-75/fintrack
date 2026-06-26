export const getPeriodBoundaries = (period, startDateQuery, endDateQuery) => {
  const now = new Date();
  let currentStart, currentEnd, previousStart, previousEnd;

  if (startDateQuery && endDateQuery) {
    currentStart = new Date(startDateQuery);
    currentEnd = new Date(endDateQuery);
    currentEnd.setHours(23, 59, 59, 999);
    
    const diffTime = Math.abs(currentEnd - currentStart);
    previousStart = new Date(currentStart.getTime() - diffTime - 1);
    previousEnd = new Date(currentStart.getTime() - 1);
  } else {
    switch (period) {
      case 'daily':
        currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        previousStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        previousEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
        break;
      case 'weekly': {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
        currentStart = new Date(now.getFullYear(), now.getMonth(), diff);
        currentStart.setHours(0, 0, 0, 0);
        currentEnd = new Date(currentStart);
        currentEnd.setDate(currentStart.getDate() + 6);
        currentEnd.setHours(23, 59, 59, 999);

        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 7);
        previousEnd = new Date(currentEnd);
        previousEnd.setDate(previousEnd.getDate() - 7);
        break;
      }
      case 'monthly':
      default:
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
    }
  }

  return { currentStart, currentEnd, previousStart, previousEnd };
};
