
import Layout from '@/components/Layout';
import PageHeader from '@/components/reservation/PageHeader';
import ReservationForm from '@/components/reservation/ReservationForm';

const Reservation = () => {
  return (
    <Layout>
      <PageHeader />
      
      <div className="py-16 container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
          <ReservationForm />
        </div>
      </div>
    </Layout>
  );
};

export default Reservation;
