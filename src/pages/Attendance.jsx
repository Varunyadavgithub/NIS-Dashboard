import { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import EmptyState from "../components/common/EmptyState";
import AttendanceForm from "../components/attendance/AttendanceForm";
import AttendanceTable from "../components/attendance/AttendanceTable";
import { PageLoader } from "../components/common/Loader";
import {
  HiOutlinePlus,
  HiOutlineDownload,
  HiOutlineClipboardCheck,
  HiOutlineCalendar,
} from "react-icons/hi";
import { downloadCSV } from "../utils/helpers";

const Attendance = () => {
  const {
    attendance,
    guards,
    fetchAttendance,
    fetchGuards,
    markAttendance,
    updateAttendance,
  } = useApp();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchAttendance(), fetchGuards()]);
    setLoading(false);
  };

  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => {
      const matchesSearch = record.guardName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || record.status === statusFilter;
      const matchesDate = !selectedDate || record.date === selectedDate;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [attendance, searchQuery, statusFilter, selectedDate]);

  const paginatedAttendance = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAttendance.slice(start, start + itemsPerPage);
  }, [filteredAttendance, currentPage]);

  const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);

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
        await updateAttendance(selectedRecord.id, data);
      } else {
        await markAttendance(data);
      }
      setShowModal(false);
      setSelectedRecord(null);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = filteredAttendance.map((a) => ({
      Date: a.date,
      Guard: a.guardName,
      Location: a.location || "",
      "Check In": a.checkIn || "-",
      "Check Out": a.checkOut || "-",
      "Hours Worked": a.hoursWorked?.toFixed(2) || "0",
      Overtime: a.overtime?.toFixed(2) || "0",
      Status: a.status,
    }));
    downloadCSV(exportData, `attendance-${selectedDate}`);
  };

  // Stats
  const stats = useMemo(() => {
    const todayRecords = attendance.filter((a) => a.date === selectedDate);
    return {
      total: todayRecords.length,
      present: todayRecords.filter((a) => a.status === "present").length,
      absent: todayRecords.filter((a) => a.status === "absent").length,
      late: todayRecords.filter((a) => a.status === "late").length,
      leave: todayRecords.filter((a) => a.status === "leave").length,
    };
  }, [attendance, selectedDate]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Attendance Management
          </h1>
          <p className="text-gray-500">
            Track guard attendance and working hours
          </p>
        </div>
        <Button onClick={handleAdd}>
          <HiOutlinePlus className="w-5 h-5" />
          Mark Attendance
        </Button>
      </div>

      {/* Date Selector & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineCalendar className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Select Date</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Total Records</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Present</p>
          <p className="text-2xl font-bold text-green-600">{stats.present}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Absent</p>
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">On Leave</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.leave}</p>
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
              className="w-full sm:w-80"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="leave">On Leave</option>
              <option value="half_day">Half Day</option>
            </select>
          </div>

          <Button variant="secondary" onClick={handleExport}>
            <HiOutlineDownload className="w-5 h-5" />
            Export
          </Button>
        </div>
      </Card>

      {/* Results */}
      {filteredAttendance.length === 0 ? (
        <Card>
          <EmptyState
            icon={HiOutlineClipboardCheck}
            title="No attendance records found"
            description={
              searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : `No attendance marked for ${selectedDate}`
            }
            actionLabel="Mark Attendance"
            onAction={handleAdd}
          />
        </Card>
      ) : (
        <Card padding={false}>
          <AttendanceTable
            attendance={paginatedAttendance}
            onEdit={handleEdit}
          />
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredAttendance.length}
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
        title={selectedRecord ? "Edit Attendance" : "Mark Attendance"}
        size="lg"
      >
        <AttendanceForm
          guards={guards}
          selectedDate={selectedDate}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedRecord(null);
          }}
          loading={submitLoading}
        />
      </Modal>
    </div>
  );
};

export default Attendance;
