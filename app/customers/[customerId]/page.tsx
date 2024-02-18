import CustomerProfilePage from '../../components/customer-page';


export default function CustomerPage({ params } : { params: { customerId: string }}) {

  console.log(params.customerId)
  return (
    <>
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <CustomerProfilePage />

      </main>
    </>

  );
}
