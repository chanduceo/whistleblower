import { useForm } from "react-hook-form";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

type Form = { email: string; password: string };
export default function Login(){
  const { register, handleSubmit } = useForm<Form>();
  const nav = useNavigate();
  async function onSubmit(data: Form){
    await api.post("/auth/login", data);
    nav("/");
  }
  return (
    <div className="max-w-sm mx-auto bg-white p-6 rounded-2xl shadow">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Email" {...register("email")} />
        <input className="w-full border p-2 rounded" placeholder="Password" type="password" {...register("password")} />
        <button className="w-full bg-black text-white p-2 rounded">Login</button>
      </form>
      <p className="text-sm mt-3">No account? <Link to="/register" className="underline">Register</Link></p>
    </div>
  );
}