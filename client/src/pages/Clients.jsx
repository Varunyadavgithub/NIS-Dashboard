import { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";
import ClientForm from "../components/clients/ClientForm";
import ClientTable from "../components/clients/ClientTable";
import ClientDetails from "../components/clients/ClientDetails";
import { PageLoader } from "../components/common/Loader";
import {
  HiOutlinePlus,
  HiOutlineDownload,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { downloadCSV, formatCurrency } from "../utils/helpers";

const Clients = () => {
  const { clients, fetchClients, addClient, updateClient, deleteClient } =
    useApp();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    await fetchClients();
    setLoading(false);
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contactPerson
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery);
      const matchesType = typeFilter === "all" || client.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [clients, searchQuery, typeFilter]);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const handleAdd = () => {
    setSelectedClient(null);
    setShowModal(true);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setShowModal(true);
    setShowDetails(false);
  };

  const handleView = (client) => {
    setSelectedClient(client);
    setShowDetails(true);
  };

  const handleDelete = (client) => {
    setSelectedClient(client);
    setShowDeleteConfirm(true);
  };

  const handleSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      if (selectedClient) {
        await updateClient(selectedClient.id, data);
      } else {
        await addClient(data);
      }
      setShowModal(false);
      setSelectedClient(null);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setSubmitLoading(true);
    try {
      await deleteClient(selectedClient.id);
      setShowDeleteConfirm(false);
      setSelectedClient(null);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = filteredClients.map((c) => ({
      ID: `CLT-${c.id.toString().padStart(4, "0")}`,
      Name: c.name,
      Type: c.type,
      "Contact Person": c.contactPerson,
      Phone: c.phone,
      Email: c.email || "",
      "Guards Required": c.guardsRequired,
      "Guards Deployed": c.guardsDeployed,
      "Monthly Rate": formatCurrency(c.monthlyRate),
      Status: c.status,
      "Payment Status": c.paymentStatus,
    }));
    downloadCSV(exportData, "clients");
  };

  // Stats
  const stats = useMemo(
    () => ({
      total: clients.length,
      active: clients.filter((c) => c.status === "active").length,
      totalRevenue: clients.reduce((sum, c) => sum + (c.monthlyRate || 0), 0),
      pendingPayments: clients.filter(
        (c) => c.paymentStatus === "pending" || c.paymentStatus === "overdue",
      ).length,
    }),
    [clients],
  );

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Clients Management
          </h1>
          <p className="text-gray-500">Manage your clients and contracts</p>
        </div>
        <Button onClick={handleAdd}>
          <HiOutlinePlus className="w-5 h-5" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-sm text-gray-500">Total Clients</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Active Clients</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Monthly Revenue</p>
          <p className="text-2xl font-bold text-primary-600">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Pending Payments</p>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.pendingPayments}
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
              placeholder="Search clients..."
              className="w-full sm:w-80"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="all">All Types</option>
              <option value="company">Company</option>
              <option value="society">Society</option>
              <option value="industry">Industry</option>
            </select>
          </div>

          <Button variant="secondary" onClick={handleExport}>
            <HiOutlineDownload className="w-5 h-5" />
            Export
          </Button>
        </div>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredClients.length} of {clients.length} clients
        </p>
      </div>

      {/* Clients Table */}
      {filteredClients.length === 0 ? (
        <Card>
          <EmptyState
            icon={HiOutlineOfficeBuilding}
            title="No clients found"
            description={
              searchQuery || typeFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first client"
            }
            actionLabel={
              !searchQuery && typeFilter === "all" ? "Add Client" : null
            }
            onAction={handleAdd}
          />
        </Card>
      ) : (
        <Card padding={false}>
          <ClientTable
            clients={paginatedClients}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredClients.length}
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
          setSelectedClient(null);
        }}
        title={selectedClient ? "Edit Client" : "Add New Client"}
        size="lg"
      >
        <ClientForm
          client={selectedClient}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedClient(null);
          }}
          loading={submitLoading}
        />
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedClient(null);
        }}
        title="Client Details"
        size="lg"
      >
        {selectedClient && (
          <ClientDetails
            client={selectedClient}
            onEdit={handleEdit}
            onClose={() => {
              setShowDetails(false);
              setSelectedClient(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedClient(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Client"
        message={`Are you sure you want to delete "${selectedClient?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={submitLoading}
      />
    </div>
  );
};

export default Clients;
