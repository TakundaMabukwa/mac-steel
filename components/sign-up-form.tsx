"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex justify-center items-center bg-gradient-to-br from-blue-800 via-blue-600 via-white to-white p-8 min-h-screen", className)} {...props}>
      <div className="bg-white shadow-2xl rounded-xl w-4/5 h-4/5 overflow-hidden">
        <div className="flex h-full">
          {/* Left Side - Sign Up Form */}
          <div className="flex flex-1 justify-center items-center bg-white p-8">
            <div className="space-y-8 w-full max-w-md">
              {/* Logo */}
              <div className="text-center">
                <div className="flex justify-center items-center mx-auto mb-4">
                  <img 
                    src="https://macsteel.co.za/assets/images/logo-macsteel-dark.svg" 
                    alt="MacSteel Logo" 
                    className="w-auto h-16"
                  />
                </div>
                <h1 className="font-bold text-gray-900 text-3xl">Create Account</h1>
                <p className="mt-2 text-gray-600">Join MacSteel and start managing your fleet today</p>
              </div>
              <form onSubmit={handleSignUp} className="space-y-6">
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
                    <Label htmlFor="password" className="font-medium text-gray-700 text-sm">
                      Password
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a Password"
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

                  <div>
                    <Label htmlFor="repeat-password" className="font-medium text-gray-700 text-sm">
                      Repeat Password
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="repeat-password"
                        type={showRepeatPassword ? "text" : "password"}
                        placeholder="Confirm Your Password"
                        required
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                        className="right-0 absolute inset-y-0 flex items-center pr-3"
                      >
                        {showRepeatPassword ? (
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
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Already Have an Account?{" "}
                  <Link href="/auth/login" className="font-medium text-blue-800 hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
          {/* Right Side - MacSteel Trading Image */}
          <div className="hidden relative lg:flex flex-1">
            <img
              src="https://macsteel.co.za/assets/images/home-macsteel-trading.jpg"
              alt="MacSteel Trading"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="bottom-8 left-8 absolute text-white">
              <h2 className="mb-2 font-bold text-2xl">MacSteel Trading</h2>
              <p className="opacity-90 text-lg">Your trusted partner in steel trading and logistics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
