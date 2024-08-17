import { subYears, subMonths, subWeeks, format, startOfDay } from "date-fns";

export const getContributionsForPeriod = (
  period: "week" | "month" | "year",
  data: { date: Date; count: number }[]
) => {
  const endDate = new Date();
  let startDate: Date;

  switch (period) {
    case "week":
      startDate = subWeeks(endDate, 1);
      break;
    case "month":
      startDate = subMonths(endDate, 1);
      break;
    case "year":
      startDate = subYears(endDate, 1);
      break;
    default:
      startDate = subYears(endDate, 1);
  }

  return data
    .filter(({ date }) => {
      const contributionDate = startOfDay(new Date(date));
      return contributionDate >= startDate && contributionDate <= endDate;
    })
    .reduce((sum, day) => sum + day.count, 0);
};

export const toggleView = (
  currentView: "week" | "month" | "year",
  setViewFunction: React.Dispatch<
    React.SetStateAction<"week" | "month" | "year">
  >
) => {
  const views: ("week" | "month" | "year")[] = ["week", "month", "year"];
  const currentIndex = views.indexOf(currentView);
  const nextIndex = (currentIndex + 1) % views.length;
  setViewFunction(views[nextIndex]);
};

export const preprocessContributions = (
  contributions: { date: Date; count: number }[]
) => {
  return contributions.map((contribution) => {
    let date = contribution.date;
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return {
      ...contribution,
      date: startOfDay(date),
    };
  });
};

export const getContributionsPeriod = (view: "week" | "month" | "year") => {
  const endDate = new Date();
  let startDate: Date;

  switch (view) {
    case "week":
      startDate = subWeeks(endDate, 1);
      break;
    case "month":
      startDate = subMonths(endDate, 1);
      break;
    case "year":
      startDate = subYears(endDate, 1);
      break;
  }

  return `${format(startDate, "MMM d, yyyy")} to ${format(
    endDate,
    "MMM d, yyyy"
  )}`;
};
