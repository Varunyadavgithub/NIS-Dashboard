const Table = ({ children, className = "" }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">{children}</table>
    </div>
  );
};

const TableHeader = ({ children }) => (
  <thead className="bg-gray-50">{children}</thead>
);

const TableBody = ({ children }) => (
  <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
);

const TableRow = ({ children, className = "", onClick, hoverable = true }) => (
  <tr
    className={`${hoverable ? "hover:bg-gray-50" : ""} ${
      onClick ? "cursor-pointer" : ""
    } ${className}`}
    onClick={onClick}
  >
    {children}
  </tr>
);

const TableHead = ({ children, className = "", sortable = false }) => (
  <th
    className={`px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
      sortable ? "cursor-pointer hover:bg-gray-100" : ""
    } ${className}`}
  >
    {children}
  </th>
);

const TableCell = ({ children, className = "" }) => (
  <td
    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}
  >
    {children}
  </td>
);

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;

export default Table;
