import { useState } from 'react';
import { AdminPage } from './admin/AdminPage';
import { useRoute } from './lib/router';
import { NoticePage } from './store/NoticePage';
import { MyOrdersPage, OrderTrackingPage } from './store/OrderPages';
import { StorePage } from './store/StorePage';

const AGE_CONFIRMED_KEY = 'shop.age-confirmed';

export default function App() {
  const route = useRoute();
  // The age check (with the store notice) is shown once per browser session.
  const [ageConfirmed, setAgeConfirmed] = useState(() => sessionStorage.getItem(AGE_CONFIRMED_KEY) === '1');

  const confirmAge = () => {
    sessionStorage.setItem(AGE_CONFIRMED_KEY, '1');
    setAgeConfirmed(true);
  };

  if (route.startsWith('/admin')) return <AdminPage />;

  // Pages open on top of the store so its scroll position is kept when you come back.
  return (
    <>
      <StorePage />
      {route === '/orders' && <MyOrdersPage />}
      {route.startsWith('/order/') && <OrderTrackingPage key={route} orderId={route.slice('/order/'.length)} />}
      {!ageConfirmed && <NoticePage onConfirm={confirmAge} />}
    </>
  );
}
