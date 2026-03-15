import {useMemo} from "react";
import {useLocation} from "react-router-dom";
import {getSurfaceOwner} from "./surfaceRegistry";

export default function useSurfaceOwner() {
  const {pathname} = useLocation();
  return useMemo(() => getSurfaceOwner(pathname), [pathname]);
}
