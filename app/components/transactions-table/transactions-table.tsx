"use client"

import { Card, Divider } from '@tremor/react';
import Search from './search';
import Table from './table';
import React, { useState } from 'react';
import TransactionForm from '../forms/transaction-form';
import { useQuery } from 'react-query';
import { toast } from 'sonner';
import { fetchTransactions } from '../../client-api/transactions/transaction-queries';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';



export default function TransactionsTable() {
  const router = useRouter()

  const [search, setSearch] = useState("")

  const { data: transactions, isLoading, refetch } = useQuery(['transactions', search], () => fetchTransactions(search), {
    // onSuccess: (data) => console.log('Data fetched:', data),
    onError: (error) => toast.error(`Error Searching For Transactions: ${error}`,),
  });


  return (
    <div>
        <div className='flex justify-between w-full'>


          <TransactionForm refetchTransactions={refetch} />
          <Button
            style={{ backgroundColor: 'var(--pink-400)' }}
            label='Cashback Details' icon='pi pi-plus'
            onClick={() => router.push('/customers/transactions')}
          />
        </div>
        <Divider />
        <Search setSearch={setSearch} />
        <Card className="mt-6">
          <Table transactions={transactions} isLoading={isLoading}/>
        </Card>

    </div>

  );
}
