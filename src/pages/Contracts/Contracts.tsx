import React, { FC, useEffect, useState } from 'react';
import Container from 'components/Atoms/Container/Container';
import Form from 'components/Atoms/Form/Form';
import Heading from 'components/Atoms/Heading/Heading';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import InputField from 'components/Atoms/InputField/InputField';
import Button from 'components/Atoms/Button/Button';
import Sidebar from 'components/Molecules/Sidebar/Sidebar';
import { appText } from 'data/appText';
import styles from './Contracts.module.css';
import AddContractModal from './AddContractModal';

const GRAPHQL_ENDPOINT = process.env.REACT_APP_API_URL ?? 'http://localhost:4000/graphql';

interface Company {
  id: string;
  title: string;
}

interface BusinessModel {
  id: string;
  name: string;
}

interface Contract {
  businessModelLookup: BusinessModel;
  company: Company;
  contractEndDate: string | null;
  contractReference: string;
  contractStartDate: string | null;
  contractValue: number | null;
  id: string;
  isActive: boolean;
}

interface ContractsData {
  contracts: Contract[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

const Contracts: FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [businessModelFilter, setBusinessModelFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [businessModels, setBusinessModels] = useState<BusinessModel[]>([]);
  const limit = 10;

  const fetchContracts = async () => {
    setLoading(true);

    try {
      const filter: any = {
        limit,
        page: currentPage,
      };

      if (search) {
        filter.search = search;
      }

      if (statusFilter !== 'all') {
        filter.status = statusFilter;
      }

      if (businessModelFilter !== 'all') {
        filter.businessModel = businessModelFilter;
      }

      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: `
            query GetContracts($filter: ContractFilterInput) {
              getContracts(filter: $filter) {
                contracts {
                  id
                  contractReference
                  company {
                    id
                    title
                  }
                  businessModelLookup {
                    id
                    name
                  }
                  contractValue
                  isActive
                  contractStartDate
                  contractEndDate
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

      const data: ContractsData = payload?.data?.getContracts;

      setContracts(data.contracts || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBusinessModels = async () => {
      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          body: JSON.stringify({
            query: `
              query GetBusinessModels {
                getLookupsByCategory(category: BUSINESS_MODEL) {
                  id
                  name
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
          setBusinessModels(payload.data.getLookupsByCategory);
        }
      } catch (error) {
        console.error('Error fetching business models:', error);
      }
    };

    fetchBusinessModels();
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [currentPage, statusFilter, businessModelFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchContracts();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) {
      return '-';
    }

    const date = new Date(dateString);

    return date.toISOString().split('T')[0];
  };

  const formatCurrency = (value: number | null) => {
    if (!value) {
      return '-';
    }

    return new Intl.NumberFormat('en-US', {
      currency: 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      style: 'currency',
    }).format(value);
  };

  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, total);

  return (
    <Container className={styles.contractsLayout}>
      <Sidebar />
      <Container className={styles.mainContent}>
        <Container className={styles.header}>
          <Heading className={styles.pageTitle} level="1">
            {appText.contracts.title}
          </Heading>
          <Button className={styles.addButton} onClick={() => setShowModal(true)} type="button">
            {appText.contracts.addNew}
          </Button>
        </Container>

        <Container className={styles.filtersSection}>
          <Form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <InputField
              name="search"
              onChange={handleSearch}
              pattern={undefined}
              placeholder={appText.contracts.searchPlaceholder}
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
              <option value="all">{appText.contracts.allStatus}</option>
              <option value="Active">{appText.contracts.status.active}</option>
              <option value="Inactive">{appText.contracts.status.inactive}</option>
            </select>
            <select
              className={styles.filterSelect}
              onChange={(e) => {
                setBusinessModelFilter(e.target.value);
                setCurrentPage(1);
              }}
              value={businessModelFilter}
            >
              <option value="all">{appText.contracts.allBusinessModels}</option>
              {businessModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <Paragraph className={styles.resultsCount}>
              {appText.contracts.showingResults.replace('{count}', total.toString())}
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
                    <th>{appText.contracts.table.contractReference}</th>
                    <th>{appText.contracts.table.company}</th>
                    <th>{appText.contracts.table.businessModel}</th>
                    <th>{appText.contracts.table.value}</th>
                    <th>{appText.contracts.table.status}</th>
                    <th>{appText.contracts.table.startDate}</th>
                    <th>{appText.contracts.table.endDate}</th>
                    <th>{appText.contracts.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr key={contract.id}>
                      <td>{contract.contractReference}</td>
                      <td>{contract.company.title}</td>
                      <td>
                        <span className={styles.businessModelTag}>
                          {contract.businessModelLookup.name}
                        </span>
                      </td>
                      <td>{formatCurrency(contract.contractValue)}</td>
                      <td>
                        <span
                          className={`${styles.statusTag} ${
                            contract.isActive ? styles.active : styles.inactive
                          }`}
                        >
                          {contract.isActive ? appText.contracts.status.active : appText.contracts.status.inactive}
                        </span>
                      </td>
                      <td>{formatDate(contract.contractStartDate)}</td>
                      <td>{formatDate(contract.contractEndDate)}</td>
                      <td>
                        <Container className={styles.actions}>
                          <Button className={styles.actionButtonEdit} onClick={() => undefined} type="button">
                            {appText.contracts.actions.edit}
                          </Button>
                          <Button className={styles.actionButtonDelete} onClick={() => undefined} type="button">
                            {appText.contracts.actions.delete}
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
                {appText.contracts.pagination.showing
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
                  {appText.contracts.pagination.previous}
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
                  {appText.contracts.pagination.next}
                </Button>
              </Container>
            </Container>
          </>
        )}
      </Container>
      {showModal && <AddContractModal onClose={() => { setShowModal(false); fetchContracts(); }} />}
    </Container>
  );
};

export default Contracts;

