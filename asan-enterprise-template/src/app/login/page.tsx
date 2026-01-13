import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        <p className="text-muted-foreground">
          Login form will be implemented here using FormPattern component
        </p>
        {/* TODO: Implement login form with react-hook-form + tRPC */}
      </div>
    </div>
  );
}
