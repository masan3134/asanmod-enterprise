import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a new account",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Register</h1>
        <p className="text-muted-foreground">
          Registration form will be implemented here
        </p>
        {/* TODO: Implement registration form */}
      </div>
    </div>
  );
}
