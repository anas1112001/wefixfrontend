import React, { FC, useEffect, useState } from 'react';
import Container from 'components/Atoms/Container/Container';
import Form from 'components/Atoms/Form/Form';
import Heading from 'components/Atoms/Heading/Heading';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import InputField from 'components/Atoms/InputField/InputField';
import Button from 'components/Atoms/Button/Button';
import { appText } from 'data/appText';
import styles from './AddContractModal.module.css';

const GRAPHQL_ENDPOINT = process.env.REACT_APP_API_URL ?? 'http://localhost:4000/graphql';

interface Company {
  id: string;
  title: string;
}

interface BusinessModel {
  id: string;
  name: string;
}

interface AddContractModalProps {
  onClose: () => void;
}

const AddContractModal: FC<AddContractModalProps> = ({ onClose }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [businessModels, setBusinessModels] = useState<BusinessModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contractTitle: '',
    companyId: '',
    businessModelLookupId: '',
    isActive: true,
    numberOfTeamLeaders: 1,
    numberOfBranches: 1,
    numberOfPreventiveTickets: 1,
    numberOfCorrectiveTickets: 1,
    contractStartDate: '',
    contractEndDate: '',
    contractValue: '',
    contractFiles: null as FileList | null,
    contractDescription: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch companies
        const companiesResponse = await fetch(GRAPHQL_ENDPOINT, {
          body: JSON.stringify({
            query: `
              query GetCompanies {
                getCompanies(filter: { limit: 100, page: 1 }) {
                  companies {
                    id
                    title
                  }
                }
              }
            `,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        const companiesPayload = await companiesResponse.json();

        if (companiesPayload.data?.getCompanies?.companies) {
          setCompanies(companiesPayload.data.getCompanies.companies);
        }

        // Fetch business models
        const businessModelsResponse = await fetch(GRAPHQL_ENDPOINT, {
          body: JSON.stringify({
            query: `
              query GetBusinessModels {
                getLookupsByCategory(category: BUSINESS_MODEL) {
                  id
                  name
                }
              }
            `,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        const businessModelsPayload = await businessModelsResponse.json();

        if (businessModelsPayload.data?.getLookupsByCategory) {
          setBusinessModels(businessModelsPayload.data.getLookupsByCategory);
          // Set default business model

          const defaultModel = businessModelsPayload.data.getLookupsByCategory.find((bm: BusinessModel) => bm.name.toLowerCase() === 'b2b');

          if (defaultModel) {
            setFormData((prev) => ({ ...prev, businessModelLookupId: defaultModel.id }));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, contractFiles: e.target.files }));
    }
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleNumberChange = (field: string, delta: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, (prev[field as keyof typeof prev] as number) + delta),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const contractData: any = {
        contractTitle: formData.contractTitle,
        companyId: formData.companyId,
        businessModelLookupId: formData.businessModelLookupId,
        isActive: formData.isActive,
        numberOfTeamLeaders: formData.numberOfTeamLeaders,
        numberOfBranches: formData.numberOfBranches,
        numberOfPreventiveTickets: formData.numberOfPreventiveTickets,
        numberOfCorrectiveTickets: formData.numberOfCorrectiveTickets,
        contractStartDate: formData.contractStartDate || null,
        contractEndDate: formData.contractEndDate || null,
        contractValue: formData.contractValue ? parseFloat(formData.contractValue) : null,
        contractDescription: formData.contractDescription || null,
      };

      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: `
            mutation CreateContract($contractData: CreateContractInput!) {
              createContract(contractData: $contractData) {
                contract {
                  id
                  contractReference
                }
                message
              }
            }
          `,
          variables: { contractData },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const payload = await response.json();

      if (payload.errors?.length) {
        throw new Error(payload.errors[0].message);
      }

      if (payload.data?.createContract) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('Failed to create contract. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateContractReference = () => {
    const year = new Date().getFullYear();

    return `Cont${year}`;
  };

  return (
    <Container className={styles.modalOverlay} onClick={onClose}>
      <Container className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <Container className={styles.modalHeader}>
          <Heading className={styles.modalTitle} level="2">
            {appText.contracts.form.contractTitle}
          </Heading>
          <Button className={styles.closeButton} onClick={onClose} type="button">
            <i className="fas fa-times"></i>
          </Button>
        </Container>

        <Form className={styles.form} onSubmit={handleSubmit}>
          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>{appText.contracts.form.contractReference}</label>
              <input
                className={styles.inputField}
                name="contractReference"
                readOnly
                title=""
                type="text"
                value={generateContractReference()}
              />
              <Paragraph className={styles.helperText}>{appText.contracts.form.autoGenerated}</Paragraph>
            </Container>
            <Container className={styles.formField}>
              <label className={styles.label}>{appText.contracts.form.contractTitle}</label>
              <InputField
                name="contractTitle"
                onChange={handleChange}
                pattern={undefined}
                placeholder={appText.contracts.form.enterContractTitle}
                title=""
                type="text"
                value={formData.contractTitle}
              />
            </Container>
          </Container>

          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>
                {appText.contracts.form.companyName} <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
                name="companyId"
                onChange={handleChange}
                required
                value={formData.companyId}
              >
                <option value="">{appText.contracts.form.selectCompany}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.title}
                  </option>
                ))}
              </select>
            </Container>
            <Container className={styles.formField}>
              <label className={styles.label}>
                {appText.contracts.form.businessModel} <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
                name="businessModelLookupId"
                onChange={handleChange}
                required
                value={formData.businessModelLookupId}
              >
                <option value="">{appText.contracts.form.selectBusinessModel}</option>
                {businessModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </Container>
          </Container>

          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>{appText.contracts.form.isActive}</label>
              <Container className={styles.toggleContainer}>
                <label className={styles.toggleLabel}>
                  <input
                    checked={formData.isActive}
                    className={styles.toggleInput}
                    onChange={handleToggle}
                    type="checkbox"
                  />
                  <span className={`${styles.toggleSlider} ${formData.isActive ? styles.toggleActive : ''}`}></span>
                  <span className={styles.toggleText}>{formData.isActive ? 'Active' : 'Inactive'}</span>
                </label>
              </Container>
            </Container>
          </Container>

          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>{appText.contracts.form.numberOfTeamLeaders}</label>
              <Container className={styles.counterControls}>
                <button
                  className={styles.counterButton}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNumberChange('numberOfTeamLeaders', -1);
                  }}
                  type="button"
                >
                  -
                </button>
                <span className={styles.counterValue}>{formData.numberOfTeamLeaders}</span>
                <button
                  className={styles.counterButton}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNumberChange('numberOfTeamLeaders', 1);
                  }}
                  type="button"
                >
                  +
                </button>
              </Container>
            </Container>
            <Container className={styles.formField}>
              <label className={styles.label}>{appText.contracts.form.numberOfBranches}</label>
              <Container className={styles.counterControls}>
                <button
                  className={styles.counterButton}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNumberChange('numberOfBranches', -1);
                  }}
                  type="button"
                >
                  -
                </button>
                <span className={styles.counterValue}>{formData.numberOfBranches}</span>
                <button
                  className={styles.counterButton}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNumberChange('numberOfBranches', 1);
                  }}
                  type="button"
                >
                  +
                </button>
              </Container>
            </Container>
          </Container>

          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>{appText.contracts.form.numberOfPreventiveTickets}</label>
              <Container className={styles.counterControls}>
                <button
                  className={styles.counterButton}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNumberChange('numberOfPreventiveTickets', -1);
                  }}
                  type="button"
                >
                  -
                </button>
                <span className={styles.counterValue}>{formData.numberOfPreventiveTickets}</span>
                <button
                  className={styles.counterButton}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNumberChange('numberOfPreventiveTickets', 1);
                  }}
                  type="button"
                >
                  +
                </button>
              </Container>
            </Container>
            <Container className={styles.formField}>
              <label className={styles.label}>{appText.contracts.form.numberOfCorrectiveTickets}</label>
              <Container className={styles.counterControls}>
                <button
                  className={styles.counterButton}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNumberChange('numberOfCorrectiveTickets', -1);
                  }}
                  type="button"
                >
                  -
                </button>
                <span className={styles.counterValue}>{formData.numberOfCorrectiveTickets}</span>
                <button
                  className={styles.counterButton}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNumberChange('numberOfCorrectiveTickets', 1);
                  }}
                  type="button"
                >
                  +
                </button>
              </Container>
            </Container>
          </Container>

          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>
                <i className="fas fa-calendar" style={{ marginRight: '8px' }}></i>
                {appText.contracts.form.contractStartDate}
              </label>
              <InputField
                name="contractStartDate"
                onChange={handleChange}
                pattern={undefined}
                placeholder="mm/dd/yyyy"
                title=""
                type="date"
                value={formData.contractStartDate}
              />
            </Container>
            <Container className={styles.formField}>
              <label className={styles.label}>
                <i className="fas fa-calendar" style={{ marginRight: '8px' }}></i>
                {appText.contracts.form.contractEndDate}
              </label>
              <InputField
                name="contractEndDate"
                onChange={handleChange}
                pattern={undefined}
                placeholder="mm/dd/yyyy"
                title=""
                type="date"
                value={formData.contractEndDate}
              />
            </Container>
          </Container>

          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>
                <i className="fas fa-dollar-sign" style={{ marginRight: '8px' }}></i>
                {appText.contracts.form.contractValue}
              </label>
              <InputField
                name="contractValue"
                onChange={handleChange}
                pattern={undefined}
                placeholder={appText.contracts.form.enterContractValue}
                title=""
                type="number"
                value={formData.contractValue}
              />
            </Container>
          </Container>

          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>
                <i className="fas fa-file" style={{ marginRight: '8px' }}></i>
                {appText.contracts.form.contractFiles}
              </label>
              <Container className={styles.fileUpload}>
                <input
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  className={styles.fileInput}
                  multiple
                  name="contractFiles"
                  onChange={handleFileChange}
                  type="file"
                />
                <label className={styles.fileLabel} htmlFor="contractFiles">
                  <i className="fas fa-file-upload" style={{ fontSize: '48px', color: '#ff6b35', marginBottom: '12px' }}></i>
                  <Paragraph>{appText.contracts.form.clickToUpload}</Paragraph>
                </label>
              </Container>
              <Paragraph className={styles.helperText}>{appText.contracts.form.supportedFormats}</Paragraph>
            </Container>
          </Container>

          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>
                <i className="fas fa-pencil-alt" style={{ marginRight: '8px' }}></i>
                {appText.contracts.form.contractDescription}
              </label>
              <textarea
                className={styles.textarea}
                name="contractDescription"
                onChange={handleChange}
                placeholder={appText.contracts.form.enterContractDescription}
                rows={4}
                value={formData.contractDescription}
              />
            </Container>
          </Container>

          <Container className={styles.modalFooter}>
            <Button className={styles.cancelButton} onClick={onClose} type="button">
              {appText.contracts.form.cancel}
            </Button>
            <Button className={styles.saveButton} disabled={loading} onClick={() => undefined} type="submit">
              {loading ? 'Saving...' : appText.contracts.form.save}
            </Button>
          </Container>
        </Form>
      </Container>
    </Container>
  );
};

export default AddContractModal;

