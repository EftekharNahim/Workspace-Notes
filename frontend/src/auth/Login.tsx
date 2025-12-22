import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" }); // Track errors
  const navigate = useNavigate();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validate = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    // Email validation
    if (!form.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const submit = async () => {
    // Only proceed if validation passes
    if (validate()) {
      try {
        await login(form);
        navigate("/notes-app");
      } catch (err) {
        alert("Invalid credentials");
        console.error("Login failed", err);
        // Optionally handle API errors here (e.g., "Invalid credentials")
      }
    }
  };

  return (
    <>
      <div className="form flex flex-col space-y-3 max-w-sm">
        <h2>Login</h2>

        <div>
          <input
            className={`border p-2 w-full rounded ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Email"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: "" }); // Clear error while typing
            }}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            className={`border p-2 w-full rounded ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Password"
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              if (errors.password) setErrors({ ...errors, password: "" }); // Clear error while typing
            }}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <button
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          onClick={submit}
        >
          Login
        </button>
      </div>
      <h3 className="mt-4">
        Not yet register?{" "}
        <Link to="/register" className="text-blue-500 underline">
          Register now
        </Link>
      </h3>
    </>
  );
}
