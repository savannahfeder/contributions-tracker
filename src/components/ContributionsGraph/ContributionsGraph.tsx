import React from "react";
import { eachDayOfInterval, format, subDays } from "date-fns";
import ContributionCell from "./ContributionCell";
import { Contribution } from "../../hooks/useFetchGithubContributions";
import { getStartDate } from "../../utils/contributionsUtils";

interface ContributionDay {
  date: Date;
  count: number;
}

interface ContributionsGraphProps {
  data: Contribution[];
  darkMode: boolean;
  view: "week" | "month" | "year";
}

const ContributionsGraph: React.FC<ContributionsGraphProps> = ({
  data,
  darkMode,
  view,
}) => {
  const endDate = new Date();
  const startDate =
    view === "year"
      ? getStartDate(view)
      : subDays(endDate, view === "week" ? 6 : 30);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayData = (date: Date): Contribution => {
    const dateKey = format(date, "yyyy-MM-dd");
    const foundDay = data.find(
      (day) => format(day.date, "yyyy-MM-dd") === dateKey
    );
    return foundDay || { date, count: 0 };
  };

  const getGridClasses = () => {
    switch (view) {
      case "week":
        return "grid-cols-7 gap-3";
      case "month":
        return "grid-cols-7 gap-2";
      default:
        return "grid-cols-[repeat(53,_1fr)] gap-1";
    }
  };

  const getContainerClasses = () => {
    switch (view) {
      case "week":
        return "px-24 py-16";
      case "month":
        return "px-28 py-14";
      default:
        return "px-10 py-8";
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className={`inline-block ${getContainerClasses()}`}>
        <div className={`inline-grid ${getGridClasses()}`}>
          {days.map((day, index) => {
            const { count } = getDayData(day);
            return (
              <ContributionCell
                key={index}
                day={day}
                count={count}
                darkMode={darkMode}
                view={view}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContributionsGraph;
