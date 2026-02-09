import { HiArrowUp, HiArrowDown } from "react-icons/hi";

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = "primary",
  prefix = "",
  suffix = "",
}) => {
  const colors = {
    primary: "bg-primary-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500",
  };

  const lightColors = {
    primary: "bg-primary-50",
    green: "bg-green-50",
    yellow: "bg-yellow-50",
    red: "bg-red-50",
    purple: "bg-purple-50",
    blue: "bg-blue-50",
    orange: "bg-orange-50",
  };

  const iconColors = {
    primary: "text-primary-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
    purple: "text-purple-600",
    blue: "text-blue-600",
    orange: "text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {prefix}
            {typeof value === "number" ? value.toLocaleString("en-IN") : value}
            {suffix}
          </p>
          {trendValue && (
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <HiArrowUp className="w-4 h-4 text-green-500" />
              ) : (
                <HiArrowDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {trendValue}
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${lightColors[color]}`}>
          <Icon className={`w-6 h-6 ${iconColors[color]}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
