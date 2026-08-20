import { useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Welcome() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    const actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setStatus("sent");
    } catch (err) {
      console.error("Firebase auth error:", err);
      setErrorMessage(err.message);
      setStatus("error");
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

        {status === "sent" ? (
          <div className="text-center">
            <p className="text-sm text-gray-700 font-medium">Check your email</p>
            <p className="text-xs text-gray-500 mt-1">
              We sent a sign-in link to {email}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              disabled={status === "sending"}
              className="w-full rounded-md bg-gray-100 border-none px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-md transition-colors disabled:opacity-60"
            >
              {status === "sending" ? "Sending link..." : "Sign Up"}
            </button>
            {status === "error" && (
              <p className="text-xs text-red-600 text-center">
                {errorMessage || "Something went wrong. Try again."}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}