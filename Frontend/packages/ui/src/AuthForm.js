import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import { useUser } from "@/utils/useUser";
// import { Twitter } from '@/components/Icons/Twitter';
// import { Google } from '@/components/Icons/Google';
import { Button } from "@/components/Button";
import LoadingDots from "@/components/LoadingDots";

export const AuthForm = ({
  type,
  campaignId,
  campaignHandle,
  affiliate,
  hideDetails,
  editor,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const router = useRouter();
  const { signIn, signInWithPassword, signUp } = useUser();

  if (
    router?.asPath?.includes("/invite/") &&
    !router?.asPath?.includes("/signin")
  ) {
    type === "signup";
  }

  let authState =
    type === "signin" ? "Sign in" : type === "signup" ? "Sign up" : "Sign in";

  const handleSignin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage({});

    let signInFunc;

    if (password && password?.length) {
      if (type === "signin") {
        signInFunc = await signInWithPassword({
          email: email,
          password: password,
          shouldCreateUser: type === "signin" ? false : true,
          redirectTo: `${
            affiliate === true
              ? process.env.NEXT_PUBLIC_AFFILIATE_SITE_URL
              : process.env.NEXT_PUBLIC_SITE_URL
          }/dashboard`,
        });
      } else {
        signInFunc = await signUp({
          email: email,
          password: password,
          redirectTo: `${
            affiliate === true
              ? process.env.NEXT_PUBLIC_AFFILIATE_SITE_URL
              : process.env.NEXT_PUBLIC_SITE_URL
          }/dashboard`,
        });
      }
    } else {
      signInFunc = await signIn({
        email: email,
        shouldCreateUser: type === "signin" ? false : true,
        redirectTo: `${
          affiliate === true
            ? process.env.NEXT_PUBLIC_AFFILIATE_SITE_URL
            : process.env.NEXT_PUBLIC_SITE_URL
        }/dashboard`,
      });
    }

    if (signInFunc?.error) {
      setMessage({ type: "error", content: signInFunc?.error.message });
    } else {
      if (password) {
        setMessage({
          type: "note",
          content: "Check your email for your confirmation email.",
        });
      } else {
        setMessage({
          type: "note",
          content: "Check your email for the magic link.",
        });
      }

      if (type === "signup" && affiliate !== true) {
        console.log("Firing signup function");
        await Reflio.signup(email);
      }

      if (campaignId) {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "join_campaign_details",
            JSON.stringify({
              campaign_id: campaignId,
              campaign_handle: campaignHandle,
            })
          );
        }
      }
    }
    setLoading(false);
  };

  // const handleOAuthSignIn = async (provider) => {
  //   setLoading(true);
  //   const { error } = await signIn({ provider });
  //   if (error) {
  //     setMessage({ type: 'error', content: error.message });
  //   }
  //   setLoading(false);
  // };

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

          {showPasswordInput && (
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
          )}

          {type === "signup" ? (
            <div className="flex items-center gap-2">
              <label htmlFor="tos" className="sr-only">
                I agree to terms of service.
              </label>
              <input
                id="tos"
                name="tos"
                type="checkbox"
                required
                className=""
              />
              <p>
                I agree to the{" "}
                <a
                  href={
                    "https://assets.ctfassets.net/e5382hct74si/5V1oeYqsTJVlpmQiBxmodA/79dd6ba6cdcd3358c4b68e2d3d4e14cc/Vercel_Affiliate_Payment_Agreement.pdf"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="text-secondary"
                >
                  Terms of Service
                </a>
                .
              </p>
            </div>
          ) : null}

          <div>
            <Button
              disabled={loading}
              type="submit"
              medium
              secondary
              className="w-full"
            >
              {loading ? (
                <LoadingDots />
              ) : showPasswordInput ? (
                authState
              ) : (
                "Send magic link"
              )}
            </Button>
          </div>

          {type === "signin" ? (
            <div className="mt-3 text-center text-sm">
              <span className="text-accents-2">
                Don&apos;t have an account?
              </span>
              {` `}
              <Link
                href="/signup"
                className="cursor-pointer font-bold text-accents-1 hover:underline"
              >
                Sign up.
              </Link>
            </div>
          ) : (
            <div className="mt-3 text-center text-sm">
              <span className="text-accents-2">Already have an account?</span>
              {` `}
              <Link
                href={"/signin"}
                className="cursor-pointer font-bold text-accents-1 hover:underline"
              >
                Sign in.
              </Link>
            </div>
          )}

          <div className="text-center">
            <button
              type="button"
              className="text-sm font-bold text-accents-1 hover:underline"
              onClick={() => {
                if (showPasswordInput) setPassword("");
                setShowPasswordInput(!showPasswordInput);
                setMessage({});
              }}
            >
              {`Or ${authState} with ${
                showPasswordInput ? "magic link" : "password"
              }.`}
            </button>
          </div>
          {/* 
          <div className="mb-6 space-y-2">
            <button
              type="button"
              className="align-center m-0 flex h-full min-h-full w-full justify-center rounded-lg border-2 bg-white p-3 px-5 font-medium hover:bg-accents-9"
              disabled={loading}
              onClick={() => handleOAuthSignIn("twitter")}
            >
              <Twitter />
              <span className="ml-2">{authState} with Twitter</span>
            </button>

            <button
              type="button"
              className="align-center m-0 flex h-full min-h-full w-full justify-center rounded-lg border-2 bg-white p-3 px-5 font-medium hover:bg-accents-9"
              disabled={loading}
              onClick={() => handleOAuthSignIn("google")}
            >
              <Google />
              <span className="ml-2">{authState} with Google</span>
            </button>
          </div> */}

          {message.content && (
            <div>
              <div
                className={`${
                  message.type === "error"
                    ? "border-red-600 bg-red-500 text-white"
                    : "border-gray-300 bg-gray-200"
                } mt-8 rounded-xl border-4 p-4 text-center text-lg`}
              >
                {message.content === "Signups not allowed for otp"
                  ? "We could not find an account with this email address."
                  : message.content}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
