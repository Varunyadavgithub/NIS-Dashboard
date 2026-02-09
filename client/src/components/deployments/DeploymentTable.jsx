import Table from "../common/Table";
import Badge from "../common/Badge";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { formatDate } from "../../utils/helpers";

const DeploymentTable = ({ deployments, onEdit, onDelete }) => {
  const statusVariant = {
    active: "success",
    inactive: "default",
    on_leave: "warning",
  };

  const shiftVariant = {
    day: "info",
    evening: "orange",
    night: "purple",
  };

  return (
    <Table>
      <Table.Header>
        <Table.Row hoverable={false}>
          <Table.Head>Guard</Table.Head>
          <Table.Head>Client</Table.Head>
          <Table.Head>Location</Table.Head>
          <Table.Head>Shift</Table.Head>
          <Table.Head>Timing</Table.Head>
          <Table.Head>Start Date</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head>Actions</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {deployments.map((deployment) => (
          <Table.Row key={deployment.id}>
            <Table.Cell>
              <p className="font-medium text-gray-900">
                {deployment.guardName}
              </p>
            </Table.Cell>
            <Table.Cell>
              <p className="text-gray-900">{deployment.clientName}</p>
            </Table.Cell>
            <Table.Cell>
              <p className="text-gray-900">{deployment.location}</p>
            </Table.Cell>
            <Table.Cell>
              <Badge variant={shiftVariant[deployment.shift] || "default"}>
                {deployment.shift}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <p className="text-gray-900">{deployment.shiftTime}</p>
            </Table.Cell>
            <Table.Cell>
              <p className="text-gray-900">
                {formatDate(deployment.startDate)}
              </p>
            </Table.Cell>
            <Table.Cell>
              <Badge variant={statusVariant[deployment.status] || "default"}>
                {deployment.status.replace("_", " ")}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(deployment)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(deployment)}
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

export default DeploymentTable;
