import {
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
} from 'react-icons/hi';
import Badge from '../common/Badge';
import { getStatusColor, formatCurrency } from '../../utils/helpers';

const GuardCard = ({ guard, onView, onEdit, onDelete }) => {
  const statusVariant = {
    active: 'success',
    inactive: 'default',
    on_leave: 'warning',
    terminated: 'danger',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={guard.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(guard.name)}&background=3b82f6&color=fff`}
            alt={guard.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{guard.name}</h3>
            <p className="text-sm text-gray-500">ID: GRD-{guard.id.toString().padStart(4, '0')}</p>
          </div>
        </div>
        <Badge variant={statusVariant[guard.status] || 'default'}>
          {guard.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <HiOutlinePhone className="w-4 h-4 text-gray-400" />
          {guard.phone}
        </div>
        {guard.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <HiOutlineMail className="w-4 h-4 text-gray-400" />
            {guard.email}
          </div>
        )}
        {guard.assignedTo && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <HiOutlineLocationMarker className="w-4 h-4 text-gray-400" />
            {guard.assignedTo}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Salary</p>
          <p className="font-semibold text-gray-900">{formatCurrency(guard.salary)}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(guard)}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="View"
          >
            <HiOutlineEye className="w-5 h-5" />
          </button>
          <button
            onClick={() => onEdit(guard)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <HiOutlinePencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(guard)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <HiOutlineTrash className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuardCard;