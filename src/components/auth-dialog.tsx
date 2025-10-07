"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "signin" | "signup";
}

export function AuthDialog({ open, onOpenChange, mode }: AuthDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(mode === "signup");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isVerifyEmail, setIsVerifyEmail] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    setIsSignUp(mode === "signup");
  }, [mode]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return minLength && hasLetter && hasNumber && hasSpecial;
  };

  const getPasswordWarning = () => {
    if (!isSignUp || !password) return "";
    const issues = [];
    if (password.length < 8) issues.push("8+ characters");
    if (!/[a-zA-Z]/.test(password)) issues.push("letters");
    if (!/\d/.test(password)) issues.push("numbers");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      issues.push("special characters");
    return issues.length > 0 ? `Missing: ${issues.join(", ")}` : "";
  };

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp && !validatePassword(password)) {
      toast.error(
        "Password must be 8+ characters with letters, numbers, and special characters"
      );
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: name || email.split('@')[0], phone })
        });
        const data = await res.json();
        if (data.success) {
          toast.success(data.message);
          setIsVerifyEmail(true);
          setIsSignUp(false);
          setResendTimer(60);
        } else {
          toast.error(data.error || 'Failed to create account');
        }
      } else {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (result?.ok) {
          toast.success('Welcome back!');
          onOpenChange(false);
        } else {
          const checkUser = await fetch('/api/auth/check-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const userData = await checkUser.json();
          
          if (!userData.exists) {
            toast.error('User not found. Please sign up first.');
            setIsSignUp(true);
          } else {
            toast.error("Invalid email or password. Please try again.");
          }
        }
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Verification code sent to your email!');
        setIsForgotPassword(false);
        setIsResetPassword(true);
        setResendTimer(60);
      } else if (data.error === 'User not found') {
        toast.error('User not found. Please sign up first.');
        setIsForgotPassword(false);
        setIsSignUp(true);
      } else {
        toast.error(data.error || 'Failed to send reset code');
      }
    } catch (error) {
      toast.error('Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode, email })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Email verified! You can now sign in.');
        setIsVerifyEmail(false);
        setVerificationCode('');
        setResendTimer(0);
      } else {
        toast.error(data.error || 'Invalid code');
      }
    } catch (error) {
      toast.error('Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelVerification = async () => {
    try {
      await fetch('/api/auth/delete-unverified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    } catch (error) {
      console.error('Failed to delete unverified user');
    }
    setIsVerifyEmail(false);
    setIsResetPassword(false);
    setIsForgotPassword(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(newPassword)) {
      toast.error('Password must be 8+ characters with letters, numbers, and special characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: resetCode, email, password: newPassword })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Password reset successfully!');
        setIsResetPassword(false);
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setResendTimer(0);
      } else {
        toast.error(data.error || 'Invalid code');
      }
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signIn("google", { redirect: false });
      if (result?.ok) {
        toast.success("Welcome!");
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("Google sign in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:min-w-5xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <motion.div 
            className="p-6"
            key={isVerifyEmail ? 'verify' : isResetPassword ? 'reset' : isForgotPassword ? 'forgot' : isSignUp ? 'signup' : 'signin'}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl font-semibold mt-4">
                {isVerifyEmail ? "Verify Email" : isResetPassword ? "Reset Password" : isForgotPassword ? "Forgot Password" : isSignUp ? "Create Account" : "Welcome Back !"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mb-2">
                {isVerifyEmail
                  ? "Enter the verification code sent to your email"
                  : isResetPassword
                  ? "Enter code and new password"
                  : isForgotPassword
                  ? "Enter your email to reset password"
                  : isSignUp
                  ? "Sign up to get started with Electronic"
                  : "Sign in to your Electronic account"}
              </p>
            </DialogHeader>
            <div className="space-y-6 p-2">
              <form onSubmit={isVerifyEmail ? handleVerifyEmail : isResetPassword ? handleResetPassword : isForgotPassword ? handleForgotPassword : handleCredentialsAuth} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    disabled={isVerifyEmail || isResetPassword}
                    required
                  />
                </div>
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                      className="h-11"
                      required
                    />
                  </div>
                )}
                {isVerifyEmail && (
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode" className="text-sm font-medium">
                      Verification Code
                    </Label>
                    <div className="flex items-center justify-between gap-3">
                      <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      {resendTimer > 0 ? (
                        <p className="text-xs text-gray-500 whitespace-nowrap">Resend in {resendTimer}s</p>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            setIsLoading(true);
                            try {
                              await fetch('/api/auth/send-verification', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email })
                              });
                              toast.success('Code resent!');
                              setResendTimer(60);
                            } catch (error) {
                              toast.error('Failed to resend code');
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {isResetPassword && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="resetCode" className="text-sm font-medium">
                        Verification Code
                      </Label>
                      <div className="flex items-center justify-between  gap-3">
                        <InputOTP maxLength={6} value={resetCode} onChange={setResetCode}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                        {resendTimer > 0 ? (
                          <p className="text-xs text-gray-500 whitespace-nowrap">Resend in {resendTimer}s</p>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              setIsLoading(true);
                              try {
                                await fetch('/api/auth/forgot-password', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ email })
                                });
                                toast.success('Code resent!');
                                setResendTimer(60);
                              } catch (error) {
                                toast.error('Failed to resend code');
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                            className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                          >
                            Resend Code
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="8+ chars, letters, numbers, symbols"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-11 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword" className="text-sm font-medium">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmNewPassword"
                          type={showConfirmNewPassword ? "text" : "password"}
                          placeholder="Re-enter password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="h-11 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmNewPassword ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {!isForgotPassword && !isVerifyEmail && !isResetPassword && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      autoComplete="off"
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        isSignUp
                          ? "8+ chars, letters, numbers, symbols"
                          : "Enter your password"
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {getPasswordWarning() && (
                    <p className="text-xs text-red-500 mt-1">
                      {getPasswordWarning()}
                    </p>
                  )}
                </div>
                )}
                <button
                  type="submit"
                  className="w-full h-11 font-medium text-sm rounded-md cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {isVerifyEmail ? "Verifying..." : isResetPassword ? "Resetting..." : isForgotPassword ? "Sending..." : isSignUp ? "Creating Account..." : "Signing In..."}
                    </>
                  ) : isVerifyEmail ? (
                    "Verify Email"
                  ) : isResetPassword ? (
                    "Reset Password"
                  ) : isForgotPassword ? (
                    "Send Code"
                  ) : isSignUp ? (
                    "Create Account"
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {(isForgotPassword || isVerifyEmail || isResetPassword) && (
                <div className="text-center text-sm">
                  <Button
                    type="button"
                    onClick={isVerifyEmail ? handleCancelVerification : () => {
                      setIsForgotPassword(false);
                      setIsVerifyEmail(false);
                      setIsResetPassword(false);
                    }}
                    className="text-primary hover:underline font-medium bg-transparent hover:bg-transparent p-0 cursor-pointer"
                  >
                    Back to Sign In
                  </Button>
                </div>
              )}

              {!isForgotPassword && !isVerifyEmail && !isResetPassword && (
              <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-3 text-muted-foreground font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full h-11 font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Signing In...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>

              {!isVerifyEmail && (
              <div className="text-center text-sm text-muted-foreground">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <Button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:underline font-medium bg-transparent hover:bg-transparent p-0 cursor-pointer"
                >
                  {isSignUp ? "Sign in here" : "Sign up here"}
                </Button>
              </div>
              )}
              </>
              )}
            </div>
          </motion.div>
          <motion.div
            className="hidden md:flex items-center justify-center text-center text-7xl font-bold tracking-wide bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 relative overflow-hidden"
            style={{ fontFamily: "'Great Vibes', cursive" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-4 relative z-10">
              <motion.div
                className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent leading-tight"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Future of
              </motion.div>
              <motion.div
                className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent leading-tight"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                Gadgets
              </motion.div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
