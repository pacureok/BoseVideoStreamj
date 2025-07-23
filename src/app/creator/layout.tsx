import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Si usas Next.js en modo SPA, o usa useHistory de react-router si es puro React

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/.netlify/functions/stream-info");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (!data.is_creator) {
          router.push("/login");
          return;
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, [router]);

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-3xl font-bold text-green-400">Panel del Creador</h1>
        <nav className="mt-2">
          <ul className="flex gap-4">
            <li><a href="/creator/dashboard" className="text-green-300 hover:underline">Dashboard</a></li>
            <li><a href="/creator/live-studio" className="text-green-300 hover:underline">Estudio en Vivo</a></li>
            <li><a href="/creator/publications" className="text-green-300 hover:underline">Mis Publicaciones</a></li>
          </ul>
        </nav>
      </header>
      <main className="flex-grow p-4">
        {children}
      </main>
      <footer className="bg-gray-800 p-4 text-center text-gray-400 text-sm mt-auto">
        &copy; {new Date().getFullYear()} BoseVideoStream - Panel del Creador.
      </footer>
    </div>
  );
}
