// src/pages/Landing.tsx
import { Link } from "react-router-dom";
import { LinkVaultIcon } from "../icons/LinkVaultIcon";

export function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-100">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-5 shadow-sm bg-white">
        <div className="flex items-center gap-2">
          <LinkVaultIcon />
          <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">LinkVault</h1>
        </div>
        <Link
          to="/signin"
          className="px-4 py-2 rounded-lg bg-white border border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 transition"
        >
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight max-w-3xl">
          Your Digital Vault for Every Link
        </h2>
        <p className="mt-6 text-lg text-gray-600 max-w-xl">
          Save, organize, and access your important links with ease — all in one
          secure place.
        </p>
        <div className="mt-8">
          <Link
            to="/signup"
            className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-6 text-center text-gray-500 text-sm border-t">
        © {new Date().getFullYear()} LinkVault. All rights reserved.
      </footer>
    </div>
  );
}
