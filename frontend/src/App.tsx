import Layout from "./components/Layout";
import Guard from "./components/Guard";
export default function App(){
  return (
    <Guard>
      <Layout />
    </Guard>
  );
}