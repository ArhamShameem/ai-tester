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
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Terminal,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();

  const [name, setName] = useState("");
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

  // Password strength calculation
  const getPasswordStrength = (pass: string): { score: number; label: string; color: string } => {
    if (!pass) return { score: 0, label: "None", color: "bg-slate-200" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: "Weak", color: "bg-rose-500" };
      case 2:
        return { score: 50, label: "Fair", color: "bg-amber-500" };
      case 3:
        return { score: 75, label: "Good", color: "bg-[#2e633f]" };
      case 4:
        return { score: 100, label: "Strong", color: "bg-[#234e32]" };
      default:
        return { score: 15, label: "Too short", color: "bg-rose-500" };
    }
  };

  const strength = getPasswordStrength(password);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Full name is required";
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
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
      await register({
        name: name.trim(),
        email: email.trim(),
        password
      });
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
            : "Failed to create account. Please try again."
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
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white border border-[#dce3da] shadow-xs">
            <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
              🏆 #1
            </span>
            <span className="text-xs text-slate-600 font-medium">
              Product of the Day
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2e633f]" />
            <span className="text-2xs font-mono text-[#2e633f] font-semibold">
              End-to-End Test Synthesizer
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
              Turn any target URL into deterministic Playwright assertions. Zero brittle selectors, automated Chromium crawls, and intelligent failure root-cause diagnoses.
            </p>
          </div>

          {/* Synthesized Test Case Preview Box */}
          <div className="rounded-2xl border border-[#dce3da] bg-white shadow-sm overflow-hidden max-w-xl">
            {/* Header Tabs */}
            <div className="bg-[#f0f4ee] px-4 py-2.5 border-b border-[#dce3da] flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-[#234e32] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#2e633f]" />
                  synthesized-suite.spec.ts
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600">Playwright CLI</span>
              </div>
              <Badge variant="teal" className="text-2xs font-mono">
                TypeScript
              </Badge>
            </div>

            {/* Code Preview Content */}
            <div className="p-4 space-y-2 font-mono text-xs bg-slate-50 text-slate-800 border-b border-[#e2e8e0]">
              <div className="text-slate-500">
                <span className="text-[#2e633f] font-semibold">import</span> &#123; test, expect &#125; <span className="text-[#2e633f] font-semibold">from</span> &apos;@playwright/test&apos;;
              </div>
              <div className="text-slate-800">
                test(&apos;Autonomous checkout flow assertion&apos;, <span className="text-[#2e633f] font-semibold">async</span> (&#123; page &#125;) =&gt; &#123;
              </div>
              <div className="pl-4 text-slate-600">
                <span className="text-[#2e633f]">await</span> page.goto(<span className="text-emerald-700">&quot;https://your-app.com&quot;</span>);
              </div>
              <div className="pl-4 text-slate-600">
                <span className="text-[#2e633f]">await</span> expect(page.locator(<span className="text-emerald-700">&quot;button[type=&apos;submit&apos;]&quot;</span>)).toBeVisible();
              </div>
              <div className="text-slate-800">&#125;);</div>
            </div>

            <div className="px-4 py-2 bg-white flex items-center gap-2 text-2xs text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2e633f]" />
              <span>Strict Zod JSON Schema Validated</span>
              <span className="ml-auto font-mono text-[#2e633f]">Ollama & Fallback Heuristic</span>
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
              <span>Instant Test Execution</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2e633f]" />
              <span>Zero Boilerplate Code</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean White Authentication Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <Card className="border-[#dce3da] bg-white/95 backdrop-blur-xl shadow-xl shadow-[#2e633f]/5">
            <CardHeader className="space-y-1.5 pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                Create an Account
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                Get started with automated Playwright browser testing in seconds.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {errorMessage && (
                <Alert variant="error" title="Registration Error">
                  {errorMessage}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Alex Smith"
                    autoComplete="name"
                    value={name}
                    error={fieldErrors.name}
                    leftIcon={<User className="w-4 h-4" />}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) {
                        setFieldErrors((prev) => ({ ...prev, name: "" }));
                      }
                    }}
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>

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
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
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

                  {/* Dynamic Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-2xs">
                        <span className="text-slate-500 font-medium">Strength:</span>
                        <span
                          className={`font-semibold ${
                            strength.score >= 75
                              ? "text-[#2e633f]"
                              : strength.score >= 50
                              ? "text-amber-600"
                              : "text-rose-600"
                          }`}
                        >
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-[#dce3da]">
                        <div
                          className={`h-full transition-all duration-300 ${strength.color}`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2 bg-[#2e633f] hover:bg-[#255234] text-white shadow-sm font-medium py-3 rounded-xl transition-all"
                  isLoading={isSubmitting}
                >
                  Create Account & Get Started
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </CardContent>

            <Separator className="my-2" />

            <CardFooter className="pt-4 justify-center">
              <p className="text-sm text-slate-600 text-center">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#2e633f] hover:underline underline-offset-4 transition-colors"
                >
                  Sign In →
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
