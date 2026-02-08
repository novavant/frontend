import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { checkAuth, isAuthRoute } from './auth';

const withAuth = (WrappedComponent) => {
  const WithAuthComponent = (props) => {
    const router = useRouter();

    useEffect(() => {
      // Don't check auth for login and register pages
      if (isAuthRoute(router.pathname)) {
        return;
      }

      const isAuthenticated = checkAuth();
      if (!isAuthenticated) {
        router.push('/login');
      }
    }, [router.pathname]);

    return <WrappedComponent {...props} />;
  };

  // Copy getInitialProps so it will run as well
  if (WrappedComponent.getInitialProps) {
    WithAuthComponent.getInitialProps = WrappedComponent.getInitialProps;
  }

  return WithAuthComponent;
};

export default withAuth;