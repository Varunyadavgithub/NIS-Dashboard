import {
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { formatCurrency, formatDate } from "../../utils/helpers";

const ClientDetails = ({ client, onEdit, onClose }) => {
  const statusVariant = {
    active: "success",
    inactive: "default",
    pending: "warning",
  };

  const paymentVariant = {
    paid: "success",
    pending: "warning",
    overdue: "danger",
  };

  const typeVariant = {
    company: "info",
    society: "purple",
    industry: "orange",
  };

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-100 rounded-lg">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value || "-"}</p>
      </div>
    </div>
  );

  const guardsFilled = (client.guardsDeployed / client.guardsRequired) * 100;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-gray-900">{client.name}</h2>
            <Badge variant={typeVariant[client.type]}>{client.type}</Badge>
          </div>
          <p className="text-gray-500">
            CLT-{client.id.toString().padStart(4, "0")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={statusVariant[client.status]}>{client.status}</Badge>
          <Badge variant={paymentVariant[client.paymentStatus]}>
            Payment: {client.paymentStatus}
          </Badge>
        </div>
      </div>

      {/* Guards Progress */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Guards Deployed
          </span>
          <span className="text-sm font-medium text-gray-900">
            {client.guardsDeployed} / {client.guardsRequired}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              guardsFilled >= 100
                ? "bg-green-500"
                : guardsFilled >= 75
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
            style={{ width: `${Math.min(guardsFilled, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <InfoItem
          icon={HiOutlineOfficeBuilding}
          label="Contact Person"
          value={client.contactPerson}
        />
        <InfoItem
          icon={HiOutlinePhone}
          label="Phone Number"
          value={client.phone}
        />
        <InfoItem icon={HiOutlineMail} label="Email" value={client.email} />
        <InfoItem
          icon={HiOutlineCash}
          label="Monthly Rate"
          value={formatCurrency(client.monthlyRate)}
        />
        <InfoItem
          icon={HiOutlineCalendar}
          label="Contract Start"
          value={formatDate(client.contractStart)}
        />
        <InfoItem
          icon={HiOutlineCalendar}
          label="Contract End"
          value={formatDate(client.contractEnd)}
        />
      </div>

      <InfoItem
        icon={HiOutlineLocationMarker}
        label="Address"
        value={client.address}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button onClick={() => onEdit(client)}>Edit Client</Button>
      </div>
    </div>
  );
};

export default ClientDetails;
