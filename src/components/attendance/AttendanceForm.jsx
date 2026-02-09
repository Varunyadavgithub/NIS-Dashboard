import { useState } from "react";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import { HiOutlineSave, HiOutlineX } from "react-icons/hi";

const statusOptions = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "leave", label: "On Leave" },
  { value: "half_day", label: "Half Day" },
];

const AttendanceForm = ({
  guards,
  onSubmit,
  onCancel,
  loading,
  selectedDate,
}) => {
  const [formData, setFormData] = useState({
    guardId: "",
    date: selectedDate || new Date().toISOString().split("T")[0],
    checkIn: "",
    checkOut: "",
    status: "present",
    notes: "",
  });
  const [errors, setErrors] = useState({});

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
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.status) newErrors.status = "Status is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateHours = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(`2000-01-01T${formData.checkIn}`);
      const checkOut = new Date(`2000-01-01T${formData.checkOut}`);
      let diff = (checkOut - checkIn) / (1000 * 60 * 60);
      if (diff < 0) diff += 24;
      return diff.toFixed(2);
    }
    return 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const selectedGuard = guards.find(
        (g) => g.id === parseInt(formData.guardId),
      );
      const hoursWorked = parseFloat(calculateHours());

      onSubmit({
        ...formData,
        guardId: parseInt(formData.guardId),
        guardName: selectedGuard?.name || "",
        location: selectedGuard?.assignedTo || "",
        hoursWorked,
        overtime: Math.max(0, hoursWorked - 8),
      });
    }
  };

  const guardOptions = guards.map((g) => ({
    value: g.id.toString(),
    label: `${g.name} - ${g.assignedTo || "Unassigned"}`,
  }));

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
        <Input
          label="Date *"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          error={errors.date}
        />
        <Input
          label="Check In Time"
          name="checkIn"
          type="time"
          value={formData.checkIn}
          onChange={handleChange}
        />
        <Input
          label="Check Out Time"
          name="checkOut"
          type="time"
          value={formData.checkOut}
          onChange={handleChange}
        />
        <Select
          label="Status *"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          error={errors.status}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Hours Worked
          </label>
          <div className="px-4 py-2.5 bg-gray-100 rounded-lg text-gray-900 font-medium">
            {calculateHours()} hours
          </div>
        </div>
      </div>

      <Input
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Any additional notes..."
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          <HiOutlineX className="w-5 h-5" />
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          <HiOutlineSave className="w-5 h-5" />
          Mark Attendance
        </Button>
      </div>
    </form>
  );
};

export default AttendanceForm;
