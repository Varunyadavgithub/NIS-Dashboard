import React from "react";
import {
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineIdentification,
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlineHeart,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { formatCurrency, formatDate } from "../../utils/helpers";

const GuardDetails = ({ guard, onEdit, onClose }) => {
  const statusVariant = {
    active: "success",
    inactive: "default",
    on_leave: "warning",
    terminated: "danger",
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
        <img
          src={
            guard.photo ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(guard.name)}&background=3b82f6&color=fff&size=96`
          }
          alt={guard.name}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-bold text-gray-900">{guard.name}</h2>
          <p className="text-gray-500">
            GRD-{guard.id.toString().padStart(4, "0")}
          </p>
          <Badge variant={statusVariant[guard.status]} className="mt-2">
            {guard.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <InfoItem
          icon={HiOutlinePhone}
          label="Phone Number"
          value={guard.phone}
        />
        <InfoItem icon={HiOutlineMail} label="Email" value={guard.email} />
        <InfoItem
          icon={HiOutlineIdentification}
          label="Aadhar Number"
          value={guard.aadhar}
        />
        <InfoItem
          icon={HiOutlineHeart}
          label="Blood Group"
          value={guard.bloodGroup}
        />
        <InfoItem
          icon={HiOutlineBriefcase}
          label="Experience"
          value={`${guard.experience} years`}
        />
        <InfoItem
          icon={HiOutlineCash}
          label="Monthly Salary"
          value={formatCurrency(guard.salary)}
        />
        <InfoItem
          icon={HiOutlineCalendar}
          label="Join Date"
          value={formatDate(guard.joinDate)}
        />
        <InfoItem
          icon={HiOutlinePhone}
          label="Emergency Contact"
          value={guard.emergencyContact}
        />
      </div>

      <InfoItem
        icon={HiOutlineLocationMarker}
        label="Address"
        value={guard.address}
      />

      {/* Certifications */}
      {guard.certifications && guard.certifications.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineShieldCheck className="w-5 h-5 text-gray-600" />
            <p className="font-medium text-gray-900">Certifications</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {guard.certifications.map((cert) => (
              <Badge key={cert} variant="primary">
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Assignment */}
      {guard.assignedTo && (
        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-600 mb-1">Currently Assigned To</p>
          <p className="font-semibold text-primary-900">{guard.assignedTo}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        {onEdit && <Button onClick={() => onEdit(guard)}>Edit Guard</Button>}
      </div>
    </div>
  );
};

export default GuardDetails;
