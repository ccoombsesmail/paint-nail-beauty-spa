import { DataTable, DataTableExpandedRows } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { useUser } from '@clerk/nextjs';
import { formatPhoneNumber, phoneNumberTemplate } from '../../utils/format-phone-number';
import { FilterMatchMode } from 'primereact/api';
import { useQuery } from 'react-query';
import { getEnums } from '../../client-api/enums/enum-queries';


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

const discountedServicePrice = (rowData: any) => {
  return (
    <span>{rowData.discountedServicePrice  ? `$${rowData.discountedServicePrice}` : null}</span>
  )
}
const amountCollectedTemplate = (rowData: any) => {
  return (
    <span>${rowData.actualPaymentCollected}</span>
  )
}

const editTemplate = (visit: { id: string }, router: AppRouterInstance) => {
  const onClick = () => {
    router.push(`visits/${visit.id}`)
  }
  return (
    <button type='button' onClick={onClick} className="flex items-center justify-between hover:opacity-50 cursor-pointer">
      <i className="pi pi-file-edit text-xl"></i>
    </button>
  )
}

const customerNumberTemplate = (rowData: any) => {
  return (
    <span>{formatPhoneNumber(rowData.customerPhoneNumber)}</span>
  )
}
const dateTemplate = (rowData: any) => {
  const date = new Date(rowData.visitDate)
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

const allowExpansion = (rowData: any) => {
  return rowData.subAccount !== null;
};
const rowExpansionTemplate = (data: any, router: any) => {

  return (
    <div className="p-3 flex justify-start items-start flex-col w-full" >
      {/*<h1 className='mb-3 text-xl'>Sub Account For {data.firstName} {data.lastName}</h1>*/}
      <DataTable
        showGridlines
        className='w-full'
        value={data.transactions}
        columnResizeMode="expand"
      >
        <Column  field="technicianName" header="Technician"  style={{ minWidth: '300px' }}></Column>

        <Column field="serviceType" header="Service Type"  style={{ width: '10%' }}></Column>
        <Column field="serviceDuration" header="Duration (hrs)"  style={{ width: '10%' }}></Column>
        <Column body={totalPriceTemplate} field="totalServicePrice" header="Total Service Price"  style={{ width: '10%' }}></Column>
        <Column body={discountedServicePrice} field="discountedServicePrice" header="Discounted Price"  style={{ width: '10%' }}></Column>

        <Column body={amountCollectedTemplate} field="actualPaymentCollected" header="Payment Collected"  style={{ width: '10%' }}></Column>
        <Column body={tipTemplate} field="tip" header="Tip"  ></Column>

        <Column field="paymentMethod" header="PaymentMethod"  style={{ width: '10%' }}></Column>
        <Column field="notes" header="Notes" ></Column>
        <Column field="franchiseCode" header="" hidden ></Column>

      </DataTable>
    </div>
  );
};


export default function TransactionsTable({ visits, isLoading }: { visits: any[], isLoading: boolean }) {
  const router = useRouter()
  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows | any[]>([]);

  const { user, isLoaded } = useUser()
  const dt = useRef(null);

  const { data: enums } = useQuery('enums', getEnums, {
    initialData: {
      orgNameMap: {}
    }
  });

  const exportCSV = useCallback( (selectionOnly: boolean) => {
    if (dt.current) { // @ts-ignore
      dt.current.exportCSV({ selectionOnly });
    }

  }, [dt]);
  const [filters, setFilters] = useState({
    technicianName: { value: "asd", matchMode: FilterMatchMode.CONTAINS },
  });

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(visits);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      });

      saveAsExcelFile(excelBuffer, 'transactions');
    });
  };

  // @ts-ignore
  const saveAsExcelFile = (buffer, fileName) => {
    // @ts-ignore
    import('file-saver').then((module) => {
      if (module && module.default) {
        let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        let EXCEL_EXTENSION = '.xlsx';
        const data = new Blob([buffer], {
          type: EXCEL_TYPE
        });

        module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
      }
    });
  };

  const header = (
    <div className="flex items-center justify-end gap-2 w-full">
      <Button type="button" icon="pi pi-file" rounded onClick={() => exportCSV(false)} data-pr-tooltip="CSV" />
      <Button type="button" icon="pi pi-file-excel" severity="success" rounded onClick={exportExcel} data-pr-tooltip="XLS" />
    </div>
  );

  const orgNameBody = (rowData: any) => {
    return (
      <span>{enums.orgNameMap[rowData.createdAtOrganizationId]}</span>
    )
  }

  if (!isLoaded) return null

  const franchiseCode = user?.publicMetadata.franchise_code

  return (
    <div className="card">
      <DataTable
        // filters={filters} filterDisplay="row"
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowExpansionTemplate={(data) => rowExpansionTemplate(data, router)}
        ref={dt}
        header={franchiseCode === 'admin' ? header : null}
        showGridlines
        // resizableColumns
        sortField="visitDate"
        sortOrder={-1}
        // columnResizeMode="expand"
        paginator
        rows={5}
        rowsPerPageOptions={[1, 5, 10, 25, 50]}
        value={visits}
        // tableStyle={{ minWidth: '50rem' }}
        loading={isLoading}
      >
        <Column field="" header="" body={(visit) => editTemplate(visit, router)} />
        <Column expander={allowExpansion} style={{ width: '5rem' }} />
        <Column field="visitDate" header="Visit Date" body={dateTemplate}  />

        <Column field="customer.firstName" header="Customer Name" ></Column>
        <Column field="customerEmail" header="Email"  style={{ width: '10%' }}></Column>
        <Column field="customerDialCode" header="" hidden ></Column>
        <Column body={customerNumberTemplate} field="customerPhoneNumber" header="Number"  style={{ width: '20%' }}></Column>
        <Column body={orgNameBody} field="createdAtOrganizationId" header="Visit Location" ></Column>


      </DataTable>
    </div>
  );
}
