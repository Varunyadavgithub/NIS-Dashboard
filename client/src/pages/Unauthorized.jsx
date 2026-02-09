import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { HiOutlineShieldExclamation, HiOutlineHome, HiOutlineArrowLeft } from 'react-icons/hi';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
          <HiOutlineShieldExclamation className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-xl text-gray-500 mb-2">403 - Unauthorized</p>
        <p className="text-gray-500 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        {user && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              You are logged in as <span className="font-semibold">{user.name}</span> with role{' '}
              <span className="font-semibold capitalize">{user.role?.replace('_', ' ')}</span>
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <HiOutlineArrowLeft className="w-5 h-5" />
            Go Back
          </Button>
          <Button onClick={() => navigate('/')}>
            <HiOutlineHome className="w-5 h-5" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;