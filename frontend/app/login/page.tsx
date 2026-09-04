"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/auth-context";
import { ApiClientError } from "../../lib/api";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors(err.fieldErrors);
        }
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to sign in. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-slate-800 shadow-2xl bg-slate-900/90">
          <CardHeader className="text-center space-y-2 pb-6 border-b border-slate-800">
            <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-900/40 mb-2">
              <svg
                width={24}
                height={24}
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Sign in to your AI Tester Platform account to manage testing runs
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {errorMessage && (
              <Alert variant="error" className="mb-5" title="Sign In Failed">
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="developer@company.com"
                autoComplete="email"
                value={email}
                error={fieldErrors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                disabled={isSubmitting}
              />

              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                error={fieldErrors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
                disabled={isSubmitting}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isSubmitting}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/register"
                className="font-medium text-teal-400 hover:text-teal-300 transition-colors underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
