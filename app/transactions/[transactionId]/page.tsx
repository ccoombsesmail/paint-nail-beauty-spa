"use client"

import { QueryClient, QueryClientProvider } from 'react-query';
import TransactionEditPage from './components/transaction-edit';

const queryClient = new QueryClient();


export default function CustomerPage({ params } : { params: { customerId: string }}) {

  return (
    <>
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <QueryClientProvider client={queryClient}>

          <TransactionEditPage />
        </QueryClientProvider>
      </main>
    </>

  );
}
