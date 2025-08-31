import { useEffect, useState } from "react";
import api from "../api";

type C = { id: string; title: string; body: string; status: string; category: string; priority: number; createdAt: string };
export default function MyComplaints(){
  const [list, setList] = useState<C[]>([]);
  useEffect(() => { api.get("/complaints/mine").then(r => setList(r.data)); }, []);
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">My Complaints</h1>
      <div className="space-y-3">
        {list.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-xl shadow">
            <div className="flex justify-between"><strong>{c.title}</strong><span>#{c.priority} · {c.category} · {c.status}</span></div>
            <p className="mt-2 whitespace-pre-wrap">{c.body}</p>
            <div className="text-xs text-gray-500 mt-2">{new Date(c.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}