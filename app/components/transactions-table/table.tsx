import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';


const tipTemplate = (rowData: any) => {
  return (
    <span>${rowData.tip}</span>
  )
}

const totalPriceTemplate = (rowData: any) => {
  return (
    <span>${rowData.totalServicePrice}</span>
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


export default function TransactionsTable({ transactions }: { transactions: any[] }) {
  return (
    <div className="card">
      <DataTable
        showGridlines
        resizableColumns
        columnResizeMode="expand"
        paginator
        rows={5}
        rowsPerPageOptions={[1, 5, 10, 25, 50]}
        value={transactions}
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column body={dateTemplate} field="userEnteredDate" header="Date" style={{ width: '10%' }}></Column>
        <Column field="customerName" header="Customer Name" style={{ width: '10%' }}></Column>
        <Column field="customerEmail" header="Email"  style={{ width: '10%' }}></Column>
        <Column field="customerPhoneNumber" header="Number"  style={{ width: '10%' }}></Column>
        <Column field="serviceType" header="Service Type"  style={{ width: '10%' }}></Column>
        <Column field="serviceDuration" header="Duration (hrs)"  style={{ width: '10%' }}></Column>
        <Column body={totalPriceTemplate} field="totalServicePrice" header="Total Service Price"  style={{ width: '10%' }}></Column>
        <Column body={amountCollectedTemplate} field="actualPaymentCollected" header="Payment Collected"  style={{ width: '10%' }}></Column>
        <Column body={tipTemplate} field="tip" header="Tip"  ></Column>

        <Column field="paymentMethod" header="PaymentMethod"  style={{ width: '10%' }}></Column>
        <Column field="technicianName" header="Technician"  style={{ width: '10%' }}></Column>
      </DataTable>
    </div>
  );
}
