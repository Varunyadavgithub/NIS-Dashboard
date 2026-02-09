import  { useState, useEffect } from "react";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import { HiOutlineSave, HiOutlineX } from "react-icons/hi";
import { formatCurrency } from "../../utils/helpers";

const monthOptions = [
  { value: "January 2024", label: "January 2024" },
  { value: "February 2024", label: "February 2024" },
  { value: "March 2024", label: "March 2024" },
  { value: "April 2024", label: "April 2024" },
  { value: "May 2024", label: "May 2024" },
  { value: "June 2024", label: "June 2024" },
  { value: "July 2024", label: "July 2024" },
  { value: "August 2024", label: "August 2024" },
  { value: "September 2024", label: "September 2024" },
  { value: "October 2024", label: "October 2024" },
  { value: "November 2024", label: "November 2024" },
  { value: "December 2024", label: "December 2024" },
];

const PayrollForm = ({ payroll, guards, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    guardId: "",
    month: "",
    baseSalary: "",
    overtime: "0",
    bonus: "0",
    deductions: "0",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (payroll) {
      setFormData({
        guardId: payroll.guardId?.toString() || "",
        month: payroll.month || "",
        baseSalary: payroll.baseSalary?.toString() || "",
        overtime: payroll.overtime?.toString() || "0",
        bonus: payroll.bonus?.toString() || "0",
        deductions: payroll.deductions?.toString() || "0",
      });
    }
  }, [payroll]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Auto-fill base salary when guard is selected
    if (name === "guardId") {
      const selectedGuard = guards.find((g) => g.id === parseInt(value));
      if (selectedGuard) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          baseSalary: selectedGuard.salary?.toString() || "",
        }));
      }
    }
  };

  const calculateNetSalary = () => {
    const base = parseFloat(formData.baseSalary) || 0;
    const overtime = parseFloat(formData.overtime) || 0;
    const bonus = parseFloat(formData.bonus) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    return base + overtime + bonus - deductions;
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.guardId) newErrors.guardId = "Guard is required";
    if (!formData.month) newErrors.month = "Month is required";
    if (!formData.baseSalary) newErrors.baseSalary = "Base salary is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const selectedGuard = guards.find(
        (g) => g.id === parseInt(formData.guardId),
      );

      onSubmit({
        ...formData,
        guardId: parseInt(formData.guardId),
        guardName: selectedGuard?.name || "",
        baseSalary: parseFloat(formData.baseSalary) || 0,
        overtime: parseFloat(formData.overtime) || 0,
        bonus: parseFloat(formData.bonus) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        netSalary: calculateNetSalary(),
        status: "pending",
        paidDate: null,
      });
    }
  };

  const guardOptions = guards.map((g) => ({
    value: g.id.toString(),
    label: `${g.name} - ${formatCurrency(g.salary)}/month`,
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
        <Select
          label="Month *"
          name="month"
          value={formData.month}
          onChange={handleChange}
          options={monthOptions}
          placeholder="Select month"
          error={errors.month}
        />
        <Input
          label="Base Salary (₹) *"
          name="baseSalary"
          type="number"
          value={formData.baseSalary}
          onChange={handleChange}
          placeholder="15000"
          error={errors.baseSalary}
        />
        <Input
          label="Overtime Pay (₹)"
          name="overtime"
          type="number"
          value={formData.overtime}
          onChange={handleChange}
          placeholder="0"
        />
        <Input
          label="Bonus (₹)"
          name="bonus"
          type="number"
          value={formData.bonus}
          onChange={handleChange}
          placeholder="0"
        />
        <Input
          label="Deductions (₹)"
          name="deductions"
          type="number"
          value={formData.deductions}
          onChange={handleChange}
          placeholder="0"
        />
      </div>

      {/* Net Salary Preview */}
      <div className="p-4 bg-primary-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-primary-700 font-medium">Net Salary</span>
          <span className="text-2xl font-bold text-primary-900">
            {formatCurrency(calculateNetSalary())}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          <HiOutlineX className="w-5 h-5" />
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          <HiOutlineSave className="w-5 h-5" />
          {payroll ? "Update Payroll" : "Create Payroll"}
        </Button>
      </div>
    </form>
  );
};

export default PayrollForm;
