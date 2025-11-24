import React, { FC, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Container from 'components/Atoms/Container/Container';
import Heading from 'components/Atoms/Heading/Heading';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import Button from 'components/Atoms/Button/Button';
import Form from 'components/Atoms/Form/Form';
import { appText } from 'data/appText';
import styles from '../EditCompanyModal/EditCompanyModal.module.css';
import { GRAPHQL_ENDPOINT } from 'utils/apiConfig';

interface Company {
  id: string;
  title: string;
}

interface ServiceOption {
  id: string;
  name: string;
  nameArabic?: string | null;
}

interface MaintenanceService {
  id: string;
  mainService: ServiceOption;
  subService: ServiceOption;
}

interface ManageServicesModalProps {
  company: Company;
  onClose: () => void;
  onSuccess: () => void;
}

const ManageServicesModal: FC<ManageServicesModalProps> = ({ company, onClose, onSuccess }) => {
  const modalText = appText.companies.modals.manageServices;
  const commonText = appText.companies.modals.common;

  const [mainServices, setMainServices] = useState<ServiceOption[]>([]);
  const [subServices, setSubServices] = useState<ServiceOption[]>([]);
  const [maintenanceServices, setMaintenanceServices] = useState<MaintenanceService[]>([]);
  const [selectedMain, setSelectedMain] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      setFetching(true);
      try {
        await Promise.all([fetchMainServices(), fetchMaintenanceServices()]);
      } finally {
        setFetching(false);
      }
    };

    loadInitialData();
  }, [company.id]);

  const fetchMainServices = async () => {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: `
            query GetMainServices {
              getActiveMainServices {
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

      const payload = await response.json();

      if (payload.errors) {
        throw new Error(payload.errors[0].message);
      }

      setMainServices(payload.data?.getActiveMainServices || []);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: commonText.errorTitle,
        text: `${modalText.errorMessage} ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const fetchSubServices = async (mainServiceId: string) => {
    if (!mainServiceId) {
      setSubServices([]);

      return;
    }

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: `
            query GetSubServicesByMain($mainServiceId: String!) {
              subServices: getActiveSubServicesByMainServiceId(mainServiceId: $mainServiceId) {
                id
                name
                nameArabic
              }
            }
          `,
          variables: { mainServiceId },
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const payload = await response.json();

      if (payload.errors) {
        throw new Error(payload.errors[0].message);
      }

      setSubServices(payload.data?.subServices || []);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: commonText.errorTitle,
        text: `${modalText.errorMessage} ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const fetchMaintenanceServices = async () => {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: `
            query GetMaintenanceServices($companyId: String!) {
              getMaintenanceServicesByCompanyId(companyId: $companyId) {
                id
                mainService {
                  id
                  name
                  nameArabic
                }
                subService {
                  id
                  name
                  nameArabic
                }
              }
            }
          `,
          variables: { companyId: company.id },
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const payload = await response.json();

      if (payload.errors) {
        throw new Error(payload.errors[0].message);
      }

      setMaintenanceServices(payload.data?.getMaintenanceServicesByCompanyId || []);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: commonText.errorTitle,
        text: `${modalText.errorMessage} ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const handleAddService = async () => {
    if (!selectedMain || !selectedSub) {
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
            mutation CreateMaintenanceService($serviceData: CreateMaintenanceServiceInput!) {
              createMaintenanceService(serviceData: $serviceData) {
                id
              }
            }
          `,
          variables: {
            serviceData: {
              companyId: company.id,
              mainServiceId: selectedMain,
              subServiceId: selectedSub,
              isActive: true,
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

      await fetchMaintenanceServices();
      setSelectedSub('');
      Swal.fire({
        icon: 'success',
        title: commonText.successTitle,
        text: modalText.successAdd,
        timer: 1500,
        showConfirmButton: false,
      });
      onSuccess();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: commonText.errorTitle,
        text: `${modalText.errorMessage} ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: modalText.confirmDelete,
      showCancelButton: true,
      confirmButtonText: modalText.delete,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: `
            mutation DeleteMaintenanceService($id: String!) {
              deleteMaintenanceService(id: $id)
            }
          `,
          variables: { id: serviceId },
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const payload = await response.json();

      if (payload.errors) {
        throw new Error(payload.errors[0].message);
      }

      await fetchMaintenanceServices();
      Swal.fire({
        icon: 'success',
        title: commonText.successTitle,
        text: modalText.successDelete,
        timer: 1500,
        showConfirmButton: false,
      });
      onSuccess();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: commonText.errorTitle,
        text: `${modalText.errorMessage} ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
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

        <Container className={styles.form}>
          <Paragraph>{modalText.description}</Paragraph>

          {fetching ? (
            <Paragraph className={styles.helperText}>{commonText.loading}</Paragraph>
          ) : (
            <>
              <Form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                <Container className={styles.formRow}>
                  <Container className={styles.formField}>
                    <label className={styles.label}>{modalText.mainService}</label>
                    <select
                      className={styles.select}
                      onChange={async (e) => {
                        const value = e.target.value;

                        setSelectedMain(value);
                        setSelectedSub('');
                        await fetchSubServices(value);
                      }}
                      value={selectedMain}
                    >
                      <option value="">{modalText.selectMainService}</option>
                      {mainServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                          {service.nameArabic ? ` / ${service.nameArabic}` : ''}
                        </option>
                      ))}
                    </select>
                  </Container>
                  <Container className={styles.formField}>
                    <label className={styles.label}>{modalText.subService}</label>
                    <select
                      className={styles.select}
                      disabled={!selectedMain || subServices.length === 0}
                      onChange={(e) => setSelectedSub(e.target.value)}
                      value={selectedSub}
                    >
                      <option value="">{modalText.selectSubService}</option>
                      {subServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                          {service.nameArabic ? ` / ${service.nameArabic}` : ''}
                        </option>
                      ))}
                    </select>
                  </Container>
                </Container>
                <Container className={styles.formField}>
                  <Button className={styles.saveButton} disabled={loading} onClick={handleAddService} type="button">
                    {loading ? commonText.loading : modalText.add}
                  </Button>
                </Container>
              </Form>

              <Container className={styles.listSection}>
                <Heading className={styles.listTitle} level="4">
                  {modalText.existingTitle}
                </Heading>
                {maintenanceServices.length === 0 ? (
                  <Paragraph className={styles.helperText}>{modalText.emptyMessage}</Paragraph>
                ) : (
                  <ul className={styles.listBody}>
                    {maintenanceServices.map((service) => (
                      <li className={styles.listItem} key={service.id}>
                        <span>
                          {service.mainService?.name}
                          {service.mainService?.nameArabic ? ` / ${service.mainService.nameArabic}` : ''}
                          {' → '}
                          {service.subService?.name}
                          {service.subService?.nameArabic ? ` / ${service.subService.nameArabic}` : ''}
                        </span>
                        <Button className={styles.cancelButton} onClick={() => handleDeleteService(service.id)} type="button">
                          {modalText.delete}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </Container>
            </>
          )}

          <Container className={styles.modalFooter}>
            <Button className={styles.cancelButton} onClick={onClose} type="button">
              {modalText.close}
            </Button>
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

export default ManageServicesModal;

