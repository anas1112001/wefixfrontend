import React, { FC } from 'react';
import Swal from 'sweetalert2';
import Container from 'components/Atoms/Container/Container';
import Heading from 'components/Atoms/Heading/Heading';
import Button from 'components/Atoms/Button/Button';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import styles from '../EditCompanyModal/EditCompanyModal.module.css';

interface Company {
  id: string;
  title: string;
}

interface ManageManagersModalProps {
  company: Company;
  onClose: () => void;
  onSuccess: () => void;
}

const ManageManagersModal: FC<ManageManagersModalProps> = ({ company, onClose, onSuccess }) => {
  const handleAction = () => {
    Swal.fire({
      icon: 'info',
      title: 'Coming Soon',
      text: 'Manage Managers functionality will be implemented soon.',
    });
  };

  return (
    <Container className={styles.modalOverlay} onClick={onClose}>
      <Container className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <Container className={styles.modalHeader}>
          <Heading className={styles.modalTitle} level="2">
            Manage Managers: {company.title}
          </Heading>
          <Button className={styles.closeButton} onClick={onClose} type="button">
            <i className="fas fa-times"></i>
          </Button>
        </Container>

        <Container className={styles.form}>
          <Paragraph>
            This feature allows you to manage managers for the company "{company.title}".
          </Paragraph>
          <Paragraph>
            You can assign team leaders, supervisors, and other management roles.
          </Paragraph>
          <Paragraph className={styles.infoNote}>
            Full implementation coming soon...
          </Paragraph>

          <Container className={styles.modalFooter}>
            <Button className={styles.cancelButton} onClick={onClose} type="button">
              Close
            </Button>
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

export default ManageManagersModal;

