// HOOKS
import { useQuery } from 'react-query';

function useFetchAuth () {

    const userAuth = useQuery('user', async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/v1/auth/me`, {
          method: 'POST',
          credentials: 'include'
        });
        if (!response.ok) throw new Error ('no user to auth');

        const user = await response.json();
        return user;
      } catch (err) {
        console.info('note: ', err);
        return null;
      }
    });
  
}

export default useFetchAuth;