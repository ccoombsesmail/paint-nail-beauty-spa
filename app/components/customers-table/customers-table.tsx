"use client"

import { Card, Divider } from '@tremor/react';
import Search from './search';
import Table from './table';
import React, { useEffect, useState } from 'react';
import CustomerForm from '../forms/customer-form';
import { LoadingSpinner } from '../loading-screen';
import { useQuery } from 'react-query';
import { ToastContainer } from 'react-toastify';
import { toast } from 'sonner';
import { fetchCustomers } from '../../client-api/cutomers/customer-queries';


export default function CustomersTable() {

  const [isLoading, setIsLoading] = useState(true)


  const [search, setSearch] = useState("")

  const { data: customers, isLoading: isCustomersLoading, refetch } = useQuery(['customers', search], () => fetchCustomers(search), {
    // onSuccess: (data) => console.log('Data fetched:', data),
    onError: (error) => toast.error(`Error Searching For Customers: ${error}`,),
  });




  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)

  }, []);

  if (isLoading) return  <LoadingSpinner />



  return (
    <>
      <div>

        <CustomerForm refetchCustomers={refetch} />
        <Divider />
        <Search setSearch={setSearch} />
        <Card className='mt-6'>
          <Table customers={customers} isCustomersLoading={isCustomersLoading} />
        </Card>
      </div>
      <ToastContainer hideProgressBar={true} />
    </>


  );
}
