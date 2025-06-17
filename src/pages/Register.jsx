import { useState } from "react";
import { Eye, EyeOff, Link, Mail, Lock, ArrowRight, User } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const Register = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/");
  };

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare API payload to match backend expectations
      const payload = {
        email: formData.email,
        password: formData.password,
        username: formData.username,
      };

      const response = await fetch(
        "https://shorter-umber.vercel.app/register",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Account created successfully!");

        // If the backend returns a token after registration, store it and redirect to home
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          if (data.refresh_token) {
            localStorage.setItem("refresh_token", data.refresh_token);
          }

          // Dispatch custom event to notify navbar of auth state change
          window.dispatchEvent(new Event("authStateChange"));

          // Redirect to home page since user is now authenticated
          setTimeout(() => {
            navigate("/");
          }, 1500);
        } else {
          // If no token is returned, redirect to login page
          setTimeout(() => {
            navigate("/login");
          }, 1500);
        }
      } else {
        // Handle error response from backend
        toast.error(
          data.message ||
            data.detail ||
            "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <button
            onClick={handleRedirect}
            className="flex mx-auto mb-4 cursor-pointer"
          >
            <Link className="w-8 h-8 text-blue-500 mr-2" />
            <span className="text-2xl font-bold dark:text-white text-gray-800">
              Umber
            </span>
            <span className="text-pink-500 text-xs ml-1">®</span>
          </button>

          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                Create Account
              </span>
            </h1>
            <p className="dark:text-gray-400 text-sm">
              Join us and start managing your links efficiently
            </p>
          </div>
        </div>

        {/* Register Form */}
        <div className="dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
          <div className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium dark:text-gray-300 mb-2"
              >
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 dark:bg-gray-700 border border-gray-600 rounded-lg dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 dark:bg-gray-700 border border-gray-600 rounded-lg dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-12 py-3 dark:bg-gray-700 border border-gray-600 rounded-lg dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium dark:text-gray-300 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-12 py-3 dark:bg-gray-700 border border-gray-600 rounded-lg dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                  required
                />
                <span className="ml-2 text-sm dark:text-gray-300 leading-relaxed">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            {/* Register Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium text-white transition-all ${
                isLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <ArrowRight className="w-5 h-5 mr-2" />
              )}
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 dark:text-gray-400 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center py-3 px-4 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white transition-all">
              Continue with Google
            </button>

            <button className="w-full flex items-center justify-center py-3 px-4 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white transition-all">
              Continue with GitHub
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="dark:text-gray-400 text-sm">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 dark:text-gray-500 text-sm">
          <p>© 2025 Umber. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
