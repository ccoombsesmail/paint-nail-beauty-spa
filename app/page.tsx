'use client'

import CustomersTable from './components/customers-table/customers-table';
import { QueryClient, QueryClientProvider } from 'react-query';
import { OrganizationProfile } from '@clerk/nextjs';

const queryClient = new QueryClient();

export default function IndexPage() {


  return (
    <main className="p-4 md:p-10 mx-auto max-w-8xl">
      <QueryClientProvider client={queryClient}>
        <CustomersTable  />
      </QueryClientProvider>

    </main>
  );
}
