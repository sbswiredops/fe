"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // added
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import useToast from "../hoock/toast";
import Image from "next/image";
interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

type AuthStep =
  | "login"
  | "register"
  | "otp-verification"
  | "forgot-password"
  | "forgot-password-otp"
  | "reset-password";

export default function AuthDrawer({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthDrawerProps) {
  const { t } = useLanguage();
  const {
    login,
    verifyPasswordOtp,
    register,
    isLoading,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
  } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const router = useRouter(); // added

  const [step, setStep] = useState<AuthStep>(initialMode);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
    resetEmail: "",
    resetOtp: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // Handle animation timing
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  // Listen for forced logout (session replaced / refresh failed)
  useEffect(() => {
    const onForcedLogout = (e: Event) => {
      const reason = (e as CustomEvent).detail as string | undefined;
      const msg =
        reason === "session-replaced"
          ? "You were logged out because your account logged in from another device."
          : "Your session expired. Please log in again.";
      showToast(msg, "warning");
      setStep("login");
      setErrors({});
    };
    if (typeof window !== "undefined") {
      window.addEventListener("auth:logout", onForcedLogout as EventListener);
      return () =>
        window.removeEventListener(
          "auth:logout",
          onForcedLogout as EventListener
        );
    }
  }, [showToast]);

  // Reset form when drawer opens/closes or step changes
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        firstName: "",
        lastName: "",
        email: prev.email || "",
        password: "",
        confirmPassword: "",
        otp: "",
        resetEmail: prev.resetEmail || "",
        resetOtp: prev.resetOtp || "",
        newPassword: "",
        confirmNewPassword: "",
      }));
      setErrors({});
      setOtpSent(false);
      setOtpTimer(0);
    }
  }, [isOpen, step]);

  // Clear all fields when switching to login tab
  useEffect(() => {
    if (step === "login") {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        otp: "",
        resetEmail: "",
        resetOtp: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setErrors({});
    }
  }, [step]);

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const success = await login(formData.email, formData.password);
      if (!success) {
        setErrors({ password: "Invalid email or password" });
        return;
      }
      handleClose();
      router.push("/dashboard"); // changed to router
    } catch (err: any) {
      const msg = String(err?.message || "Login failed");
      setErrors({ password: msg });
      showToast(msg, "error");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast("Please fill all required fields correctly.", "warning");
      return;
    }

    try {
      const response = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      if (
        response.data?.message &&
        response.data.message
          .toLowerCase()
          .includes("already registered and verified")
      ) {
        setErrors({ email: response.data.message });
        showToast(response.data.message, "error");
        return;
      }

      if (response.success) {
        setOtpSent(true);
        setOtpTimer(60);
        setStep("otp-verification");
        showToast(
          "Registration successful! Please verify your email.",
          "success"
        );
      } else {
        setErrors({ email: response.message || "Registration failed" });
        showToast(response.message || "Registration failed", "error");
      }
    } catch (error: any) {
      setErrors({ email: error.message || "Registration failed" });
      showToast(error.message || "Registration failed", "error");
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      setErrors({ email: "Email is required" });
      showToast("Email is required", "warning");
      return;
    }
    if (!formData.otp || formData.otp.length !== 6) {
      setErrors({ otp: "Please enter a valid 6-digit OTP" });
      showToast("Please enter a valid 6-digit OTP", "warning");
      return;
    }

    try {
      const success = await verifyOtp(formData.email, formData.otp);
      if (success) {
        setStep("login");
        setErrors({});
        setOtpSent(false);
        setOtpTimer(0);
        showToast("OTP verified successfully! You can now login.", "success");
      } else {
        setErrors({ otp: "Invalid OTP. Please try again." });
        showToast("Invalid OTP. Please try again.", "error");
      }
    } catch (error: any) {
      setErrors({
        otp: error.message || "Invalid or expired OTP. Please try again.",
      });
      showToast(
        error.message || "Invalid or expired OTP. Please try again.",
        "error"
      );
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.resetEmail) {
      setErrors({ resetEmail: "Email is required" });
      showToast("Email is required", "warning");
      return;
    }

    const success = await forgotPassword(formData.resetEmail);
    if (success) {
      setOtpTimer(60);
      setStep("forgot-password-otp");
      setErrors({});
      showToast("Reset code sent to your email.", "success");
    } else {
      setErrors({ resetEmail: "Failed to send reset code. Please try again." });
      showToast("Failed to send reset code. Please try again.", "error");
    }
  };

  const handleForgotPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.resetOtp || formData.resetOtp.length !== 6) {
      setErrors({ resetOtp: "Please enter a valid 6-digit OTP" });
      showToast("Please enter a valid 6-digit OTP", "warning");
      return;
    }

    const success = await verifyPasswordOtp(
      formData.resetEmail,
      formData.resetOtp
    );
    if (success) {
      setStep("reset-password");
      setErrors({});
      showToast(
        "OTP verified successfully! You can now reset your password.",
        "success"
      );
    } else {
      setErrors({ resetOtp: "Invalid OTP. Please try again." });
      showToast("Invalid OTP. Please try again.", "error");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.newPassword)
      newErrors.newPassword = "New password is required";
    if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const success = await resetPassword(
      formData.resetEmail,
      formData.resetOtp,
      formData.newPassword
    );
    if (success) {
      showToast(
        "Password reset successfully! Please login with your new password.",
        "success"
      );
      setStep("login");
    } else {
      setErrors({ newPassword: "Failed to reset password. Please try again." });
      showToast("Failed to reset password. Please try again.", "error");
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email) {
      setErrors({ email: "Email is required" });
      showToast("Email is required", "warning");
      return;
    }

    if (otpTimer > 0) return;

    const success = await resendOtp(formData.email);
    if (success) {
      setOtpTimer(120);
      setErrors({});
      showToast("OTP resent successfully!", "success");
    } else {
      setErrors({ email: "Failed to resend OTP. Please try again." });
      showToast("Failed to resend OTP. Please try again.", "error");
    }
  };

  const resendResetOtp = async () => {
    if (!formData.resetEmail) {
      setErrors({ resetEmail: "Email is required" });
      showToast("Email is required", "warning");
      return;
    }

    if (otpTimer > 0) return;

    const success = await resendOtp(formData.resetEmail);
    if (success) {
      setOtpTimer(120);
      setErrors({});
      showToast("OTP resent successfully!", "success");
    } else {
      setErrors({ resetEmail: "Failed to resend OTP. Please try again." });
      showToast("Failed to resend OTP. Please try again.", "error");
    }
  };

  const changeEmail = () => {
    setStep("register");
    setOtpSent(false);
    setOtpTimer(0);
  };

  // Handle the close animation
  const handleClose = () => {
    const hasFormData =
      formData.firstName ||
      formData.lastName ||
      formData.email ||
      formData.password ||
      formData.confirmPassword ||
      formData.otp ||
      formData.resetEmail ||
      formData.resetOtp ||
      formData.newPassword ||
      formData.confirmNewPassword;

    if (hasFormData && step !== "login") {
      setShowConfirmClose(true);
    } else {
      confirmClose();
    }
  };

  const confirmClose = () => {
    setShowConfirmClose(false);
    setIsVisible(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      otp: "",
      resetEmail: "",
      resetOtp: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isVisible ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      <ToastContainer />

      <div
        className={`fixed top-0 right-0 h-full w-[90vw] sm:w-[420px] md:w-[480px] bg-white shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          isVisible ? "translate-x-0" : "translate-x-full"
        } overflow-hidden flex flex-col border-l border-gray-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Shekhabo Logo"
              width={102}
              height={102}
            />
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-all duration-200 hover:shadow-sm group"
            type="button"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 text-gray-600 group-hover:text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {(step === "login" || step === "register") && (
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6 transition-all duration-300">
              <button
                onClick={() => setStep("login")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  step === "login"
                    ? "bg-white text-blue-600 shadow-sm transform scale-[0.98]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {t("nav.login")}
              </button>
              <button
                onClick={() => setStep("register")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  step === "register"
                    ? "bg-white text-blue-600 shadow-sm transform scale-[0.98]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {t("nav.register")}
              </button>
            </div>
          )}

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step === "login" && t("auth.loginTitle")}
              {step === "register" && t("auth.registerTitle")}
              {step === "otp-verification" && "Verify Your Email"}
              {step === "forgot-password" && "Reset Password"}
              {step === "forgot-password-otp" && "Verify Reset Code"}
              {step === "reset-password" && "Create New Password"}
            </h2>
            <p className="text-gray-600 text-sm">
              {step === "login" && "Welcome back to your learning journey"}
              {step === "register" && "Join thousands of learners today"}
              {step === "otp-verification" && (
                <>
                  We've sent a verification code to{" "}
                  <span className="font-medium text-blue-600">
                    {formData.email}
                  </span>
                </>
              )}
              {step === "forgot-password" &&
                "Enter your email to receive a password reset code"}
              {step === "forgot-password-otp" && (
                <>
                  We've sent a verification code to{" "}
                  <span className="font-medium text-blue-600">
                    {formData.resetEmail}
                  </span>
                </>
              )}
              {step === "reset-password" && "Create your new password"}
            </p>
          </div>

          {step === "login" && (
            <>
              <form className="space-y-4" onSubmit={handleLogin}>
                <Input
                  label={t("auth.email")}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="Enter your email"
                  required
                />

                <Input
                  label={t("auth.password")}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Enter your password"
                  required
                />

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep("forgot-password")}
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    {t("auth.forgotPassword")}
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {t("nav.login")}
                </Button>
              </form>
            </>
          )}

          {step === "register" && (
            <form className="space-y-4" onSubmit={handleRegister}>
              <Input
                label={t("First Name")}
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                placeholder="Enter your first name"
                required
              />

              <Input
                label={t("Last Name")}
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                placeholder="Enter your last name"
                required
              />

              <Input
                label={t("auth.email")}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="Enter your email"
                required
              />

              <Input
                label={t("auth.password")}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Enter your password"
                helperText="Must be at least 6 characters"
                required
              />

              <div className="flex items-start">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                />
                <label
                  htmlFor="agree-terms"
                  className="ml-2 block text-sm text-gray-600"
                >
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                Continue to Verification
              </Button>
            </form>
          )}

          {step === "otp-verification" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Please check your email at{" "}
                  <span className="font-medium text-blue-600">
                    {formData.email}
                  </span>{" "}
                  and enter the 6-digit verification code we sent you.
                </p>
              </div>

              <form onSubmit={handleOtpVerification} className="space-y-4">
                <Input
                  label="Verification Code"
                  name="otp"
                  type="text"
                  value={formData.otp}
                  onChange={handleChange}
                  error={errors.otp}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />

                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Verify & Complete Registration
                </Button>
              </form>

              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpTimer > 0}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}
                </button>

                <button
                  type="button"
                  onClick={changeEmail}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors duration-200"
                >
                  Change Email Address
                </button>
              </div>
            </div>
          )}

          {step === "forgot-password" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <Input
                  label="Email Address"
                  name="resetEmail"
                  type="email"
                  value={formData.resetEmail}
                  onChange={handleChange}
                  error={errors.resetEmail}
                  placeholder="Enter your email address"
                  required
                />

                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Send Reset Code
                </Button>
              </form>

              <button
                type="button"
                onClick={() => setStep("login")}
                className="w-full text-center text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors duration-200"
              >
                Back to Login
              </button>
            </div>
          )}

          {step === "forgot-password-otp" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Please check your email at{" "}
                  <span className="font-medium text-blue-600">
                    {formData.resetEmail}
                  </span>{" "}
                  and enter the 6-digit verification code.
                </p>
              </div>

              <form onSubmit={handleForgotPasswordOtp} className="space-y-4">
                <Input
                  label="Verification Code"
                  name="resetOtp"
                  type="text"
                  value={formData.resetOtp}
                  onChange={handleChange}
                  error={errors.resetOtp}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />

                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Verify OTP
                </Button>
              </form>

              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={resendResetOtp}
                  disabled={otpTimer > 0}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("forgot-password")}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors duration-200"
                >
                  Change Email Address
                </button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-600">
                  Reset code sent to:{" "}
                  <span className="font-medium text-gray-900">
                    {formData.resetEmail}
                  </span>
                </p>
              </div>
            </div>
          )}

          {step === "reset-password" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Your identity has been verified. Please create a new secure
                  password.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={errors.newPassword}
                  placeholder="Enter your new password"
                  helperText="Must be at least 6 characters"
                  required
                />

                <Input
                  label="Confirm New Password"
                  name="confirmNewPassword"
                  type="password"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  error={errors.confirmNewPassword}
                  placeholder="Confirm your new password"
                  required
                />

                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Reset Password
                </Button>
              </form>
            </div>
          )}

          {(step === "login" || step === "register") && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200 hover:shadow-md">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </button>

                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200 hover:shadow-md">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmClose}
        onClose={() => setShowConfirmClose(false)}
        onConfirm={confirmClose}
        title="Are you sure you want to close?"
        message="You have unsaved changes that will be lost if you close this form. Do you want to continue?"
        confirmText="Yes, close"
        cancelText="No, stay here"
        type="warning"
      />
    </div>
  );
}
