import React from "react";
import NotReady from "./NotReady";

export default function RouteGuard({ready=true,children}){
  if(!ready){
    return <NotReady />;
  }
  return children;
}
