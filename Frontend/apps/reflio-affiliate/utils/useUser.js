import { useEffect, useState, createContext, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export const UserContext = createContext();

const backendBaseUrl = 'https://your-django-backend-url'; // Replace with your actual Django backend URL

export const UserContextProvider = (props) => {
  const [userLoaded, setUserLoaded] = useState(false);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userFinderLoaded, setUserFinderLoaded] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${backendBaseUrl}/api/auth/session/`);
        const session = response.data;
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    checkAuth();

    setUserFinderLoaded(true);
  }, []);

  const getUserDetails = async () => {
    try {
      const response = await axios.get(`${backendBaseUrl}/api/users/${user?.id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      Promise.allSettled([getUserDetails()]).then((results) => {
        setUserDetails(results[0].value);
        setUserLoaded(true);
        setUserFinderLoaded(true);
      });
    }
  }, [user]);

  const signIn = async (options) => {
    try {
      const response = await axios.post(`${backendBaseUrl}/api/auth/signin/`, {
        email: options.email,
        password: options.password,
      });
      const session = response.data;
      setSession(session);
      setUser(session.user);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const signInWithPassword = async (options) => {
    try {
      const response = await axios.post(`${backendBaseUrl}/api/auth/signin/`, {
        email: options.email,
        password: options.password,
      });
      const session = response.data;
      setSession(session);
      setUser(session.user);
    } catch (error) {
      console.error('Error signing in with password:', error);
    }
  };

  const signUp = async (options) => {
    try {
      const response = await axios.post(`${backendBaseUrl}/api/auth/signup/`, {
        email: options.email,
        password: options.password,
      });
      const session = response.data;
      setSession(session);
      setUser(session.user);
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post(`${backendBaseUrl}/api/auth/forgot_password/`, { email });
    } catch (error) {
      console.error('Error sending forgot password email:', error);
    }
  };

  const signOut = async () => {
    try {
      await axios.post(`${backendBaseUrl}/api/auth/signout/`);
      setUserDetails(null);
      setSession(null);
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    session,
    user,
    userDetails,
    userLoaded,
    userFinderLoaded,
    signIn,
    signInWithPassword,
    signUp,
    forgotPassword,
    signOut,
  };

  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  console.log("UseUser");
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserContextProvider.`);
  }
  return context;
};

// Reset Password
export const resetPassword = async (token, password) => {
  try {
    const response = await axios.post(`${backendBaseUrl}/api/auth/reset_password/`, {
      token,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    return "error";
  }
};

// Update PayPal Email
export const paypalEmail = async (id, email) => {
  try {
    const response = await axios.put(`${backendBaseUrl}/api/users/${id}/`, {
      paypal_email: email,
    });
    return response.status === 200 ? "success" : "error";
  } catch (error) {
    console.error('Error updating PayPal email:', error);
    return "error";
  }
};
