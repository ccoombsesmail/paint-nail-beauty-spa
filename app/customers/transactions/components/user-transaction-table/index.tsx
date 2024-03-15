import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useQuery } from 'react-query';
import { fetchUserTransactions } from '../../../../client-api/transactions/transaction-queries';
import { toast } from 'sonner';
import { Divider } from 'primereact/divider';
import { franchiseCodeToDisplayNameMap } from '../../../../utils/franchise-code-mapping';


const tipTemplate = (rowData: any) => {
  return (
    <span>{rowData.tip  ? `$${rowData.tip}` : null}</span>
  )
}

const totalPriceTemplate = (rowData: any) => {
  return (
    <span>{rowData.totalServicePrice  ? `$${rowData.totalServicePrice}` : null}</span>
  )
}


const amountCollectedTemplate = (rowData: any) => {
  return (
    <span>${rowData.actualPaymentCollected}</span>
  )
}

const dateTemplate = (rowData: any) => {
  const date = new Date(rowData.userEnteredDate)
  const formattedDate = date.toLocaleString('en-US', {
    month: 'long', // "February"
    day: '2-digit', // "19"
    year: 'numeric', // "2024"
    hour: 'numeric', // "10"
    minute: '2-digit', // "04"
    hour12: true // AM/PM format
  });
  return (
    <span>{formattedDate}</span>
  )
}
const franchiseTemplate = (rowData: any) => {
  return (
    <span>{franchiseCodeToDisplayNameMap.get(rowData.franchiseCode)}</span>
  )
}

const discountedServicePrice = (rowData: any) => {
  return (
    <span>{rowData.discountedServicePrice  ? `$${rowData.discountedServicePrice}` : null}</span>
  )
}


const calculatedCashback = (rowData: any) => {
  return (
    <span>${(rowData.actualPaymentCollected * .01).toFixed(2)}</span>
  )
}

export default function UserTransactionsTable({ selectedUser } : { selectedUser: any | null }) {
  const { data: transactions, isLoading, refetch } = useQuery(['transactions', selectedUser?.id], () => fetchUserTransactions(selectedUser?.id), {
    // onSuccess: (data) => console.log('Data fetched:', data),
    onError: (error) => toast.error(`Error Searching For Transactions: ${error}`,),
    enabled: Boolean(selectedUser?.id)

  });

  if (!selectedUser?.id) return null
  if (isLoading) {
    return <div className='w-full flex justify-center mt-14'>
        <i className='pi pi-spinner' style={{ fontSize: '2.5rem' }} />
      </div>
  }

  return (
    <div className="card rounded-3xl border-2 shadow mt-10 flex justify-center items-center flex-col pb-[40vh]">
      {/*<Divider />*/}
    <h1 className='font-bold text-2xl mt-10'>
      Transactions For {selectedUser.firstName} {selectedUser.lastName || ''}
    </h1>
      <h2>
        email: {selectedUser.email}
      </h2>
      <h2>
        phone: {selectedUser.phoneNumber}
      </h2>

      <DataTable
        // showGridlines
        resizableColumns
        columnResizeMode="fit"
        paginator
        sortField={"userEnteredDate"}
        sortOrder={-1}
        rows={5}
        rowsPerPageOptions={[1, 5, 10, 25, 50]}
        value={transactions}
        // tableStyle={{ minWidth: '50rem' }}
        className='mt-10 max-w-[90%]'

      >
        <Column body={dateTemplate} field="userEnteredDate" header="Visit Date" style={{ width: '10%' }}></Column>
        <Column body={franchiseTemplate}  field="franchiseCode" header="Visit Location" style={{ width: '10%' }}></Column>
        <Column field="serviceType" header="Service Type"  style={{ width: '10%' }}></Column>
        {/*<Column field="serviceDuration" header="Duration (hrs)"  style={{ width: '10%' }}></Column>*/}
        <Column body={totalPriceTemplate} field="totalServicePrice" header="Total Service Price"  style={{ width: '10%' }}></Column>
        <Column body={discountedServicePrice} field="discountedServicePrice" header="Discounted Price"  style={{ width: '10%' }}></Column>

        <Column body={amountCollectedTemplate} field="actualPaymentCollected" header="Payment Collected"  style={{ width: '10%' }}></Column>
        <Column body={calculatedCashback} field="" header="Cashback" style={{ width: '10%' }}></Column>

        <Column body={tipTemplate} field="tip" header="Tip"  ></Column>

        <Column field="paymentMethod" header="PaymentMethod"  style={{ width: '10%' }}></Column>
        <Column field="technicianName" header="Technician"  style={{ width: '10%' }}></Column>
      </DataTable>
    </div>
  );
}
