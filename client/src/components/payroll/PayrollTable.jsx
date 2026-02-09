import Table from "../common/Table";
import Badge from "../common/Badge";
import { HiOutlinePencil, HiOutlineCash } from "react-icons/hi";
import { formatCurrency, formatDate } from "../../utils/helpers";

const PayrollTable = ({ payroll, onEdit, onPay, selectedIds, onSelect }) => {
  const statusVariant = {
    paid: "success",
    pending: "warning",
    processing: "info",
  };

  return (
    <Table>
      <Table.Header>
        <Table.Row hoverable={false}>
          <Table.Head>
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  onSelect(
                    payroll
                      .filter((p) => p.status === "pending")
                      .map((p) => p.id),
                  );
                } else {
                  onSelect([]);
                }
              }}
              checked={
                selectedIds.length ===
                  payroll.filter((p) => p.status === "pending").length &&
                selectedIds.length > 0
              }
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </Table.Head>
          <Table.Head>Guard</Table.Head>
          <Table.Head>Month</Table.Head>
          <Table.Head>Base Salary</Table.Head>
          <Table.Head>Overtime</Table.Head>
          <Table.Head>Bonus</Table.Head>
          <Table.Head>Deductions</Table.Head>
          <Table.Head>Net Salary</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head>Actions</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {payroll.map((record) => (
          <Table.Row key={record.id}>
            <Table.Cell>
              {record.status === "pending" && (
                <input
                  type="checkbox"
                  checked={selectedIds.includes(record.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelect([...selectedIds, record.id]);
                    } else {
                      onSelect(selectedIds.filter((id) => id !== record.id));
                    }
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              )}
            </Table.Cell>
            <Table.Cell>
              <p className="font-medium text-gray-900">{record.guardName}</p>
            </Table.Cell>
            <Table.Cell>
              <p className="text-gray-900">{record.month}</p>
            </Table.Cell>
            <Table.Cell>
              <p className="text-gray-900">
                {formatCurrency(record.baseSalary)}
              </p>
            </Table.Cell>
            <Table.Cell>
              <p className="text-green-600">
                +{formatCurrency(record.overtime)}
              </p>
            </Table.Cell>
            <Table.Cell>
              <p className="text-green-600">+{formatCurrency(record.bonus)}</p>
            </Table.Cell>
            <Table.Cell>
              <p className="text-red-600">
                -{formatCurrency(record.deductions)}
              </p>
            </Table.Cell>
            <Table.Cell>
              <p className="font-semibold text-gray-900">
                {formatCurrency(record.netSalary)}
              </p>
            </Table.Cell>
            <Table.Cell>
              <div>
                <Badge variant={statusVariant[record.status] || "default"}>
                  {record.status}
                </Badge>
                {record.paidDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(record.paidDate)}
                  </p>
                )}
              </div>
            </Table.Cell>
            <Table.Cell>
              <div className="flex items-center gap-1">
                {record.status === "pending" && (
                  <>
                    <button
                      onClick={() => onEdit(record)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onPay([record.id])}
                      className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <HiOutlineCash className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default PayrollTable;
