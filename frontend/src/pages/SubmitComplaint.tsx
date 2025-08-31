import { useForm } from "react-hook-form";
import api from "../api";

type Form = { title: string; body: string; accusedId: string };
export default function SubmitComplaint(){
  const { register, handleSubmit, reset } = useForm<Form>();
  async function onSubmit(data: Form){
    await api.post("/complaints", data);
    alert("Submitted");
    reset();
  }
  return (
    <div className="bg-white p-6 rounded-2xl shadow max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">Submit a Complaint</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Title" {...register("title")} />
        <textarea className="w-full border p-2 rounded h-40" placeholder="Describe the incident with dates, places, people…" {...register("body")} />
        <input className="w-full border p-2 rounded" placeholder="Accused User ID" {...register("accusedId")} />
        <button className="bg-black text-white px-4 py-2 rounded">Submit</button>
      </form>
    </div>
  );
}