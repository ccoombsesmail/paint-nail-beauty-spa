import { DataTable, DataTableExpandedRows } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Image from 'next/image';
import goldBadge from '../../gold-badge.png'
import silverBadge from '../../silver-badge.png'
import bronzeBadge from '../../bronze-badge.png'
import sadFace from '../../sad-face.png'
import hourglass from '../../hourglass.png'

import nail from '../../nail.png'
import facial from '../../facial.png'
import bodySpa from '../../body-spa.png'
import eyelash from '../../eyelash.png'

import { useCallback, useState } from 'react';
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
  console.log(customer.membershipLevel)
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
    case "Non Member":
      badge = sadFace
      break
    default:
      badge = hourglass
  }
  return (
    <div className="flex items-center justify-between">
      {customer.membershipLevel}
      { badge && <Image src={badge} width={32} height={32} alt={customer.membershipLevel} /> }
    </div>
  )
}


const serviceTypeColTemplate = (customer: { serviceCategorySelection: string, membershipLevel: string }) => {
  let badge = null
  switch (customer.serviceCategorySelection) {
    case "Nail":
      badge = nail
      break
    case "Facial":
      badge = facial
      break
    case "BodySpa":
      badge = bodySpa
      break
    case "Eyelash":
      badge = eyelash
      break
    default:
      badge = null
  }
  let serviceCategory = ''

  switch (customer.membershipLevel) {
    case "Gold":
      serviceCategory = 'All'
      break
    case "Silver":
      serviceCategory = "All"
      break
    case "Bronze":
      serviceCategory = customer.serviceCategorySelection
      break
    case "Bronze (Non Active)":
      serviceCategory = customer.serviceCategorySelection
      break
    default:
      serviceCategory = ''
  }
  return (
    <div className="flex items-center justify-between">
      <span className=''>
        {serviceCategory}
      </span>
      { badge && <Image src={badge} width={32} height={32} alt={customer.serviceCategorySelection} /> }
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

const dateTemplate = (rowData: any) => {
  const date = new Date(rowData.createdAt)
  const formattedDate = date.toLocaleString('en-US', {
    month: 'long', // "February"
    day: '2-digit', // "19"
    year: 'numeric', // "2024"
  });
  return (
    <span>{formattedDate}</span>
  )
}
const allowExpansion = (rowData: any) => {
  return rowData.subAccount !== null;
};

const rowExpansionTemplate = (data: any) => {

  return (
    <div className="p-3 flex justify-center items-center flex-col w-full" >
      <h1 className='mb-3 text-xl'>Sub Account For {data.firstName}</h1>
      <DataTable showGridlines className='w-4/6 ' value={[data.subAccount]}>
        <Column field="firstName" header="First" ></Column>
        <Column field="lastName" header="Last" ></Column>
        <Column field="email" header="Email"  ></Column>
        <Column field="phoneNumber" header="Phone Number" ></Column>
        <Column body={cashbackBalanceTemplate} field="cashbackBalance" header="Cashback Balance" ></Column>

      </DataTable>
    </div>
  );
};

export default function CustomersTable({ customers, isCustomersLoading }: { customers: Customer[], isCustomersLoading: boolean }) {
  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows | any[]>([]);

  const router = useRouter()

  return (
    <div className="card">
      <DataTable
        showGridlines
        stripedRows
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowExpansionTemplate={rowExpansionTemplate}
        sortField="createdAt"
        sortOrder={-1}
        resizableColumns
        columnResizeMode="fit"
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        value={customers}
        loading={isCustomersLoading}
        tableStyle={{ minWidth: '50rem' }}>
        <Column field="" header="" body={(customer) => editTemplate(customer, router)} />
        <Column expander={allowExpansion} style={{ width: '5rem' }} />
        <Column field="createdAt" header="Joined" body={dateTemplate}  />
        <Column field="firstName" header="First" ></Column>
        <Column field="lastName" header="Last" ></Column>
        <Column field="email" header="Email"  ></Column>
        <Column field="phoneNumber" header="Phone Number" ></Column>
        <Column body={cashbackBalanceTemplate} field="cashbackBalance" header="Cashback Balance" ></Column>
        <Column className='min-w-[150px]' field="membershipLevel" header="Membership"  body={membershipColTemplate}></Column>
        <Column field="serviceCategorySelection" header="Category" body={serviceTypeColTemplate} ></Column>

      </DataTable>
    </div>
  );
}

