"use client"

import { Card, Divider } from '@tremor/react';
import Search from './search';
import Table from './table';
import { useState } from 'react';
import TransactionForm from '../forms/transaction-form';
import { useQuery } from 'react-query';
import { toast } from 'sonner';
import { fetchTransactions } from '../../client-api/transactions/transaction-queries';



export default function TransactionsTable() {

  const [search, setSearch] = useState("")

  const { data: transactions, refetch } = useQuery(['transactions', search], () => fetchTransactions(search), {
    // onSuccess: (data) => console.log('Data fetched:', data),
    onError: (error) => toast.error(`Error Searching For Transactions: ${error}`,),
  });


  return (
    <div>

        <TransactionForm refetchTransactions={refetch} />
        <Divider />
        <Search setSearch={setSearch} />
        <Card className="mt-6">
          <Table transactions={transactions} />
        </Card>

    </div>

  );
}
