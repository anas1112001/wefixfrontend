import React, { FC, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Container from 'components/Atoms/Container/Container';
import Heading from 'components/Atoms/Heading/Heading';
import InputField from 'components/Atoms/InputField/InputField';
import Button from 'components/Atoms/Button/Button';
import Form from 'components/Atoms/Form/Form';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import styles from '../EditCompanyModal/EditCompanyModal.module.css';
import { GRAPHQL_ENDPOINT } from 'utils/apiConfig';

interface Country {
  code: string | null;
  id: string;
  name: string;
}

interface UserRole {
  id: string;
  name: string;
  nameArabic: string | null;
}

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
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [formData, setFormData] = useState({
    fullNameAr: '',
    fullNameEn: '',
    userRoleId: '',
    countryId: '',
    email: '',
    mobileNumber: '',
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
                userRoles: getLookupsByCategory(category: USER_ROLE) {
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

        if (data.data?.userRoles) {
          setUserRoles(data.data.userRoles);
        }
      } catch (error) {
        console.error('Error fetching lookups:', error);
      }
    };

    fetchLookups();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullNameEn || !formData.mobileNumber || !formData.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill in all required fields.',
      });

      return;
    }

    setLoading(true);

    try {
      await Swal.fire({
        icon: 'success',
        title: 'User Added!',
        text: `User "${formData.fullNameEn}" has been added to company "${company.title}".`,
        timer: 1500,
        showConfirmButton: false,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to add user: ${error.message || 'Unknown error'}`,
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
            Add User to: {company.title}
          </Heading>
          <Button className={styles.closeButton} onClick={onClose} type="button">
            <i className="fas fa-times"></i>
          </Button>
        </Container>

        <Form className={styles.form} onSubmit={handleSubmit}>
          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>
                Full Name (Arabic) <span className={styles.required}>*</span>
              </label>
              <InputField
                name="fullNameAr"
                onChange={(e) => handleInputChange('fullNameAr', e.target.value)}
                pattern={undefined}
                placeholder="اسم المستخدم"
                title=""
                type="text"
                value={formData.fullNameAr}
              />
            </Container>
            <Container className={styles.formField}>
              <label className={styles.label}>
                Full Name (English) <span className={styles.required}>*</span>
              </label>
              <InputField
                name="fullNameEn"
                onChange={(e) => handleInputChange('fullNameEn', e.target.value)}
                pattern={undefined}
                placeholder="User Name"
                title=""
                type="text"
                value={formData.fullNameEn}
              />
            </Container>
          </Container>

          <Container className={styles.formField}>
            <label className={styles.label}>
              User Role <span className={styles.required}>*</span>
            </label>
            <select
              className={styles.select}
              onChange={(e) => handleInputChange('userRoleId', e.target.value)}
              value={formData.userRoleId}
            >
              <option value="">Select User Role</option>
              {userRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </Container>

          <Container className={styles.formRow}>
            <Container className={styles.formField}>
              <label className={styles.label}>
                Country <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
                onChange={(e) => handleInputChange('countryId', e.target.value)}
                value={formData.countryId}
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name} {country.code && `(${country.code})`}
                  </option>
                ))}
              </select>
            </Container>
            <Container className={styles.formField}>
              <label className={styles.label}>
                Mobile Number <span className={styles.required}>*</span>
              </label>
              <InputField
                name="mobileNumber"
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                pattern={undefined}
                placeholder="7XX XXX XXX"
                title=""
                type="tel"
                value={formData.mobileNumber}
              />
              <Paragraph className={styles.helperText}>
                Mobile number only (without country code)
              </Paragraph>
            </Container>
          </Container>

          <Container className={styles.formField}>
            <label className={styles.label}>
              Email Address <span className={styles.required}>*</span>
            </label>
            <InputField
              name="email"
              onChange={(e) => handleInputChange('email', e.target.value)}
              pattern={undefined}
              placeholder="user@example.com"
              title=""
              type="email"
              value={formData.email}
            />
          </Container>

          <Container className={styles.modalFooter}>
            <Button className={styles.cancelButton} onClick={onClose} type="button">
              Cancel
            </Button>
            <Button className={styles.saveButton} disabled={loading} onClick={() => undefined} type="submit">
              {loading ? 'Adding...' : 'Add User'}
            </Button>
          </Container>
        </Form>
      </Container>
    </Container>
  );
};

export default AddUserModal;

