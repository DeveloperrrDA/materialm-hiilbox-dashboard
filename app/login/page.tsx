import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F6FAF7] px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">

        {/* Logo / Header */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center"
          >
            <span className="text-3xl font-extrabold tracking-tight text-[#18A558]">
              Hiil
              <span className="text-[#16324F]">box</span>
            </span>
          </Link>

          <h1 className="mt-7 text-3xl font-bold tracking-tight text-[#16324F]">
            Welcome back
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Sign in to your Hiilbox account and continue making an impact.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_10px_40px_rgba(15,45,65,0.08)] sm:p-8">
          <LoginForm />

          {/* Signup Link */}
          <div className="mt-7 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#18A558] transition hover:text-[#128044]"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs leading-5 text-gray-400">
          Welcome to the Hiilbox crowdfunding community.
        </p>
      </div>
    </main>
  );
}