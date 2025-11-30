import React, { FC, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Container from 'components/Atoms/Container/Container';
import Form from 'components/Atoms/Form/Form';
import Heading from 'components/Atoms/Heading/Heading';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import InputField from 'components/Atoms/InputField/InputField';
import Button from 'components/Atoms/Button/Button';
import Sidebar from 'components/Molecules/Sidebar/Sidebar';
import AppHeader from 'components/Organisms/AppHeader/AppHeader';
import { GRAPHQL_ENDPOINT } from 'utils/apiConfig';
import styles from './Tickets.module.css';
import CreateTicketModal from './CreateTicketModal';

interface Lookup {
  code?: string | null;
  id: string;
  name: string;
  nameArabic: string | null;
}

interface Company {
  id: string;
  title: string;
}

interface Contract {
  contractTitle: string;
  id: string;
}

interface Branch {
  branchTitle: string;
  id: string;
}

interface Zone {
  id: string;
  zoneTitle: string;
}

interface Ticket {
  assignToTeamLeaderLookup: Lookup | null;
  assignToTechnicianLookup: Lookup | null;
  branch: Branch;
  company: Company;
  contract: Contract;
  havingFemaleEngineer: boolean;
  id: string;
  locationDescription: string;
  locationMap: string;
  mainServiceLookup: Lookup | null;
  serviceDescription: string;
  ticketCategoryLookup: Lookup | null;
  ticketCodeLookup: Lookup | null;
  ticketDate: string;
  ticketDescription: string;
  ticketStatusLookup: Lookup | null;
  ticketTime: string;
  ticketTypeLookup: Lookup | null;
  zone: Zone;
}

interface TicketsData {
  limit: number;
  page: number;
  tickets: Ticket[];
  total: number;
  totalPages: number;
}

const Tickets: FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortFilter, setSortFilter] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const limit = 10;

  const fetchTickets = async () => {
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
        filter.ticketStatusId = statusFilter;
      }

      if (typeFilter !== 'all') {
        filter.ticketTypeId = typeFilter;
      }

      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: `
            query GetTickets($filter: TicketFilterInput) {
              getTickets(filter: $filter) {
                tickets {
                  id
                  ticketCodeLookup {
                    id
                    name
                    code
                  }
                  company {
                    id
                    title
                  }
                  contract {
                    id
                    contractTitle
                  }
                  branch {
                    id
                    branchTitle
                  }
                  zone {
                    id
                    zoneTitle
                  }
                  locationMap
                  locationDescription
                  ticketTypeLookup {
                    id
                    name
                  }
                  ticketCategoryLookup {
                    id
                    name
                  }
                  ticketStatusLookup {
                    id
                    name
                  }
                  ticketDate
                  ticketTime
                  assignToTeamLeaderLookup {
                    id
                    name
                  }
                  assignToTechnicianLookup {
                    id
                    name
                  }
                  ticketDescription
                  havingFemaleEngineer
                  mainServiceLookup {
                    id
                    name
                  }
                  serviceDescription
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

      const data: TicketsData = payload?.data?.getTickets;

      setTickets(data.tickets || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch tickets';

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
    fetchTickets();
  }, [currentPage, statusFilter, typeFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTickets();
  };

  const handleDeleteTicket = async (ticket: Ticket) => {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'Delete Ticket',
      text: `Are you sure you want to delete this ticket?`,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          query: `
            mutation DeleteTicket($id: String!) {
              deleteTicket(id: $id)
            }
          `,
          variables: { id: ticket.id },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const payload = await response.json();

      if (payload.errors?.length || payload.data?.deleteTicket !== true) {
        const errorMessage = payload.errors?.[0]?.message || 'Failed to delete ticket';

        throw new Error(errorMessage);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Ticket deleted successfully',
      });

      if (tickets.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);

        return;
      }

      fetchTickets();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete ticket';
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const getStatusColor = (status: string | null) => {
    if (!status) {
      return styles.statusPending;
    }

    const statusLower = status.toLowerCase();

    if (statusLower.includes('pending')) {
      return styles.statusPending;
    }

    if (statusLower.includes('progress')) {
      return styles.statusInProgress;
    }

    if (statusLower.includes('complete')) {
      return styles.statusCompleted;
    }

    if (statusLower.includes('cancel')) {
      return styles.statusCancelled;
    }

    return styles.statusPending;
  };

  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, total);

  return (
    <Container className={styles.ticketsLayout}>
      <AppHeader />
      <Container className={styles.contentWrapper}>
        <Sidebar />
        <Container className={styles.mainContent}>
          <Container className={styles.header}>
            <Heading className={styles.pageTitle} level="1">
              Tickets
            </Heading>
            <Button className={styles.addButton} onClick={() => setShowCreateModal(true)} type="button">
              <span className={styles.plusIcon}>+</span> Create New Ticket
            </Button>
          </Container>

          <Container className={styles.filtersSection}>
            <Form className={styles.searchForm} onSubmit={handleSearchSubmit}>
              <InputField
                name="search"
                onChange={handleSearch}
                pattern={undefined}
                placeholder="Search tickets..."
                title=""
                type="text"
                value={search}
              />
            </Form>
            <Container className={styles.filters}>
              <select
                className={styles.filterSelect}
                onChange={(e) => {
                  setSortFilter(e.target.value);
                  setCurrentPage(1);
                }}
                value={sortFilter}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <select
                className={styles.filterSelect}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                value={statusFilter}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                className={styles.filterSelect}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                value={typeFilter}
              >
                <option value="all">All Types</option>
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
                <option value="emergency">Emergency</option>
              </select>
              <Paragraph className={styles.resultsCount}>
                {total} tickets found
              </Paragraph>
            </Container>
          </Container>

          {loading ? (
            <Paragraph>Loading...</Paragraph>
          ) : (
            <>
              <Container className={styles.ticketsGrid}>
                {tickets.map((ticket) => (
                  <Container key={ticket.id} className={styles.ticketCard}>
                    <Container className={styles.ticketHeader}>
                      <Heading className={styles.ticketId} level="3">
                        {ticket.ticketCodeLookup?.code || `TKT${ticket.id.slice(0, 8).toUpperCase()}`}
                      </Heading>
                      <span className={`${styles.statusTag} ${getStatusColor(ticket.ticketStatusLookup?.name || null)}`}>
                        {ticket.ticketStatusLookup?.name || 'PENDING'}
                      </span>
                    </Container>
                    <Container className={styles.ticketDetails}>
                      <Container className={styles.detailColumn}>
                        <Paragraph className={styles.detailItem}>
                          <strong>Company:</strong> {ticket.company.title}
                        </Paragraph>
                        <Paragraph className={styles.detailItem}>
                          <strong>Technician:</strong> {ticket.assignToTechnicianLookup?.name || 'N/A'}
                        </Paragraph>
                      </Container>
                      <Container className={styles.detailColumn}>
                        <Paragraph className={styles.detailItem}>
                          <strong>Type:</strong> {ticket.ticketTypeLookup?.name || 'N/A'}
                        </Paragraph>
                        <Paragraph className={styles.detailItem}>
                          <strong>Branch:</strong> {ticket.branch.branchTitle}
                        </Paragraph>
                        <Paragraph className={styles.detailItem}>
                          <strong>Zone:</strong> {ticket.zone.zoneTitle}
                        </Paragraph>
                        <Paragraph className={styles.detailItem}>
                          <strong>Date:</strong> {formatDate(ticket.ticketDate)}
                        </Paragraph>
                      </Container>
                    </Container>
                    <Container className={styles.ticketActions}>
                      <Button className={styles.actionButtonTimeline} onClick={() => {}} type="button">
                        Time Line
                      </Button>
                      <Button className={styles.actionButtonUpdate} onClick={() => {}} type="button">
                        Update By Technician
                      </Button>
                      <Button className={styles.actionButtonAdditional} onClick={() => {}} type="button">
                        Additional Work
                      </Button>
                      <Button className={styles.actionButtonEdit} onClick={() => {}} type="button">
                        Edit
                      </Button>
                      <Button className={styles.actionButtonDelete} onClick={() => handleDeleteTicket(ticket)} type="button">
                        Delete
                      </Button>
                    </Container>
                  </Container>
                ))}
              </Container>

              {tickets.length === 0 && !loading && (
                <Container className={styles.emptyState}>
                  <Paragraph>No tickets found. Create your first ticket!</Paragraph>
                </Container>
              )}

              <Container className={styles.pagination}>
                <Paragraph className={styles.paginationInfo}>
                  Showing {startIndex} to {endIndex} of {total} tickets
                </Paragraph>
                <Container className={styles.paginationControls}>
                  <Button
                    className={styles.paginationButton}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    type="button"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                    const pageNum = i + 1;

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
                    Next
                  </Button>
                </Container>
              </Container>
            </>
          )}
        </Container>
      </Container>
      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTickets();
          }}
        />
      )}
    </Container>
  );
};

export default Tickets;

