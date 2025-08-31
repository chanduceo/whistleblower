import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

type Row = { id: string; title: string; status: string; category: string; priority: number; createdAt: string };
export default function ReviewDashboard(){
  const [list, setList] = useState<Row[]>([]);
  useEffect(() => { api.get("/complaints/inbox").then(r => setList(r.data)); }, []);
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Inbox (Authorized Officials)</h1>
      <div className="space-y-2">
        {list.map(r => (
          <Link to={`/complaint/${r.id}`} key={r.id} className="block bg-white p-4 rounded-xl shadow hover:bg-gray-50">
            <div className="flex justify-between"><strong>{r.title}</strong><span>#{r.priority} · {r.category} · {r.status}</span></div>
            <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}