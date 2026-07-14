/**
 * Apollo Client adapter for search select fields.
 *
 * This is the only entry point that imports @apollo/client — the main
 * '@nestledjs/forms-core' entry stays Apollo-free. Import from here only
 * when @apollo/client (v3 or v4) is installed.
 */
export { ApolloSearchProvider, useApolloSearchQuery } from './lib/apollo-search-provider'
