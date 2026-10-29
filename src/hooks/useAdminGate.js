import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

export function useAdminGate() {
  const [state, setState] = useState(() => ({
    loading: Boolean(getAuth().currentUser),
    isAdmin: false,
  }));

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
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

