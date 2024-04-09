import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/router';

// Adjust the following import statements based on your Django backend setup
import { signin, signup, signout } from '../pages/api/auth';
import { getUserDetails, getTeam, getSubscription } from '../pages/api/user'; // Import getUserDetails function

export const UserContext = createContext();

export const UserContextProvider = (props) => {
  const router = useRouter();
  const [userLoaded, setUserLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [userFinderLoaded, setUserFinderLoaded] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user details from Django backend using the imported getUserDetails function
        const userDetails = await getUserDetails();
        setUser(userDetails);
        setUserDetails(userDetails);

        // Fetch team details from Django backend
        const teamDetails = await getTeam();
        setTeam(teamDetails);

        // Fetch subscription details from Django backend
        const subscriptionDetails = await getSubscription();
        setSubscription(subscriptionDetails);

        // Set user loaded state to true
        setUserLoaded(true);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const signIn = async (email, password) => {
      await signin(email, password);
  };

  const signUp = async (email, password) => {
      await signup(email, password);
  };

  const signOut = async () => {
    try {
      await signout();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Handle sign-out error here
    }
  };

  // Other utility functions can be added here based on your application requirements

  const value = {
    user,
    team,
    userDetails,
    userLoaded,
    subscription,
    userFinderLoaded,
    planDetails,
    signIn,
    signUp,
    signOut,
  };

  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserContextProvider.`);
  }
  return context;
};
