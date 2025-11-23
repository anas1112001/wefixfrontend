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

interface CompanyWizardProps {
  onClose: () => void;
}

const CompanyWizard: FC<CompanyWizardProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [countries, setCountries] = useState<Country[]>([]);
  const [establishedTypes, setEstablishedTypes] = useState<EstablishedType[]>([]);
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
            <Container key={step.number} className={styles.stepIndicator}>
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

