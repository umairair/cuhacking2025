import { useActionForm } from "@gadgetinc/react";
import { api } from "../api";
import { useLocation } from "react-router-dom";
import { GoogleOAuthButton } from "../components";

export default function () {
  const {
    register,
    submit,
    formState: { errors, isSubmitSuccessful, isSubmitting },
  } = useActionForm(api.user.signUp);
  const { search } = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-purple-900 p-4">
      <div className="bg-gray-900 p-6 rounded-lg border border-purple-600 shadow-lg w-full max-w-[350px] animate-fadeIn 
          transition-all duration-300 relative overflow-hidden
          shadow-[0_0_15px_rgba(128,0,128,0.5)]">
        <div className="absolute inset-0 border-2 border-transparent rounded-lg glow-border"></div>
        <form
          className="flex gap-4 flex-col w-full"
          onSubmit={submit}
        >
          <h1 className="text-2xl font-bold text-white mb-1 pb-2 text-center text-shadow">Create account</h1>
          <div className="flex gap-4 flex-col w-full">
            <GoogleOAuthButton search={search} />
            <input
              className="text-base py-2 px-4 bg-gray-800 border border-red-500 border-solid rounded w-full text-white 
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
              placeholder="Email"
              {...register("email")}
            />
            {errors?.user?.email?.message && (
              <p className="text-red-400 text-sm font-medium animate-pulse">
                Email: {errors.user.email.message}
              </p>
            )}
            <input
              className="text-base py-2 px-4 bg-gray-800 border border-red-500 border-solid rounded w-full text-white 
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
              placeholder="Password"
              type="password"
              {...register("password")}
            />
            {errors?.user?.password?.message && (
              <p className="text-red-400 text-sm font-medium animate-pulse">
                Password: {errors.user.password.message}
              </p>
            )}
            {errors?.root?.message && (
              <p className="text-red-400 text-sm font-medium animate-pulse">
                {errors.root.message}
              </p>
            )}
            {isSubmitSuccessful && (
              <p className="text-purple-300 text-sm font-medium animate-pulse">
                Please check your inbox
              </p>
            )}
            <button
              className="py-2 px-4 rounded font-semibold text-white bg-gradient-to-r from-red-600 to-purple-700 
                  hover:from-red-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-600
                  transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-red-900/30
                  disabled:opacity-70 disabled:hover:scale-100"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Signing up..." : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
