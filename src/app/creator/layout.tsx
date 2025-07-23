'use client'; // ¡ESTO DEBE SER LA PRIMERA LÍNEA EXACTA!

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !session.user?.isCreator) {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading" || !session || !session.user?.isCreator) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100">
        Cargando...
      </div>
    );
  }

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
