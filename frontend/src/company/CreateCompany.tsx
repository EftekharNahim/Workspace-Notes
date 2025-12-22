import { useState } from "react";
import { api } from "../api/axios";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

export default function CreateCompany() {
  const [form, setForm] = useState({
    companyName: "",
    companyHostname: "",
    ownerUsername: "",
    ownerEmail: "",
    ownerPassword: "",
  });

  // State to hold validation error messages
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Regex matching your VineJS schema
    const hostnameRegex = /^(localhost(:[0-9]+)?|[a-z0-9\-]+)$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!form.companyName) newErrors.companyName = "Company name is required";

    if (!form.companyHostname) {
      newErrors.companyHostname = "Hostname is required";
    } else if (!hostnameRegex.test(form.companyHostname)) {
      newErrors.companyHostname =
        "Invalid format (lowercase, numbers, and hyphens only)";
    }

    if (form.ownerUsername.length < 3) {
      newErrors.ownerUsername = "Username must be at least 3 characters";
    }

    if (!emailRegex.test(form.ownerEmail)) {
      newErrors.ownerEmail = "Please enter a valid email address";
    }

    if (form.ownerPassword.length < 8) {
      newErrors.ownerPassword = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    try {
      await api.post("/companies", form);
      alert("Company created. Use owner credentials to login.");
      navigate("/login");
    } catch (err: any) {
       const responseData = err.response?.data;
      if (responseData && Array.isArray(responseData.error)) {
      const backendErrors: Record<string, string> = {};
      
      responseData.error.forEach((e: any) => {
        backendErrors[e.field] = e.message;
      });

      setErrors(backendErrors);
    } else {
        alert(err.response?.data?.message || "Something went wrong");
      }
    }
  };

  // Helper to render error messages
  const ErrorMsg = ({ name }: { name: string }) =>
    errors[name] ? (
      <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
    ) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow space-y-4">
        <h1 className="text-xl font-bold text-center text-gray-800">
          Create Company
        </h1>

        <div>
          <input
            className={`w-full border p-2 rounded ${
              errors.companyName ? "border-red-500" : "border-gray-300"
            }`}
            name="companyName"
            placeholder="Company Name"
            onChange={handleChange}
          />
          <ErrorMsg name="companyName" />
        </div>

        <div>
          <input
            className={`w-full border p-2 rounded ${
              errors.companyHostname ? "border-red-500" : "border-gray-300"
            }`}
            name="companyHostname"
            placeholder="Hostname (acme-corp)"
            onChange={handleChange}
          />
          <ErrorMsg name="companyHostname" />
        </div>

        <div>
          <input
            className={`w-full border p-2 rounded ${
              errors.ownerUsername ? "border-red-500" : "border-gray-300"
            }`}
            name="ownerUsername"
            placeholder="Owner Username"
            onChange={handleChange}
          />
          <ErrorMsg name="ownerUsername" />
        </div>

        <div>
          <input
            className={`w-full border p-2 rounded ${
              errors.ownerEmail ? "border-red-500" : "border-gray-300"
            }`}
            name="ownerEmail"
            placeholder="Owner Email"
            onChange={handleChange}
          />
          <ErrorMsg name="ownerEmail" />
        </div>

        <div>
          <input
            className={`w-full border p-2 rounded ${
              errors.ownerPassword ? "border-red-500" : "border-gray-300"
            }`}
            type="password"
            name="ownerPassword"
            placeholder="Owner Password"
            onChange={handleChange}
          />
          <ErrorMsg name="ownerPassword" />
        </div>

        <button
          onClick={submit}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition duration-200"
        >
          Create Company
        </button>
         <p>Already a member or owner of a company? <Link to={'/login'}>Login now</Link></p>
      </div>
    </div>
  );
}
