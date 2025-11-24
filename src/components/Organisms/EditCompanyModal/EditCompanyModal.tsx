import React, { FC, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Container from 'components/Atoms/Container/Container';
import Heading from 'components/Atoms/Heading/Heading';
import InputField from 'components/Atoms/InputField/InputField';
import TextArea from 'components/Atoms/TextArea/TextArea';
import Button from 'components/Atoms/Button/Button';
import Form from 'components/Atoms/Form/Form';
import { appText } from 'data/appText';
import styles from './EditCompanyModal.module.css';
import { GRAPHQL_ENDPOINT } from 'utils/apiConfig';

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

interface Company {
  companyId: string;
  companyNameArabic?: string | null;
  companyNameEnglish?: string | null;
  countryLookup: { id: string; name: string } | null;
  establishedTypeLookup: { id: string; name: string } | null;
  hoAddress?: string | null;
  id: string;
  isActive: string;
  logo: string | null;
  title: string;
}

interface EditCompanyModalProps {
  company: Company;
  onClose: () => void;
  onSuccess: () => void;
}

const EditCompanyModal: FC<EditCompanyModalProps> = ({ company, onClose, onSuccess }) => {
  const modalText = appText.companies.modals.editCompany;
  const commonText = appText.companies.modals.common;
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [establishedTypes, setEstablishedTypes] = useState<EstablishedType[]>([]);
  const [formData, setFormData] = useState({
    companyTitle: company.title || '',
    companyNameArabic: company.companyNameArabic || '',
    companyNameEnglish: company.companyNameEnglish || '',
    countryLookupId: company.countryLookup?.id || '',
    establishedTypeLookupId: company.establishedTypeLookup?.id || '',
    hoAddress: company.hoAddress || '',
    isActive: company.isActive === 'Active',
  });

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          body: JSON.stringify({
            query: `
              query GetLookups {
                countries: getLookupsByCategory(category: COUNTRY) {
                  id
                  name
                  code
                }
                establishedTypes: getLookupsByCategory(category: ESTABLISHED_TYPE) {
                  id
                  name
                  nameArabic
                }
              }
            `,
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });

        const data = await response.json();

        if (data.data?.countries) {
          setCountries(data.data.countries);
        }

        if (data.data?.establishedTypes) {
          setEstablishedTypes(data.data.establishedTypes);
        }
      } catch (error) {
        console.error('Error fetching lookups:', error);
      }
    };

    fetchLookups();
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: `
            mutation UpdateCompany($id: String!, $companyData: UpdateCompanyInput!) {
              updateCompany(id: $id, companyData: $companyData) {
                company {
                  id
                  title
                }
                message
              }
            }
          `,
          variables: {
            id: company.id,
            companyData: {
              title: formData.companyTitle,
              companyNameArabic: formData.companyNameArabic || null,
              companyNameEnglish: formData.companyNameEnglish || null,
              countryLookupId: formData.countryLookupId || null,
              establishedTypeLookupId: formData.establishedTypeLookupId || null,
              hoAddress: formData.hoAddress || null,
              isActive: formData.isActive ? 'ACTIVE' : 'INACTIVE',
            },
          },
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const payload = await response.json();

      if (payload.errors) {
        throw new Error(payload.errors[0].message);
      }

      await Swal.fire({
        icon: 'success',
        title: commonText.successTitle,
        text: modalText.successMessage,
        timer: 1500,
        showConfirmButton: false,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: commonText.errorTitle,
        text: `${modalText.errorMessage} ${error.message || 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className={styles.modalOverlay} onClick={onClose}>
      <Container className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <Container className={styles.modalHeader}>
          <Heading className={styles.modalTitle} level="2">
            {modalText.title}: {company.title}
          </Heading>
          <Button className={styles.closeButton} onClick={onClose} type="button">
            <i className="fas fa-times"></i>
          </Button>
        </Container>

        <Form className={styles.form} onSubmit={handleSubmit}>
          <Container className={styles.formField}>
            <label className={styles.label}>
              {modalText.companyTitle} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="companyTitle"
              onChange={(e) => handleInputChange('companyTitle', e.target.value)}
              pattern={undefined}
              placeholder={modalText.companyTitlePlaceholder}
              title=""
              type="text"
              value={formData.companyTitle}
            />
          </Container>

          <Container className={styles.formField}>
            <label className={styles.label}>{modalText.companyNameArabic}</label>
            <InputField
              name="companyNameArabic"
              onChange={(e) => handleInputChange('companyNameArabic', e.target.value)}
              pattern={undefined}
              placeholder={modalText.companyNameArabicPlaceholder}
              title=""
              type="text"
              value={formData.companyNameArabic}
            />
          </Container>

          <Container className={styles.formField}>
            <label className={styles.label}>{modalText.companyNameEnglish}</label>
            <InputField
              name="companyNameEnglish"
              onChange={(e) => handleInputChange('companyNameEnglish', e.target.value)}
              pattern={undefined}
              placeholder={modalText.companyNameEnglishPlaceholder}
              title=""
              type="text"
              value={formData.companyNameEnglish}
            />
          </Container>

          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>{modalText.country}</label>
              <select
                className={styles.select}
                onChange={(e) => handleInputChange('countryLookupId', e.target.value)}
                value={formData.countryLookupId}
              >
                <option value="">{modalText.selectCountry}</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </Container>
            <Container className={styles.formField}>
              <label className={styles.label}>{modalText.establishedType}</label>
              <select
                className={styles.select}
                onChange={(e) => handleInputChange('establishedTypeLookupId', e.target.value)}
                value={formData.establishedTypeLookupId}
              >
                <option value="">{modalText.selectEstablishedType}</option>
                {establishedTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </Container>
          </Container>

          <Container className={styles.formField}>
            <label className={styles.label}>{modalText.hoAddress}</label>
            <TextArea
              name="hoAddress"
              onChange={(e) => handleInputChange('hoAddress', e.target.value)}
              placeholder={modalText.hoAddressPlaceholder}
              value={formData.hoAddress}
            />
          </Container>

          <Container className={styles.formField}>
            <label className={styles.label}>{modalText.statusLabel}</label>
            <Container className={styles.toggleContainer}>
              <label className={styles.toggleLabel}>
                <input
                  checked={formData.isActive}
                  className={styles.toggleInput}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  type="checkbox"
                />
                <span className={`${styles.toggleSlider} ${formData.isActive ? styles.toggleActive : ''}`}></span>
                <span className={styles.toggleText}>
                  {formData.isActive ? modalText.statusActive : modalText.statusInactive}
                </span>
              </label>
            </Container>
          </Container>

          <Container className={styles.modalFooter}>
            <Button className={styles.cancelButton} onClick={onClose} type="button">
              {commonText.cancel}
            </Button>
            <Button className={styles.saveButton} disabled={loading} onClick={() => undefined} type="submit">
              {loading ? commonText.loading : modalText.save}
            </Button>
          </Container>
        </Form>
      </Container>
    </Container>
  );
};

export default EditCompanyModal;

