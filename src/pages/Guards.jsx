import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { usePermissions } from "../hooks/usePermissions";
import PermissionGate from "../components/auth/PermissionGate";
import { PERMISSIONS } from "../config/roles";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";
import GuardForm from "../components/guards/GuardForm";
import GuardTable from "../components/guards/GuardTable";
import GuardCard from "../components/guards/GuardCard";
import GuardDetails from "../components/guards/GuardDetails";
import { PageLoader } from "../components/common/Loader";
import {
  HiOutlinePlus,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineDownload,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { downloadCSV } from "../utils/helpers";

const Guards = () => {
  const { guards, fetchGuards, addGuard, updateGuard, deleteGuard } = useApp();
  const permissions = usePermissions();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadGuards();
  }, []);

  const loadGuards = async () => {
    setLoading(true);
    await fetchGuards();
    setLoading(false);
  };

  const filteredGuards = useMemo(() => {
    return guards.filter((guard) => {
      const matchesSearch =
        guard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guard.phone.includes(searchQuery) ||
        guard.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || guard.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [guards, searchQuery, statusFilter]);

  const paginatedGuards = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGuards.slice(start, start + itemsPerPage);
  }, [filteredGuards, currentPage]);

  const totalPages = Math.ceil(filteredGuards.length / itemsPerPage);

  const handleAdd = () => {
    if (!permissions.canCreateGuard) return;
    setSelectedGuard(null);
    setShowModal(true);
  };

  const handleEdit = (guard) => {
    if (!permissions.canEditGuard) return;
    setSelectedGuard(guard);
    setShowModal(true);
    setShowDetails(false);
  };

  const handleView = (guard) => {
    setSelectedGuard(guard);
    setShowDetails(true);
  };

  const handleDelete = (guard) => {
    if (!permissions.canDeleteGuard) return;
    setSelectedGuard(guard);
    setShowDeleteConfirm(true);
  };

  const handleSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      if (selectedGuard) {
        await updateGuard(selectedGuard.id, data);
      } else {
        await addGuard(data);
      }
      setShowModal(false);
      setSelectedGuard(null);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setSubmitLoading(true);
    try {
      await deleteGuard(selectedGuard.id);
      setShowDeleteConfirm(false);
      setSelectedGuard(null);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleExport = () => {
    if (!permissions.canExportGuards) return;
    const exportData = filteredGuards.map((g) => ({
      ID: `GRD-${g.id.toString().padStart(4, "0")}`,
      Name: g.name,
      Phone: g.phone,
      Email: g.email || "",
      Status: g.status,
      Salary: g.salary,
      Experience: `${g.experience} years`,
      "Assigned To": g.assignedTo || "",
      "Join Date": g.joinDate,
    }));
    downloadCSV(exportData, "guards");
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Guards Management
          </h1>
          <p className="text-gray-500">Manage your security personnel</p>
        </div>
        <PermissionGate permissions={[PERMISSIONS.CREATE_GUARD]}>
          <Button onClick={handleAdd}>
            <HiOutlinePlus className="w-5 h-5" />
            Add Guard
          </Button>
        </PermissionGate>
      </div>

      {/* Filters & Actions */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search guards..."
              className="w-full sm:w-80"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <PermissionGate permissions={[PERMISSIONS.EXPORT_GUARDS]}>
              <Button variant="secondary" onClick={handleExport}>
                <HiOutlineDownload className="w-5 h-5" />
                Export
              </Button>
            </PermissionGate>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2.5 ${viewMode === "table" ? "bg-primary-100 text-primary-600" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <HiOutlineViewList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 ${viewMode === "grid" ? "bg-primary-100 text-primary-600" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <HiOutlineViewGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredGuards.length} of {guards.length} guards
        </p>
      </div>

      {/* Guards List */}
      {filteredGuards.length === 0 ? (
        <Card>
          <EmptyState
            icon={HiOutlineUserGroup}
            title="No guards found"
            description={
              searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first security guard"
            }
            actionLabel={
              permissions.canCreateGuard &&
              !searchQuery &&
              statusFilter === "all"
                ? "Add Guard"
                : null
            }
            onAction={handleAdd}
          />
        </Card>
      ) : viewMode === "table" ? (
        <Card padding={false}>
          <GuardTableWithPermissions
            guards={paginatedGuards}
            onView={handleView}
            onEdit={permissions.canEditGuard ? handleEdit : null}
            onDelete={permissions.canDeleteGuard ? handleDelete : null}
          />
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredGuards.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedGuards.map((guard) => (
              <GuardCard
                key={guard.id}
                guard={guard}
                onView={handleView}
                onEdit={permissions.canEditGuard ? handleEdit : null}
                onDelete={permissions.canDeleteGuard ? handleDelete : null}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredGuards.length}
            itemsPerPage={itemsPerPage}
          />
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedGuard(null);
        }}
        title={selectedGuard ? "Edit Guard" : "Add New Guard"}
        size="lg"
      >
        <GuardForm
          guard={selectedGuard}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedGuard(null);
          }}
          loading={submitLoading}
        />
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedGuard(null);
        }}
        title="Guard Details"
        size="lg"
      >
        {selectedGuard && (
          <GuardDetails
            guard={selectedGuard}
            onEdit={permissions.canEditGuard ? handleEdit : null}
            onClose={() => {
              setShowDetails(false);
              setSelectedGuard(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedGuard(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Guard"
        message={`Are you sure you want to delete "${selectedGuard?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={submitLoading}
      />
    </div>
  );
};

// Guard Table with permission-based action buttons
const GuardTableWithPermissions = ({ guards, onView, onEdit, onDelete }) => {
  return (
    <GuardTable
      guards={guards}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default Guards;
