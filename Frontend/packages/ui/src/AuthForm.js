import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useUser } from "@/utils/useUser";
import { Button } from "@/components/Button";
import LoadingDots from "@/components/LoadingDots";

export const AuthForm = ({
  type,
  hideDetails,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const router = useRouter();
  const { user, signIn, signUp } = useUser();

  let authState =
    type === "signin" ? "Sign in" : type === "signup" ? "Sign up" : "Sign in";


  const handleSignin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage({});

    try {
      // Determine which function to call based on the type prop
      const authFunction = type === 'signin' ? signIn : signUp;

      const response = await authFunction(email, password);

      // If authentication is successful, you can optionally redirect to the dashboard
      router.push('/dashboard');
    } catch (error) {
      setMessage({ type: "error", content: error.message });
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-12">
        {!hideDetails && (
          <div className="text-center">
            <h1 className="mb-3 text-center text-3xl font-extrabold capitalize text-gray-900">
              {authState}
            </h1>
          </div>
        )}
        <form onSubmit={handleSignin} className="space-y-4">
          <input type="hidden" name="remember" defaultValue="true" />
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="relative block w-full appearance-none rounded-lg border-2 border-gray-200 p-4 text-base placeholder-gray-500 focus:z-10 focus:outline-none"
              placeholder="Email address"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="password"
              required
              className="relative block w-full appearance-none rounded-lg border-2 border-gray-200 p-4 text-base placeholder-gray-500 focus:z-10 focus:outline-none"
              placeholder="*********"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </div>

          <div>
            <Button
              disabled={loading}
              type="submit"
              medium
              secondary
              className="w-full"
            >
              {loading ? <LoadingDots /> : authState}
            </Button>
          </div>

          {message.content && (
            <div>
              <div
                className={`${
                  message.type === "error"
                    ? "border-red-600 bg-red-500 text-white"
                    : "border-gray-300 bg-gray-200"
                } mt-8 rounded-xl border-4 p-4 text-center text-lg`}
              >
                {message.content}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
