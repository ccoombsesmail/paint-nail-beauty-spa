import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';


export default function TransactionsTable({ transactions }: { transactions: any[] }) {
  return (
    <div className="card">
      <DataTable paginator rows={5} rowsPerPageOptions={[1, 5, 10, 25, 50]} value={transactions} tableStyle={{ minWidth: '50rem' }}>
        <Column field="firstName" header="First" style={{ width: '10%' }}></Column>
        <Column field="lastName" header="Last" style={{ width: '10%' }}></Column>
        <Column field="email" header="Email"  style={{ width: '10%' }}></Column>
        <Column field="phoneNumber" header="Number"  style={{ width: '10%' }}></Column>
        <Column field="serviceType" header="Service Type"  style={{ width: '10%' }}></Column>
        <Column field="serviceDuration" header="Duration"  style={{ width: '10%' }}></Column>
        <Column field="amount" header="Amount"  style={{ width: '10%' }}></Column>
        <Column field="paymentMethod" header="PaymentMethod"  style={{ width: '10%' }}></Column>
        <Column field="technician" header="Technician"  style={{ width: '10%' }}></Column>
      </DataTable>
    </div>
  );
}
