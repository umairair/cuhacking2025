import GoogleIcon from "../assets/google.svg";

export const GoogleOAuthButton = ({ search }) => (
  <a
    className="flex py-3 px-4 items-center justify-center gap-3 self-stretch rounded border border-solid border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer no-underline font-normal text-gray-200 max-w-[350px] transition-colors duration-200"
    href={`/auth/google/start${search}`}
  >
    <img src={GoogleIcon} width={22} height={22} alt="Google logo" /> Continue with Google
  </a>
);
