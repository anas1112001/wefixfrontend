import React, { FC, useState } from 'react';
import Swal from 'sweetalert2';
import Container from 'components/Atoms/Container/Container';
import Heading from 'components/Atoms/Heading/Heading';
import InputField from 'components/Atoms/InputField/InputField';
import Button from 'components/Atoms/Button/Button';
import Form from 'components/Atoms/Form/Form';
import { appText } from 'data/appText';
import styles from '../EditCompanyModal/EditCompanyModal.module.css';
import { GRAPHQL_ENDPOINT } from 'utils/apiConfig';

interface Company {
  id: string;
  title: string;
}

interface AddBranchModalProps {
  company: Company;
  onClose: () => void;
  onSuccess: () => void;
}

const AddBranchModal: FC<AddBranchModalProps> = ({ company, onClose, onSuccess }) => {
  const modalText = appText.companies.modals.addBranch;
  const commonText = appText.companies.modals.common;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    branchTitle: '',
    branchNameArabic: '',
    branchNameEnglish: '',
    branchRepresentativeName: '',
    isActive: true,
    representativeEmailAddress: '',
    representativeMobileNumber: '',
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.branchTitle || !formData.branchNameEnglish) {
      Swal.fire({
        icon: 'warning',
        title: commonText.validationTitle,
        text: commonText.validationMessage,
      });

      return;
    }

    setLoading(true);

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: `
            mutation CreateBranch($branchData: CreateBranchInput!) {
              createBranch(branchData: $branchData) {
                id
                branchTitle
              }
            }
          `,
          variables: {
            branchData: {
              branchTitle: formData.branchTitle,
              branchNameArabic: formData.branchNameArabic || null,
              branchNameEnglish: formData.branchNameEnglish,
              branchRepresentativeName: formData.branchRepresentativeName || null,
              representativeMobileNumber: formData.representativeMobileNumber || null,
              representativeEmailAddress: formData.representativeEmailAddress || null,
              companyId: company.id,
              isActive: formData.isActive,
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
              {modalText.branchTitle} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="branchTitle"
              onChange={(e) => handleInputChange('branchTitle', e.target.value)}
              pattern={undefined}
              placeholder={modalText.branchTitlePlaceholder}
              title=""
              type="text"
              value={formData.branchTitle}
            />
          </Container>

          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>
                {modalText.branchNameArabic} <span className={styles.required}>*</span>
              </label>
              <InputField
                name="branchNameArabic"
                onChange={(e) => handleInputChange('branchNameArabic', e.target.value)}
                pattern={undefined}
                placeholder={modalText.branchNameArabicPlaceholder}
                title=""
                type="text"
                value={formData.branchNameArabic}
              />
            </Container>
            <Container className={styles.formField}>
              <label className={styles.label}>
                {modalText.branchNameEnglish} <span className={styles.required}>*</span>
              </label>
              <InputField
                name="branchNameEnglish"
                onChange={(e) => handleInputChange('branchNameEnglish', e.target.value)}
                pattern={undefined}
                placeholder={modalText.branchNameEnglishPlaceholder}
                title=""
                type="text"
                value={formData.branchNameEnglish}
              />
            </Container>
          </Container>

          <Container className={styles.formField}>
            <label className={styles.label}>{modalText.representativeName}</label>
            <InputField
              name="branchRepresentativeName"
              onChange={(e) => handleInputChange('branchRepresentativeName', e.target.value)}
              pattern={undefined}
              placeholder={modalText.representativeNamePlaceholder}
              title=""
              type="text"
              value={formData.branchRepresentativeName}
            />
          </Container>

          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>{modalText.representativeMobile}</label>
              <InputField
                name="representativeMobileNumber"
                onChange={(e) => handleInputChange('representativeMobileNumber', e.target.value)}
                pattern={undefined}
                placeholder={modalText.representativeMobilePlaceholder}
                title=""
                type="tel"
                value={formData.representativeMobileNumber}
              />
            </Container>
            <Container className={styles.formField}>
              <label className={styles.label}>{modalText.representativeEmail}</label>
              <InputField
                name="representativeEmailAddress"
                onChange={(e) => handleInputChange('representativeEmailAddress', e.target.value)}
                pattern={undefined}
                placeholder={modalText.representativeEmailPlaceholder}
                title=""
                type="email"
                value={formData.representativeEmailAddress}
              />
            </Container>
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

export default AddBranchModal;

