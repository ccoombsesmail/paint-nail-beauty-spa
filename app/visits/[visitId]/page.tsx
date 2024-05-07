"use client"

import { QueryClient, QueryClientProvider } from 'react-query';
import VisitEditPage from './components/edit-visit';

const queryClient = new QueryClient();


export default function CustomerPage({ params } : { params: { customerId: string }}) {

  return (
    <>
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <QueryClientProvider client={queryClient}>
          <VisitEditPage />
        </QueryClientProvider>
      </main>
    </>

  );
}
