import express from 'express';
import {
  getPayrolls,
  getPayroll,
  generatePayroll,
  bulkGeneratePayroll,
  updatePayroll,
  addAdjustment,
  verifyPayroll,
  approvePayroll,
  rejectPayroll,
  processPayment,
  bulkProcessPayment,
  getPayrollSummary,
  getPayrollStats,
  getGuardPayrollHistory,
  generatePayslip,
  deletePayroll,
} from '../controllers/payroll.controller.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import {
  generatePayrollSchema,
  bulkGeneratePayrollSchema,
  updatePayrollSchema,
  addAdjustmentSchema,
  processPaymentSchema,
  bulkProcessPaymentSchema,
  getPayrollSchema,
  listPayrollsSchema,
  approvePayrollSchema,
  rejectPayrollSchema,
} from '../validators/payrollValidator.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getPayrollSummary);
router.get('/stats', getPayrollStats);
router.post('/generate', authorize('super_admin', 'admin', 'manager', 'accountant'), validate(generatePayrollSchema), generatePayroll);
router.post('/bulk-generate', authorize('super_admin', 'admin', 'manager', 'accountant'), validate(bulkGeneratePayrollSchema), bulkGeneratePayroll);
router.post('/bulk-pay', authorize('super_admin', 'admin', 'accountant'), validate(bulkProcessPaymentSchema), bulkProcessPayment);
router.get('/guard/:guardId/history', getGuardPayrollHistory);

router.route('/')
  .get(validate(listPayrollsSchema), getPayrolls);

router.route('/:id')
  .get(validate(getPayrollSchema), getPayroll)
  .put(authorize('super_admin', 'admin', 'manager', 'accountant'), validate(updatePayrollSchema), updatePayroll)
  .delete(authorize('super_admin', 'admin'), validate(getPayrollSchema), deletePayroll);

router.post('/:id/adjustment', authorize('super_admin', 'admin', 'accountant'), validate(addAdjustmentSchema), addAdjustment);
router.patch('/:id/verify', authorize('super_admin', 'admin', 'manager', 'accountant'), validate(approvePayrollSchema), verifyPayroll);
router.patch('/:id/approve', authorize('super_admin', 'admin'), validate(approvePayrollSchema), approvePayroll);
router.patch('/:id/reject', authorize('super_admin', 'admin'), validate(rejectPayrollSchema), rejectPayroll);
router.post('/:id/pay', authorize('super_admin', 'admin', 'accountant'), validate(processPaymentSchema), processPayment);
router.get('/:id/payslip', generatePayslip);

export default router;