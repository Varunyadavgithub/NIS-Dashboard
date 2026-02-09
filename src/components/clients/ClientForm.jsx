import { useState, useEffect } from "react";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import { HiOutlineSave, HiOutlineX } from "react-icons/hi";

const initialFormData = {
  name: "",
  type: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  guardsRequired: "",
  contractStart: "",
  contractEnd: "",
  monthlyRate: "",
  status: "active",
};

const typeOptions = [
  { value: "company", label: "Company" },
  { value: "society", label: "Society" },
  { value: "industry", label: "Industry" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

const ClientForm = ({ client, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      setFormData({
        ...initialFormData,
        ...client,
        guardsRequired: client.guardsRequired?.toString() || "",
        monthlyRate: client.monthlyRate?.toString() || "",
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Client name is required";
    if (!formData.type) newErrors.type = "Client type is required";
    if (!formData.contactPerson.trim())
      newErrors.contactPerson = "Contact person is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.guardsRequired)
      newErrors.guardsRequired = "Guards required is required";
    if (!formData.monthlyRate)
      newErrors.monthlyRate = "Monthly rate is required";
    if (!formData.contractStart)
      newErrors.contractStart = "Contract start date is required";
    if (!formData.contractEnd)
      newErrors.contractEnd = "Contract end date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        guardsRequired: parseInt(formData.guardsRequired) || 0,
        guardsDeployed: client?.guardsDeployed || 0,
        monthlyRate: parseInt(formData.monthlyRate) || 0,
        paymentStatus: client?.paymentStatus || "pending",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Client Name *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter client name"
          error={errors.name}
        />
        <Select
          label="Client Type *"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={typeOptions}
          placeholder="Select type"
          error={errors.type}
        />
        <Input
          label="Contact Person *"
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleChange}
          placeholder="Enter contact person name"
          error={errors.contactPerson}
        />
        <Input
          label="Phone Number *"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91 9876543210"
          error={errors.phone}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="email@example.com"
        />
        <Input
          label="Guards Required *"
          name="guardsRequired"
          type="number"
          value={formData.guardsRequired}
          onChange={handleChange}
          placeholder="10"
          min="1"
          error={errors.guardsRequired}
        />
        <Input
          label="Monthly Rate (₹) *"
          name="monthlyRate"
          type="number"
          value={formData.monthlyRate}
          onChange={handleChange}
          placeholder="100000"
          error={errors.monthlyRate}
        />
        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
        />
        <Input
          label="Contract Start Date *"
          name="contractStart"
          type="date"
          value={formData.contractStart}
          onChange={handleChange}
          error={errors.contractStart}
        />
        <Input
          label="Contract End Date *"
          name="contractEnd"
          type="date"
          value={formData.contractEnd}
          onChange={handleChange}
          error={errors.contractEnd}
        />
      </div>

      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Enter full address"
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          <HiOutlineX className="w-5 h-5" />
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          <HiOutlineSave className="w-5 h-5" />
          {client ? "Update Client" : "Add Client"}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
