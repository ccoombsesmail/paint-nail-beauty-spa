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

interface Customer {
  id: string;
  name: string;
  customername: string;
  email: string;
}

const membershipColTemplate = (customer: { membershipLevel: string }) => {
  let badge = null
  switch (customer.membershipLevel) {
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
      {customer.membershipLevel}
      { badge && <Image src={badge} width={32} height={32} alt={customer.membershipLevel} /> }
    </div>
  )
}

const editTemplate = (customer: { membershipLevel: string, id: string }, router: AppRouterInstance) => {
  const onClick = () => {
    router.push(`customers/${customer.id}`)
  }
  return (
    <button type='button' onClick={onClick} className="flex items-center justify-between hover:opacity-50 cursor-pointer">
      <i className="pi pi-user-edit text-xl"></i>
    </button>
  )
}

const cashbackBalanceTemplate = (rowData: any) => {
  return (
    <span>${rowData.cashbackBalance}</span>
  )
}
export default function CustomersTable({ customers }: { customers: Customer[] }) {
  const router = useRouter()

  return (
    <div className="card">
      <DataTable resizableColumns  columnResizeMode="expand" paginator rows={10} rowsPerPageOptions={[10, 25, 50]} value={customers} tableStyle={{ minWidth: '50rem' }}>
        <Column field="" header="" body={(customer) => editTemplate(customer, router)} />
        <Column field="firstName" header="First" style={{ width: '16%' }}></Column>
        <Column field="lastName" header="Last" style={{ width: '16%' }}></Column>
        <Column field="email" header="Email"  style={{ width: '16%' }}></Column>
        <Column field="phoneNumber" header="Phone Number"  style={{width: '16%' }}></Column>
        <Column body={cashbackBalanceTemplate} field="cashbackBalance" header="Cashback Balance"  style={{ width: '16%'}}></Column>
        <Column field="membershipLevel" header="Membership"  style={{ width: '16%' }} body={membershipColTemplate}></Column>
      </DataTable>
    </div>
  );
}
