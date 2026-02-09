import Table from "../common/Table";
import Badge from "../common/Badge";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi";
import {
  formatCurrency,
  formatDate,
  getClientTypeColor,
} from "../../utils/helpers";

const ClientTable = ({ clients, onView, onEdit, onDelete }) => {
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

  return (
    <Table>
      <Table.Header>
        <Table.Row hoverable={false}>
          <Table.Head>Client</Table.Head>
          <Table.Head>Type</Table.Head>
          <Table.Head>Contact</Table.Head>
          <Table.Head>Guards</Table.Head>
          <Table.Head>Monthly Rate</Table.Head>
          <Table.Head>Contract</Table.Head>
          <Table.Head>Payment</Table.Head>
          <Table.Head>Actions</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {clients.map((client) => (
          <Table.Row key={client.id}>
            <Table.Cell>
              <div>
                <p className="font-medium text-gray-900">{client.name}</p>
                <p className="text-xs text-gray-500">
                  {client.address?.substring(0, 30)}...
                </p>
              </div>
            </Table.Cell>
            <Table.Cell>
              <Badge variant={typeVariant[client.type] || "default"}>
                {client.type}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <div>
                <p className="text-gray-900">{client.contactPerson}</p>
                <p className="text-xs text-gray-500">{client.phone}</p>
              </div>
            </Table.Cell>
            <Table.Cell>
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-900">
                  {client.guardsDeployed}
                </span>
                <span className="text-gray-500">/ {client.guardsRequired}</span>
              </div>
            </Table.Cell>
            <Table.Cell>
              <span className="font-medium text-gray-900">
                {formatCurrency(client.monthlyRate)}
              </span>
            </Table.Cell>
            <Table.Cell>
              <div className="text-sm">
                <p className="text-gray-900">
                  {formatDate(client.contractStart)}
                </p>
                <p className="text-xs text-gray-500">
                  to {formatDate(client.contractEnd)}
                </p>
              </div>
            </Table.Cell>
            <Table.Cell>
              <Badge
                variant={paymentVariant[client.paymentStatus] || "default"}
              >
                {client.paymentStatus}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onView(client)}
                  className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <HiOutlineEye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(client)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(client)}
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

export default ClientTable;
