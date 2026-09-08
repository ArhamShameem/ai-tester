"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { ApiClientError } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import { AnimatedGrid } from "@/components/ui/animated-grid";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  Zap,
  Sparkles
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      errors.email = "Email address is required";
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
          err instanceof Error
            ? err.message
            : "Failed to sign in. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-6.5rem)] flex items-center justify-center bg-[#f8faf7] text-slate-900 overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
      {/* Animated Technical Background Grid */}
      <AnimatedGrid />

      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: TestSprite-Inspired Hero Showcase */}
        <div className="lg:col-span-7 space-y-8 pr-0 lg:pr-6 text-left">
          {/* Product Hunt / Social Proof Badge */}
          <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white border border-[#dce3da] shadow-xs">
            <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
              🏆 #1
            </span>
            <span className="text-xs text-slate-600 font-medium">
              Autonomous Browser QA Engine
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2e633f]" />
            <span className="text-2xs font-mono text-[#2e633f] font-semibold">
              v1.63 Core
            </span>
          </div>

          {/* TestSprite Typography Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-serif tracking-tight text-slate-900 leading-[1.12]">
              Agentic Testing for <br />
              <span className="text-[#2e633f] not-italic font-sans font-bold">
                Every Change You Ship.
              </span>
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
              You changed the code — did anything break? AI Tester writes the end-to-end tests you never get to, runs them on your live app, and tells you exactly what broke.
            </p>
          </div>

          {/* Test Execution Telemetry Preview Box (similar to TestSprite CLI/Copilot box) */}
          <div className="rounded-2xl border border-[#dce3da] bg-white shadow-sm overflow-hidden max-w-xl">
            {/* Header Tabs */}
            <div className="bg-[#f0f4ee] px-4 py-2.5 border-b border-[#dce3da] flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-[#234e32] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#2e633f]" />
                  Agentic Copilot
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600">Playwright Live Runner</span>
              </div>
              <Badge variant="emerald" className="text-2xs font-mono">
                Active Telemetry
              </Badge>
            </div>

            {/* Live Steps Content */}
            <div className="p-4 space-y-2.5 font-mono text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#2e633f] shrink-0" />
                <span>Headless Chromium session initiated at 60fps</span>
                <span className="ml-auto text-2xs text-slate-400">12ms</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#2e633f] shrink-0" />
                <span>Indexed interactive DOM: 14 buttons, 6 form inputs</span>
                <span className="ml-auto text-2xs text-slate-400">45ms</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#234e32] font-semibold bg-[#f0f5ee] px-2.5 py-1.5 rounded-lg border border-[#d6dfd3]">
                <Sparkles className="w-4 h-4 text-[#2e633f] shrink-0" />
                <span>AI Heuristic Engine: All critical journeys verified</span>
                <span className="ml-auto text-2xs font-mono text-[#2e633f]">0-Flakes</span>
              </div>
            </div>
          </div>

          {/* Features Row */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2e633f]" />
              <span>Supabase Cloud Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#2e633f]" />
              <span>Ollama Local AI Models</span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#2e633f]" />
              <span>Deterministic Playwright</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean White Authentication Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <Card className="border-[#dce3da] bg-white/95 backdrop-blur-xl shadow-xl shadow-[#2e633f]/5">
            <CardHeader className="space-y-1.5 pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                Sign in to your AI Tester workspace to manage projects and test runs.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {errorMessage && (
                <Alert variant="error" title="Sign In Failed">
                  {errorMessage}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="developer@company.com"
                    autoComplete="email"
                    value={email}
                    error={fieldErrors.email}
                    leftIcon={<Mail className="w-4 h-4" />}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    error={fieldErrors.password}
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-700 focus:outline-none transition-colors p-1"
                        title={showPassword ? "Hide password" : "Show password"}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: "" }));
                      }
                    }}
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2 bg-[#2e633f] hover:bg-[#255234] text-white shadow-sm font-medium py-3 rounded-xl transition-all"
                  isLoading={isSubmitting}
                >
                  Sign In to Workspace
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </CardContent>

            <Separator className="my-2" />

            <CardFooter className="pt-4 justify-center">
              <p className="text-sm text-slate-600 text-center">
                Don&apos;t have an account yet?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-[#2e633f] hover:underline underline-offset-4 transition-colors"
                >
                  Get Started Free →
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
