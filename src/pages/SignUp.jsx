import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, storage } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const SignUp = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    agreeToTerms: false,
    profileImage: null,
  });

  const [validationErrors, setValidationErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const validateFullName = (name) => {
    if (name.length < 2) {
      return "Full name must be at least 2 characters long";
    }
    if (!/^[a-zA-Z\s]*$/.test(name)) {
      return "Full name should only contain letters and spaces";
    }
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*)";
    }
    return "";
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return "Please enter a valid phone number";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear validation error when user starts typing
    setValidationErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Validate on change
    let error = "";
    switch (name) {
      case "fullName":
        error = validateFullName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "confirmPassword":
        error = value !== formData.password ? "Passwords do not match" : "";
        break;
      case "phoneNumber":
        error = validatePhoneNumber(value);
        break;
      default:
        break;
    }

    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const errors = {
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword:
        formData.password !== formData.confirmPassword
          ? "Passwords do not match"
          : "",
      phoneNumber: validatePhoneNumber(formData.phoneNumber),
    };

    setValidationErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      setError("Please fix the validation errors before submitting");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      let photoURL = null;
      if (formData.profileImage) {
        const storageRef = ref(storage, `profile_images/${userCredential.user.uid}`);
        await uploadBytes(storageRef, formData.profileImage);
        photoURL = await getDownloadURL(storageRef);
      }

      // Update user profile with full name and photo
      await updateProfile(userCredential.user, {
        displayName: formData.fullName,
        photoURL: photoURL
      });

      navigate("/wallet");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      navigate("/wallet");
    } catch (error) {
      setError("Failed to sign up with Google. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        background:
          "linear-gradient(159.42deg, #060A0E 3.3%, #3B4550 48.96%, #192531 94.61%)",
      }}
    >
      <div className="max-w-md w-full space-y-8 p-8 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg border border-white/20">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/90"
            >
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="profileImage"
                className="block text-sm font-medium text-gray-300"
              >
                Profile Image (Optional)
              </label>
              <input
                id="profileImage"
                name="profileImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-300"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className={`appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                  validationErrors.fullName
                    ? "border-red-500"
                    : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
              />
              {validationErrors.fullName && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.fullName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                  validationErrors.email ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-300"
              >
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                className={`appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                  validationErrors.phoneNumber
                    ? "border-red-500"
                    : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="+1 (555) 000-0000"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              {validationErrors.phoneNumber && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.phoneNumber}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                  validationErrors.password
                    ? "border-red-500"
                    : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                  validationErrors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
              <label
                htmlFor="agreeToTerms"
                className="ml-2 block text-sm text-gray-300"
              >
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-primary hover:text-primary/90"
                >
                  Terms and Conditions
                </Link>
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-300">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              Sign up with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
