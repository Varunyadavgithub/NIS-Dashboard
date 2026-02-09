import React, { useState, useMemo } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import PermissionGate from '../components/auth/PermissionGate';
import { usePermissions } from '../hooks/usePermissions';
import { usersData } from '../data/usersData';
import { ROLES, ROLE_CONFIG, PERMISSIONS, ROLE_PERMISSIONS, getRoleLabel, getRoleColor } from '../config/roles';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlineDownload,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineSave,
  HiOutlineX,
} from 'react-icons/hi';

const Users = () => {
  const permissions = usePermissions();
  const [users, setUsers] = useState(usersData);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    status: 'active',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const roleOptions = Object.entries(ROLE_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
  }));

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
  ];

  const handleAdd = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      status: 'active',
      password: '',
    });
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      password: '',
    });
    setErrors({});
    setShowModal(true);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setShowResetPassword(true);
  };

  const handleViewPermissions = (user) => {
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!selectedUser && !formData.password) newErrors.password = 'Password is required';
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (selectedUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, ...formData, password: formData.password || u.password }
            : u
        )
      );
      toast.success('User updated successfully');
    } else {
      const newUser = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: null,
      };
      setUsers((prev) => [...prev, newUser]);
      toast.success('User created successfully');
    }

    setLoading(false);
    setShowModal(false);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    toast.success('User deleted successfully');
    setLoading(false);
    setShowDeleteConfirm(false);
  };

  const handleConfirmResetPassword = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success(`Password reset link sent to ${selectedUser.email}`);
    setLoading(false);
    setShowResetPassword(false);
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      inactive: 'default',
      suspended: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  // Stats
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    admins: users.filter((u) => [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(u.role)).length,
    staff: users.filter((u) => u.role === ROLES.STAFF).length,
  }), [users]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Manage system users and their roles</p>
        </div>
        <PermissionGate permissions={[PERMISSIONS.CREATE_USER]}>
          <Button onClick={handleAdd}>
            <HiOutlinePlus className="w-5 h-5" />
            Add User
          </Button>
        </PermissionGate>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Active Users</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Admins</p>
          <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Staff</p>
          <p className="text-2xl font-bold text-blue-600">{stats.staff}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search users..."
              className="w-full sm:w-80"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="all">All Roles</option>
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <Button variant="secondary">
            <HiOutlineDownload className="w-5 h-5" />
            Export
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card padding={false}>
        <Table>
          <Table.Header>
            <Table.Row hoverable={false}>
              <Table.Head>User</Table.Head>
              <Table.Head>Role</Table.Head>
              <Table.Head>Contact</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Last Login</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginatedUsers.map((user) => (
              <Table.Row key={user.id}>
                <Table.Cell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <p className="text-gray-900">{user.phone || '-'}</p>
                </Table.Cell>
                <Table.Cell>{getStatusBadge(user.status)}</Table.Cell>
                <Table.Cell>
                  <p className="text-gray-900">{user.lastLogin || 'Never'}</p>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleView(user)}
                      className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <HiOutlineEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewPermissions(user)}
                      className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="View Permissions"
                    >
                      <HiOutlineShieldCheck className="w-4 h-4" />
                    </button>
                    <PermissionGate permissions={[PERMISSIONS.EDIT_USER]}>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                    </PermissionGate>
                    <PermissionGate permissions={[PERMISSIONS.EDIT_USER]}>
                      <button
                        onClick={() => handleResetPassword(user)}
                        className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Reset Password"
                      >
                        <HiOutlineKey className="w-4 h-4" />
                      </button>
                    </PermissionGate>
                    <PermissionGate permissions={[PERMISSIONS.DELETE_USER]}>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </PermissionGate>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <div className="p-4 border-t border-gray-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </Card>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedUser ? 'Edit User' : 'Add New User'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            icon={HiOutlineUser}
            error={errors.name}
          />
          <Input
            label="Email Address *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            icon={HiOutlineMail}
            error={errors.email}
          />
          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
            icon={HiOutlinePhone}
          />
          <Select
            label="Role *"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={roleOptions}
            placeholder="Select role"
            error={errors.role}
          />
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
          />
          <Input
            label={selectedUser ? 'New Password (leave blank to keep current)' : 'Password *'}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.password}
          />

          {/* Role Description */}
          {formData.role && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Role Description:</p>
              <p className="text-sm text-gray-500">{ROLE_CONFIG[formData.role]?.description}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              <HiOutlineX className="w-5 h-5" />
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              <HiOutlineSave className="w-5 h-5" />
              {selectedUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* User Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold text-2xl">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h3>
                <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getRoleColor(selectedUser.role)}`}>
                  {getRoleLabel(selectedUser.role)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{selectedUser.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                {getStatusBadge(selectedUser.status)}
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="font-medium text-gray-900">{selectedUser.lastLogin || 'Never'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Permissions Modal */}
      <Modal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        title={`Permissions - ${selectedUser?.name}`}
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getRoleColor(selectedUser.role)}`}>
                  {getRoleLabel(selectedUser.role)}
                </span>
              </div>
              <p className="text-sm text-gray-600">{ROLE_CONFIG[selectedUser.role]?.description}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Assigned Permissions ({ROLE_PERMISSIONS[selectedUser.role]?.length || 0})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {ROLE_PERMISSIONS[selectedUser.role]?.map((permission) => (
                  <div
                    key={permission}
                    className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
                  >
                    <HiOutlineShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-800 truncate">
                      {permission.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                )) || (
                  <p className="col-span-full text-gray-500">No permissions assigned</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setShowPermissionsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${selectedUser?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={loading}
      />

      {/* Reset Password Confirmation */}
      <ConfirmDialog
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
        onConfirm={handleConfirmResetPassword}
        title="Reset Password"
        message={`Send password reset link to "${selectedUser?.email}"?`}
        confirmText="Send Reset Link"
        variant="warning"
        loading={loading}
      />
    </div>
  );
};

export default Users;