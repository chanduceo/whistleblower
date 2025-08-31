import { Link, Outlet } from "react-router-dom";

export default function Layout(){
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto p-4 flex gap-4">
          <Link to="/submit" className="font-semibold">Submit</Link>
          <Link to="/mine">My Complaints</Link>
          <Link to="/review">Review</Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}