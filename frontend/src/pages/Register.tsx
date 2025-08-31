web/src/pages/Register.tsx
import { useForm } from "react-hook-form";
import api from "../api";
import { useNavigate } from "react-router-dom";

type Form = { name: string; email: string; password: string };
export default function Register(){
  const { register, handleSubmit } = useForm<Form>();
  const nav = useNavigate();
  async function onSubmit(data: Form){
    await api.post("/auth/register", data);
    nav("/");
  }
  return (
    <div className="max-w-sm mx-auto bg-white p-6 rounded-2xl shadow">
      <h1 className="text-xl font-semibold mb-4">Register</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Full name" {...register("name")} />
        <input className="w-full border p-2 rounded" placeholder="Email" {...register("email")} />
        <input className="w-full border p-2 rounded" placeholder="Password" type="password" {...register("password")} />
        <button className="w-full bg-black text-white p-2 rounded">Create account</button>
      </form>
    </div>
  );
}