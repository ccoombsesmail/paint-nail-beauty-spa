import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Image from 'next/image';
import goldBadge from '../../gold-badge.png'
import silverBadge from '../../silver-badge.png'
import bronzeBadge from '../../bronze-badge.png'
import sadFace from '../../sad-face.png'
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { NextRouter } from 'next/router';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
}

const membershipColTemplate = (user: { membershipLevel: string }) => {
  let badge = null
  switch (user.membershipLevel) {
    case "Gold":
      badge = goldBadge
      break
    case "Silver":
      badge = silverBadge
      break
    case "Bronze":
      badge = bronzeBadge
      break
    default:
      badge = sadFace
  }
  return (
    <div className="flex items-center justify-between">
      {user.membershipLevel}
      { badge && <Image src={badge} width={32} height={32} alt={user.membershipLevel} /> }
    </div>
  )
}

const editTemplate = (user: { membershipLevel: string, id: string }, router: AppRouterInstance) => {
  const onClick = () => {
    router.push(`users/${user.id}`)
  }
  return (
    <button type='button' onClick={onClick} className="flex items-center justify-between hover:opacity-50 cursor-pointer">
      <i className="pi pi-user-edit text-xl"></i>
    </button>
  )
}
export default function UsersTable({ users }: { users: User[] }) {
  const router = useRouter()

  return (
    <div className="card">
      <DataTable paginator rows={10} rowsPerPageOptions={[10, 25, 50]} value={users} tableStyle={{ minWidth: '50rem' }}>
        <Column field="" header="" body={(user) => editTemplate(user, router)} />
        <Column field="firstName" header="First" style={{ width: '16%' }}></Column>
        <Column field="lastName" header="Last" style={{ width: '16%' }}></Column>
        <Column field="email" header="Email"  style={{ width: '16%' }}></Column>
        <Column field="phoneNumber" header="Phone Number"  style={{width: '16%' }}></Column>
        <Column field="cashbackBalance" header="Cashback Balance"  style={{ width: '16%'}}></Column>
        <Column field="membershipLevel" header="Membership"  style={{ width: '16%' }} body={membershipColTemplate}></Column>
      </DataTable>
    </div>
  );
}
