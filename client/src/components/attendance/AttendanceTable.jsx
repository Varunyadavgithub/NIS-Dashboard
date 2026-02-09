import Table from "../common/Table";
import Badge from "../common/Badge";
import { HiOutlinePencil } from "react-icons/hi";

const AttendanceTable = ({ attendance, onEdit }) => {
  const statusVariant = {
    present: "success",
    absent: "danger",
    late: "warning",
    leave: "info",
    half_day: "orange",
  };

  return (
    <Table>
      <Table.Header>
        <Table.Row hoverable={false}>
          <Table.Head>Guard</Table.Head>
          <Table.Head>Location</Table.Head>
          <Table.Head>Date</Table.Head>
          <Table.Head>Check In</Table.Head>
          <Table.Head>Check Out</Table.Head>
          <Table.Head>Hours</Table.Head>
          <Table.Head>Overtime</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head>Actions</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {attendance.map((record) => (
          <Table.Row key={record.id}>
            <Table.Cell>
              <p className="font-medium text-gray-900">{record.guardName}</p>
            </Table.Cell>
            <Table.Cell>
              <p className="text-gray-900">{record.location || "-"}</p>
            </Table.Cell>
            <Table.Cell>
              <p className="text-gray-900">{record.date}</p>
            </Table.Cell>
            <Table.Cell>
              <p className="text-gray-900">{record.checkIn || "-"}</p>
            </Table.Cell>
            <Table.Cell>
              <p className="text-gray-900">{record.checkOut || "-"}</p>
            </Table.Cell>
            <Table.Cell>
              <p className="text-gray-900">
                {record.hoursWorked?.toFixed(2) || "0"} hrs
              </p>
            </Table.Cell>
            <Table.Cell>
              <p
                className={`font-medium ${record.overtime > 0 ? "text-green-600" : "text-gray-500"}`}
              >
                {record.overtime?.toFixed(2) || "0"} hrs
              </p>
            </Table.Cell>
            <Table.Cell>
              <Badge variant={statusVariant[record.status] || "default"}>
                {record.status.replace("_", " ")}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <button
                onClick={() => onEdit(record)}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <HiOutlinePencil className="w-4 h-4" />
              </button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default AttendanceTable;
