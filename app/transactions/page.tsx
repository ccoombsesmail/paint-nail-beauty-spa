'use client';

import TransactionsTable from '../components/transactions-table/transactions-table';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '../components/loading-screen';
import { QueryClient, QueryClientProvider } from 'react-query';


const queryClient = new QueryClient();


function TransactionsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)

  }, []);

  if (isLoading) return  <LoadingSpinner />
  return (
    <main className="p-4 md:p-10 mx-auto max-w-8xl">
      <QueryClientProvider client={queryClient} >

      <TransactionsTable />
      </QueryClientProvider>
    </main>
  );
}


export default function TransactionPageLayout() {

  return (
        <TransactionsPage />
  )
}
