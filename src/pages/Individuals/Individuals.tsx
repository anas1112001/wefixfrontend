import React, { FC, useEffect, useState } from 'react';
import Container from 'components/Atoms/Container/Container';
import Form from 'components/Atoms/Form/Form';
import Heading from 'components/Atoms/Heading/Heading';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import InputField from 'components/Atoms/InputField/InputField';
import Button from 'components/Atoms/Button/Button';
import Sidebar from 'components/Molecules/Sidebar/Sidebar';
import { appText } from 'data/appText';
import styles from './Individuals.module.css';
import { GRAPHQL_ENDPOINT } from 'utils/apiConfig';

interface Individual {
  email: string;
  firstName: string;
  fullName: string;
  id: string;
  individualId: string;
  isActive: string;
  lastName: string;
  phoneNumber: string | null;
}

interface IndividualsData {
  individuals: Individual[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

const Individuals: FC = () => {
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchIndividuals = async () => {
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

      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: `
            query GetIndividuals($filter: IndividualFilterInput) {
              getIndividuals(filter: $filter) {
                individuals {
                  id
                  individualId
                  firstName
                  lastName
                  fullName
                  email
                  phoneNumber
                  isActive
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

      const data: IndividualsData = payload?.data?.getIndividuals;

      setIndividuals(data.individuals || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching individuals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndividuals();
  }, [currentPage, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchIndividuals();
  };

  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, total);

  return (
    <Container className={styles.individualsLayout}>
      <Sidebar />
      <Container className={styles.mainContent}>
        <Container className={styles.header}>
          <Heading className={styles.pageTitle} level="1">
            {appText.individuals.title}
          </Heading>
          <Button className={styles.addButton} onClick={() => undefined} type="button">
            {appText.individuals.addNew}
          </Button>
        </Container>

        <Container className={styles.filtersSection}>
          <Form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <InputField
              name="search"
              onChange={handleSearch}
              pattern={undefined}
              placeholder={appText.individuals.searchPlaceholder}
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
              <option value="all">{appText.individuals.allStatus}</option>
              <option value="Active">{appText.individuals.status.active}</option>
              <option value="Inactive">{appText.individuals.status.inactive}</option>
            </select>
            <Paragraph className={styles.resultsCount}>
              {appText.individuals.showingResults.replace('{count}', total.toString())}
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
                    <th>{appText.individuals.table.individualId}</th>
                    <th>{appText.individuals.table.name}</th>
                    <th>{appText.individuals.table.email}</th>
                    <th>{appText.individuals.table.phoneNumber}</th>
                    <th>{appText.individuals.table.isActive}</th>
                    <th>{appText.individuals.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {individuals.map((individual) => (
                    <tr key={individual.id}>
                      <td>{individual.individualId}</td>
                      <td>{individual.fullName}</td>
                      <td>{individual.email}</td>
                      <td>{individual.phoneNumber || '-'}</td>
                      <td>
                        <span
                          className={`${styles.statusTag} ${
                            individual.isActive === 'Active' ? styles.active : styles.inactive
                          }`}
                        >
                          {individual.isActive}
                        </span>
                      </td>
                      <td>
                        <Container className={styles.actions}>
                          <Button className={styles.actionButtonEdit} onClick={() => undefined} type="button">
                            {appText.individuals.actions.edit}
                          </Button>
                          <Button className={styles.actionButtonDelete} onClick={() => undefined} type="button">
                            {appText.individuals.actions.delete}
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
                {appText.individuals.pagination.showing
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
                  {appText.individuals.pagination.previous}
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
                  {appText.individuals.pagination.next}
                </Button>
              </Container>
            </Container>
          </>
        )}
      </Container>
    </Container>
  );
};

export default Individuals;

