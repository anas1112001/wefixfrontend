import React, { FC, useEffect, useState } from 'react';
import Container from 'components/Atoms/Container/Container';
import Heading from 'components/Atoms/Heading/Heading';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import InputField from 'components/Atoms/InputField/InputField';
import TextArea from 'components/Atoms/TextArea/TextArea';
import Button from 'components/Atoms/Button/Button';
import Form from 'components/Atoms/Form/Form';
import { appText } from 'data/appText';
import styles from './CompanyWizard.module.css';

const GRAPHQL_ENDPOINT = process.env.REACT_APP_API_URL ?? 'http://localhost:4000/graphql';

interface Country {
  code: string | null;
  id: string;
  name: string;
}

interface EstablishedType {
  id: string;
  name: string;
  nameArabic: string | null;
}

interface UserRole {
  id: string;
  name: string;
  nameArabic: string | null;
}

interface CompanyWizardProps {
  onClose: () => void;
}

const CompanyWizard: FC<CompanyWizardProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [countries, setCountries] = useState<Country[]>([]);
  const [establishedTypes, setEstablishedTypes] = useState<EstablishedType[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyTitle: '',
    companyNameArabic: '',
    companyNameEnglish: '',
    countryId: '',
    establishedTypeId: '',
    hoAddress: '',
    hoLocation: '',
    logo: null as File | null,
    // Contract data
    contractReference: '',
    contractTitle: '',
    businessModel: 'B2B',
    managedBy: 'WeFix Team',
    ticketShortCode: '',
    isActive: true,
    numberOfOwner: 1,
    numberOfTeamLeader: 1,
    numberOfBranch: 1,
    numberOfPreventiveTickets: 1,
    numberOfCorrectiveTickets: 1,
    numberOfEmergencyTickets: 1,
    contractStartDate: '',
    contractEndDate: '',
    contractFiles: [] as File[],
    contractDescription: '',
    contractValue: '',
    // User Roles data
    userRoleId: '',
    fullNameAr: '',
    fullNameEn: '',
    userImage: null as File | null,
    userCountryId: '',
    mobileNumber: '',
    email: '',
    userDescription: '',
  });

  const steps = [
    { number: 1, label: appText.companyWizard.steps.basicInfo },
    { number: 2, label: appText.companyWizard.steps.contracts },
    { number: 3, label: appText.companyWizard.steps.userRoles },
    { number: 4, label: appText.companyWizard.steps.branches },
    { number: 5, label: appText.companyWizard.steps.zones },
    { number: 6, label: appText.companyWizard.steps.maintenanceServices },
    { number: 7, label: appText.companyWizard.steps.workingHours },
  ];

  useEffect(() => {
    const fetchLookups = async () => {
      setLoading(true);

      try {
        // Fetch Countries
        const countriesResponse = await fetch(GRAPHQL_ENDPOINT, {
          body: JSON.stringify({
            query: `
              query GetCountries {
                getCountries {
                  id
                  name
                  code
                }
              }
            `,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        const countriesData = await countriesResponse.json();

        if (countriesData.data?.getCountries) {
          setCountries(countriesData.data.getCountries);
        }

        // Fetch Established Types
        const typesResponse = await fetch(GRAPHQL_ENDPOINT, {
          body: JSON.stringify({
            query: `
              query GetEstablishedTypes {
                getEstablishedTypes {
                  id
                  name
                  nameArabic
                }
              }
            `,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        const typesData = await typesResponse.json();

        if (typesData.data?.getEstablishedTypes) {
          setEstablishedTypes(typesData.data.getEstablishedTypes);
        }

        // Fetch User Roles
        const userRolesResponse = await fetch(GRAPHQL_ENDPOINT, {
          body: JSON.stringify({
            query: `
              query GetUserRoles {
                getUserRoles {
                  id
                  name
                  nameArabic
                }
              }
            `,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        const userRolesData = await userRolesResponse.json();

        if (userRolesData.data?.getUserRoles) {
          setUserRoles(userRolesData.data.getUserRoles);
        }
      } catch (error) {
        console.error('Error fetching lookups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLookups();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, (prev[field as keyof typeof prev] as number) + delta),
    }));
  };

  useEffect(() => {
    if (currentStep === 2 && !formData.contractReference && formData.companyTitle) {
      const shortName = formData.companyTitle.substring(0, 2).toUpperCase();
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const contractRef = `CNT-${shortName}-${randomNum}`;
      const ticketCode = `TKT-${shortName}-0003`;

      setFormData((prev) => ({
        ...prev,
        contractReference: contractRef,
        ticketShortCode: ticketCode,
      }));
    }
  }, [currentStep, formData.companyTitle, formData.contractReference]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
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
      <Heading className={styles.sectionTitle} level="3">
        {appText.companyWizard.basicInfo.title}
      </Heading>

      <Form className={styles.form} onSubmit={handleFormSubmit}>
        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.basicInfo.companyTitle} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="companyTitle"
              onChange={(e) => handleInputChange('companyTitle', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.basicInfo.companyTitlePlaceholder}
              title=""
              type="text"
              value={formData.companyTitle}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.basicInfo.companyNameArabic} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="companyNameArabic"
              onChange={(e) => handleInputChange('companyNameArabic', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.basicInfo.companyNameArabicPlaceholder}
              title=""
              type="text"
              value={formData.companyNameArabic}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.basicInfo.companyNameEnglish} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="companyNameEnglish"
              onChange={(e) => handleInputChange('companyNameEnglish', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.basicInfo.companyNameEnglishPlaceholder}
              title=""
              type="text"
              value={formData.companyNameEnglish}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.basicInfo.country} <span className={styles.required}>*</span>
            </label>
            <select
              className={styles.select}
              onChange={(e) => handleInputChange('countryId', e.target.value)}
              value={formData.countryId}
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
              {appText.companyWizard.basicInfo.establishedType} <span className={styles.required}>*</span>
            </label>
            <select
              className={styles.select}
              onChange={(e) => handleInputChange('establishedTypeId', e.target.value)}
              value={formData.establishedTypeId}
            >
              <option value="">{appText.companyWizard.basicInfo.selectType}</option>
              {establishedTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
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
      <Heading className={styles.sectionTitle} level="3">
        {appText.companyWizard.contracts.title}
      </Heading>

      <Form className={styles.form} onSubmit={handleFormSubmit}>
        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              <i className="fas fa-clipboard" style={{ marginRight: '8px' }}></i>
              {appText.companyWizard.contracts.contractReference}
            </label>
            <InputField
              name="contractReference"
              onChange={(e) => handleInputChange('contractReference', e.target.value)}
              pattern={undefined}
              placeholder="CNT-101"
              title=""
              type="text"
              value={formData.contractReference}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.contracts.contractTitle}
            </label>
            <InputField
              name="contractTitle"
              onChange={(e) => handleInputChange('contractTitle', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.contracts.contractTitlePlaceholder}
              title=""
              type="text"
              value={formData.contractTitle}
            />
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.contracts.businessModel} <span className={styles.required}>*</span>
            </label>
            <Container className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  checked={formData.businessModel === 'B2B'}
                  className={styles.radioInput}
                  name="businessModel"
                  onChange={() => handleInputChange('businessModel', 'B2B')}
                  type="radio"
                />
                <span>{appText.companyWizard.contracts.businessModelB2B}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  checked={formData.businessModel === 'White Label'}
                  className={styles.radioInput}
                  name="businessModel"
                  onChange={() => handleInputChange('businessModel', 'White Label')}
                  type="radio"
                />
                <span>{appText.companyWizard.contracts.businessModelWhiteLabel}</span>
              </label>
            </Container>
          </Container>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.contracts.managedBy} <span className={styles.required}>*</span>
            </label>
            <Container className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  checked={formData.managedBy === 'Client Team'}
                  className={styles.radioInput}
                  name="managedBy"
                  onChange={() => handleInputChange('managedBy', 'Client Team')}
                  type="radio"
                />
                <span>{appText.companyWizard.contracts.managedByClientTeam}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  checked={formData.managedBy === 'WeFix Team'}
                  className={styles.radioInput}
                  name="managedBy"
                  onChange={() => handleInputChange('managedBy', 'WeFix Team')}
                  type="radio"
                />
                <span>{appText.companyWizard.contracts.managedByWeFixTeam}</span>
              </label>
            </Container>
          </Container>
        </Container>

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {appText.companyWizard.contracts.ticketShortCode} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="ticketShortCode"
              onChange={(e) => handleInputChange('ticketShortCode', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.contracts.ticketShortCodePlaceholder}
              title=""
              type="text"
              value={formData.ticketShortCode}
            />
            <Paragraph className={styles.helperText}>
              {appText.companyWizard.contracts.ticketShortCodeHelper}
            </Paragraph>
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
          <Container className={styles.numberCounter}>
            <label className={styles.label}>{appText.companyWizard.contracts.numberOfBranch}</label>
            <Container className={styles.counterControls}>
              <Button
                className={styles.counterButton}
                onClick={() => handleNumberChange('numberOfBranch', -1)}
                type="button"
              >
                -
              </Button>
              <span className={styles.counterValue}>{formData.numberOfBranch}</span>
              <Button
                className={styles.counterButton}
                onClick={() => handleNumberChange('numberOfBranch', 1)}
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
          <Container className={styles.formField}>
            <label className={styles.label}>
              <i className="fas fa-calendar" style={{ marginRight: '8px' }}></i>
              {appText.companyWizard.contracts.contractStartDate} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="contractStartDate"
              onChange={(e) => handleInputChange('contractStartDate', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.contracts.datePlaceholder}
              title=""
              type="date"
              value={formData.contractStartDate}
            />
          </Container>
          <Container className={styles.formField}>
            <label className={styles.label}>
              <i className="fas fa-calendar" style={{ marginRight: '8px' }}></i>
              {appText.companyWizard.contracts.contractEndDate} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="contractEndDate"
              onChange={(e) => handleInputChange('contractEndDate', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.contracts.datePlaceholder}
              title=""
              type="date"
              value={formData.contractEndDate}
            />
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

        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <Heading className={styles.sectionSubtitle} level="4">
              <i className="fas fa-dollar-sign" style={{ marginRight: '8px' }}></i>
              {appText.companyWizard.contracts.contractValue}
            </Heading>
            <InputField
              name="contractValue"
              onChange={(e) => handleInputChange('contractValue', e.target.value)}
              pattern={undefined}
              placeholder={appText.companyWizard.contracts.contractValuePlaceholder}
              title=""
              type="text"
              value={formData.contractValue}
            />
          </Container>
        </Container>
      </Form>
    </Container>
  );

  const renderUserRoles = () => (
    <Container className={styles.stepContent}>
      <Heading className={styles.sectionTitle} level="3">
        {appText.companyWizard.userRoles.title}
      </Heading>

      <Form className={styles.form} onSubmit={handleFormSubmit}>
        <Container className={styles.formRow}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              <i className="fas fa-user" style={{ marginRight: '8px' }}></i>
              {appText.companyWizard.userRoles.userRole} <span className={styles.required}>*</span>
            </label>
            <select
              className={styles.select}
              onChange={(e) => handleInputChange('userRoleId', e.target.value)}
              value={formData.userRoleId}
            >
              <option value="">{appText.companyWizard.userRoles.selectUserRole}</option>
              {userRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
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
              title=""
              type="text"
              value={formData.fullNameAr}
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
              title=""
              type="text"
              value={formData.fullNameEn}
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
              pattern={undefined}
              placeholder={appText.companyWizard.userRoles.mobileNumberPlaceholder}
              title=""
              type="tel"
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

  return (
    <Container className={styles.modalOverlay} onClick={onClose}>
      <Container className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <Container className={styles.modalHeader}>
          <Heading className={styles.modalTitle} level="2">
            {appText.companyWizard.title}
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

        {currentStep === 1 && renderBasicInfo()}
        {currentStep === 2 && renderContracts()}
        {currentStep === 3 && renderUserRoles()}

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
            <Button className={styles.nextButton} onClick={handleNext} type="button">
              {currentStep === steps.length ? appText.companyWizard.buttons.finish : appText.companyWizard.buttons.next}
            </Button>
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

export default CompanyWizard;

