import { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";
import DeploymentForm from "../components/deployments/DeploymentForm";
import DeploymentTable from "../components/deployments/DeploymentTable";
import { PageLoader } from "../components/common/Loader";
import {
  HiOutlinePlus,
  HiOutlineDownload,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { downloadCSV } from "../utils/helpers";

const Deployments = () => {
  const {
    deployments,
    guards,
    clients,
    fetchDeployments,
    fetchGuards,
    fetchClients,
    addDeployment,
    updateDeployment,
    deleteDeployment,
  } = useApp();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchDeployments(), fetchGuards(), fetchClients()]);
    setLoading(false);
  };

  const filteredDeployments = useMemo(() => {
    return deployments.filter((deployment) => {
      const matchesSearch =
        deployment.guardName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        deployment.clientName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        deployment.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesShift =
        shiftFilter === "all" || deployment.shift === shiftFilter;
      return matchesSearch && matchesShift;
    });
  }, [deployments, searchQuery, shiftFilter]);

  const paginatedDeployments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDeployments.slice(start, start + itemsPerPage);
  }, [filteredDeployments, currentPage]);

  const totalPages = Math.ceil(filteredDeployments.length / itemsPerPage);

  const handleAdd = () => {
    setSelectedDeployment(null);
    setShowModal(true);
  };

  const handleEdit = (deployment) => {
    setSelectedDeployment(deployment);
    setShowModal(true);
  };

  const handleDelete = (deployment) => {
    setSelectedDeployment(deployment);
    setShowDeleteConfirm(true);
  };

  const handleSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      if (selectedDeployment) {
        await updateDeployment(selectedDeployment.id, data);
      } else {
        await addDeployment(data);
      }
      setShowModal(false);
      setSelectedDeployment(null);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setSubmitLoading(true);
    try {
      await deleteDeployment(selectedDeployment.id);
      setShowDeleteConfirm(false);
      setSelectedDeployment(null);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = filteredDeployments.map((d) => ({
      ID: `DEP-${d.id.toString().padStart(4, "0")}`,
      Guard: d.guardName,
      Client: d.clientName,
      Location: d.location,
      Shift: d.shift,
      Timing: d.shiftTime,
      "Start Date": d.startDate,
      Status: d.status,
    }));
    downloadCSV(exportData, "deployments");
  };

  // Stats
  const stats = useMemo(
    () => ({
      total: deployments.length,
      active: deployments.filter((d) => d.status === "active").length,
      day: deployments.filter((d) => d.shift === "day").length,
      night: deployments.filter((d) => d.shift === "night").length,
    }),
    [deployments],
  );

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deployments</h1>
          <p className="text-gray-500">Manage guard assignments and shifts</p>
        </div>
        <Button onClick={handleAdd}>
          <HiOutlinePlus className="w-5 h-5" />
          New Deployment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-sm text-gray-500">Total Deployments</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Day Shifts</p>
          <p className="text-2xl font-bold text-blue-600">{stats.day}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Night Shifts</p>
          <p className="text-2xl font-bold text-purple-600">{stats.night}</p>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search deployments..."
              className="w-full sm:w-80"
            />
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="all">All Shifts</option>
              <option value="day">Day Shift</option>
              <option value="evening">Evening Shift</option>
              <option value="night">Night Shift</option>
            </select>
          </div>

          <Button variant="secondary" onClick={handleExport}>
            <HiOutlineDownload className="w-5 h-5" />
            Export
          </Button>
        </div>
      </Card>

      {/* Results */}
      {filteredDeployments.length === 0 ? (
        <Card>
          <EmptyState
            icon={HiOutlineLocationMarker}
            title="No deployments found"
            description={
              searchQuery || shiftFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Get started by creating your first deployment"
            }
            actionLabel={
              !searchQuery && shiftFilter === "all" ? "New Deployment" : null
            }
            onAction={handleAdd}
          />
        </Card>
      ) : (
        <Card padding={false}>
          <DeploymentTable
            deployments={paginatedDeployments}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredDeployments.length}
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
          setSelectedDeployment(null);
        }}
        title={selectedDeployment ? "Edit Deployment" : "Create New Deployment"}
        size="lg"
      >
        <DeploymentForm
          deployment={selectedDeployment}
          guards={guards}
          clients={clients}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedDeployment(null);
          }}
          loading={submitLoading}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedDeployment(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Deployment"
        message="Are you sure you want to delete this deployment? This action cannot be undone."
        confirmText="Delete"
        loading={submitLoading}
      />
    </div>
  );
};

export default Deployments;
