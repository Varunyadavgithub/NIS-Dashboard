import { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";
import PayrollForm from "../components/payroll/PayrollForm";
import PayrollTable from "../components/payroll/PayrollTable";
import { PageLoader } from "../components/common/Loader";
import {
  HiOutlinePlus,
  HiOutlineDownload,
  HiOutlineCash,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { downloadCSV, formatCurrency } from "../utils/helpers";

const Payroll = () => {
  const {
    payroll,
    guards,
    fetchPayroll,
    fetchGuards,
    addPayroll,
    updatePayroll,
    processPayroll,
  } = useApp();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showProcessConfirm, setShowProcessConfirm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchPayroll(), fetchGuards()]);
    setLoading(false);
  };

  const filteredPayroll = useMemo(() => {
    return payroll.filter((record) => {
      const matchesSearch = record.guardName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || record.status === statusFilter;
      const matchesMonth = !monthFilter || record.month === monthFilter;
      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [payroll, searchQuery, statusFilter, monthFilter]);

  const paginatedPayroll = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayroll.slice(start, start + itemsPerPage);
  }, [filteredPayroll, currentPage]);

  const totalPages = Math.ceil(filteredPayroll.length / itemsPerPage);

  const handleAdd = () => {
    setSelectedRecord(null);
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      if (selectedRecord) {
        await updatePayroll(selectedRecord.id, data);
      } else {
        await addPayroll(data);
      }
      setShowModal(false);
      setSelectedRecord(null);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleProcessPayroll = async () => {
    setSubmitLoading(true);
    try {
      await processPayroll(selectedIds);
      setShowProcessConfirm(false);
      setSelectedIds([]);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = filteredPayroll.map((p) => ({
      Guard: p.guardName,
      Month: p.month,
      "Base Salary": formatCurrency(p.baseSalary),
      Overtime: formatCurrency(p.overtime),
      Bonus: formatCurrency(p.bonus),
      Deductions: formatCurrency(p.deductions),
      "Net Salary": formatCurrency(p.netSalary),
      Status: p.status,
      "Paid Date": p.paidDate || "-",
    }));
    downloadCSV(exportData, "payroll");
  };

  // Stats
  const stats = useMemo(
    () => ({
      totalRecords: payroll.length,
      pendingAmount: payroll
        .filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + p.netSalary, 0),
      paidAmount: payroll
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.netSalary, 0),
      pendingCount: payroll.filter((p) => p.status === "pending").length,
    }),
    [payroll],
  );

  // Get unique months
  const months = useMemo(() => {
    const uniqueMonths = [...new Set(payroll.map((p) => p.month))];
    return uniqueMonths.map((m) => ({ value: m, label: m }));
  }, [payroll]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payroll Management
          </h1>
          <p className="text-gray-500">Manage guard salaries and payments</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="success"
              onClick={() => setShowProcessConfirm(true)}
            >
              <HiOutlineCheckCircle className="w-5 h-5" />
              Process Selected ({selectedIds.length})
            </Button>
          )}
          <Button onClick={handleAdd}>
            <HiOutlinePlus className="w-5 h-5" />
            Add Payroll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-sm text-gray-500">Total Records</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalRecords}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Pending Payments</p>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.pendingCount}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Pending Amount</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(stats.pendingAmount)}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Paid Amount</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.paidAmount)}
          </p>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by guard name..."
              className="w-full sm:w-64"
            />
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">All Months</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <Button variant="secondary" onClick={handleExport}>
            <HiOutlineDownload className="w-5 h-5" />
            Export
          </Button>
        </div>
      </Card>

      {/* Results */}
      {filteredPayroll.length === 0 ? (
        <Card>
          <EmptyState
            icon={HiOutlineCash}
            title="No payroll records found"
            description={
              searchQuery || statusFilter !== "all" || monthFilter
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding payroll records"
            }
            actionLabel="Add Payroll"
            onAction={handleAdd}
          />
        </Card>
      ) : (
        <Card padding={false}>
          <PayrollTable
            payroll={paginatedPayroll}
            onEdit={handleEdit}
            onPay={(ids) => {
              setSelectedIds(ids);
              setShowProcessConfirm(true);
            }}
            selectedIds={selectedIds}
            onSelect={setSelectedIds}
          />
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredPayroll.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedRecord(null);
        }}
        title={selectedRecord ? "Edit Payroll" : "Add Payroll Record"}
        size="lg"
      >
        <PayrollForm
          payroll={selectedRecord}
          guards={guards}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedRecord(null);
          }}
          loading={submitLoading}
        />
      </Modal>

      {/* Process Confirmation */}
      <ConfirmDialog
        isOpen={showProcessConfirm}
        onClose={() => {
          setShowProcessConfirm(false);
        }}
        onConfirm={handleProcessPayroll}
        title="Process Payroll"
        message={`Are you sure you want to process payment for ${selectedIds.length} record(s)? This will mark them as paid.`}
        confirmText="Process Payment"
        variant="warning"
        loading={submitLoading}
      />
    </div>
  );
};

export default Payroll;
