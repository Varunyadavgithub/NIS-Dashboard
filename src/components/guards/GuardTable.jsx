import Table from "../common/Table";
import Badge from "../common/Badge";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi";
import { formatCurrency, formatDate } from "../../utils/helpers";

const GuardTable = ({ guards, onView, onEdit, onDelete }) => {
  const statusVariant = {
    active: "success",
    inactive: "default",
    on_leave: "warning",
    terminated: "danger",
  };

  return (
    <Table>
      <Table.Header>
        <Table.Row hoverable={false}>
          <Table.Head>Guard</Table.Head>
          <Table.Head>Contact</Table.Head>
          <Table.Head>Assigned To</Table.Head>
          <Table.Head>Experience</Table.Head>
          <Table.Head>Salary</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head>Actions</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {guards.map((guard) => (
          <Table.Row key={guard.id}>
            <Table.Cell>
              <div className="flex items-center gap-3">
                <img
                  src={
                    guard.photo ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(guard.name)}&background=3b82f6&color=fff`
                  }
                  alt={guard.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">{guard.name}</p>
                  <p className="text-xs text-gray-500">
                    GRD-{guard.id.toString().padStart(4, "0")}
                  </p>
                </div>
              </div>
            </Table.Cell>
            <Table.Cell>
              <div>
                <p className="text-gray-900">{guard.phone}</p>
                <p className="text-xs text-gray-500">{guard.email || "-"}</p>
              </div>
            </Table.Cell>
            <Table.Cell>
              <span className="text-gray-900">{guard.assignedTo || "-"}</span>
            </Table.Cell>
            <Table.Cell>
              <span className="text-gray-900">{guard.experience} years</span>
            </Table.Cell>
            <Table.Cell>
              <span className="font-medium text-gray-900">
                {formatCurrency(guard.salary)}
              </span>
            </Table.Cell>
            <Table.Cell>
              <Badge variant={statusVariant[guard.status] || "default"}>
                {guard.status.replace("_", " ")}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onView(guard)}
                  className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <HiOutlineEye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(guard)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(guard)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default GuardTable;
