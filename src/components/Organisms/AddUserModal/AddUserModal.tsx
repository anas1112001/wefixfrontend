import React, { FC, useMemo, useState } from 'react';
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

interface AddUserModalProps {
  company: Company;
  onClose: () => void;
  onSuccess: () => void;
}

const AddUserModal: FC<AddUserModalProps> = ({ company, onClose, onSuccess }) => {
  const modalText = appText.companies.modals.addUser;
  const commonText = appText.companies.modals.common;
  const roleOptions = useMemo(
    () => Object.entries(modalText.roles).map(([value, label]) => ({ value, label })),
    [modalText.roles],
  );

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    userRole: roleOptions[0]?.value || 'COMPANY',
  });

  const generateUserNumber = () => `USR${Math.random().toString(36).slice(2, 9).toUpperCase()}`.slice(0, 10);
  const generateIdentifier = (prefix: string) =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? `${prefix}-${crypto.randomUUID()}`
      : `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
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
            mutation CreateUser($userData: CreateUserInput!) {
              createUser(userData: $userData) {
                message
                user {
                  id
                }
              }
            }
          `,
          variables: {
            userData: {
              companyId: company.id,
              deviceId: generateIdentifier('device'),
              email: formData.email,
              fcmToken: generateIdentifier('fcm'),
              firstName: formData.firstName,
              lastName: formData.lastName,
              password: formData.password,
              userNumber: generateUserNumber(),
              userRole: formData.userRole,
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

      Swal.fire({
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
          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>
                {modalText.firstName} <span className={styles.required}>*</span>
              </label>
              <InputField
                name="firstName"
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                pattern={undefined}
                placeholder={modalText.firstNamePlaceholder}
                title=""
                type="text"
                value={formData.firstName}
              />
            </Container>
            <Container className={styles.formField}>
              <label className={styles.label}>
                {modalText.lastName} <span className={styles.required}>*</span>
              </label>
              <InputField
                name="lastName"
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                pattern={undefined}
                placeholder={modalText.lastNamePlaceholder}
                title=""
                type="text"
                value={formData.lastName}
              />
            </Container>
          </Container>

          <Container className={styles.formField}>
            <label className={styles.label}>
              {modalText.email} <span className={styles.required}>*</span>
            </label>
            <InputField
              name="email"
              onChange={(e) => handleInputChange('email', e.target.value)}
              pattern={undefined}
              placeholder={modalText.emailPlaceholder}
              title=""
              type="email"
              value={formData.email}
            />
          </Container>

          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>
                {modalText.password} <span className={styles.required}>*</span>
              </label>
              <InputField
                name="password"
                onChange={(e) => handleInputChange('password', e.target.value)}
                pattern={undefined}
                placeholder={modalText.passwordPlaceholder}
                title=""
                type="password"
                value={formData.password}
              />
            </Container>
            <Container className={styles.formField}>
              <label className={styles.label}>
                {modalText.userRole} <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
                onChange={(e) => handleInputChange('userRole', e.target.value)}
                value={formData.userRole}
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
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

export default AddUserModal;

