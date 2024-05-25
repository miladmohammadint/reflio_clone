import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';  // Add axios for making API requests

// Adjust the following import statements based on your Django backend setup
import { signin, signup, signout } from '../pages/api/auth';
import { getUserDetails, getTeam, getSubscription, createCompany } from '../pages/api/user'; // Import getUserDetails, getTeam, and createCompany
import { backendBaseUrl } from '../pages/api/user';

export const UserContext = createContext();

// Define the getCompanies function
export const getCompanies = async (userId) => {
  try {
    const response = await axios.get(backendBaseUrl + '/api/get_company_details'); // Adjust the URL to your actual endpoint
    return response.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
};

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

        // Fetch team details from Django backend using the imported getTeam function
        const teamDetails = await getTeam();
        setTeam(teamDetails);

        // Fetch subscription details from Django backend using the imported getSubscription function
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

  const newCompany = async (userDetails, companyData) => {
    try {
      // Call your API endpoint to create a new company using the imported createCompany function
      const result = await createCompany(userDetails, companyData);
      return result;
    } catch (error) {
      console.error('Error creating company:', error);
      throw new Error('Failed to create company');
    }
  };

  const newCampaign = async (userDetails, data, companyId) => {
    const token = userDetails?.token;
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/company/${companyId}/campaigns`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error creating campaign');
      }

      return 'success';
    } catch (error) {
      console.error('Error creating campaign:', error);
      return 'error';
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
    newCompany,
    newCampaign,
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
