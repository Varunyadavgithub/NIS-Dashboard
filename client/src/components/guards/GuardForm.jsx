import { useState, useEffect } from "react";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import { HiOutlineSave, HiOutlineX } from "react-icons/hi";

const initialFormData = {
  name: "",
  phone: "",
  email: "",
  address: "",
  aadhar: "",
  experience: "",
  salary: "",
  status: "active",
  joinDate: "",
  bloodGroup: "",
  emergencyContact: "",
  certifications: [],
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "on_leave", label: "On Leave" },
  { value: "terminated", label: "Terminated" },
];

const bloodGroupOptions = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

const certificationOptions = [
  "Security Training",
  "Fire Safety",
  "First Aid",
  "CCTV Operations",
  "Access Control",
];

const GuardForm = ({ guard, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (guard) {
      setFormData({
        ...initialFormData,
        ...guard,
        experience: guard.experience?.toString() || "",
        salary: guard.salary?.toString() || "",
      });
    }
  }, [guard]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCertificationChange = (cert) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.aadhar.trim()) newErrors.aadhar = "Aadhar is required";
    if (!formData.salary) newErrors.salary = "Salary is required";
    if (!formData.joinDate) newErrors.joinDate = "Join date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        experience: parseInt(formData.experience) || 0,
        salary: parseInt(formData.salary) || 0,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter full name"
          error={errors.name}
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
          label="Aadhar Number *"
          name="aadhar"
          value={formData.aadhar}
          onChange={handleChange}
          placeholder="1234-5678-9012"
          error={errors.aadhar}
        />
        <Input
          label="Experience (Years)"
          name="experience"
          type="number"
          value={formData.experience}
          onChange={handleChange}
          placeholder="0"
          min="0"
        />
        <Input
          label="Monthly Salary (₹) *"
          name="salary"
          type="number"
          value={formData.salary}
          onChange={handleChange}
          placeholder="15000"
          error={errors.salary}
        />
        <Input
          label="Join Date *"
          name="joinDate"
          type="date"
          value={formData.joinDate}
          onChange={handleChange}
          error={errors.joinDate}
        />
        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
        />
        <Select
          label="Blood Group"
          name="bloodGroup"
          value={formData.bloodGroup}
          onChange={handleChange}
          options={bloodGroupOptions}
          placeholder="Select blood group"
        />
        <Input
          label="Emergency Contact"
          name="emergencyContact"
          value={formData.emergencyContact}
          onChange={handleChange}
          placeholder="+91 9876543211"
        />
      </div>

      <div className="md:col-span-2">
        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter full address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certifications
        </label>
        <div className="flex flex-wrap gap-2">
          {certificationOptions.map((cert) => (
            <button
              key={cert}
              type="button"
              onClick={() => handleCertificationChange(cert)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                formData.certifications.includes(cert)
                  ? "bg-primary-100 text-primary-700 border-2 border-primary-500"
                  : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
              }`}
            >
              {cert}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          <HiOutlineX className="w-5 h-5" />
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          <HiOutlineSave className="w-5 h-5" />
          {guard ? "Update Guard" : "Add Guard"}
        </Button>
      </div>
    </form>
  );
};

export default GuardForm;
