import { useState, useEffect } from "react";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import { HiOutlineSave, HiOutlineX } from "react-icons/hi";

const initialFormData = {
  guardId: "",
  clientId: "",
  location: "",
  shift: "",
  shiftTime: "",
  startDate: "",
  status: "active",
};

const shiftOptions = [
  { value: "day", label: "Day Shift" },
  { value: "evening", label: "Evening Shift" },
  { value: "night", label: "Night Shift" },
];

const shiftTimeOptions = [
  { value: "06:00 - 14:00", label: "06:00 AM - 02:00 PM" },
  { value: "08:00 - 16:00", label: "08:00 AM - 04:00 PM" },
  { value: "14:00 - 22:00", label: "02:00 PM - 10:00 PM" },
  { value: "22:00 - 06:00", label: "10:00 PM - 06:00 AM" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "on_leave", label: "On Leave" },
];

const DeploymentForm = ({
  deployment,
  guards,
  clients,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (deployment) {
      setFormData({
        ...initialFormData,
        ...deployment,
        guardId: deployment.guardId?.toString() || "",
        clientId: deployment.clientId?.toString() || "",
      });
    }
  }, [deployment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.guardId) newErrors.guardId = "Guard is required";
    if (!formData.clientId) newErrors.clientId = "Client is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.shift) newErrors.shift = "Shift is required";
    if (!formData.shiftTime) newErrors.shiftTime = "Shift time is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const selectedGuard = guards.find(
        (g) => g.id === parseInt(formData.guardId),
      );
      const selectedClient = clients.find(
        (c) => c.id === parseInt(formData.clientId),
      );

      onSubmit({
        ...formData,
        guardId: parseInt(formData.guardId),
        clientId: parseInt(formData.clientId),
        guardName: selectedGuard?.name || "",
        clientName: selectedClient?.name || "",
      });
    }
  };

  const guardOptions = guards
    .filter((g) => g.status === "active")
    .map((g) => ({ value: g.id.toString(), label: `${g.name} (${g.phone})` }));

  const clientOptions = clients
    .filter((c) => c.status === "active")
    .map((c) => ({ value: c.id.toString(), label: c.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Select Guard *"
          name="guardId"
          value={formData.guardId}
          onChange={handleChange}
          options={guardOptions}
          placeholder="Select a guard"
          error={errors.guardId}
        />
        <Select
          label="Select Client *"
          name="clientId"
          value={formData.clientId}
          onChange={handleChange}
          options={clientOptions}
          placeholder="Select a client"
          error={errors.clientId}
        />
        <Input
          label="Location/Post *"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g., Main Gate, Parking Area"
          error={errors.location}
        />
        <Select
          label="Shift *"
          name="shift"
          value={formData.shift}
          onChange={handleChange}
          options={shiftOptions}
          placeholder="Select shift"
          error={errors.shift}
        />
        <Select
          label="Shift Timing *"
          name="shiftTime"
          value={formData.shiftTime}
          onChange={handleChange}
          options={shiftTimeOptions}
          placeholder="Select timing"
          error={errors.shiftTime}
        />
        <Input
          label="Start Date *"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          error={errors.startDate}
        />
        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          <HiOutlineX className="w-5 h-5" />
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          <HiOutlineSave className="w-5 h-5" />
          {deployment ? "Update Deployment" : "Create Deployment"}
        </Button>
      </div>
    </form>
  );
};

export default DeploymentForm;
