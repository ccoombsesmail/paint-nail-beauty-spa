"use client"

import { Card, Divider } from '@tremor/react';
import Search from './search';
import Table from './table';
import React, { useCallback, useEffect, useState } from 'react';
import CustomerForm from '../forms/customer-form';
import { LoadingSpinner } from '../loading-screen';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';

const queryClient = new QueryClient();

export default function CustomersTable() {

  const [isLoading, setIsLoading] = useState(true)


  const [search, setSearch] = useState("")
  const [customers, setCustomers] = useState([])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch(`/api/customers?search=${search}`);
      const data = await response.json();
      console.log(data);
      setCustomers(data?.customers || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }, [search])

  useEffect(() => {
      fetchCustomers()
  }, [fetchCustomers, search]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)

  }, []);

  if (isLoading) return  <LoadingSpinner />



  return (
    <QueryClientProvider client={queryClient}>
      <div>

        <CustomerForm refetchCustomers={fetchCustomers}/>
        <Divider />
        <Search setSearch={setSearch} />
        <Card className="mt-6">
          <Table customers={customers}  />
        </Card>
      </div>
      <ToastContainer hideProgressBar={true} />

    </QueryClientProvider>

  );
}
