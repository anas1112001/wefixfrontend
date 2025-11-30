import React, { FC, useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Container from 'components/Atoms/Container/Container';
import Heading from 'components/Atoms/Heading/Heading';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import InputField from 'components/Atoms/InputField/InputField';
import TextArea from 'components/Atoms/TextArea/TextArea';
import Button from 'components/Atoms/Button/Button';
import Form from 'components/Atoms/Form/Form';
import { appText } from 'data/appText';
import styles from './CompanyWizard.module.css';
import { GRAPHQL_ENDPOINT } from 'utils/apiConfig';
import SecureStorage from 'modules/secureStorage';

// Helper function to get upload endpoint URL
const getUploadEndpoint = (): string => {
  const graphqlUrl = GRAPHQL_ENDPOINT;

  // Replace /graphql with /upload
  return graphqlUrl.replace('/graphql', '/upload');
};

// Helper function to get headers with authorization
const getHeaders = (): HeadersInit => {
  const token = SecureStorage.getAccessToken();

  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Helper function to upload file via FormData
const uploadFile = async (file: File, category: 'image' | 'contract'): Promise<string> => {
  const uploadEndpoint = getUploadEndpoint();
  const formData = new FormData();
  
  // Generate unique filename with timestamp and original name
  const fileExtension = file.name.split('.').pop();
  const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = Date.now();
  const filename = `${category}-${fileNameWithoutExt}-${timestamp}.${fileExtension}`;
  
  formData.append('file', file);
  formData.append('filename', filename);
  formData.append('category', category);
  formData.append('chunkIndex', '0');
  formData.append('totalChunks', '1');
  
  const response = await fetch(uploadEndpoint, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(`File upload failed: ${errorText || response.statusText}`);
  }
  
  const result = await response.json();
  
  // Return the path from response or construct it
  if (result.path) {
    return result.path;
  }
  
  // Fallback: construct path based on category
  if (category === 'image') {
    return `/WeFixFiles/Images/${filename}`;
  } else {
    return `/WeFixFiles/Contracts/${filename}`;
  }
};

interface Country {
  code: string | null;
  id: string;
  name: string;
}


interface State {
  id: string;
  name: string;
  nameArabic: string | null;
  parentLookupId: string | null;
}

interface UserRole {
  id: string;
  name: string;
  nameArabic: string | null;
}

interface TeamLeader {
  id: string;
  name: string;
  nameArabic: string | null;
}

interface BusinessModel {
  id: string;
  isDefault?: boolean;
  name: string;
  nameArabic: string | null;
}

interface ManagedBy {
  id: string;
  isDefault?: boolean;
  name: string;
  nameArabic: string | null;
}


interface Branch {
  branchNameArabic: string | null;
  branchNameEnglish: string | null;
  branchTitle: string;
  id: string;
}

interface CompanyWizardProps {
  onClose: () => void;
}

const CompanyWizard: FC<CompanyWizardProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<TeamLeader[]>([]);
  const [businessModels, setBusinessModels] = useState<BusinessModel[]>([]);
  const [managedBy, setManagedBy] = useState<ManagedBy[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

interface MainService {
  id: string;
  name: string;
  nameArabic: string | null;
}

interface SubService {
  id: string;
  name: string;
  nameArabic: string | null;
}

  const [mainServices, setMainServices] = useState<MainService[]>([]);
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [maintenanceServices, setMaintenanceServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    companyTitle: '',
    companyNameArabic: '',
    companyNameEnglish: '',
    countryLookupId: '',
    stateLookupId: '',
    hoAddress: '',
    hoLocation: '',
    logo: null as File | null,
    // Contract data
    contractReference: '',
    contractTitle: '',
    businessModelLookupId: '',
    managedByLookupId: '',
    ticketShortCode: '',
    isActive: true,
    numberOfOwner: 1,
    numberOfTeamLeader: 1,
    numberOfPreventiveTickets: 1,
    numberOfCorrectiveTickets: 1,
    numberOfEmergencyTickets: 1,
    contractStartDate: '',
    contractEndDate: '',
    contractFiles: [] as File[],
    contractDescription: '',
    contractValue: '0',
    // User Roles data
    userRoleId: '',
    fullNameAr: '',
    fullNameEn: '',
    userImage: null as File | null,
    userCountryId: '',
    mobileNumber: '',
    email: '',
    userDescription: '',
    userRolesTeamLeaderId: '', // Team Leader from User Roles step (readonly)
    // Branches data
    branchTitle: '',
    branchNameArabic: '',
    branchNameEnglish: '',
    branchRepresentativeName: '',
    representativeMobileNumber: '',
    representativeEmailAddress: '',
    teamLeaderId: '',
    branchIsActive: true,
    // Zones data
    zoneTitle: '',
    zoneNumber: '',
    zoneDescription: '',
    branchId: '',
    zoneIsActive: true,
    // Maintenance Services data
    mainServiceId: '',
    subServiceId: '',
  });

  const steps = [
    { number: 1, label: appText.companyWizard.steps.basicInfo },
    { number: 2, label: appText.companyWizard.steps.contracts },
    { number: 3, label: appText.companyWizard.steps.userRoles },
    { number: 4, label: appText.companyWizard.steps.branches },
    { number: 5, label: appText.companyWizard.steps.zones },
    { number: 6, label: appText.companyWizard.steps.maintenanceServices },
  ];

  const fetchSubServicesByMainServiceId = async (mainServiceId: string) => {
    try {
      const queryString = `
        query GetSubServicesByMainServiceId($mainServiceId: String!) {
          subServices: getActiveSubServicesByMainServiceId(mainServiceId: $mainServiceId) {
            id
            name
            nameArabic
          }
        }
      `;

      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: queryString,
          variables: {
            mainServiceId,
          },
        }),
        headers: getHeaders(),
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('HTTP error:', response.status, response.statusText);
        console.error('Response data:', JSON.stringify(data, null, 2));

        return;
      }

      if (data.errors) {
        console.error('GraphQL errors:', JSON.stringify(data.errors, null, 2));

        return;
      }

      if (data.data?.subServices) {
        setSubServices(data.data.subServices);
        console.log('Sub services loaded:', data.data.subServices.length);
      } else {
        console.warn('No sub services data received:', data);
      }
    } catch (error) {
      console.error('Error fetching sub services:', error);
    }
  };

  useEffect(() => {
    const fetchLookups = async () => {
      setLoading(true);

      try {
        // Fetch all lookups by category using unified lookup
        const queryString = `
          query GetLookupsByCategory {
            countries: getLookupsByCategory(category: COUNTRY) {
              id
              name
              code
              nameArabic
            }
            userRoles: getLookupsByCategory(category: USER_ROLE) {
              id
              name
              nameArabic
            }
            teamLeaders: getLookupsByCategory(category: USER_ROLE) {
              id
              name
              nameArabic
              code
            }
            businessModels: getLookupsByCategory(category: BUSINESS_MODEL) {
              id
              name
              nameArabic
              isDefault
            }
            managedBy: getLookupsByCategory(category: MANAGED_BY) {
              id
              name
              nameArabic
              isDefault
            }
            mainServices: getActiveMainServices {
              id
              name
              nameArabic
            }
            states: getLookupsByCategory(category: STATE) {
              id
              name
              nameArabic
              parentLookupId
            }
          }
        `;

        console.log('Sending GraphQL query:', queryString);
        console.log('GraphQL endpoint:', GRAPHQL_ENDPOINT);

        const lookupsResponse = await fetch(GRAPHQL_ENDPOINT, {
          body: JSON.stringify({
            query: queryString,
          }),
          headers: getHeaders(),
          method: 'POST',
        });

        if (!lookupsResponse.ok) {
          console.error('HTTP error:', lookupsResponse.status, lookupsResponse.statusText);

          const text = await lookupsResponse.text();

          console.error('Response text:', text);

          return;
        }

        const lookupsData = await lookupsResponse.json();

        console.log('Full GraphQL response:', JSON.stringify(lookupsData, null, 2));

        if (lookupsData.errors) {
          console.error('GraphQL errors:', lookupsData.errors);

          return;
        }

        if (!lookupsData.data) {
          console.error('No data in GraphQL response:', lookupsData);

          return;
        }

        if (lookupsData.data?.countries) {
          setCountries(lookupsData.data.countries);
          console.log('Countries loaded:', lookupsData.data.countries.length, lookupsData.data.countries);
        } else {
          console.warn('No countries data received. Full response:', lookupsData);
        }

        if (lookupsData.data?.userRoles) {
          setUserRoles(lookupsData.data.userRoles);
          console.log('User roles loaded:', lookupsData.data.userRoles.length);
        } else {
          console.warn('No user roles data received');
        }

        if (lookupsData.data?.teamLeaders) {
          // Filter to only show USER_ROLE with code 'TEAMLEADER'
          const teamLeaderRole = lookupsData.data.teamLeaders.filter(
            (tl: any) => tl.code === 'TEAMLEADER'
          );

          setTeamLeaders(teamLeaderRole);
          console.log('Team leaders loaded:', teamLeaderRole.length);
        } else {
          console.warn('No team leaders data received');
        }

        if (lookupsData.data?.businessModels) {
          setBusinessModels(lookupsData.data.businessModels);
          console.log('Business models loaded:', lookupsData.data.businessModels.length);
          // Set default business model (B2B - first one with isDefault or first in list)

          const defaultBusinessModel = lookupsData.data.businessModels.find((bm: any) => bm.isDefault) || lookupsData.data.businessModels[0];

          if (defaultBusinessModel && !formData.businessModelLookupId) {
            setFormData((prev) => ({ ...prev, businessModelLookupId: defaultBusinessModel.id }));
          }
        } else {
          console.warn('No business models data received');
        }

        if (lookupsData.data?.managedBy) {
          setManagedBy(lookupsData.data.managedBy);
          console.log('Managed by loaded:', lookupsData.data.managedBy.length);
          // Set default managed by (WeFix Team - one with isDefault or second in list)

          const defaultManagedBy = lookupsData.data.managedBy.find((mb: any) => mb.isDefault) || lookupsData.data.managedBy[1] || lookupsData.data.managedBy[0];

          if (defaultManagedBy && !formData.managedByLookupId) {
            setFormData((prev) => ({ ...prev, managedByLookupId: defaultManagedBy.id }));
          }
        } else {
          console.warn('No managed by data received');
        }

        if (lookupsData.data?.mainServices) {
          setMainServices(lookupsData.data.mainServices);
          console.log('Main services loaded:', lookupsData.data.mainServices.length);
        } else {
          console.warn('No main services data received');
        }

        if (lookupsData.data?.states) {
          setStates(lookupsData.data.states);
        } else {
          console.warn('No states data received');
        }
      } catch (error: any) {
        console.error('Error fetching lookups:', error);
        
        // Show user-friendly error message
        const errorMessage = error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')
          ? 'Unable to connect to the server. Please make sure the backend server is running on http://localhost:4000'
          : error.message || 'Failed to load data. Please try again later.';
        
        Swal.fire({
          icon: 'error',
          title: 'Connection Error',
          text: errorMessage,
          confirmButtonText: 'OK',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLookups();
  }, []);


  useEffect(() => {
    const fetchBranches = async () => {
      // For now, branches will be fetched after company is created
      // This is a placeholder - in a real scenario, you'd need the companyId
      // For now, we'll handle branches locally or fetch them when company is created
    };

    if (currentStep === 5) {
      fetchBranches();
    }
  }, [currentStep]);

  // Sync team leader from User Roles to Branches when entering Branches step
  useEffect(() => {
    if (currentStep === 4 && formData.userRolesTeamLeaderId && !formData.teamLeaderId) {
      const updatedTeamLeaderId = formData.userRolesTeamLeaderId;

      setFormData((prev) => ({ ...prev, teamLeaderId: updatedTeamLeaderId }));
    }
  }, [currentStep, formData.userRolesTeamLeaderId, formData.teamLeaderId]);

  // When entering Zones step, ensure branch data from step 4 is available
  useEffect(() => {
    if (currentStep === 5 && formData.branchTitle) {
      // Branch from step 4 is ready to be used
      // The branchId will be set when the branch is actually created
    }
  }, [currentStep, formData.branchTitle]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Ticket ShortCode: store only the part after "TKT-" prefix, max 6 characters
      if (field === 'ticketShortCode') {
        // Remove "TKT-" prefix if user tries to type it, keep only the suffix
        const cleanValue = value.replace(/^TKT-?/, '');
        
        // Limit to 6 characters maximum
        const limitedValue = cleanValue.length > 6 ? cleanValue.substring(0, 6) : cleanValue;

        updated[field] = limitedValue;

        // Clear validation error when user types
        if (invalidFields.has(field)) {
          const newInvalidFields = new Set(invalidFields);

          newInvalidFields.delete(field);
          setInvalidFields(newInvalidFields);
        }

        return updated;
      }

      // Contract Value: only accept numbers, max 7 characters
      if (field === 'contractValue') {
        // Remove any non-numeric characters except decimal point
        const numericValue = value.replace(/[^0-9.]/g, '');

        // Ensure only one decimal point
        const parts = numericValue.split('.');
        let cleanValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;

        // Limit to 7 characters
        if (cleanValue.length > 7) {
          cleanValue = cleanValue.substring(0, 7);
        }

        updated[field] = cleanValue || '0';

        // Clear validation error when user types
        if (invalidFields.has(field)) {
          const newInvalidFields = new Set(invalidFields);

          newInvalidFields.delete(field);
          setInvalidFields(newInvalidFields);
        }

        return updated;
      }

      // Mobile Number: only accept numbers, max 15 characters
      if (field === 'mobileNumber') {
        // Remove any non-numeric characters
        const numericValue = value.replace(/[^0-9]/g, '');

        // Limit to 15 characters
        const cleanValue = numericValue.length > 15 ? numericValue.substring(0, 15) : numericValue;

        updated[field] = cleanValue;

        // Clear validation error when user types
        if (invalidFields.has(field)) {
          const newInvalidFields = new Set(invalidFields);

          newInvalidFields.delete(field);
          setInvalidFields(newInvalidFields);
        }

        return updated;
      }

      // Clear validation error when user fills a field (for both input and select)
      if (invalidFields.has(field) && value && (typeof value === 'string' ? value.trim() !== '' : value !== '')) {
        const newInvalidFields = new Set(invalidFields);

        newInvalidFields.delete(field);
        setInvalidFields(newInvalidFields);
      }

      // When user role is selected, auto-set first team leader if not already set
      if (field === 'userRoleId' && value && !updated.userRolesTeamLeaderId && teamLeaders.length > 0) {
        const firstTeamLeader = teamLeaders[0];

        updated.userRolesTeamLeaderId = firstTeamLeader.id;
        updated.teamLeaderId = firstTeamLeader.id;
      }

      if (field === 'countryLookupId') {
        updated.stateLookupId = '';
      }

      return updated;
    });
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, logo: files[0] }));
    }
  };

  const handleContractFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files) {
      setFormData((prev) => ({ ...prev, contractFiles: Array.from(files) }));
    }
  };

  const handleUserImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, userImage: files[0] }));
    }
  };

  const handleNumberChange = (field: string, delta: number) => {
    setFormData((prev) => {
      const currentValue = prev[field as keyof typeof prev] as number;
      const newValue = Math.max(1, currentValue + delta);

      return {
        ...prev,
        [field]: newValue,
      };
    });
  };

  // Helper function to fill test data for quick testing
  const fillTestData = useCallback(() => {
    // Get first available options from loaded data
    const firstCountry = countries.length > 0 ? countries[0].id : '';
    const firstState = states.length > 0 ? states[0].id : '';
    const firstUserRole = userRoles.length > 0 ? userRoles[0].id : '';
    const firstTeamLeader = teamLeaders.length > 0 ? teamLeaders[0].id : '';
    const firstBusinessModel = businessModels.length > 0 ? businessModels[0].id : '';
    const firstManagedBy = managedBy.length > 0 ? managedBy[0].id : '';
    const firstMainService = mainServices.length > 0 ? mainServices[0].id : '';

    // Generate timestamp for unique values
    const timestamp = Date.now();

    setFormData({
      // Basic Info
      companyTitle: `Test Company ${timestamp}`,
      companyNameArabic: `شركة اختبار ${timestamp}`,
      companyNameEnglish: `Test Company ${timestamp}`,
      countryLookupId: firstCountry,
      stateLookupId: firstState,
      hoAddress: `123 Test Street, Test City ${timestamp}`,
      hoLocation: `Test Location ${timestamp}`,
      logo: null,

      // Contract data
      contractReference: `CONTRACT-${timestamp}`,
      contractTitle: `Test Contract ${timestamp}`,
      businessModelLookupId: firstBusinessModel,
      managedByLookupId: firstManagedBy,
      ticketShortCode: `TST${timestamp.toString().slice(-4)}`,
      isActive: true,
      numberOfOwner: 2,
      numberOfTeamLeader: 3,
      numberOfPreventiveTickets: 10,
      numberOfCorrectiveTickets: 5,
      numberOfEmergencyTickets: 2,
      contractStartDate: new Date().toISOString().split('T')[0], // Today
      contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      contractFiles: [],
      contractDescription: `Test contract description for testing purposes. Created at ${new Date().toLocaleString()}`,
      contractValue: '50000',

      // User Roles data
      userRoleId: firstUserRole,
      fullNameAr: `اسم اختبار ${timestamp}`,
      fullNameEn: `Test Name ${timestamp}`,
      userImage: null,
      userCountryId: firstCountry,
      mobileNumber: `+9627${timestamp.toString().slice(-8)}`,
      email: `test${timestamp}@example.com`,
      userDescription: `Test user description ${timestamp}`,
      userRolesTeamLeaderId: firstTeamLeader,

      // Branches data
      branchTitle: `Test Branch ${timestamp}`,
      branchNameArabic: `فرع اختبار ${timestamp}`,
      branchNameEnglish: `Test Branch ${timestamp}`,
      branchRepresentativeName: `Test Representative ${timestamp}`,
      representativeMobileNumber: `+9627${timestamp.toString().slice(-8)}`,
      representativeEmailAddress: `branch${timestamp}@example.com`,
      teamLeaderId: firstTeamLeader,
      branchIsActive: true,

      // Zones data
      zoneTitle: `Test Zone ${timestamp}`,
      zoneNumber: `Z-${timestamp.toString().slice(-6)}`,
      zoneDescription: `Test zone description ${timestamp}`,
      branchId: '', // Will be set when branch is created
      zoneIsActive: true,

      // Maintenance Services data
      mainServiceId: firstMainService,
      subServiceId: '', // Will be loaded based on mainServiceId
    });

    Swal.fire({
      icon: 'success',
      title: 'Test Data Loaded',
      text: 'All form fields have been filled with test data.',
      timer: 2000,
      showConfirmButton: false,
    });
  }, [countries, states, userRoles, teamLeaders, businessModels, managedBy, mainServices]);

  // Keyboard shortcut for test data (Ctrl+Shift+T or Cmd+Shift+T)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check for Ctrl+Shift+T (Windows/Linux) or Cmd+Shift+T (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        fillTestData();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [fillTestData]);

  useEffect(() => {
    if (currentStep === 2 && !formData.contractReference && formData.companyTitle) {
      const shortName = formData.companyTitle.substring(0, 2).toUpperCase();
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const contractRef = `CNT-${shortName}-${randomNum}`;
      // Only auto-generate ticketShortCode if it's still empty
      const ticketCode = formData.ticketShortCode === '' ? shortName : formData.ticketShortCode;

      setFormData((prev) => ({
        ...prev,
        contractReference: contractRef,
        ticketShortCode: ticketCode,
      }));
    }
  }, [currentStep, formData.companyTitle, formData.contractReference, formData.ticketShortCode]);

  // Generate a simple UUID-like string
  const generateUUID = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.floor(Math.random() * 16);
      const v = c === 'x' ? r : Math.floor(r % 4) + 8;

      return v.toString(16);
    });

  // Generate company ID from company title
  const generateCompanyId = (title: string) => {
    const shortName = title.substring(0, 3).toUpperCase().replace(/\s/g, '');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    return `${shortName}-${randomNum}`;
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Basic Info
        const filteredStates = states.filter(
          (state) => state.parentLookupId === formData.countryLookupId,
        );
        const requiredFields = [
          { 
            key: 'companyTitle', 
            value: formData.companyTitle,
            minLength: 5,
            maxLength: 100,
          },
          { 
            key: 'companyNameArabic', 
            value: formData.companyNameArabic,
            minLength: 5,
            maxLength: 100,
          },
          { 
            key: 'companyNameEnglish', 
            value: formData.companyNameEnglish,
            minLength: 5,
            maxLength: 100,
          },
          { key: 'countryLookupId', value: formData.countryLookupId },
          // Only require state if country is selected and states are available
          { 
            key: 'stateLookupId', 
            value: formData.stateLookupId,
            condition: formData.countryLookupId && filteredStates.length > 0,
          },
          { 
            key: 'ticketShortCode', 
            value: formData.ticketShortCode,
            maxLength: 6,
          },
        ];

        const invalid = new Set<string>();
        const lengthErrors: Record<string, string> = {};

        requiredFields.forEach((field) => {
          // Skip validation if condition is false
          if ('condition' in field && !field.condition) {
            return;
          }

          const value = typeof field.value === 'string' ? field.value.trim() : field.value;

          // Check if empty
          if (!value || value === '') {
            invalid.add(field.key);

            return;
          }

          // Check length constraints
          if ('minLength' in field && 'maxLength' in field && typeof value === 'string') {
            const minLength = 'minLength' in field ? field.minLength : undefined;
            const maxLength = 'maxLength' in field ? field.maxLength : undefined;

            if (minLength !== undefined && value.length < minLength) {
              invalid.add(field.key);
              lengthErrors[field.key] = `must be at least ${minLength} characters`;
            } else if (maxLength !== undefined && value.length > maxLength) {
              invalid.add(field.key);
              lengthErrors[field.key] = `must be at most ${maxLength} characters`;
            }
          }
        });

        if (invalid.size > 0) {
          setInvalidFields(invalid);

          // Map field keys to display names
          const fieldNameMap: Record<string, string> = {
            companyTitle: appText.companyWizard.basicInfo.companyTitle,
            companyNameArabic: appText.companyWizard.basicInfo.companyNameArabic,
            companyNameEnglish: appText.companyWizard.basicInfo.companyNameEnglish,
            countryLookupId: appText.companyWizard.basicInfo.country,
            stateLookupId: appText.companyWizard.basicInfo.state,
            ticketShortCode: appText.companyWizard.contracts.ticketShortCode,
          };

          // Create bullet list of invalid fields with error details
          const invalidFieldNames = Array.from(invalid)
            .map((key) => {
              const fieldName = fieldNameMap[key] || key;
              const lengthError = lengthErrors[key];

              return `• ${fieldName}${lengthError ? ` (${lengthError})` : ''}`;
            })
            .join('<br>');

          // Focus on first invalid field
          setTimeout(() => {
            const firstInvalidField = Array.from(invalid)[0];
            const element = document.querySelector(`[name="${firstInvalidField}"]`) as HTMLElement;

            if (element) {
              element.focus();
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);

          Swal.fire({
            icon: 'warning',
            html: `
              <div style="text-align: left;">
                <p style="margin-bottom: 10px;">Please fill in all required fields in Basic Info step:</p>
                <div style="margin-left: 20px;">
                  ${invalidFieldNames}
                </div>
              </div>
            `,
            title: 'Validation Error',
          });

          return false;
        }

        setInvalidFields(new Set());

        return true;

      case 2: // Contracts
        const contractInvalid = new Set<string>();
        const contractErrors: Record<string, string> = {};

        // Check required fields
        if (!formData.contractTitle) {
          contractInvalid.add('contractTitle');
        }

        if (!formData.businessModelLookupId) {
          contractInvalid.add('businessModelLookupId');
        }

        if (!formData.managedByLookupId) {
          contractInvalid.add('managedByLookupId');
        }

        // Check dates
        if (!formData.contractStartDate) {
          contractInvalid.add('contractStartDate');
        }

        if (!formData.contractEndDate) {
          contractInvalid.add('contractEndDate');
        } else if (formData.contractStartDate && formData.contractEndDate) {
          // Validate End Date >= Start Date
          const startDate = new Date(formData.contractStartDate);
          const endDate = new Date(formData.contractEndDate);

          if (endDate < startDate) {
            contractInvalid.add('contractEndDate');
            contractErrors.contractEndDate = 'must be greater than or equal to Start Date';
          }

          // Validate Start Date <= End Date
          if (startDate > endDate) {
            contractInvalid.add('contractStartDate');
            contractErrors.contractStartDate = 'must be less than or equal to End Date';
          }
        }

        if (contractInvalid.size > 0) {
          setInvalidFields(contractInvalid);

          // Map field keys to display names
          const contractFieldNameMap: Record<string, string> = {
            contractTitle: appText.companyWizard.contracts.contractTitle,
            businessModelLookupId: appText.companyWizard.contracts.businessModel,
            managedByLookupId: appText.companyWizard.contracts.managedBy,
            contractStartDate: appText.companyWizard.contracts.contractStartDate,
            contractEndDate: appText.companyWizard.contracts.contractEndDate,
          };

          // Create bullet list of invalid fields with error details
          const invalidFieldNames = Array.from(contractInvalid)
            .map((key) => {
              const fieldName = contractFieldNameMap[key] || key;
              const error = contractErrors[key];

              return `• ${fieldName}${error ? ` (${error})` : ''}`;
            })
            .join('<br>');

          // Focus on first invalid field
          setTimeout(() => {
            const firstInvalidField = Array.from(contractInvalid)[0];
            const element = document.querySelector(`[name="${firstInvalidField}"]`) as HTMLElement;

            if (element) {
              element.focus();
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);

          Swal.fire({
            icon: 'warning',
            html: `
              <div style="text-align: left;">
                <p style="margin-bottom: 10px;">Please fill in all required fields in Contracts step:</p>
                <div style="margin-left: 20px;">
                  ${invalidFieldNames}
                </div>
              </div>
            `,
            title: 'Validation Error',
          });

          return false;
        }

        setInvalidFields(new Set());

        return true;

      case 3: // User Roles
        const userRolesInvalid = new Set<string>();
        const userRolesErrors: Record<string, string> = {};

        // Validate Full Name Arabic
        if (!formData.fullNameAr || formData.fullNameAr.trim() === '') {
          userRolesInvalid.add('fullNameAr');
        } else if (formData.fullNameAr.trim().length < 5) {
          userRolesInvalid.add('fullNameAr');
          userRolesErrors.fullNameAr = 'must be at least 5 characters';
        } else if (formData.fullNameAr.trim().length > 50) {
          userRolesInvalid.add('fullNameAr');
          userRolesErrors.fullNameAr = 'must be at most 50 characters';
        }

        // Validate Full Name English
        if (!formData.fullNameEn || formData.fullNameEn.trim() === '') {
          userRolesInvalid.add('fullNameEn');
        } else if (formData.fullNameEn.trim().length < 5) {
          userRolesInvalid.add('fullNameEn');
          userRolesErrors.fullNameEn = 'must be at least 5 characters';
        } else if (formData.fullNameEn.trim().length > 50) {
          userRolesInvalid.add('fullNameEn');
          userRolesErrors.fullNameEn = 'must be at most 50 characters';
        }

        // Validate Mobile Number
        if (!formData.mobileNumber || formData.mobileNumber.trim() === '') {
          userRolesInvalid.add('mobileNumber');
        }

        // Email is optional, no validation needed

        if (userRolesInvalid.size > 0) {
          setInvalidFields(userRolesInvalid);

          const fieldNameMap: Record<string, string> = {
            fullNameAr: appText.companyWizard.userRoles.fullNameAr,
            fullNameEn: appText.companyWizard.userRoles.fullNameEn,
            mobileNumber: appText.companyWizard.userRoles.mobileNumber,
            email: appText.companyWizard.userRoles.emailAddress,
          };

          const invalidFieldNames = Array.from(userRolesInvalid)
            .map((key) => {
              const fieldName = fieldNameMap[key] || key;
              const error = userRolesErrors[key];

              return `• ${fieldName}${error ? ` (${error})` : ''}`;
            })
            .join('<br>');

          setTimeout(() => {
            const firstInvalidField = Array.from(userRolesInvalid)[0];
            const element = document.querySelector(`[name="${firstInvalidField}"]`) as HTMLElement;

            if (element) {
              element.focus();
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);

          Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            html: `Please fill in all required fields in User Roles step:<br>${invalidFieldNames}`,
          });

          return false;
        }

        setInvalidFields(new Set());

        return true;

      case 4: // Branches
        const branchesInvalid = new Set<string>();
        const branchesErrors: Record<string, string> = {};

        // Check required fields
        if (!formData.branchTitle || formData.branchTitle.trim() === '') {
          branchesInvalid.add('branchTitle');
        }

        if (!formData.branchNameArabic || formData.branchNameArabic.trim() === '') {
          branchesInvalid.add('branchNameArabic');
        }

        if (!formData.branchNameEnglish || formData.branchNameEnglish.trim() === '') {
          branchesInvalid.add('branchNameEnglish');
        }

        if (!formData.branchRepresentativeName || formData.branchRepresentativeName.trim() === '') {
          branchesInvalid.add('branchRepresentativeName');
        }

        if (!formData.representativeMobileNumber || formData.representativeMobileNumber.trim() === '') {
          branchesInvalid.add('representativeMobileNumber');
        }

        if (branchesInvalid.size > 0) {
          setInvalidFields(branchesInvalid);

          const fieldNameMap: Record<string, string> = {
            branchTitle: appText.companyWizard.branches.branchTitle,
            branchNameArabic: appText.companyWizard.branches.branchNameArabic,
            branchNameEnglish: appText.companyWizard.branches.branchNameEnglish,
            branchRepresentativeName: appText.companyWizard.branches.branchRepresentativeName,
            representativeMobileNumber: appText.companyWizard.branches.representativeMobileNumber,
          };

          const invalidFieldNames = Array.from(branchesInvalid)
            .map((key) => {
              const fieldName = fieldNameMap[key] || key;
              const error = branchesErrors[key];

              return `• ${fieldName}${error ? ` (${error})` : ''}`;
            })
            .join('<br>');

          setTimeout(() => {
            const firstInvalidField = Array.from(branchesInvalid)[0];
            const element = document.querySelector(`[name="${firstInvalidField}"]`) as HTMLElement;

            if (element) {
              element.focus();
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);

          Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            html: `Please fill in all required fields in Branches step:<br>${invalidFieldNames}`,
          });

          return false;
        }

        setInvalidFields(new Set());

        return true;

      case 5: // Zones
        const zonesInvalid = new Set<string>();
        const zonesErrors: Record<string, string> = {};

        // Check required fields
        if (!formData.zoneTitle || formData.zoneTitle.trim() === '') {
          zonesInvalid.add('zoneTitle');
        }

        // Check if branch is selected (from previous step)
        if (!formData.branchTitle || formData.branchTitle.trim() === '') {
          zonesInvalid.add('branch');
        }

        if (zonesInvalid.size > 0) {
          setInvalidFields(zonesInvalid);

          const fieldNameMap: Record<string, string> = {
            zoneTitle: appText.companyWizard.zones.zoneTitle,
            branch: appText.companyWizard.zones.branch,
          };

          const invalidFieldNames = Array.from(zonesInvalid)
            .map((key) => {
              const fieldName = fieldNameMap[key] || key;
              const error = zonesErrors[key];

              return `• ${fieldName}${error ? ` (${error})` : ''}`;
            })
            .join('<br>');

          setTimeout(() => {
            const firstInvalidField = Array.from(zonesInvalid)[0];
            const element = document.querySelector(`[name="${firstInvalidField}"]`) as HTMLElement;

            if (element) {
              element.focus();
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);

          Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            html: `Please fill in all required fields in Zones step:<br>${invalidFieldNames}`,
          });

          return false;
        }

        setInvalidFields(new Set());

        return true;

      case 6: // Maintenance Services
        if (maintenanceServices.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please add at least one maintenance service.',
          });

          return false;
        }

        return true;

      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Validate all steps
      for (let i = 1; i <= steps.length; i++) {
        if (!validateStep(i)) {
          setLoading(false);

          return;
        }
      }

      // Generate company ID
      const companyId = generateCompanyId(formData.companyTitle);

      // Upload logo if provided
      let logoPath: string | null = null;

      if (formData.logo) {
        try {
          logoPath = await uploadFile(formData.logo, 'image');
        } catch (error) {
          console.error('Error uploading logo:', error);
          await Swal.fire({
            icon: 'error',
            title: 'Logo Upload Failed',
            text: error instanceof Error ? error.message : 'Failed to upload company logo. Please try again.',
          });
          setLoading(false);

          return;
        }
      }

      // Step 1: Create Company
      const createCompanyMutation = `
        mutation CreateCompany($companyData: CreateCompanyInput!) {
          createCompany(companyData: $companyData) {
            company {
              id
              companyId
              title
            }
            message
          }
        }
      `;

      const companyData = {
        companyId,
        title: formData.companyTitle,
        companyNameArabic: formData.companyNameArabic || null,
        companyNameEnglish: formData.companyNameEnglish || null,
        countryLookupId: formData.countryLookupId || null,
        hoAddress: formData.hoAddress || null,
        hoLocation: formData.hoLocation || null,
        ticketShortCode: formData.ticketShortCode || null,
        isActive: formData.isActive ? 'ACTIVE' : 'INACTIVE',
        logo: logoPath,
      };

      const companyResponse = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: createCompanyMutation,
          variables: { companyData },
        }),
        headers: getHeaders(),
        method: 'POST',
      });

      const companyPayload = await companyResponse.json();

      if (companyPayload.errors) {
        throw new Error(companyPayload.errors[0].message);
      }

      const createdCompany = companyPayload.data?.createCompany?.company;

      if (!createdCompany) {
        throw new Error('Failed to create company');
      }

      const createdCompanyId = createdCompany.id;

      // Step 2: Create Contract
      const createContractMutation = `
        mutation CreateContract($contractData: CreateContractInput!) {
          createContract(contractData: $contractData) {
            contract {
              id
              contractReference
            }
            message
          }
        }
      `;

      const contractData = {
        contractTitle: formData.contractTitle,
        companyId: createdCompanyId,
        businessModelLookupId: formData.businessModelLookupId,
        isActive: formData.isActive,
        numberOfTeamLeaders: formData.numberOfTeamLeader || 0,
        numberOfPreventiveTickets: formData.numberOfPreventiveTickets || 0,
        numberOfCorrectiveTickets: formData.numberOfCorrectiveTickets || 0,
        contractStartDate: formData.contractStartDate || null,
        contractEndDate: formData.contractEndDate || null,
        contractValue: formData.contractValue ? parseFloat(formData.contractValue) : null,
        contractDescription: formData.contractDescription || null,
        contractFiles: null, // TODO: Handle contract files upload if needed
      };

      const contractResponse = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: createContractMutation,
          variables: { contractData },
        }),
        headers: getHeaders(),
        method: 'POST',
      });

      const contractPayload = await contractResponse.json();

      if (contractPayload.errors) {
        throw new Error(`Failed to create contract: ${contractPayload.errors[0].message}`);
      }

      // Step 3: Create Branch
      const createBranchMutation = `
        mutation CreateBranch($branchData: CreateBranchInput!) {
          createBranch(branchData: $branchData) {
            id
            branchTitle
          }
        }
      `;

      const branchData = {
        branchTitle: formData.branchTitle,
        branchNameArabic: formData.branchNameArabic || null,
        branchNameEnglish: formData.branchNameEnglish || null,
        branchRepresentativeName: formData.branchRepresentativeName || null,
        representativeMobileNumber: formData.representativeMobileNumber || null,
        representativeEmailAddress: formData.representativeEmailAddress || null,
        companyId: createdCompanyId,
        teamLeaderLookupId: formData.userRolesTeamLeaderId || null,
        isActive: formData.branchIsActive,
      };

      const branchResponse = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: createBranchMutation,
          variables: { branchData },
        }),
        headers: getHeaders(),
        method: 'POST',
      });

      const branchPayload = await branchResponse.json();

      if (branchPayload.errors) {
        throw new Error(`Failed to create branch: ${branchPayload.errors[0].message}`);
      }

      const createdBranch = branchPayload.data?.createBranch;

      if (!createdBranch) {
        throw new Error('Failed to create branch');
      }

      const createdBranchId = createdBranch.id;

      // Step 4: Create Zone
      const createZoneMutation = `
        mutation CreateZone($zoneData: CreateZoneInput!) {
          createZone(zoneData: $zoneData) {
            id
            zoneTitle
          }
        }
      `;

      const zoneData = {
        zoneTitle: formData.zoneTitle,
        zoneNumber: formData.zoneNumber || null,
        zoneDescription: formData.zoneDescription || null,
        branchId: createdBranchId,
        isActive: formData.zoneIsActive,
      };

      const zoneResponse = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: createZoneMutation,
          variables: { zoneData },
        }),
        headers: getHeaders(),
        method: 'POST',
      });

      const zonePayload = await zoneResponse.json();

      if (zonePayload.errors) {
        throw new Error(`Failed to create zone: ${zonePayload.errors[0].message}`);
      }

      // Step 5: Create Maintenance Services
      const createMaintenanceServiceMutation = `
        mutation CreateMaintenanceService($serviceData: CreateMaintenanceServiceInput!) {
          createMaintenanceService(serviceData: $serviceData) {
            id
          }
        }
      `;

      const maintenanceServicePromises = maintenanceServices.map((service) => {
        const serviceData = {
          itemId: createdCompanyId,
          itemType: 'COMPANY',
          mainServiceId: service.mainServiceId,
          subServiceId: service.subServiceId,
          isActive: true,
        };

        return fetch(GRAPHQL_ENDPOINT, {
          body: JSON.stringify({
            query: createMaintenanceServiceMutation,
            variables: { serviceData },
          }),
          headers: getHeaders(),
          method: 'POST',
        });
      });

      const maintenanceServiceResponses = await Promise.all(maintenanceServicePromises);

      for (const response of maintenanceServiceResponses) {
        const payload = await response.json();

        if (payload.errors) {
          throw new Error(`Failed to create maintenance service: ${payload.errors[0].message}`);
        }
      }

      // Success!
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Company created successfully!',
        timer: 2000,
        showConfirmButton: false,
      });
      onClose();
    } catch (error: any) {
      console.error('Error creating company:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to create company: ${error.message || 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === steps.length) {
      // Last step - submit
      handleSubmit();
    } else if (currentStep < steps.length) {
      // Validate current step before moving to next
      if (validateStep(currentStep)) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= steps.length) {
      setCurrentStep(stepNumber);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const renderBasicInfo = () => (
    <Container className={styles.stepContent}>
      <Form className={styles.form} onSubmit={handleFormSubmit}>
        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.basicInfo.companyTitle} <span className={styles.required}>*</span>
            </label>
            <InputField
              maxLength={100}
              minLength={5}
              name="companyTitle"
              onChange={(e) => handleInputChange('companyTitle', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.basicInfo.companyTitlePlaceholder}
              title="Company Title must be between 5 and 100 characters"
              type="text"
              value={formData.companyTitle}
              className={invalidFields.has('companyTitle') ? styles.inputError : ''}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.basicInfo.companyNameArabic} <span className={styles.required}>*</span>
            </label>
            <InputField
              maxLength={100}
              minLength={5}
              name="companyNameArabic"
              onChange={(e) => handleInputChange('companyNameArabic', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.basicInfo.companyNameArabicPlaceholder}
              title="Company Name Arabic must be between 5 and 100 characters"
              type="text"
              value={formData.companyNameArabic}
              className={invalidFields.has('companyNameArabic') ? styles.inputError : ''}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.basicInfo.companyNameEnglish} <span className={styles.required}>*</span>
            </label>
            <InputField
              maxLength={100}
              minLength={5}
              name="companyNameEnglish"
              onChange={(e) => handleInputChange('companyNameEnglish', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.basicInfo.companyNameEnglishPlaceholder}
              title="Company Name English must be between 5 and 100 characters"
              type="text"
              value={formData.companyNameEnglish}
              className={invalidFields.has('companyNameEnglish') ? styles.inputError : ''}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.basicInfo.country} <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${invalidFields.has('countryLookupId') ? styles.selectError : ''}`}
              onChange={(e) => handleInputChange('countryLookupId', e.target.value)}
              value={formData.countryLookupId}
            >
              <option value="">{appText.companyWizard.basicInfo.selectCountry}</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </Container>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.basicInfo.state} <span className={styles.required}>*</span>
            </label>
            {(() => {
              const filteredStates = states.filter(
                (state) => state.parentLookupId === formData.countryLookupId,
              );

              return (
                <>
                  <select
                    className={`${styles.select} ${invalidFields.has('stateLookupId') ? styles.selectError : ''}`}
                    disabled={!formData.countryLookupId || filteredStates.length === 0}
                    onChange={(e) => handleInputChange('stateLookupId', e.target.value)}
                    value={formData.stateLookupId}
                  >
                    <option value="">{appText.companyWizard.basicInfo.selectState}</option>
                    {filteredStates.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  {!formData.countryLookupId && (
                    <Paragraph className={styles.helperText}>
                      {appText.companyWizard.basicInfo.selectCountry}
                    </Paragraph>
                  )}
                  {formData.countryLookupId && filteredStates.length === 0 && (
                    <Paragraph className={styles.helperText}>
                      {appText.companyWizard.basicInfo.noStates ||
                        'No states available for this country.'}
                    </Paragraph>
                  )}
                </>
              );
            })()}
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.contracts.ticketShortCode} <span className={styles.required}>*</span>
            </label>
            <Container className={`${styles.ticketShortCodeContainer} ${invalidFields.has('ticketShortCode') ? styles.ticketShortCodeContainerError : ''}`}>
              <span className={styles.ticketPrefix}>TKT-</span>
              <input
                className={styles.ticketShortCodeInput}
                maxLength={6}
                name="ticketShortCode"
                onChange={(e) => {
                  const value = e.target.value;

                  handleInputChange('ticketShortCode', value);
                }}
                placeholder="XXXXXX"
                type="text"
                value={formData.ticketShortCode.replace('TKT-', '')}
              />
            </Container>
            <Paragraph className={styles.helperText}>
              {appText.companyWizard.contracts.ticketShortCodeHelper}
            </Paragraph>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>{appText.companyWizard.basicInfo.hoAddress}</label>
            <TextArea
              name="hoAddress"
              onChange={(e) => handleInputChange('hoAddress', e.target.value)}
              placeholder={appText.companyWizard.basicInfo.hoAddressPlaceholder}
              value={formData.hoAddress}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <Heading className={styles.sectionSubtitle} level="4">
              {appText.companyWizard.basicInfo.hoLocationMap}
            </Heading>
            <Container className={styles.mapPlaceholder} onClick={() => undefined}>
              <i className="fas fa-map-marker-alt" style={{ color: '#ff6b35', fontSize: '24px', marginBottom: '8px' }}></i>
              <Paragraph>{appText.companyWizard.basicInfo.mapPlaceholder}</Paragraph>
            </Container>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <Heading className={styles.sectionSubtitle} level="4">
              {appText.companyWizard.basicInfo.companyLogo}
            </Heading>
            <Container className={styles.logoUpload}>
              <input
                accept="image/*"
                className={styles.fileInput}
                id="logo-upload"
                onChange={handleFileChange}
                type="file"
              />
              <label className={styles.fileLabel} htmlFor="logo-upload">
                <i className="fas fa-paperclip" style={{ fontSize: '32px', marginBottom: '8px' }}></i>
                <Paragraph>{appText.companyWizard.basicInfo.logoPlaceholder}</Paragraph>
              </label>
              {formData.logo && (
                <Paragraph className={styles.fileName}>{formData.logo.name}</Paragraph>
              )}
            </Container>
          </Container>
        </Container>
      </Form>
    </Container>
  );

  const renderContracts = () => (
    <Container className={styles.stepContent}>
      <Form className={styles.form} onSubmit={handleFormSubmit}>
        {/* 2 Columns */}
        <Container className={styles.formRow}>
          <Container className={`${styles.formField} ${styles.formFieldFixedWidth}`}>
            <label className={styles.label}>
              {appText.companyWizard.contracts.contractTitle} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="contractTitle"
              onChange={(e) => handleInputChange('contractTitle', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.contracts.contractTitlePlaceholder || 'Enter contract title'}
              title=""
              type="text"
              value={formData.contractTitle}
              className={invalidFields.has('contractTitle') ? styles.inputError : ''}
            />
          </Container>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.contracts.contractValue}
            </label>
            <Container className={styles.currencyInputContainer}>
              <span className={styles.currencyPrefix}>JD</span>
              <InputField
                name="contractValue"
                onChange={(e) => handleInputChange('contractValue', e.target.value)}
                pattern="[0-9.]*"
                placeholder={appText.companyWizard.contracts.contractValuePlaceholder}
                title="Only numbers are allowed (max 7 characters)"
                type="text"
                maxLength={7}
                value={formData.contractValue}
              />
            </Container>
          </Container>
        </Container>

        {/* 2 Columns */}
        <Container className={styles.formRow}>
          <Container className={`${styles.formField} ${styles.formFieldFixedWidth}`}>
            <label className={styles.label}>
              {appText.companyWizard.contracts.businessModel} <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${invalidFields.has('businessModelLookupId') ? styles.selectError : ''}`}
              onChange={(e) => handleInputChange('businessModelLookupId', e.target.value)}
              value={formData.businessModelLookupId}
            >
              <option value="">{appText.companyWizard.contracts.selectBusinessModel}</option>
              {businessModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </Container>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.contracts.managedBy} <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${invalidFields.has('managedByLookupId') ? styles.selectError : ''}`}
              onChange={(e) => handleInputChange('managedByLookupId', e.target.value)}
              value={formData.managedByLookupId}
            >
              <option value="">{appText.companyWizard.contracts.selectManagedBy}</option>
              {managedBy.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.numberCounter}>
            <label className={styles.label}>{appText.companyWizard.contracts.numberOfOwner}</label>
            <Container className={styles.counterControls}>
              <Button
                className={styles.counterButton}
                onClick={() => handleNumberChange('numberOfOwner', -1)}
                type="button"
              >
                -
              </Button>
              <span className={styles.counterValue}>{formData.numberOfOwner}</span>
              <Button
                className={styles.counterButton}
                onClick={() => handleNumberChange('numberOfOwner', 1)}
                type="button"
              >
                +
              </Button>
            </Container>
          </Container>
          <Container className={styles.numberCounter}>
            <label className={styles.label}>{appText.companyWizard.contracts.numberOfTeamLeader}</label>
            <Container className={styles.counterControls}>
              <Button
                className={styles.counterButton}
                onClick={() => handleNumberChange('numberOfTeamLeader', -1)}
                type="button"
              >
                -
              </Button>
              <span className={styles.counterValue}>{formData.numberOfTeamLeader}</span>
              <Button
                className={styles.counterButton}
                onClick={() => handleNumberChange('numberOfTeamLeader', 1)}
                type="button"
              >
                +
              </Button>
            </Container>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.numberCounter}>
            <label className={styles.label}>{appText.companyWizard.contracts.numberOfPreventiveTickets}</label>
            <Container className={styles.counterControls}>
              <Button
                className={styles.counterButton}
                onClick={() => handleNumberChange('numberOfPreventiveTickets', -1)}
                type="button"
              >
                -
              </Button>
              <span className={styles.counterValue}>{formData.numberOfPreventiveTickets}</span>
              <Button
                className={styles.counterButton}
                onClick={() => handleNumberChange('numberOfPreventiveTickets', 1)}
                type="button"
              >
                +
              </Button>
            </Container>
          </Container>
          <Container className={styles.numberCounter}>
            <label className={styles.label}>{appText.companyWizard.contracts.numberOfCorrectiveTickets}</label>
            <Container className={styles.counterControls}>
              <Button
                className={styles.counterButton}
                onClick={() => handleNumberChange('numberOfCorrectiveTickets', -1)}
                type="button"
              >
                -
              </Button>
              <span className={styles.counterValue}>{formData.numberOfCorrectiveTickets}</span>
              <Button
                className={styles.counterButton}
                onClick={() => handleNumberChange('numberOfCorrectiveTickets', 1)}
                type="button"
              >
                +
              </Button>
            </Container>
          </Container>
          <Container className={styles.numberCounter}>
            <label className={styles.label}>{appText.companyWizard.contracts.numberOfEmergencyTickets}</label>
            <Container className={styles.counterControls}>
              <Button
                className={styles.counterButton}
                onClick={() => handleNumberChange('numberOfEmergencyTickets', -1)}
                type="button"
              >
                -
              </Button>
              <span className={styles.counterValue}>{formData.numberOfEmergencyTickets}</span>
              <Button
                className={styles.counterButton}
                onClick={() => handleNumberChange('numberOfEmergencyTickets', 1)}
                type="button"
              >
                +
              </Button>
            </Container>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.dateField}>
            <label className={styles.label}>
              <i className="fas fa-calendar" style={{ marginRight: '8px' }}></i>
              {appText.companyWizard.contracts.contractStartDate} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="contractStartDate"
              onChange={(e) => {
                handleInputChange('contractStartDate', e.target.value);
                // Clear end date error if start date changes

                if (invalidFields.has('contractEndDate')) {
                  const newInvalidFields = new Set(invalidFields);

                  newInvalidFields.delete('contractEndDate');
                  setInvalidFields(newInvalidFields);
                }
              }}
              pattern={undefined}
              placeholder={appText.companyWizard.contracts.datePlaceholder}
              title={formData.contractEndDate ? `Start Date must be on or before ${formData.contractEndDate}` : 'Start Date must be less than or equal to End Date'}
              type="date"
              max={formData.contractEndDate || undefined}
              value={formData.contractStartDate}
              className={invalidFields.has('contractStartDate') ? styles.inputError : ''}
            />
          </Container>
          <Container className={styles.dateField}>
            <label className={styles.label}>
              <i className="fas fa-calendar" style={{ marginRight: '8px' }}></i>
              {appText.companyWizard.contracts.contractEndDate} <span className={styles.required}>*</span>
            </label>
            <InputField
              min={formData.contractStartDate || undefined}
              name="contractEndDate"
              onChange={(e) => handleInputChange('contractEndDate', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.contracts.datePlaceholder}
              title={formData.contractStartDate ? `End Date must be on or after ${formData.contractStartDate}` : 'End Date must be greater than or equal to Start Date'}
              type="date"
              value={formData.contractEndDate}
              className={invalidFields.has('contractEndDate') ? styles.inputError : ''}
            />
          </Container>
          <Container className={styles.formField}>
            <label className={styles.label}>{appText.companyWizard.contracts.isActive}</label>
            <Container className={styles.toggleContainer}>
              <label className={styles.toggleLabel}>
                <input
                  checked={formData.isActive}
                  className={styles.toggleInput}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  type="checkbox"
                />
                <span className={`${styles.toggleSlider} ${formData.isActive ? styles.toggleActive : ''}`}></span>
                <span className={styles.toggleText}>
                  {formData.isActive ? appText.companyWizard.contracts.active : appText.companyWizard.contracts.inactive}
                </span>
              </label>
            </Container>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <Heading className={styles.sectionSubtitle} level="4">
              <i className="fas fa-file-alt" style={{ marginRight: '8px' }}></i>
              {appText.companyWizard.contracts.contractFiles}
            </Heading>
            <Container className={styles.fileUpload}>
              <input
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className={styles.fileInput}
                id="contract-files-upload"
                multiple
                onChange={handleContractFilesChange}
                type="file"
              />
              <label className={styles.fileLabel} htmlFor="contract-files-upload">
                <i className="fas fa-cloud-upload-alt" style={{ fontSize: '32px', marginBottom: '8px' }}></i>
                <Paragraph>{appText.companyWizard.contracts.contractFilesPlaceholder}</Paragraph>
              </label>
            </Container>
            <Paragraph className={styles.helperText}>
              {appText.companyWizard.contracts.contractFilesHelper}
            </Paragraph>
            {formData.contractFiles.length > 0 && (
              <Container className={styles.fileList}>
                {formData.contractFiles.map((file, index) => (
                  <Paragraph key={index} className={styles.fileName}>
                    {file.name}
                  </Paragraph>
                ))}
              </Container>
            )}
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <Heading className={styles.sectionSubtitle} level="4">
              <i className="fas fa-pencil-alt" style={{ marginRight: '8px' }}></i>
              {appText.companyWizard.contracts.contractDescription}
            </Heading>
            <TextArea
              name="contractDescription"
              onChange={(e) => handleInputChange('contractDescription', e.target.value)}
              placeholder={appText.companyWizard.contracts.contractDescriptionPlaceholder}
              value={formData.contractDescription}
            />
          </Container>
        </Container>

      </Form>
    </Container>
  );

  const renderUserRoles = () => (
    <Container className={styles.stepContent}>
      <Form className={styles.form} onSubmit={handleFormSubmit}>
        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              <i className="fas fa-user-tie" style={{ marginRight: '8px' }}></i>
              {appText.companyWizard.userRoles.teamLeaderReadonly}
            </label>
            <select
              className={styles.select}
              disabled
              value={formData.userRolesTeamLeaderId}
            >
              <option value="">{appText.companyWizard.branches.selectTeamLeader}</option>
              {teamLeaders.map((leader) => (
                <option key={leader.id} value={leader.id}>
                  {leader.name}
                </option>
              ))}
            </select>
            <Paragraph className={styles.helperText}>
              This team leader will be used for all branches
            </Paragraph>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              <i className="fas fa-user" style={{ marginRight: '8px' }}></i>
              {appText.companyWizard.userRoles.fullNameAr} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="fullNameAr"
              onChange={(e) => handleInputChange('fullNameAr', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.userRoles.fullNameArPlaceholder}
              title="Full Name Arabic must be between 5 and 50 characters"
              type="text"
              minLength={5}
              maxLength={50}
              value={formData.fullNameAr}
              className={invalidFields.has('fullNameAr') ? styles.inputError : ''}
            />
          </Container>
          <Container className={styles.formField}>
            <label className={styles.label}>
              <i className="fas fa-user" style={{ marginRight: '8px' }}></i>
              {appText.companyWizard.userRoles.fullNameEn} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="fullNameEn"
              onChange={(e) => handleInputChange('fullNameEn', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.userRoles.fullNameEnPlaceholder}
              title="Full Name English must be between 5 and 50 characters"
              type="text"
              minLength={5}
              maxLength={50}
              value={formData.fullNameEn}
              className={invalidFields.has('fullNameEn') ? styles.inputError : ''}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <Heading className={styles.sectionSubtitle} level="4">
              {appText.companyWizard.userRoles.userImage}
            </Heading>
            <Container className={styles.logoUpload}>
              <input
                accept="image/*"
                className={styles.fileInput}
                id="user-image-upload"
                onChange={handleUserImageChange}
                type="file"
              />
              <label className={styles.fileLabel} htmlFor="user-image-upload">
                <i className="fas fa-camera" style={{ fontSize: '32px', marginBottom: '8px' }}></i>
                <Paragraph>{appText.companyWizard.userRoles.userImagePlaceholder}</Paragraph>
              </label>
              {formData.userImage && (
                <Paragraph className={styles.fileName}>{formData.userImage.name}</Paragraph>
              )}
            </Container>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              <i className="fas fa-mobile-alt" style={{ marginRight: '8px' }}></i>
              {appText.companyWizard.userRoles.country} <span className={styles.required}>*</span>
            </label>
            <select
              className={styles.select}
              onChange={(e) => handleInputChange('userCountryId', e.target.value)}
              value={formData.userCountryId}
            >
              <option value="">{appText.companyWizard.userRoles.selectCountry}</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name} {country.code ? `(${country.code})` : ''}
                </option>
              ))}
            </select>
          </Container>
          <Container className={styles.formField}>
            <label className={styles.label}>
              <i className="fas fa-mobile-alt" style={{ marginRight: '8px' }}></i>
              {appText.companyWizard.userRoles.mobileNumber} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="mobileNumber"
              onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
              pattern="[0-9]*"
              placeholder={appText.companyWizard.userRoles.mobileNumberPlaceholder}
              title="Only numbers are allowed (max 15 characters)"
              type="tel"
              maxLength={15}
              value={formData.mobileNumber}
            />
            <Paragraph className={styles.helperText}>
              {appText.companyWizard.userRoles.mobileNumberHelper}
            </Paragraph>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              <i className="fas fa-envelope" style={{ marginRight: '8px' }}></i>
              {appText.companyWizard.userRoles.emailAddress}
            </label>
            <InputField
              name="email"
              onChange={(e) => handleInputChange('email', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.userRoles.emailAddressPlaceholder}
              title=""
              type="email"
              value={formData.email}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              <i className="fas fa-pencil-alt" style={{ marginRight: '8px' }}></i>
              {appText.companyWizard.userRoles.description}
            </label>
            <TextArea
              name="userDescription"
              onChange={(e) => handleInputChange('userDescription', e.target.value)}
              placeholder={appText.companyWizard.userRoles.descriptionPlaceholder}
              value={formData.userDescription}
            />
          </Container>
        </Container>
      </Form>
    </Container>
  );

  const renderBranches = () => (
    <Container className={styles.stepContent}>
      <Form className={styles.form} onSubmit={handleFormSubmit}>
        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.branches.branchTitle} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="branchTitle"
              onChange={(e) => handleInputChange('branchTitle', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.branches.branchTitlePlaceholder}
              title=""
              type="text"
              value={formData.branchTitle}
              className={invalidFields.has('branchTitle') ? styles.inputError : ''}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.branches.teamLeader}
            </label>
            <select
              className={styles.select}
              disabled
              value={formData.userRolesTeamLeaderId || formData.teamLeaderId}
            >
              <option value="">{appText.companyWizard.branches.selectTeamLeader}</option>
              {teamLeaders.map((leader) => (
                <option key={leader.id} value={leader.id}>
                  {leader.name}
                </option>
              ))}
            </select>
            <Paragraph className={styles.helperText}>
              Team leader is set from User Roles step
            </Paragraph>
          </Container>
          <Container className={styles.formField}>
            <label className={styles.label}>{appText.companyWizard.branches.isActive}</label>
            <Container className={styles.toggleContainer}>
              <label className={styles.toggleLabel}>
                <input
                  checked={formData.branchIsActive}
                  className={styles.toggleInput}
                  disabled
                  onChange={(e) => setFormData((prev) => ({ ...prev, branchIsActive: e.target.checked }))}
                  type="checkbox"
                />
                <span className={`${styles.toggleSlider} ${formData.branchIsActive ? styles.toggleActive : ''}`}></span>
                <span className={styles.toggleText}>
                  {formData.branchIsActive ? appText.companyWizard.branches.active : appText.companyWizard.branches.inactive}
                </span>
              </label>
            </Container>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.branches.branchNameArabic} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="branchNameArabic"
              onChange={(e) => handleInputChange('branchNameArabic', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.branches.branchNameArabicPlaceholder}
              title=""
              type="text"
              value={formData.branchNameArabic}
              className={invalidFields.has('branchNameArabic') ? styles.inputError : ''}
            />
          </Container>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.branches.branchNameEnglish} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="branchNameEnglish"
              onChange={(e) => handleInputChange('branchNameEnglish', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.branches.branchNameEnglishPlaceholder}
              title=""
              type="text"
              value={formData.branchNameEnglish}
              className={invalidFields.has('branchNameEnglish') ? styles.inputError : ''}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.branches.branchRepresentativeName} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="branchRepresentativeName"
              onChange={(e) => handleInputChange('branchRepresentativeName', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.branches.branchRepresentativeNamePlaceholder}
              title=""
              type="text"
              value={formData.branchRepresentativeName}
              className={invalidFields.has('branchRepresentativeName') ? styles.inputError : ''}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.branches.representativeMobileNumber} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="representativeMobileNumber"
              onChange={(e) => handleInputChange('representativeMobileNumber', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.branches.representativeMobileNumberPlaceholder}
              title=""
              type="tel"
              value={formData.representativeMobileNumber}
              className={invalidFields.has('representativeMobileNumber') ? styles.inputError : ''}
            />
          </Container>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.branches.representativeEmailAddress}
            </label>
            <InputField
              name="representativeEmailAddress"
              onChange={(e) => handleInputChange('representativeEmailAddress', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.branches.representativeEmailAddressPlaceholder}
              title=""
              type="email"
              value={formData.representativeEmailAddress}
            />
          </Container>
        </Container>

      </Form>
    </Container>
  );

  const renderZones = () => {
    const branchDisplayName = formData.branchNameEnglish || formData.branchTitle || 'Branch from Step 4';

    return (
      <Container className={styles.stepContent}>
        <Form className={styles.form} onSubmit={handleFormSubmit}>
          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>
                {appText.companyWizard.zones.branch} <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.select}
                readOnly
                type="text"
                value={branchDisplayName}
              />
              <Paragraph className={styles.helperText}>
                Using branch created in Step 4: {formData.branchTitle}
                {formData.branchNameEnglish && ` (${formData.branchNameEnglish})`}
              </Paragraph>
            </Container>
          </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.zones.zoneTitle} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="zoneTitle"
              onChange={(e) => handleInputChange('zoneTitle', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.zones.zoneTitlePlaceholder}
              title=""
              type="text"
              value={formData.zoneTitle}
              className={invalidFields.has('zoneTitle') ? styles.inputError : ''}
            />
          </Container>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.zones.zoneNumber}
            </label>
            <InputField
              name="zoneNumber"
              onChange={(e) => handleInputChange('zoneNumber', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.zones.zoneNumberPlaceholder}
              title=""
              type="text"
              value={formData.zoneNumber}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.zones.zoneDescription}
            </label>
            <TextArea
              name="zoneDescription"
              onChange={(e) => handleInputChange('zoneDescription', e.target.value)}
              placeholder={appText.companyWizard.zones.zoneDescriptionPlaceholder}
              rows={4}
              value={formData.zoneDescription}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>{appText.companyWizard.zones.isActive}</label>
            <Container className={styles.toggleContainer}>
              <label className={styles.toggleLabel}>
                <input
                  checked={formData.zoneIsActive}
                  className={styles.toggleInput}
                  onChange={(e) => setFormData((prev) => ({ ...prev, zoneIsActive: e.target.checked }))}
                  type="checkbox"
                />
                <span className={`${styles.toggleSlider} ${formData.zoneIsActive ? styles.toggleActive : ''}`}></span>
                <span className={styles.toggleText}>
                  {formData.zoneIsActive ? appText.companyWizard.zones.active : appText.companyWizard.zones.inactive}
                </span>
              </label>
            </Container>
          </Container>
        </Container>
        </Form>
      </Container>
    );
  };

  const handleAddMaintenanceService = () => {
    if (!formData.mainServiceId || !formData.subServiceId) {
      return;
    }

    const mainService = mainServices.find((s) => s.id === formData.mainServiceId);
    const subService = subServices.find((s) => s.id === formData.subServiceId);

    if (mainService && subService) {
      const newService = {
        id: `temp-${Date.now()}`,
        mainService,
        mainServiceId: mainService.id,
        subService,
        subServiceId: subService.id,
      };

      setMaintenanceServices((prev) => [...prev, newService]);
      setFormData((prev) => ({ ...prev, mainServiceId: '', subServiceId: '' }));
    }
  };

  const handleDeleteMaintenanceService = (id: string) => {
    setMaintenanceServices((prev) => prev.filter((service) => service.id !== id));
  };

  const renderMaintenanceServices = () => (
    <Container className={styles.stepContent}>
      <Form className={styles.form} onSubmit={handleFormSubmit}>
        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.maintenanceServices.mainService} <span className={styles.required}>*</span>
            </label>
            <select
              className={styles.select}
              onChange={async (e) => {
                handleInputChange('mainServiceId', e.target.value);
                // Fetch sub services for selected main service

                if (e.target.value) {
                  await fetchSubServicesByMainServiceId(e.target.value);
                } else {
                  setSubServices([]);
                }

                setFormData((prev) => ({ ...prev, subServiceId: '' }));
              }}
              value={formData.mainServiceId}
            >
              <option value="">{appText.companyWizard.maintenanceServices.mainServicePlaceholder}</option>
              {mainServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} {service.nameArabic ? `(${service.nameArabic})` : ''}
                </option>
              ))}
            </select>
          </Container>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.maintenanceServices.subService} <span className={styles.required}>*</span>
            </label>
            <select
              className={styles.select}
              disabled={!formData.mainServiceId}
              onChange={(e) => handleInputChange('subServiceId', e.target.value)}
              value={formData.subServiceId}
            >
              <option value="">{appText.companyWizard.maintenanceServices.subServicePlaceholder}</option>
              {subServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} {service.nameArabic ? `(${service.nameArabic})` : ''}
                </option>
              ))}
            </select>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <Button className={styles.addButton} onClick={handleAddMaintenanceService} type="button">
              {appText.companyWizard.maintenanceServices.add}
            </Button>
          </Container>
        </Container>

        <Container className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{appText.companyWizard.maintenanceServices.table.id}</th>
                <th>{appText.companyWizard.maintenanceServices.table.mainCategoryTitle}</th>
                <th>{appText.companyWizard.maintenanceServices.table.subCategoryTitle}</th>
                <th>{appText.companyWizard.maintenanceServices.table.delete}</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceServices.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyMessage}>
                    {appText.companyWizard.maintenanceServices.noServices}
                  </td>
                </tr>
              ) : (
                maintenanceServices.map((service) => (
                  <tr key={service.id}>
                    <td>{service.id}</td>
                    <td>
                      {service.mainService?.name || ''}
                      {service.mainService?.nameArabic && ` / ${service.mainService.nameArabic}`}
                    </td>
                    <td>
                      {service.subService?.name || ''}
                      {service.subService?.nameArabic && ` / ${service.subService.nameArabic}`}
                    </td>
                    <td>
                      <Button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteMaintenanceService(service.id)}
                        type="button"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Container>
      </Form>
    </Container>
  );

  return (
    <Container className={styles.modalOverlay} onClick={onClose}>
      <Container className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Test Data Fill Button - Only visible in development */}
        {process.env.NODE_ENV === 'development' && (
          <Container
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 1000,
            }}
            title="Fill test data (Ctrl+Shift+T)"
          >
            <Button
              type="button"
              onClick={fillTestData}
              className={styles.testDataButton}
            >
              🧪 Fill Test Data
            </Button>
          </Container>
        )}
        <Container className={styles.modalHeader}>
          <Heading className={styles.modalTitle} level="2">
            {appText.companyWizard.title}: <span className={styles.stepTitle}>{steps.find((s) => s.number === currentStep)?.label}</span>
          </Heading>
          <Button className={styles.closeButton} onClick={onClose} type="button">
            <i className="fas fa-times"></i>
          </Button>
        </Container>

        <Container className={styles.progressIndicator}>
          {steps.map((step) => (
            <Container
              key={step.number}
              className={styles.stepIndicator}
              onClick={() => handleStepClick(step.number)}
            >
              <Container
                className={`${styles.stepCircle} ${currentStep === step.number ? styles.active : ''} ${currentStep > step.number ? styles.completed : ''}`}
              >
                {currentStep > step.number ? <i className="fas fa-check"></i> : step.number}
              </Container>
              <Paragraph className={styles.stepLabel}>{step.label}</Paragraph>
            </Container>
          ))}
        </Container>

        <Container className={styles.stepContentWrapper}>
          {currentStep === 1 && renderBasicInfo()}
          {currentStep === 2 && renderContracts()}
          {currentStep === 3 && renderUserRoles()}
          {currentStep === 4 && renderBranches()}
          {currentStep === 5 && renderZones()}
          {currentStep === 6 && renderMaintenanceServices()}
        </Container>

        <Container className={styles.modalFooter}>
          <Button className={styles.cancelButton} onClick={onClose} type="button">
            {appText.companyWizard.buttons.cancel}
          </Button>
          <Container className={styles.navigationButtons}>
            {currentStep > 1 && (
              <Button className={styles.previousButton} onClick={handlePrevious} type="button">
                {appText.companyWizard.buttons.previous}
              </Button>
            )}
            <Button className={styles.nextButton} disabled={loading} onClick={handleNext} type="button">
              {loading ? 'Processing...' : currentStep === steps.length ? appText.companyWizard.buttons.finish : appText.companyWizard.buttons.next}
            </Button>
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

export default CompanyWizard;

