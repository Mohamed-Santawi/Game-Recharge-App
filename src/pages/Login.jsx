import firedninjaImage from "../assets/firedninja.webp";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, storage } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Optimize image loading for mobile
    if (isMobile) {
      // On mobile, show content immediately and load image in background
      setIsLoading(false);
      const img = new Image();
      img.src = firedninjaImage;
    } else {
      // On desktop, wait for image to load
      const img = new Image();
      img.onload = () => setIsLoading(false);
      img.src = firedninjaImage;
    }

    // Failsafe timeout
    const timeout = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, [isMobile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size before setting
      if (file.size > 1024 * 1024) {
        setError(
          "Image size should be less than 1MB. Please choose a smaller image."
        );
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateInitialAvatar = (name) => {
    if (!name) return null;
    const initial = name.charAt(0).toUpperCase();
    const colors = [
      "#60A5FA", // Blue
      "#34D399", // Green
      "#F87171", // Red
      "#FBBF24", // Yellow
      "#A78BFA", // Purple
      "#F472B6", // Pink
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    return {
      initial,
      backgroundColor: randomColor,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Upload profile image if selected, otherwise use initial avatar
        if (profileImage) {
          const storageRef = ref(
            storage,
            `profileImages/${userCredential.user.uid}`
          );
          await uploadBytes(storageRef, profileImage);
          const downloadURL = await getDownloadURL(storageRef);
          await updateProfile(userCredential.user, {
            displayName: formData.fullName,
            photoURL: downloadURL,
          });
        } else {
          const avatar = generateInitialAvatar(formData.fullName);
          const initialAvatarUrl = `https://ui-avatars.com/api/?name=${
            avatar.initial
          }&background=${avatar.backgroundColor.replace(
            "#",
            ""
          )}&color=fff&size=128&bold=true`;
          await updateProfile(userCredential.user, {
            displayName: formData.fullName,
            photoURL: initialAvatarUrl,
          });
        }

        setSuccess("Account created successfully!");
        navigate("/");
      } else {
        // Sign In
        await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        navigate("/");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError("");
      setSuccess("");

      // Attempt Google sign in
      const result = await signInWithGoogle();

      // Check if this is a new user
      const isNewUser = result.additionalUserInfo?.isNewUser;

      if (isNewUser) {
        // If new user and no photo URL, create initial avatar
        if (!result.user.photoURL) {
          const avatar = generateInitialAvatar(result.user.displayName);
          const initialAvatarUrl = `https://ui-avatars.com/api/?name=${
            avatar.initial
          }&background=${avatar.backgroundColor.replace(
            "#",
            ""
          )}&color=fff&size=128&bold=true`;
          await updateProfile(result.user, {
            photoURL: initialAvatarUrl,
          });
        }
        setSuccess("Welcome! Your account has been created successfully.");
      } else {
        setSuccess("Welcome back!");
      }

      // Short delay to show success message
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to home
      navigate("/");
    } catch (error) {
      console.error("Google sign in error:", error);

      // Handle specific error cases
      switch (error.code) {
        case "auth/popup-closed-by-user":
          setError("Sign in was cancelled. Please try again.");
          break;
        case "auth/popup-blocked":
          setError("Pop-up was blocked. Please allow pop-ups for this site.");
          break;
        case "auth/cancelled-popup-request":
          setError("Sign in was cancelled. Please try again.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection.");
          break;
        default:
          setError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Loading State - Only show on desktop */}
      {!isMobile && isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a] z-50">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Background - Optimized for mobile */}
      <div
        className="fixed inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${firedninjaImage})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#0a0a0a",
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          ...(isMobile && {
            willChange: "auto",
            transform: "none",
          }),
        }}
      />

      {/* Dark Overlay */}
      <div
        className="fixed inset-0"
        style={{
          background:
            "linear-gradient(159.42deg, rgba(6, 10, 14, 0.7) 3.3%, rgba(59, 69, 80, 0.7) 48.96%, rgba(25, 37, 49, 0.7) 94.61%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 p-8 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg border border-white/20">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              {isSignUp ? "Create your account" : "Welcome Back"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-medium text-[#60A5FA] hover:text-[#60A5FA]/90 transition-colors"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              {isSignUp && (
                <>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <span className="text-white/50">No image</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 text-sm text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      {imagePreview ? "Change Image" : "Upload Image"}
                    </button>
                  </div>

                  <div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-300"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-300"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-300"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {isSignUp && (
                <div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-300"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#60A5FA] hover:bg-[#60A5FA]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#60A5FA] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Processing..."
                  : isSignUp
                  ? "Create Account"
                  : "Sign In"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-300">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-white/20 rounded-lg shadow-sm text-sm font-medium text-white bg-white/5 hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                      />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
