import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(
      "http://localhost:5000/api/users/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

   if (response.ok) {
  toast.success(data.message);
} else {
  toast.error(data.message || "Something went wrong");
}
  } catch (error) {
    console.error("Forgot password error:", error);
    toast.error("Unable to connect to server");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Forgot Password?
        </h2>

        <p className="text-sm text-gray-500 text-center mt-2 mb-6">
          Enter your email address and we'll help you reset your password.
        </p>

        <form onSubmit={handleSubmit}>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <button
            type="submit"
            className="w-full mt-5 py-3 bg-violet-600 text-white
                       font-semibold rounded-xl hover:bg-violet-700
                       transition-colors"
          >
            Send Reset Link
          </button>

        </form>

        <div className="text-center mt-5">
          <Link
            to="/login"
            className="text-sm font-semibold text-violet-600 hover:text-blue-600"
          >
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;