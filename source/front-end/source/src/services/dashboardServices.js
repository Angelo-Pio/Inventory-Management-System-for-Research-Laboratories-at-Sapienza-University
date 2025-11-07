import { apiCall } from "./api";

const getRequestsGraphData = async (departmentId) => {
  return await apiCall(`/management/${departmentId}/graphdata/requests`, {
    method: "GET",
  });
};

/**
 * Summarize requests and produce data array aligned to today.
 * data[29] === today, data[0] === today - 29 days (30-day window)
 */
export const summarizeRequests = async (departmentId) => {
  const defaultResult = {
    value: 0,
    interval: 30,
    trend: "neutral",
    data: Array(30).fill(0),
    labels: Array.from({ length: 30 }, (_, i) => null),
    windowDiff: 0,
  };

  try {
    const resp = await getRequestsGraphData(departmentId);
    const response = Array.isArray(resp) ? resp : resp?.data ?? [];

    if (!Array.isArray(response) || response.length === 0) return defaultResult;

    // group items by UTC date key YYYY-MM-DD
    const dateKey = (ts) => new Date(ts).toISOString().slice(0, 10);
    const countsByDate = response.reduce((acc, item) => {
      const parsed = Date.parse(item.created_at);
      if (!Number.isFinite(parsed)) return acc;
      const key = dateKey(parsed);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // Today (UTC normalized)
    const now = new Date();
    const normalizeToUTCDate = (d) =>
      new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const todayUtc = normalizeToUTCDate(now);

    const msPerDay = 24 * 60 * 60 * 1000;

    // Build labels and counts for last 30 days where index 29 = today
    const data = new Array(30);
    const labels = new Array(30);
    for (let i = 0; i < 30; i++) {
      const daysBefore = 29 - i; // i=29 -> 0 daysBefore -> today; i=0 -> 29 days before
      const day = new Date(todayUtc.getTime() - daysBefore * msPerDay);
      const key = day.toISOString().slice(0, 10);
      labels[i] = key;
      data[i] = countsByDate[key] || 0;
    }
    console.log(labels);

    // compute earliest/latest timestamps for interval calculation (unchanged)
    const timestamps = response
      .map((d) => {
        const t = Date.parse(d.created_at);
        return Number.isFinite(t) ? t : null;
      })
      .filter((t) => t != null)
      .sort((a, b) => a - b);

      
    if (timestamps.length === 0)
      return {
        value: response.length,
        interval: 30,
        trend: "neutral",
        data,
        labels,
        windowDiff: 0,
      };

    const earliestTs = timestamps[0];
    const latestTs = timestamps[timestamps.length - 1];

    // day difference between earliest and latest
    const dayDiff = Math.floor((latestTs - earliestTs) / msPerDay);
    const interval = Math.max(30, dayDiff);

    // earliest/latest date counts (use UTC date keys)
    const earliestDate = dateKey(earliestTs);
    const latestDate = dateKey(latestTs);
    const earliestCount = countsByDate[earliestDate] || 0;
    const latestCount = countsByDate[latestDate] || 0;

    // NEW: compute windowDiff from last 30 endpoints and derive trend from that
    const windowDiff = (data[29] || 0) - (data[0] || 0);
    const firstDay = data[0] || 0;
    const lastDay = data[29] || 0;

    let trendValues;
    if (firstDay === 0) {
      trendValues = lastDay === 0 ? 0 : lastDay*100; // from 0 to something = +100%
    } else {
      trendValues = ((lastDay - firstDay) / firstDay) * 100;
    }
    trendValues = String(trendValues+"%")

    let trend;
    if (windowDiff > 5) trend = "up";
    else if (windowDiff < -4) trend = "down";
    else trend = "neutral";
    
    console.log({ title: "Total Requests",

      value: response.length,
      interval,
      trend,
      data,
      uniqueId: 1,});
    return {
      title: "Total Requests",

      value: response.length,
      interval:"Last 30 days",
      trend,
      data,
      trendValues,
      labels
      // earliestDate,
      // latestDate,
      // earliestCount,
      // latestCount,
      // dayDiff,
      // // legacy diff kept for reference (latest - earliest)
      // diff: latestCount - earliestCount,
      // // new window-based diff
      // windowDiff,
      // labels,
    };
  } catch (err) {
    console.error("Failed to summarize requests", err);
    return defaultResult;
  }
};
