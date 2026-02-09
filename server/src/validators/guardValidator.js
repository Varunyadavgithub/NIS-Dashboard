import Joi from 'joi';
import { GUARD_STATUS } from '../config/constants.js';

const addressSchema = Joi.object({
  street: Joi.string().trim().allow(''),
  city: Joi.string().trim(),
  district: Joi.string().trim().allow(''),
  state: Joi.string().trim(),
  pincode: Joi.string().pattern(/^\d{6}$/).allow(''),
  landmark: Joi.string().trim().allow(''),
  sameAsCurrent: Joi.boolean(),
});

const bankDetailsSchema = Joi.object({
  accountHolderName: Joi.string().trim(),
  accountNumber: Joi.string().trim(),
  bankName: Joi.string().trim(),
  branchName: Joi.string().trim(),
  ifscCode: Joi.string().uppercase().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),
});

const salarySchema = Joi.object({
  basic: Joi.number().min(0),
  hra: Joi.number().min(0),
  travelAllowance: Joi.number().min(0),
  foodAllowance: Joi.number().min(0),
  medicalAllowance: Joi.number().min(0),
  specialAllowance: Joi.number().min(0),
  pfContribution: Joi.number().min(0),
  esiContribution: Joi.number().min(0),
});

export const createGuardSchema = {
  body: Joi.object({
    firstName: Joi.string().required().min(2).max(50).trim()
      .messages({ 'string.empty': 'First name is required' }),
    lastName: Joi.string().required().min(2).max(50).trim()
      .messages({ 'string.empty': 'Last name is required' }),
    fatherName: Joi.string().trim().allow(''),
    dateOfBirth: Joi.date().required().max('now')
      .messages({ 'date.max': 'Date of birth cannot be in the future' }),
    gender: Joi.string().required().valid('male', 'female', 'other'),
    bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed'),
    nationality: Joi.string().default('Indian'),
    religion: Joi.string().allow(''),
    
    phone: Joi.string().required().pattern(/^[6-9]\d{9}$/)
      .messages({ 'string.pattern.base': 'Please provide a valid phone number' }),
    alternatePhone: Joi.string().pattern(/^[6-9]\d{9}$/).allow(''),
    email: Joi.string().email().lowercase().allow(''),
    
    currentAddress: addressSchema.keys({
      city: Joi.string().required().trim(),
      state: Joi.string().required().trim(),
    }),
    permanentAddress: addressSchema,
    
    documents: Joi.object({
      aadhar: Joi.object({
        number: Joi.string().pattern(/^\d{12}$/),
        file: Joi.string(),
        verified: Joi.boolean(),
      }),
      pan: Joi.object({
        number: Joi.string().uppercase().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
        file: Joi.string(),
        verified: Joi.boolean(),
      }),
      voterId: Joi.object({
        number: Joi.string(),
        file: Joi.string(),
      }),
      drivingLicense: Joi.object({
        number: Joi.string(),
        file: Joi.string(),
        expiryDate: Joi.date(),
      }),
      passport: Joi.object({
        number: Joi.string(),
        file: Joi.string(),
        expiryDate: Joi.date(),
      }),
    }),
    
    dateOfJoining: Joi.date().required()
      .messages({ 'any.required': 'Date of joining is required' }),
    designation: Joi.string().valid(
      'security_guard', 'senior_guard', 'supervisor', 'gunman', 'pso', 'bouncer'
    ).default('security_guard'),
    
    education: Joi.object({
      level: Joi.string().valid('below_10th', '10th', '12th', 'graduate', 'post_graduate'),
      details: Joi.string(),
    }),
    
    experience: Joi.object({
      totalYears: Joi.number().min(0),
      previousEmployers: Joi.array().items(
        Joi.object({
          company: Joi.string(),
          designation: Joi.string(),
          duration: Joi.string(),
          reasonForLeaving: Joi.string(),
        })
      ),
    }),
    
    skills: Joi.array().items(Joi.string()),
    
    languages: Joi.array().items(
      Joi.object({
        name: Joi.string(),
        proficiency: Joi.string().valid('basic', 'intermediate', 'fluent'),
      })
    ),
    
    physicalDetails: Joi.object({
      height: Joi.number().min(0),
      weight: Joi.number().min(0),
      eyeSight: Joi.string(),
      identificationMark: Joi.string(),
    }),
    
    bankDetails: bankDetailsSchema,
    salary: salarySchema,
    
    pfDetails: Joi.object({
      pfNumber: Joi.string(),
      uanNumber: Joi.string(),
      isApplicable: Joi.boolean(),
    }),
    
    esiDetails: Joi.object({
      esiNumber: Joi.string(),
      isApplicable: Joi.boolean(),
    }),
    
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      relationship: Joi.string(),
      phone: Joi.string().required().pattern(/^[6-9]\d{9}$/),
      address: Joi.string(),
    }).required(),
    
    status: Joi.string().valid(...Object.values(GUARD_STATUS)).default('active'),
    remarks: Joi.string().allow(''),
  }),
};

export const updateGuardSchema = {
  body: Joi.object({
    firstName: Joi.string().min(2).max(50).trim(),
    lastName: Joi.string().min(2).max(50).trim(),
    fatherName: Joi.string().trim().allow(''),
    dateOfBirth: Joi.date().max('now'),
    gender: Joi.string().valid('male', 'female', 'other'),
    bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed'),
    nationality: Joi.string(),
    religion: Joi.string().allow(''),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/),
    alternatePhone: Joi.string().pattern(/^[6-9]\d{9}$/).allow('', null),
    email: Joi.string().email().lowercase().allow('', null),
    currentAddress: addressSchema,
    permanentAddress: addressSchema,
    documents: Joi.object({
      aadhar: Joi.object({
        number: Joi.string().pattern(/^\d{12}$/),
        file: Joi.string(),
        verified: Joi.boolean(),
      }),
      pan: Joi.object({
        number: Joi.string().uppercase().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
        file: Joi.string(),
        verified: Joi.boolean(),
      }),
      voterId: Joi.object({
        number: Joi.string(),
        file: Joi.string(),
      }),
      drivingLicense: Joi.object({
        number: Joi.string(),
        file: Joi.string(),
        expiryDate: Joi.date(),
      }),
      passport: Joi.object({
        number: Joi.string(),
        file: Joi.string(),
        expiryDate: Joi.date(),
      }),
    }),
    dateOfJoining: Joi.date(),
    dateOfLeaving: Joi.date(),
    designation: Joi.string().valid(
      'security_guard', 'senior_guard', 'supervisor', 'gunman', 'pso', 'bouncer'
    ),
    education: Joi.object({
      level: Joi.string().valid('below_10th', '10th', '12th', 'graduate', 'post_graduate'),
      details: Joi.string(),
    }),
    experience: Joi.object({
      totalYears: Joi.number().min(0),
      previousEmployers: Joi.array().items(Joi.object({
        company: Joi.string(),
        designation: Joi.string(),
        duration: Joi.string(),
        reasonForLeaving: Joi.string(),
      })),
    }),
    skills: Joi.array().items(Joi.string()),
    languages: Joi.array().items(Joi.object({
      name: Joi.string(),
      proficiency: Joi.string().valid('basic', 'intermediate', 'fluent'),
    })),
    physicalDetails: Joi.object({
      height: Joi.number().min(0),
      weight: Joi.number().min(0),
      eyeSight: Joi.string(),
      identificationMark: Joi.string(),
    }),
    bankDetails: bankDetailsSchema,
    salary: salarySchema,
    pfDetails: Joi.object({
      pfNumber: Joi.string(),
      uanNumber: Joi.string(),
      isApplicable: Joi.boolean(),
    }),
    esiDetails: Joi.object({
      esiNumber: Joi.string(),
      isApplicable: Joi.boolean(),
    }),
    emergencyContact: Joi.object({
      name: Joi.string(),
      relationship: Joi.string(),
      phone: Joi.string().pattern(/^[6-9]\d{9}$/),
      address: Joi.string(),
    }),
    policeVerification: Joi.object({
      status: Joi.string().valid('pending', 'in_progress', 'verified', 'rejected'),
      verifiedDate: Joi.date(),
      document: Joi.string(),
      remarks: Joi.string(),
    }),
    medicalDetails: Joi.object({
      lastCheckupDate: Joi.date(),
      fitnessStatus: Joi.string().valid('fit', 'unfit', 'conditional'),
      medicalHistory: Joi.string(),
      document: Joi.string(),
    }),
    status: Joi.string().valid(...Object.values(GUARD_STATUS)),
    leaveBalance: Joi.object({
      casual: Joi.number().min(0),
      sick: Joi.number().min(0),
      earned: Joi.number().min(0),
    }),
    remarks: Joi.string().allow(''),
  }),
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const getGuardSchema = {
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const listGuardsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('guardId', 'firstName', 'dateOfJoining', 'status', 'createdAt').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().trim().allow(''),
    status: Joi.string().valid(...Object.values(GUARD_STATUS)),
    designation: Joi.string(),
    client: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    deployed: Joi.boolean(),
  }),
};