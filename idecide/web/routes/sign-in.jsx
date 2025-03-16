import { useActionForm } from "@gadgetinc/react";
import { api } from "../api";
import { Link, useLocation } from "react-router-dom";
import { GoogleOAuthButton } from "../components";

export default function () {
  const {
    register,
    submit,
    formState: { errors, isSubmitting },
  } = useActionForm(api.user.signIn);
  const { search } = useLocation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-purple-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <form
          className="flex gap-4 flex-col w-full"
          onSubmit={submit}
        >
          <h1 className="text-2xl font-bold text-center text-white">Welcome Back</h1>
          <p className="text-center text-white mb-2">Sign in to your account</p>
          
          {/* Center the Google OAuth button with flex */}
          <div className="flex justify-center">
            <GoogleOAuthButton search={search} />
          </div>
          
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-gray-300 w-full"></div>
            <span className="bg-purple-800 px-3 text-sm text-gray-500 absolute">or</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">Email</label>
              <input
                id="email"
                className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your email address"
                {...register("email")}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">Password</label>
              <input
                id="password"
                className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your password"
                type="password"
                {...register("password")}
              />
            </div>
          </div>
          
          {errors?.root?.message && (
            <p className="px-4 py-2 bg-red-100 border border-red-200 text-red-800 rounded-md text-sm">
              {errors.root.message}
            </p>
          )}
          
          <button
            className="py-2 px-4 bg-white text-black font-medium rounded-md hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
          
          <div className="flex justify-between items-center mt-2 text-sm">
            <Link 
              className="text-white hover:text-blue-800" 
              to="/forgot-password"
            >
              Forgot your password?
            </Link>
            <Link 
              className="text-white hover:text-blue-800" 
              to="/sign-up"
            >
              Create account
            </Link>

          </div>
        </form>
      </div>
    </div>
  );
}
