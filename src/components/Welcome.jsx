import { useState } from "react";

const ADMIN_PASSWORD = "bossapril2026"; // change this to whatever you want

export default function Welcome({ onSignIn }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onSignIn();
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden flex items-center justify-center">
      <div className="absolute top-0 right-0 w-40 h-24 bg-red-600 rounded-bl-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-20 bg-blue-600 rounded-tr-2xl" />

      <div className="relative bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-center text-lg font-bold text-gray-900">Welcome</h1>
        <p className="text-center text-sm text-gray-500 mt-1">
          Football Lipa Open Play
        </p>

        <div className="flex justify-center my-6">
          <img
            src="/logo.png"
            alt="Football Lipa"
            className="h-24 w-24 object-contain"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Enter admin password"
            className="w-full rounded-md bg-gray-100 border-none px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-md transition-colors"
          >
            Sign In
          </button>
          {error && (
            <p className="text-xs text-red-600 text-center">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}