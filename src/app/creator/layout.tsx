import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route"; // ¡IMPORTACIÓN ACTUALIZADA!
import { redirect } from "next/navigation";
import React from "react"; // Asegúrate de importar React

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirigir si no hay sesión o si el usuario no es creador
  if (!session || !session.user?.isCreator) {
    redirect("/login"); // O a una página de acceso denegado
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-3xl font-bold text-green-400">Panel del Creador</h1>
        {/* Aquí puedes añadir navegación específica para el creador */}
        <nav className="mt-2">
          <ul className="flex gap-4">
            <li><a href="/creator/dashboard" className="text-green-300 hover:underline">Dashboard</a></li>
            <li><a href="/creator/live-studio" className="text-green-300 hover:underline">Estudio en Vivo</a></li>
            <li><a href="/creator/publications" className="text-green-300 hover:underline">Mis Publicaciones</a></li>
            {/* Otros enlaces del panel de creador */}
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
