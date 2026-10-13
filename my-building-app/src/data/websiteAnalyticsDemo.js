// Synthetic frontend preview only. Replace this module with reviewed API data later.
export const DEMO_END_DATE = "2026-10-06";
export const analyticsPages = [
  { path: "/", title: "Homepage", weight: 34, position: 5.4 },
  { path: "/raising", title: "Browse campaigns", weight: 23, position: 7.8 },
  { path: "/how-to-start-a-raising", title: "How to raise funds", weight: 16, position: 9.2 },
  { path: "/about", title: "About MateBid", weight: 11, position: 6.3 },
  { path: "/how-to-contribute", title: "How to contribute", weight: 10, position: 11.6 },
  { path: "/contact", title: "Contact us", weight: 6, position: 8.5 },
];
export const devices = ["Mobile", "Desktop", "Tablet"];
export const channels = ["Organic search", "Direct", "Social", "Referral", "Email"];
export const queryNames = ["matebid", "crowdfunding india", "raise funds for startup", "verified fundraising campaigns", "how to contribute online"];
const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0);
export const percentage = (part, total) => total ? part / total * 100 : 0;

function allocate(total, weights) {
  const denominator = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((weight) => total * weight / denominator);
  const result = raw.map(Math.floor);
  const order = raw.map((value, index) => ({ index, fraction: value % 1 })).sort((a, b) => b.fraction - a.fraction);
  const remainder = total - result.reduce((a, b) => a + b, 0);
  for (let i = 0; i < remainder; i++) result[order[i].index]++;
  return result;
}

export const demoAnalyticsRows = Array.from({ length: 90 }, (_, day) => {
  const date = new Date(`${DEMO_END_DATE}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 89 + day);
  const dateKey = date.toISOString().slice(0, 10);
  return devices.flatMap((device, deviceIndex) => channels.flatMap((channel, channelIndex) => {
    const wave = 1 + Math.sin(day * 0.71) * 0.15 + Math.cos(day * 0.23) * 0.09;
    const total = Math.round((290 + day * 2.1) * [0.61, 0.33, 0.06][deviceIndex] * [0.48, 0.24, 0.14, 0.09, 0.05][channelIndex] * wave);
    const entries = allocate(total, analyticsPages.map((page) => page.weight));
    const exits = allocate(total, [25, 20, 18, 10, 12, 15]);
    return analyticsPages.map((page, pageIndex) => {
      const clicks = channelIndex === 0 ? Math.round(entries[pageIndex] * 0.88) : 0;
      const impressions = clicks ? Math.round(clicks / (0.048 - pageIndex * 0.004 + deviceIndex * 0.002)) : 0;
      return {
        date: dateKey, device, channel, page: page.path, title: page.title,
        entries: entries[pageIndex], exits: exits[pageIndex],
        views: Math.max(entries[pageIndex], exits[pageIndex]) + Math.round(entries[pageIndex] * (0.6 + pageIndex * 0.12)),
        engaged: Math.round(entries[pageIndex] * (0.76 - pageIndex * 0.045)),
        engagementSeconds: entries[pageIndex] * (85 - pageIndex * 7 + deviceIndex * 5),
        clicks, impressions, positionWeight: impressions * (page.position + Math.sin(day * 0.2) * 0.6),
      };
    });
  }));
}).flat();

export function summarize(rows) {
  const entries = sum(rows, "entries");
  const impressions = sum(rows, "impressions");
  const clicks = sum(rows, "clicks");
  return {
    clicks, impressions, entries, exits: sum(rows, "exits"), views: sum(rows, "views"),
    ctr: percentage(clicks, impressions),
    position: impressions ? sum(rows, "positionWeight") / impressions : null,
    engagementRate: percentage(sum(rows, "engaged"), entries),
    engagementSeconds: entries ? sum(rows, "engagementSeconds") / entries : 0,
    exitRate: percentage(sum(rows, "exits"), sum(rows, "views")),
  };
}

export function groupAnalytics(rows, key) {
  const groups = new Map();
  rows.forEach((row) => {
    if (!groups.has(row[key])) groups.set(row[key], []);
    groups.get(row[key]).push(row);
  });
  return Array.from(groups, ([name, members]) => ({ name, title: members[0].title, ...summarize(members) }));
}

export function getQueryPreview(rows) {
  const clicks = allocate(sum(rows, "clicks"), [33, 27, 19, 13, 8]);
  const impressions = allocate(sum(rows, "impressions"), [18, 31, 24, 17, 10]);
  return queryNames.map((name, index) => ({ name, clicks: clicks[index], impressions: impressions[index], ctr: percentage(clicks[index], impressions[index]) }));
}
