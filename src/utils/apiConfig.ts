/**
 * Get the GraphQL API endpoint URL
 * Uses direct connection or proxy based on environment
 */
export const getGraphQLEndpoint = (): string => {
  // If custom API URL is set via environment variable, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // In production, use direct connection to backend
  // (API proxy requires ARR module which may not be installed)
  if (process.env.NODE_ENV === 'production') {
    // Use direct connection to backend (CORS is configured)
    return 'http://localhost:4000/graphql';
  }

  // Default to localhost for development
  return 'http://localhost:4000/graphql';
};

export const GRAPHQL_ENDPOINT = getGraphQLEndpoint();


