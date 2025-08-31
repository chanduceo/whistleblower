import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

type C = { id: string; title: string; body: string; status: string; category: string; priority: number };
export default function ComplaintView(){
  const { id } = useParams();
  const [c, setC] = useState<C | null>(null);
  const [status, setStatus] = useState<string>("");
  useEffect(() => { api.get(`/complaints/${id}`).then(r => { setC(r.data); setStatus(r.data.status); }); }, [id]);
  async function updateStatus(){
    await api.patch(`/complaints/${id}/status`, { status });
    alert("Updated");
  }
  if (!c) return null;
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h1 className="text-xl font-semibold mb-2">{c.title}</h1>
      <div className="text-sm text-gray-600 mb-4">{c.category} · Priority #{c.priority}</div>
      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{c.body}</pre>
      <div className="mt-4 flex items-center gap-2">
        <select className="border p-2 rounded" value={status} onChange={e => setStatus(e.target.value)}>
          {['OPEN','UNDER_REVIEW','ESCALATED','RESOLVED','REJECTED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={updateStatus} className="bg-black text-white px-4 py-2 rounded">Save</button>
      </div>
    </div>
  );
}