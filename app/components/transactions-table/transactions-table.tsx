"use client"

import { Card, Divider } from '@tremor/react';
import Search from './search';
import Table from './table';
import { useState } from 'react';
import TransactionForm from '../forms/transaction-form';
import { QueryClient, QueryClientProvider } from 'react-query';


const queryClient = new QueryClient();

export default function TransactionsTable() {

  const [search, setSearch] = useState("")
  const [transactions, setTransactions] = useState([])

  // useEffect(() => {
  //     fetch(`/api/transactions?search=${search}`)
  //       .then((response) => response.json())
  //       .then((data) => {
  //         console.log(data)
  //         setUsers(data?.users || []);
  //       })
  //       .catch((error) => {
  //         console.error("Error:", error);
  //       });
  // }, [search]);


  return (
    <div>
      <QueryClientProvider client={queryClient} >

        <TransactionForm />
        <Divider />
        <Search setSearch={setSearch} />
        <Card className="mt-6">
          <Table transactions={transactions} />
        </Card>
      </QueryClientProvider>

    </div>

  );
}
