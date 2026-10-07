import { useState } from 'react';
import { AdminPage } from './admin/AdminPage';
import { store } from './config/store';
import { useRoute } from './lib/router';
import { LoginPage, SignUpPage } from './store/AuthPages';
import { NoticePage } from './store/NoticePage';
import { MyOrdersPage, OrderTrackingPage } from './store/OrderPages';
import { StorePage } from './store/StorePage';

const NOTICE_SEEN_KEY = 'ordering-demo.notice-seen';

export default function App() {
  const route = useRoute();
  // The store notice opens once per browser session (like the original site's opening notice).
  const [noticeOpen, setNoticeOpen] = useState(() => store.notice.showOnLoad && sessionStorage.getItem(NOTICE_SEEN_KEY) !== '1');

  const closeNotice = () => {
    sessionStorage.setItem(NOTICE_SEEN_KEY, '1');
    setNoticeOpen(false);
  };

  if (route.startsWith('/admin')) return <AdminPage />;

  // Pages open on top of the store so its scroll position is kept when you come back.
  return (
    <>
      <StorePage />
      {route === '/login' && <LoginPage />}
      {route === '/signup' && <SignUpPage />}
      {route === '/orders' && <MyOrdersPage />}
      {route.startsWith('/order/') && <OrderTrackingPage orderId={route.slice('/order/'.length)} />}
      {noticeOpen && <NoticePage onClose={closeNotice} />}
    </>
  );
}
