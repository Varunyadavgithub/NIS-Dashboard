import {
  HiOutlineUserAdd,
  HiOutlineLocationMarker,
  HiOutlineCash,
  HiOutlineClipboardCheck,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";

const activityIcons = {
  guard_added: HiOutlineUserAdd,
  deployment: HiOutlineLocationMarker,
  payment: HiOutlineCash,
  attendance: HiOutlineClipboardCheck,
  client_added: HiOutlineOfficeBuilding,
};

const activityColors = {
  guard_added: "bg-blue-100 text-blue-600",
  deployment: "bg-green-100 text-green-600",
  payment: "bg-purple-100 text-purple-600",
  attendance: "bg-yellow-100 text-yellow-600",
  client_added: "bg-orange-100 text-orange-600",
};

const RecentActivities = ({ activities }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activities
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type] || HiOutlineClipboardCheck;
          const colorClass =
            activityColors[activity.type] || "bg-gray-100 text-gray-600";

          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <button className="w-full mt-4 text-center text-sm text-primary-600 font-medium hover:text-primary-700">
        View all activities
      </button>
    </div>
  );
};

export default RecentActivities;
