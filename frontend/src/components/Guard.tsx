import { Navigate } from "react-router-dom";
export default function Guard({ children }: { children: React.ReactNode }){
  const has = document.cookie.includes("token=");
  return has ? <>{children}</> : <Navigate to="/login" replace />;
}