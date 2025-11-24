import React, { FC, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Container from 'components/Atoms/Container/Container';
import Form from 'components/Atoms/Form/Form';
import Heading from 'components/Atoms/Heading/Heading';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import InputField from 'components/Atoms/InputField/InputField';
import Button from 'components/Atoms/Button/Button';
import Sidebar from 'components/Molecules/Sidebar/Sidebar';
import CompanyWizard from 'components/Organisms/CompanyWizard/CompanyWizard';
import EditCompanyModal from 'components/Organisms/EditCompanyModal/EditCompanyModal';
import AddUserModal from 'components/Organisms/AddUserModal/AddUserModal';
import AddBranchModal from 'components/Organisms/AddBranchModal/AddBranchModal';
import AddZoneModal from 'components/Organisms/AddZoneModal/AddZoneModal';
import ManageServicesModal from 'components/Organisms/ManageServicesModal/ManageServicesModal';
import { appText } from 'data/appText';
import styles from './Companies.module.css';
import { GRAPHQL_ENDPOINT } from 'utils/apiConfig';

interface Lookup {
  id: string;
  name: string;
  nameArabic: string | null;
}

interface Company {
  companyId: string;
  countryLookup: Lookup | null;
  establishedTypeLookup: Lookup | null;
  id: string;
  isActive: string;
  logo: string | null;
  numberOfBranches: number;
  title: string;
}

interface CompaniesData {
  companies: Company[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

type CompanyAction = 'edit' | 'addUser' | 'addBranch' | 'addZone' | 'manageServices';

const Companies: FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showWizard, setShowWizard] = useState(false);
  const [establishedTypes, setEstablishedTypes] = useState<Lookup[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const limit = 10;

  const handleActionClick = (action: CompanyAction, company: Company) => {
    setSelectedCompany(company);
    setActiveModal(action);
  };

  const closeModal = () => {
    setSelectedCompany(null);
    setActiveModal(null);
  };

  const handleModalSuccess = () => {
    fetchCompanies();
  };

  const handleDeleteCompany = async (company: Company) => {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: appText.companies.deleteDialog.title,
      text: appText.companies.deleteDialog.message.replace('{title}', company.title),
      showCancelButton: true,
      confirmButtonText: appText.companies.deleteDialog.confirm,
      cancelButtonText: appText.companies.deleteDialog.cancel,
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: `
            mutation DeleteCompany($id: String!) {
              deleteCompany(id: $id)
            }
          `,
          variables: { id: company.id },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const payload = await response.json();
      
      if (payload.errors?.length || payload.data?.deleteCompany !== true) {
        const errorMessage = payload.errors?.[0]?.message || appText.companies.deleteDialog.errorMessage;
        
        throw new Error(errorMessage);
      }

      await Swal.fire({
        icon: 'success',
        title: appText.companies.deleteDialog.successTitle,
        text: appText.companies.deleteDialog.successMessage,
      });

      if (companies.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      
        return;
      }

      fetchCompanies();
    } catch (error) {
      
      const message = error instanceof Error ? error.message : appText.companies.deleteDialog.errorMessage;
      
      Swal.fire({
        icon: 'error',
        title: appText.companies.deleteDialog.errorTitle,
        text: message,
      });
    }
  };

  const fetchCompanies = async () => {
    setLoading(true);

    try {
      const filter: any = {
        page: currentPage,
        limit,
      };

      if (search) {
        filter.search = search;
      }

      if (statusFilter !== 'all') {
        filter.status = statusFilter;
      }

      if (typeFilter !== 'all') {
        filter.type = typeFilter;
      }

      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: `
            query GetCompanies($filter: CompanyFilterInput) {
              getCompanies(filter: $filter) {
                companies {
                  id
                  companyId
                  title
                  isActive
                  establishedTypeLookup {
                    id
                    name
                    nameArabic
                  }
                  countryLookup {
                    id
                    name
                    nameArabic
                  }
                  numberOfBranches
                  logo
                }
                total
                page
                limit
                totalPages
                message
              }
            }
          `,
          variables: { filter },
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

      const data: CompaniesData = payload?.data?.getCompanies;

      setCompanies(data.companies || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching companies:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch companies';

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchEstablishedTypes = async () => {
      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          body: JSON.stringify({
            query: `
              query GetEstablishedTypes {
                getLookupsByCategory(category: ESTABLISHED_TYPE) {
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

        const payload = await response.json();

        if (payload.data?.getLookupsByCategory) {
          setEstablishedTypes(payload.data.getLookupsByCategory);
        }
      } catch (error) {
        console.error('Error fetching established types:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch established types';

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: message,
        });
      }
    };

    fetchEstablishedTypes();
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, statusFilter, typeFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCompanies();
  };

  const getInitials = (title: string) =>
    title
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, total);

  return (
    <Container className={styles.companiesLayout}>
      <Sidebar />
      <Container className={styles.mainContent}>
        <Container className={styles.header}>
          <Heading className={styles.pageTitle} level="1">
            {appText.companies.title}
          </Heading>
          <Button className={styles.addButton} onClick={() => setShowWizard(true)} type="button">
            {appText.companies.addNew}
          </Button>
        </Container>

        <Container className={styles.filtersSection}>
          <Form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <InputField
              name="search"
              onChange={handleSearch}
              pattern={undefined}
              placeholder={appText.companies.searchPlaceholder}
              title=""
              type="text"
              value={search}
            />
          </Form>
          <Container className={styles.filters}>
            <select
              className={styles.filterSelect}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              value={statusFilter}
            >
              <option value="all">{appText.companies.allStatus}</option>
              <option value="Active">{appText.companies.status.active}</option>
              <option value="Inactive">{appText.companies.status.inactive}</option>
            </select>
            <select
              className={styles.filterSelect}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              value={typeFilter}
            >
              <option value="all">{appText.companies.allTypes}</option>
              {establishedTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <Paragraph className={styles.resultsCount}>
              {appText.companies.showingResults.replace('{count}', total.toString())}
            </Paragraph>
          </Container>
        </Container>

        {loading ? (
          <Paragraph>Loading...</Paragraph>
        ) : (
          <>
            <Container className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{appText.companies.table.logo}</th>
                    <th>{appText.companies.table.companyId}</th>
                    <th>{appText.companies.table.companyTitle}</th>
                    <th>{appText.companies.table.isActive}</th>
                    <th>{appText.companies.table.establishedType}</th>
                    <th>{appText.companies.table.numberOfBranches}</th>
                    <th>{appText.companies.table.teamLeaders}</th>
                    <th>{appText.companies.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.id}>
                      <td>
                        <Container className={styles.logoCircle}>
                          {company.logo ? (
                            <img alt={company.title} className={styles.logoImage} src={company.logo} />
                          ) : (
                            <span className={styles.logoInitials}>{getInitials(company.title)}</span>
                          )}
                        </Container>
                      </td>
                      <td>{company.companyId}</td>
                      <td>{company.title}</td>
                      <td>
                        <span
                          className={`${styles.statusTag} ${
                            company.isActive === 'Active' ? styles.active : styles.inactive
                          }`}
                        >
                          {company.isActive}
                        </span>
                      </td>
                      <td>{company.establishedTypeLookup?.name || '-'}</td>
                      <td>{company.numberOfBranches}</td>
                      <td>
                        <Container className={styles.teamLeaders}>
                          <Container className={styles.leaderCircle}>TL1</Container>
                          <Container className={styles.leaderCircle}>TL2</Container>
                        </Container>
                      </td>
                      <td>
                        <Container className={styles.actions}>
                          <Button
                            className={styles.actionButtonEdit}
                            onClick={() => handleActionClick('edit', company)}
                            type="button"
                          >
                            {appText.companies.actions.edit}
                          </Button>
                          <Button
                            className={styles.actionButtonAdd}
                            onClick={() => handleActionClick('addUser', company)}
                            type="button"
                          >
                            {appText.companies.actions.addUser}
                          </Button>
                          <Button
                            className={styles.actionButtonBranch}
                            onClick={() => handleActionClick('addBranch', company)}
                            type="button"
                          >
                            {appText.companies.actions.addBranch}
                          </Button>
                          <Button
                            className={styles.actionButtonZone}
                            onClick={() => handleActionClick('addZone', company)}
                            type="button"
                          >
                            {appText.companies.actions.addZone}
                          </Button>
                          <Button
                            className={styles.actionButtonManage}
                            onClick={() => handleActionClick('manageServices', company)}
                            type="button"
                          >
                            {appText.companies.actions.manageServices}
                          </Button>
                          <Button
                            className={styles.actionButtonDelete}
                            onClick={() => handleDeleteCompany(company)}
                            type="button"
                          >
                            {appText.companies.actions.delete}
                          </Button>
                        </Container>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Container>

            <Container className={styles.pagination}>
              <Paragraph className={styles.paginationInfo}>
                {appText.companies.pagination.showing
                  .replace('{start}', startIndex.toString())
                  .replace('{end}', endIndex.toString())
                  .replace('{total}', total.toString())}
              </Paragraph>
              <Container className={styles.paginationControls}>
                <Button
                  className={styles.paginationButton}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  type="button"
                >
                  {appText.companies.pagination.previous}
                </Button>
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                  const pageNum = i + 1;

                  if (totalPages > 10 && pageNum === 10) {
                    return (
                      <React.Fragment key={pageNum}>
                        <span>...</span>
                        <Button
                          className={`${styles.paginationButton} ${currentPage === totalPages ? styles.active : ''}`}
                          onClick={() => setCurrentPage(totalPages)}
                          type="button"
                        >
                          {totalPages}
                        </Button>
                      </React.Fragment>
                    );
                  }

                  return (
                    <Button
                      key={pageNum}
                      className={`${styles.paginationButton} ${currentPage === pageNum ? styles.active : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                      type="button"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  className={styles.paginationButton}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  type="button"
                >
                  {appText.companies.pagination.next}
                </Button>
              </Container>
            </Container>
          </>
        )}
      </Container>
      {showWizard && <CompanyWizard onClose={() => setShowWizard(false)} />}
      {activeModal === 'edit' && selectedCompany && (
        <EditCompanyModal company={selectedCompany} onClose={closeModal} onSuccess={handleModalSuccess} />
      )}
      {activeModal === 'addUser' && selectedCompany && (
        <AddUserModal company={selectedCompany} onClose={closeModal} onSuccess={handleModalSuccess} />
      )}
      {activeModal === 'addBranch' && selectedCompany && (
        <AddBranchModal company={selectedCompany} onClose={closeModal} onSuccess={handleModalSuccess} />
      )}
      {activeModal === 'addZone' && selectedCompany && (
        <AddZoneModal company={selectedCompany} onClose={closeModal} onSuccess={handleModalSuccess} />
      )}
      {activeModal === 'manageServices' && selectedCompany && (
        <ManageServicesModal company={selectedCompany} onClose={closeModal} onSuccess={handleModalSuccess} />
      )}
    </Container>
  );
};

export default Companies;

