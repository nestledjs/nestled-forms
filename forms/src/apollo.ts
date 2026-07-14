/**
 * Apollo Client adapter for search select fields.
 *
 * The main '@nestledjs/forms' entry never imports @apollo/client — only this
 * subpath does (via forms-core). Import from here only when @apollo/client
 * (v3 or v4) is installed, and place <ApolloSearchProvider> inside your
 * <ApolloProvider> to enable SearchSelectApollo / SearchSelectMultiApollo fields.
 */
export { ApolloSearchProvider, useApolloSearchQuery } from '@nestledjs/forms-core/apollo'
