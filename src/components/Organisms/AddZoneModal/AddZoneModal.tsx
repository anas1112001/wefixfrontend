import React, { FC, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Container from 'components/Atoms/Container/Container';
import Heading from 'components/Atoms/Heading/Heading';
import InputField from 'components/Atoms/InputField/InputField';
import TextArea from 'components/Atoms/TextArea/TextArea';
import Button from 'components/Atoms/Button/Button';
import Form from 'components/Atoms/Form/Form';
import { appText } from 'data/appText';
import styles from '../EditCompanyModal/EditCompanyModal.module.css';
import { GRAPHQL_ENDPOINT } from 'utils/apiConfig';

interface Branch {
  branchTitle: string;
  id: string;
}

interface Company {
  id: string;
  title: string;
}

interface AddZoneModalProps {
  company: Company;
  onClose: () => void;
  onSuccess: () => void;
}

const AddZoneModal: FC<AddZoneModalProps> = ({ company, onClose, onSuccess }) => {
  const modalText = appText.companies.modals.addZone;
  const commonText = appText.companies.modals.common;
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [formData, setFormData] = useState({
    branchId: '',
    isActive: true,
    zoneDescription: '',
    zoneNumber: '',
    zoneTitle: '',
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          body: JSON.stringify({
            query: `
            query GetBranchesByCompany($companyId: String!) {
                getBranchesByCompanyId(companyId: $companyId) {
                  id
                  branchTitle
                }
              }
            `,
            variables: {
              companyId: company.id,
            },
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });

        const data = await response.json();

        if (data.data?.getBranchesByCompanyId) {
          setBranches(data.data.getBranchesByCompanyId);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, [company.id]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.zoneTitle || !formData.branchId) {
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
            mutation CreateZone($zoneData: CreateZoneInput!) {
              createZone(zoneData: $zoneData) {
                id
                zoneTitle
              }
            }
          `,
          variables: {
            zoneData: {
              zoneTitle: formData.zoneTitle,
              zoneNumber: formData.zoneNumber || null,
              zoneDescription: formData.zoneDescription || null,
              branchId: formData.branchId,
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
              {modalText.branch} <span className={styles.required}>*</span>
            </label>
            <select
              className={styles.select}
              onChange={(e) => handleInputChange('branchId', e.target.value)}
              value={formData.branchId}
            >
              <option value="">{modalText.selectBranch}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branchTitle}
                </option>
              ))}
            </select>
            {branches.length === 0 && (
              <p className={styles.helperText}>{modalText.emptyBranches}</p>
            )}
          </Container>

          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>
                {modalText.zoneTitle} <span className={styles.required}>*</span>
              </label>
              <InputField
                name="zoneTitle"
                onChange={(e) => handleInputChange('zoneTitle', e.target.value)}
                pattern={undefined}
                placeholder={modalText.zoneTitlePlaceholder}
                title=""
                type="text"
                value={formData.zoneTitle}
              />
            </Container>
            <Container className={styles.formField}>
              <label className={styles.label}>{modalText.zoneNumber}</label>
              <InputField
                name="zoneNumber"
                onChange={(e) => handleInputChange('zoneNumber', e.target.value)}
                pattern={undefined}
                placeholder={modalText.zoneNumberPlaceholder}
                title=""
                type="text"
                value={formData.zoneNumber}
              />
            </Container>
          </Container>

          <Container className={styles.formField}>
            <label className={styles.label}>{modalText.zoneDescription}</label>
            <TextArea
              name="zoneDescription"
              onChange={(e) => handleInputChange('zoneDescription', e.target.value)}
              placeholder={modalText.zoneDescriptionPlaceholder}
              rows={4}
              value={formData.zoneDescription}
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

export default AddZoneModal;

