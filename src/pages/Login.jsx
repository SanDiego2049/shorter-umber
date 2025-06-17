import { useState } from "react";
import { Eye, EyeOff, Link, Lock, ArrowRight, User } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const Login = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/");
  };

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare form data as required by the API
      const payload = new URLSearchParams({
        grant_type: "password",
        username: formData.username,
        password: formData.password,
        scope: "",
      });

      const response = await fetch("https://shorter-umber.vercel.app/token", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token
        localStorage.setItem("access_token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }

        // Dispatch custom event to notify navbar of auth state change
        window.dispatchEvent(new Event("authStateChange"));

        toast.success("Login successful!");

        // Redirect to home page instead of dashboard
        setTimeout(() => {
          navigate("/"); // Redirect to root page as requested
        }, 1000);
      } else {
        // Handle API errors
        const errorMessage = data.detail || data.message || "Login failed";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
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
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Welcome Back
              </span>
            </h1>
            <p className="dark:text-gray-400 text-sm">
              Sign in to continue managing your links
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
          <form onSubmit={handleSubmit}>
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
                    placeholder="Enter your password"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm dark:text-gray-300">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium text-white transition-all ${
                  isLoading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <ArrowRight className="w-5 h-5 mr-2" />
                )}
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 dark:text-gray-400 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-center py-3 px-4 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white transition-all"
            >
              Continue with Google
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center py-3 px-4 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white transition-all"
            >
              Continue with GitHub
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="dark:text-gray-400 text-sm">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign up now
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

export default Login;
