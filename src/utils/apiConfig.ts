/**
 * Get the GraphQL API endpoint URL
 * Uses Netlify proxy in production to avoid CORS issues
 */
export const getGraphQLEndpoint = (): string => {
  // If custom API URL is set via environment variable, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // In production (Netlify), use the proxy endpoint
  if (process.env.NODE_ENV === 'production') {
    return '/api/graphql';
  }

  // Default to localhost for development
  return 'http://localhost:4000/graphql';
};

export const GRAPHQL_ENDPOINT = getGraphQLEndpoint();

