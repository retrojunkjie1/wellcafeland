import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

export function useAdminGate() {
  const [state, setState] = useState({
    loading: true,
    isAdmin: false,
  });

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setState({ loading: false, isAdmin: false });
      return;
    }

    user.getIdTokenResult()
      .then((token) => {
        setState({
          loading: false,
          isAdmin: token.claims?.admin === true,
        });
      })
      .catch(() => {
        setState({ loading: false, isAdmin: false });
      });
  }, []);

  return state;
}

