"use client"

import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import CustomersTable from '../../components/customers-table/customer-transactions-search-table';
import { useEffect, useState } from 'react';
import { fetchTransactions, fetchUserTransactions } from '../../client-api/transactions/transaction-queries';
import { toast } from 'sonner';
import UserTransactionsTable from './components/user-transaction-table';
import { Divider } from '@tremor/react';

const queryClient = new QueryClient();


export default function CustomerPage({ params } : { params: { customerId: string }}) {

  const [selectedUser, setSelectedUser] = useState<any | null>(null)


  return (
    <>
      <main className="p-4 md:p-10 mx-auto max-w-8xl">
        <QueryClientProvider client={queryClient}>

          <CustomersTable setSelectedUser={setSelectedUser}/>

          <UserTransactionsTable selectedUser={selectedUser} />

        </QueryClientProvider>
      </main>
    </>

  );
}
