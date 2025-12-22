import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = { username: "", email: "", password: "" };
    let isValid = true;

    // Username validation (No special characters, only letters/numbers)
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!form.username) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (!usernameRegex.test(form.username)) {
      newErrors.username = "Username contains invalid characters";
      isValid = false;
    }

    // Email validation (Using your specific regex)
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    // Standard Email Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    // Password validation (Min length 8)
    if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const submit = async () => {
    if (validate()) {
      try {
        await authApi.register(form);
        alert("Registration successful! Please login.");
        navigate("/login");
      } catch (error) {
        console.error("Registration failed", error);
        // Optional: Handle server-side errors here
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col space-y-4 max-w-sm">
        {/* Username */}
        <div>
          <input
            className={`border p-2 w-full rounded ${
              errors.username ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Username"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          {errors.username && (
            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            className={`border p-2 w-full rounded ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            className={`border p-2 w-full rounded ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <button
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          onClick={submit}
        >
          Register
        </button>
      </div>

      <h1 className="mt-4">
        Already registered!{" "}
        <Link to={"/login"} className="text-blue-500 underline">
          Login now
        </Link>
      </h1>
      <h1>
        Want to create a company?{" "}
        <Link to={"/"} className="text-blue-500 underline">
          Create Company
        </Link>
      </h1>
    </div>
  );
}
