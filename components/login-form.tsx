"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("relative flex justify-center items-center w-full min-h-screen", className)} {...props}>
      {/* Background Image */}
      <div className="z-0 absolute inset-0">
        <img
          src="https://macsteel.co.za/assets/images/home-macsteel-coil-processing.jpg"
          alt="MacSteel Coil Processing"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Login Form Card */}
      <div className="z-10 relative mx-4 w-full max-w-md">
        {/* Logo above the card */}
        <div className="flex justify-center items-center mx-auto mb-8">
          <img 
            src="https://macsteel.co.za/assets/images/logo-macsteel-dark.svg" 
            alt="MacSteel Logo" 
            className="w-auto h-20"
          />
        </div>
        
        <Card className="bg-white/95 shadow-2xl backdrop-blur-sm border-0">
          <CardHeader className="pb-6 text-center">
            <CardTitle className="font-bold text-gray-900 text-3xl">Welcome Back!</CardTitle>
            <CardDescription className="mt-2 text-gray-600 text-base">
              Let's get you signed in securely.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="font-medium text-gray-700 text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter Your Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="font-medium text-gray-700 text-sm">
                      Password
                    </Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-blue-800 text-sm hover:underline"
                    >
                      Forgot Your Password?
                    </Link>
                  </div>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Your Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="right-0 absolute inset-y-0 flex items-center pr-3"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button type="submit" className="bg-gray-900 hover:bg-gray-800 w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Log in with Email"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Don't Have an Account?{" "}
                <Link href="/auth/sign-up" className="font-medium text-blue-800 hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
