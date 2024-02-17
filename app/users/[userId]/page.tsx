import UserProfilePage from '../../components/user-page';


export default function UserPage({ params } : { params: { userId: string }}) {

  console.log(params.userId)
  return (
    <>
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <UserProfilePage />

      </main>
    </>

  );
}
