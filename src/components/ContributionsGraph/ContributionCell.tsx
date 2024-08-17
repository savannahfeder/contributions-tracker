import React, { useState } from "react";
import { format } from "date-fns";

interface ContributionCellProps {
  day: Date;
  count: number;
  darkMode: boolean;
  view: "week" | "month" | "year";
}

const ContributionCell: React.FC<ContributionCellProps> = ({
  day,
  count,
  darkMode,
  view,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getContributionLevel = (count: number): string => {
    if (darkMode) {
      if (count === 0) return "bg-gray-800";
      if (count < 5) return "bg-green-900";
      if (count < 10) return "bg-green-700";
      return "bg-green-500";
    } else {
      if (count === 0) return "bg-gray-100";
      if (count < 5) return "bg-green-200";
      if (count < 10) return "bg-green-300";
      return "bg-green-500";
    }
  };

  const getSizeClasses = () => {
    switch (view) {
      case "week":
        return "w-12 h-12 rounded-lg";
      case "month":
        return "w-8 h-8 rounded-md";
      default:
        return "w-[1.05875rem] h-[1.05875rem] rounded-[0.242rem]";
    }
  };

  const getTooltipOffset = () => {
    switch (view) {
      case "week":
        return "calc(100% + 12px)";
      case "month":
        return "calc(100% + 10px)";
      default:
        return "calc(100% + 8px)";
    }
  };

  return (
    <div className="relative group">
      <div
        className={`${getSizeClasses()} ${getContributionLevel(count)}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      ></div>
      {showTooltip && (
        <div
          className={`absolute z-10 px-2 py-1 text-xs whitespace-nowrap rounded ${
            darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800"
          } shadow-md transition-opacity duration-150 opacity-0 group-hover:opacity-100`}
          style={{
            bottom: getTooltipOffset(),
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {`${count} contribution${count !== 1 ? "s" : ""} on ${format(
            day,
            "MMM d"
          )}`}
        </div>
      )}
    </div>
  );
};

export default ContributionCell;
