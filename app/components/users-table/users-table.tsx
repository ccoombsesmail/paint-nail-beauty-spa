"use client"

import { Card, Divider } from '@tremor/react';
import Search from './search';
import Table from './table';
import { useCallback, useEffect, useState } from 'react';
import UserForm from '../forms/user-form';
import { LoadingSpinner } from '../loading-screen';


export default function UsersTable() {

  const [isLoading, setIsLoading] = useState(true)


  const [search, setSearch] = useState("")
  const [users, setUsers] = useState([])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`/api/users?search=${search}`);
      const data = await response.json();
      console.log(data);
      setUsers(data?.users || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }, [search])

  useEffect(() => {
      fetchUsers()
  }, [fetchUsers, search]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)

  }, []);

  if (isLoading) return  <LoadingSpinner />



  return (
    <div>
      <UserForm refetchUsers={fetchUsers}/>
      <Divider />
      <Search setSearch={setSearch} />
      <Card className="mt-6">
        <Table users={users}  />
      </Card>
    </div>

  );
}
