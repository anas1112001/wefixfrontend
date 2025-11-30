import React, { FC, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Container from 'components/Atoms/Container/Container';
import Form from 'components/Atoms/Form/Form';
import Heading from 'components/Atoms/Heading/Heading';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import InputField from 'components/Atoms/InputField/InputField';
import Button from 'components/Atoms/Button/Button';
import { GRAPHQL_ENDPOINT } from 'utils/apiConfig';
import SecureStorage from 'modules/secureStorage';
import styles from './CreateTicketModal.module.css';

// Helper function to get headers with authorization
const getHeaders = (): HeadersInit => {
  const token = SecureStorage.getAccessToken();

  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

interface Lookup {
  code?: string | null;
  id: string;
  name: string;
  nameArabic?: string | null;
}

interface Company {
  id: string;
  title: string;
}

interface Contract {
  contractReference: string;
  contractTitle: string;
  id: string;
}

interface Branch {
  branchTitle: string;
  id: string;
}

interface Zone {
  id: string;
  zoneTitle: string;
}

interface SubService {
  id: string;
  name: string;
  nameArabic: string | null;
}

interface CreateTicketModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTicketModal: FC<CreateTicketModalProps> = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [ticketCodes, setTicketCodes] = useState<Lookup[]>([]);
  const [ticketTypes, setTicketTypes] = useState<Lookup[]>([]);
  const [ticketCategories, setTicketCategories] = useState<Lookup[]>([]);
  const [ticketStatuses, setTicketStatuses] = useState<Lookup[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<Lookup[]>([]);
  const [technicians, setTechnicians] = useState<Lookup[]>([]);
  const [mainServices, setMainServices] = useState<Lookup[]>([]);
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [tools, setTools] = useState<Lookup[]>([]);
  const [filteredTools, setFilteredTools] = useState<Lookup[]>([]);
  const [toolSearch, setToolSearch] = useState('');
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    // Step 1: Customer Info
    companyId: '',
    contractId: '',
    branchId: '',
    zoneId: '',
    locationMap: '',
    locationDescription: '',
    // Step 2: Ticket Info
    ticketTypeId: '',
    ticketCategoryId: '',
    ticketStatusId: '',
    ticketDate: new Date().toISOString().split('T')[0],
    ticketTime: '',
    assignToTeamLeaderId: '',
    assignToTechnicianId: '',
    ticketDescription: '',
    ticketAttachments: [] as File[],
    // Step 3: Service Info
    havingFemaleEngineer: false,
    mainServiceId: '',
    subServiceId: '',
    serviceDescription: '',
    // Step 4: Tools
    selectedTools: [] as string[],
  });

  const steps = [
    { number: 1, label: 'Customer Info' },
    { number: 2, label: 'Ticket Info' },
    { number: 3, label: 'Service Info' },
    { number: 4, label: 'Tools' },
  ];

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          body: JSON.stringify({
            query: `
              query GetTicketFormData {
                companies: getCompanies(filter: { limit: 100, page: 1 }) {
                  companies {
                    id
                    title
                  }
                }
                ticketCodes: getLookupsByCategory(category: TICKET_CODE) {
                  id
                  name
                  code
                }
                ticketTypes: getLookupsByCategory(category: TICKET_TYPE) {
                  id
                  name
                  code
                }
                ticketCategories: getLookupsByCategory(category: TICKET_CATEGORY) {
                  id
                  name
                  code
                }
                ticketStatuses: getLookupsByCategory(category: TICKET_STATUS) {
                  id
                  name
                  code
                }
                teamLeaders: getLookupsByCategory(category: TEAM_LEADER) {
                  id
                  name
                  code
                }
                technicians: getLookupsByCategory(category: TECHNICIAN) {
                  id
                  name
                  code
                }
                mainServices: getActiveMainServices {
                  id
                  name
                }
                tools: getLookupsByCategory(category: TOOL) {
                  id
                  name
                  code
                }
              }
            `,
          }),
          headers: getHeaders(),
          method: 'POST',
        });

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}, body: ${errorText}`);
        }

        const payload = await response.json();

        if (payload.data) {
          if (payload.data.companies?.companies) {
            setCompanies(payload.data.companies.companies);
          }

          if (payload.data.ticketCodes) {
            setTicketCodes(payload.data.ticketCodes);
          }

          if (payload.data.ticketTypes) {
            // Filter to only show Corrective and Preventive
            const filteredTypes = payload.data.ticketTypes.filter(
              (type: Lookup) => 
                type.name.toLowerCase() === 'corrective' || 
                type.name.toLowerCase() === 'preventive'
            );

            setTicketTypes(filteredTypes);
            
            // Set Corrective as default
            const correctiveType = filteredTypes.find(
              (type: Lookup) => type.name.toLowerCase() === 'corrective'
            );

            if (correctiveType) {
              setFormData((prev) => {
                // Only set if not already set
                if (!prev.ticketTypeId) {
                  return { ...prev, ticketTypeId: correctiveType.id };
                }

                return prev;
              });
            }
          }

          if (payload.data.ticketCategories) {
            setTicketCategories(payload.data.ticketCategories);
          }

          if (payload.data.ticketStatuses) {
            setTicketStatuses(payload.data.ticketStatuses);
          }

          if (payload.data.teamLeaders) {
            setTeamLeaders(payload.data.teamLeaders);
          }

          if (payload.data.technicians) {
            setTechnicians(payload.data.technicians);
          }

          if (payload.data.mainServices) {
            setMainServices(payload.data.mainServices);
          }

          if (payload.data.tools) {
            setTools(payload.data.tools);
            setFilteredTools(payload.data.tools);
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch contracts when company is selected
  useEffect(() => {
    if (formData.companyId) {
      const fetchContracts = async () => {
        try {
          // Reset contract selection when company changes
          setFormData((prev) => ({ ...prev, contractId: '', branchId: '', zoneId: '' }));

          const query = `
            query GetContracts($filter: ContractFilterInput) {
              getContracts(filter: $filter) {
                contracts {
                  id
                  contractReference
                  contractTitle
                }
              }
            }
          `;

          const variables = {
            filter: { companyId: formData.companyId, limit: 100, page: 1 },
          };

          console.log('Fetching contracts for company:', formData.companyId);
          console.log('GraphQL Endpoint:', GRAPHQL_ENDPOINT);
          console.log('Request body:', JSON.stringify({ query, variables }, null, 2));

          const response = await fetch(GRAPHQL_ENDPOINT, {
            body: JSON.stringify({
              query,
              variables,
            }),
            headers: getHeaders(),
            method: 'POST',
          });

          if (!response.ok) {
            const errorText = await response.text();

            throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}, body: ${errorText}`);
          }

          const payload = await response.json();

          console.log('Response payload:', payload);

          if (payload.errors) {
            console.error('GraphQL errors:', payload.errors);
            setContracts([]);

            return;
          }

          if (payload.data?.getContracts?.contracts) {
            const fetchedContracts = payload.data.getContracts.contracts;

            setContracts(fetchedContracts);
            console.log('Fetched contracts:', fetchedContracts);
            
            // Auto-select first contract if at least one exists and none is currently selected
            if (fetchedContracts.length > 0 && !formData.contractId) {
              const firstContractId = fetchedContracts[0].id;

              setFormData((prev) => ({ ...prev, contractId: firstContractId }));
            }
          } else {
            console.log('No contracts found in response:', payload.data);
            setContracts([]);
          }
        } catch (error) {
          console.error('Error fetching contracts:', error);
          console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          });
          setContracts([]);
        }
      };

      fetchContracts();
    } else {
      setContracts([]);
      setFormData((prev) => ({ ...prev, contractId: '', branchId: '', zoneId: '' }));
    }
  }, [formData.companyId]);

  // Fetch branches when contract is selected
  useEffect(() => {
    if (formData.contractId && formData.companyId) {
      const fetchBranches = async () => {
        try {
          const response = await fetch(GRAPHQL_ENDPOINT, {
            body: JSON.stringify({
              query: `
                query GetBranchesByCompanyId($companyId: String!) {
                  getBranchesByCompanyId(companyId: $companyId) {
                    id
                    branchTitle
                  }
                }
              `,
              variables: {
                companyId: formData.companyId,
              },
            }),
            headers: getHeaders(),
            method: 'POST',
          });

          const payload = await response.json();

          if (payload.errors) {
            console.error('GraphQL errors:', payload.errors);
            setBranches([]);

            return;
          }

          if (payload.data?.getBranchesByCompanyId) {
            const fetchedBranches = payload.data.getBranchesByCompanyId;

            setBranches(fetchedBranches);
            
            // Auto-select first branch if at least one exists and none is currently selected
            if (fetchedBranches.length > 0 && !formData.branchId) {
              const firstBranchId = fetchedBranches[0].id;

              setFormData((prev) => ({ ...prev, branchId: firstBranchId }));
            }
          } else {
            setBranches([]);
          }
        } catch (error) {
          console.error('Error fetching branches:', error);
          setBranches([]);
        }
      };

      fetchBranches();
    } else {
      setBranches([]);
      setFormData((prev) => ({ ...prev, branchId: '', zoneId: '' }));
    }
  }, [formData.contractId, formData.companyId]);

  // Fetch zones when branch is selected
  useEffect(() => {
    if (formData.branchId) {
      const fetchZones = async () => {
        try {
          const response = await fetch(GRAPHQL_ENDPOINT, {
            body: JSON.stringify({
              query: `
                query GetZonesByBranchId($branchId: String!) {
                  getZonesByBranchId(branchId: $branchId) {
                    id
                    zoneTitle
                  }
                }
              `,
              variables: {
                branchId: formData.branchId,
              },
            }),
            headers: getHeaders(),
            method: 'POST',
          });

          const payload = await response.json();

          if (payload.errors) {
            console.error('GraphQL errors:', payload.errors);
            setZones([]);

            return;
          }

          if (payload.data?.getZonesByBranchId) {
            const fetchedZones = payload.data.getZonesByBranchId;

            setZones(fetchedZones);
            
            // Auto-select first zone if at least one exists and none is currently selected
            if (fetchedZones.length > 0 && !formData.zoneId) {
              const firstZoneId = fetchedZones[0].id;

              setFormData((prev) => ({ ...prev, zoneId: firstZoneId }));
            }
          } else {
            setZones([]);
          }
        } catch (error) {
          console.error('Error fetching zones:', error);
          setZones([]);
        }
      };

      fetchZones();
    } else {
      setZones([]);
      setFormData((prev) => ({ ...prev, zoneId: '' }));
    }
  }, [formData.branchId]);

  // Fetch sub services when main service is selected
  useEffect(() => {
    if (formData.mainServiceId) {
      const fetchSubServices = async () => {
        try {
          const response = await fetch(GRAPHQL_ENDPOINT, {
            body: JSON.stringify({
              query: `
                query GetSubServicesByMainServiceId($mainServiceId: String!) {
                  subServices: getActiveSubServicesByMainServiceId(mainServiceId: $mainServiceId) {
                    id
                    name
                    nameArabic
                  }
                }
              `,
              variables: {
                mainServiceId: formData.mainServiceId,
              },
            }),
            headers: getHeaders(),
            method: 'POST',
          });

          const payload = await response.json();

          if (payload.data?.subServices) {
            setSubServices(payload.data.subServices);
          }
        } catch (error) {
          console.error('Error fetching sub services:', error);
        }
      };

      fetchSubServices();
    } else {
      setSubServices([]);
      setFormData((prev) => ({ ...prev, subServiceId: '' }));
    }
  }, [formData.mainServiceId]);

  // Filter tools based on search
  useEffect(() => {
    if (toolSearch.trim() === '') {
      setFilteredTools(tools);
    } else {
      const filtered = tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
          (tool.nameArabic && tool.nameArabic.toLowerCase().includes(toolSearch.toLowerCase())),
      );

      setFilteredTools(filtered);
    }
  }, [toolSearch, tools]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setInvalidFields((prev) => {
      const next = new Set(prev);

      next.delete(field);

      return next;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      setFormData((prev) => ({
        ...prev,
        ticketAttachments: [...prev.ticketAttachments, ...files],
      }));
    }
  };

  const handleToolToggle = (toolId: string) => {
    setFormData((prev) => {
      const selectedTools = prev.selectedTools.includes(toolId)
        ? prev.selectedTools.filter((id) => id !== toolId)
        : [...prev.selectedTools, toolId];

      return { ...prev, selectedTools };
    });
  };

  const validateStep = (step: number): boolean => {
    const invalid = new Set<string>();

    switch (step) {
      case 1: // Customer Info
        if (!formData.companyId) {
          invalid.add('companyId');
        }

        if (!formData.contractId) {
          invalid.add('contractId');
        }

        if (!formData.branchId) {
          invalid.add('branchId');
        }

        if (!formData.zoneId) {
          invalid.add('zoneId');
        }

        break;

      case 2: // Ticket Info
        if (!formData.ticketTypeId) {
          invalid.add('ticketTypeId');
        }

        if (!formData.ticketCategoryId) {
          invalid.add('ticketCategoryId');
        }

        if (!formData.ticketStatusId) {
          invalid.add('ticketStatusId');
        }

        if (!formData.ticketDate) {
          invalid.add('ticketDate');
        }

        if (!formData.ticketTime) {
          invalid.add('ticketTime');
        }

        if (!formData.assignToTeamLeaderId) {
          invalid.add('assignToTeamLeaderId');
        }

        if (!formData.assignToTechnicianId) {
          invalid.add('assignToTechnicianId');
        }

        break;

      case 3: // Service Info
        if (!formData.mainServiceId) {
          invalid.add('mainServiceId');
        }

        break;

      case 4: // Tools - optional, no validation needed
        break;

      default:
        break;
    }

    if (invalid.size > 0) {
      setInvalidFields(invalid);
      const fieldNames = Array.from(invalid).join(', ');

      Swal.fire({
        icon: 'warning',
        text: `Please fill in all required fields: ${fieldNames}`,
      });

      return false;
    }

    setInvalidFields(new Set());

    return true;
  };

  const handleNext = () => {
    if (currentStep === steps.length) {
      handleSubmit();
    } else if (currentStep < steps.length) {
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

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);

    try {
      const mutation = `
        mutation CreateTicket($ticketData: CreateTicketInput!) {
          createTicket(ticketData: $ticketData) {
            ticket {
              id
            }
            message
          }
        }
      `;

      const ticketData = {
        companyId: formData.companyId,
        contractId: formData.contractId,
        branchId: formData.branchId,
        zoneId: formData.zoneId,
        locationMap: formData.locationMap || 'No location defined',
        locationDescription: formData.locationDescription || '',
        ticketTypeId: formData.ticketTypeId,
        ticketCategoryId: formData.ticketCategoryId,
        ticketStatusId: formData.ticketStatusId,
        ticketDate: formData.ticketDate,
        ticketTime: formData.ticketTime,
        assignToTeamLeaderId: formData.assignToTeamLeaderId,
        assignToTechnicianId: formData.assignToTechnicianId,
        ticketDescription: formData.ticketDescription || '',
        havingFemaleEngineer: formData.havingFemaleEngineer,
        mainServiceId: formData.mainServiceId,
        serviceDescription: formData.serviceDescription || '',
        tools: formData.selectedTools.length > 0 ? formData.selectedTools : null,
      };

      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: mutation,
          variables: { ticketData },
        }),
        headers: getHeaders(),
        method: 'POST',
      });

      const payload = await response.json();

      if (payload.errors) {
        throw new Error(payload.errors[0].message);
      }

      if (payload.data?.createTicket?.ticket) {
        await Swal.fire({
          icon: 'success',
          text: 'Ticket created successfully',
          title: 'Success',
        });
        onSuccess();
        onClose();
      } else {
        throw new Error('Failed to create ticket');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create ticket';

      Swal.fire({
        icon: 'error',
        text: message,
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  // Generate time options
  const generateTimeOptions = () => {
    const times = [];

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        times.push(timeString);
      }
    }

    return times;
  };

  const timeOptions = generateTimeOptions();

  // Render Step 1: Customer Info
  const renderCustomerInfo = () => (
    <Container className={styles.stepContent}>
      <Form className={styles.form} onSubmit={handleFormSubmit}>
        <Heading className={styles.sectionTitle} level="3">
          Customer Information
        </Heading>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              Company Name <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${invalidFields.has('companyId') ? styles.selectError : ''}`}
              onChange={(e) => handleInputChange('companyId', e.target.value)}
              value={formData.companyId}
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.title}
                </option>
              ))}
            </select>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              Contract Reference <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${invalidFields.has('contractId') ? styles.selectError : ''}`}
              disabled={!formData.companyId || contracts.length === 0}
              onChange={(e) => handleInputChange('contractId', e.target.value)}
              value={formData.contractId}
            >
              <option value="">Select Contract Reference</option>
              {contracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  {contract.contractReference || contract.contractTitle}
                </option>
              ))}
            </select>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              Branch <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${invalidFields.has('branchId') ? styles.selectError : ''}`}
              disabled={!formData.contractId || branches.length === 0}
              onChange={(e) => handleInputChange('branchId', e.target.value)}
              value={formData.branchId}
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branchTitle}
                </option>
              ))}
            </select>
          </Container>
          <Container className={styles.formField}>
            <label className={styles.label}>
              Zone <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${invalidFields.has('zoneId') ? styles.selectError : ''}`}
              disabled={!formData.branchId || zones.length === 0}
              onChange={(e) => handleInputChange('zoneId', e.target.value)}
              value={formData.zoneId}
            >
              <option value="">Select Zone</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.zoneTitle}
                </option>
              ))}
            </select>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>Location</label>
            <Container className={styles.mapPlaceholder}>
              <i className="fas fa-map-marker-alt" style={{ color: '#ff6b35', fontSize: '24px', marginBottom: '8px' }}></i>
              <Paragraph>No location defined</Paragraph>
            </Container>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>Location Description</label>
            <textarea
              className={styles.textarea}
              name="locationDescription"
              onChange={(e) => handleInputChange('locationDescription', e.target.value)}
              placeholder="Describe the location"
              value={formData.locationDescription}
            />
          </Container>
        </Container>
      </Form>
    </Container>
  );

  // Render Step 2: Ticket Info
  const renderTicketInfo = () => (
    <Container className={styles.stepContent}>
      <Form className={styles.form} onSubmit={handleFormSubmit}>
        <Heading className={styles.sectionTitle} level="3">
          Ticket Information
        </Heading>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              Ticket Type <span className={styles.required}>*</span>
            </label>
            <Container className={styles.radioGroup}>
              {ticketTypes.map((type) => (
                <label className={styles.radioLabel} key={type.id}>
                  <input
                    checked={formData.ticketTypeId === type.id}
                    className={styles.radioInput}
                    name="ticketType"
                    onChange={() => handleInputChange('ticketTypeId', type.id)}
                    type="radio"
                  />
                  {type.name}
                </label>
              ))}
            </Container>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              Ticket Category <span className={styles.required}>*</span>
            </label>
            <Container className={styles.radioGroup}>
              {ticketCategories.map((category) => (
                <label className={styles.radioLabel} key={category.id}>
                  <input
                    checked={formData.ticketCategoryId === category.id}
                    className={styles.radioInput}
                    name="ticketCategory"
                    onChange={() => handleInputChange('ticketCategoryId', category.id)}
                    type="radio"
                  />
                  {category.name}
                </label>
              ))}
            </Container>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              Ticket Status <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${invalidFields.has('ticketStatusId') ? styles.selectError : ''}`}
              onChange={(e) => handleInputChange('ticketStatusId', e.target.value)}
              value={formData.ticketStatusId}
            >
              <option value="">Select Status</option>
              {ticketStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              Ticket Date <span className={styles.required}>*</span>
            </label>
            <Container style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <InputField
                name="ticketDate"
                onChange={(e) => handleInputChange('ticketDate', e.target.value)}
                pattern={undefined}
                placeholder=""
                required
                title=""
                type="date"
                value={formData.ticketDate}
                className={invalidFields.has('ticketDate') ? styles.inputError : ''}
              />
              <i className="fas fa-calendar" style={{ color: '#ff6b35' }}></i>
            </Container>
          </Container>
          <Container className={styles.formField}>
            <label className={styles.label}>
              Ticket Time <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${invalidFields.has('ticketTime') ? styles.selectError : ''}`}
              onChange={(e) => handleInputChange('ticketTime', e.target.value)}
              value={formData.ticketTime}
            >
              <option value="">Select Time</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              Assign To Team Leader <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${invalidFields.has('assignToTeamLeaderId') ? styles.selectError : ''}`}
              onChange={(e) => handleInputChange('assignToTeamLeaderId', e.target.value)}
              value={formData.assignToTeamLeaderId}
            >
              <option value="">Select Team Leader</option>
              {teamLeaders.map((leader) => (
                <option key={leader.id} value={leader.id}>
                  {leader.name}
                </option>
              ))}
            </select>
          </Container>
          <Container className={styles.formField}>
            <label className={styles.label}>
              Assign To Technician <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${invalidFields.has('assignToTechnicianId') ? styles.selectError : ''}`}
              onChange={(e) => handleInputChange('assignToTechnicianId', e.target.value)}
              value={formData.assignToTechnicianId}
            >
              <option value="">Select Technician</option>
              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.name}
                </option>
              ))}
            </select>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>Ticket Description</label>
            <textarea
              className={styles.textarea}
              name="ticketDescription"
              onChange={(e) => handleInputChange('ticketDescription', e.target.value)}
              placeholder="Add any additional information about the ticket"
              value={formData.ticketDescription}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>Ticket Attachments</label>
            <Container className={styles.fileUpload}>
              <input
                accept="*/*"
                className={styles.fileInput}
                id="ticket-attachments"
                multiple
                onChange={handleFileChange}
                type="file"
              />
              <label className={styles.fileLabel} htmlFor="ticket-attachments">
                <i className="fas fa-paperclip" style={{ fontSize: '32px', marginBottom: '8px' }}></i>
                <Paragraph>Choose Files</Paragraph>
                <p className={styles.helperText} style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                  {formData.ticketAttachments.length > 0
                    ? `${formData.ticketAttachments.length} file(s) selected`
                    : 'No file chosen'}
                </p>
              </label>
            </Container>
            <Paragraph className={styles.helperText}>
              Optional: upload related documents or images (multiple files supported)
            </Paragraph>
          </Container>
        </Container>
      </Form>
    </Container>
  );

  // Render Step 3: Service Info
  const renderServiceInfo = () => (
    <Container className={styles.stepContent}>
      <Form className={styles.form} onSubmit={handleFormSubmit}>
        <Heading className={styles.sectionTitle} level="3">
          Service Information
        </Heading>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>Having a Female Engineer</label>
            <Container className={styles.toggleContainer}>
              <label className={styles.toggleLabel}>
                <input
                  checked={formData.havingFemaleEngineer}
                  className={styles.toggleInput}
                  onChange={(e) => handleInputChange('havingFemaleEngineer', e.target.checked)}
                  type="checkbox"
                />
                <Container className={`${styles.toggleSlider} ${formData.havingFemaleEngineer ? styles.toggleActive : ''}`}>
                  {' '}
                </Container>
                <Paragraph className={styles.toggleText}>{formData.havingFemaleEngineer ? 'On' : 'Off'}</Paragraph>
              </label>
            </Container>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              Main Service <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${invalidFields.has('mainServiceId') ? styles.selectError : ''}`}
              onChange={(e) => handleInputChange('mainServiceId', e.target.value)}
              value={formData.mainServiceId}
            >
              <option value="">-- Select Category --</option>
              {mainServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            {formData.mainServiceId && subServices.length === 0 && (
              <Paragraph className={styles.helperText}>No sub services available for this category.</Paragraph>
            )}
          </Container>
        </Container>

        {formData.mainServiceId && subServices.length > 0 && (
          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>Sub Service</label>
              <select
                className={styles.select}
                onChange={(e) => handleInputChange('subServiceId', e.target.value)}
                value={formData.subServiceId}
              >
                <option value="">Select Sub Service</option>
                {subServices.map((subService) => (
                  <option key={subService.id} value={subService.id}>
                    {subService.name}
                  </option>
                ))}
              </select>
            </Container>
          </Container>
        )}

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>Service Description</label>
            <textarea
              className={styles.textarea}
              name="serviceDescription"
              onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
              placeholder="Describe the service requirements"
              value={formData.serviceDescription}
            />
          </Container>
        </Container>
      </Form>
    </Container>
  );

  // Render Step 4: Tools
  const renderTools = () => (
    <Container className={styles.stepContent}>
      <Form className={styles.form} onSubmit={handleFormSubmit}>
        <Heading className={styles.sectionTitle} level="3">
          Tools
        </Heading>

        <Container className={styles.formRow}>
          <Container className={styles.formField} style={{ width: '100%' }}>
            <label className={styles.label}>Search Tools</label>
            <InputField
              name="toolSearch"
              onChange={(e) => setToolSearch(e.target.value)}
              pattern={undefined}
              placeholder="Search for tools..."
              title=""
              type="text"
              value={toolSearch}
            />
          </Container>
        </Container>

        <Container className={styles.toolsGrid}>
          {filteredTools.map((tool) => (
            <Container className={styles.toolItem} key={tool.id}>
              <label className={styles.toolLabel}>
                <input
                  checked={formData.selectedTools.includes(tool.id)}
                  onChange={() => handleToolToggle(tool.id)}
                  type="checkbox"
                />
                <span>{tool.name}</span>
              </label>
            </Container>
          ))}
        </Container>
      </Form>
    </Container>
  );

  return (
    <Container className={styles.modalOverlay} onClick={onClose}>
      <Container className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <Container className={styles.modalHeader}>
          <Heading className={styles.modalTitle} level="2">
            Create New Ticket
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
          {currentStep === 1 && renderCustomerInfo()}
          {currentStep === 2 && renderTicketInfo()}
          {currentStep === 3 && renderServiceInfo()}
          {currentStep === 4 && renderTools()}
        </Container>

        <Container className={styles.modalFooter}>
          <Button className={styles.cancelButton} onClick={onClose} type="button">
            Cancel
          </Button>
          <Container className={styles.navigationButtons}>
            {currentStep > 1 && (
              <Button className={styles.previousButton} onClick={handlePrevious} type="button">
                Previous
              </Button>
            )}
            <Button className={styles.nextButton} disabled={loading} onClick={handleNext} type="button">
              {loading ? 'Processing...' : currentStep === steps.length ? 'Save' : 'Next'}
            </Button>
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

export default CreateTicketModal;
