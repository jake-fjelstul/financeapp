// src/components/Sidebar.jsx
import { Home, PlusCircle, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 bg-[#111827] text-white p-4 shadow-xl fixed">
      <div className="text-2xl font-bold mb-8">💰 JakeFinance</div>
      <nav className="flex flex-col gap-4">
        <Link to="/" className="flex items-center gap-2 p-2 rounded hover:bg-[#1f2937]">
          <Home size={20} /> Dashboard
        </Link>
        <Link to="/accounts" className="flex items-center gap-2 p-2 rounded hover:bg-[#1f2937]">
          <Wallet size={20} /> Accounts
        </Link>
        <Link to="/add" className="flex items-center gap-2 p-2 rounded hover:bg-[#1f2937]">
          <PlusCircle size={20} /> Add Transaction
        </Link>
      </nav>
    </aside>
  );
}