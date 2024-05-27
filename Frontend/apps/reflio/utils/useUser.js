import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

import { signin, signup, signout } from '../pages/api/auth';
import { getUserDetails, getTeam, getSubscription, createCompany } from '../pages/api/user';
import { backendBaseUrl } from '../pages/api/user';

export const UserContext = createContext();

export const getCompanies = async (userId) => {
  try {
    const response = await axios.get(backendBaseUrl + '/api/get_company_details');
    return response.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
};

export const handleActiveCompany = async (companyId) => {
  try {
    const response = await axios.post(backendBaseUrl + `/api/companies/${companyId}/set-active`);
    if (response.status === 200) {
      return 'success';
    } else {
      return 'error';
    }
  } catch (error) {
    console.error('Error setting active company:', error);
    return 'error';
  }
};

export const newCampaign = async (userDetails, data) => {
  console.log('userDetails in newCampaign:', userDetails); // Log userDetails
  const { token, user_id: userId } = userDetails;

  console.log('userId in newCampaign:', userId); // Log userId

  try {
    // Fetch team details to get the team ID
    const teamDetails = await getTeam();
    const teamId = teamDetails.team_id;

    console.log('teamId in newCampaign:', teamId); // Log teamId

    const apiUrl = `${backendBaseUrl}/api/campaigns/create/`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...data, user: userId, team: teamId }), // Include userId and teamId in the request body
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error creating campaign');
    }

    return 'success';
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw new Error('Failed to create campaign');
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
  const [activeCompany, setActiveCompany] = useState(null);
  const [userCompanyDetails, setUserCompanyDetails] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDetails = await getUserDetails();
        console.log("User Details:", userDetails);
        
        // Extract userId from userDetails and pass it to newCampaign
        const userId = userDetails.user_id;
        console.log("Extracted userId:", userId); 
        console.log('Type of userId:', typeof userId);
        const companies = await getCompanies(userId);
    
        setUser(userDetails);
        setUserDetails(userDetails);
        setTeam(await getTeam());
        setSubscription(await getSubscription());
        setUserCompanyDetails(companies);
        if (companies.length > 0) {
          setActiveCompany(companies[0]);
        }
    
        setUserLoaded(true);
        console.log("User loaded with userId:", userId); // Log the userId after setting userLoaded
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
    }
  };

  const newCompany = async (userDetails, companyData) => {
    try {
      const result = await createCompany(userDetails, companyData);
      return result;
    } catch (error) {
      console.error('Error creating company:', error);
      throw new Error('Failed to create company');
    }
  };

  const updateActiveCompany = async (companyId) => {
    const result = await handleActiveCompany(companyId);
    if (result === 'success') {
      const newActiveCompany = userCompanyDetails.find(company => company.company_id === companyId);
      setActiveCompany(newActiveCompany);
    }
    return result;
  };

  const value = {
    user,
    team,
    userDetails,
    userLoaded,
    subscription,
    userFinderLoaded,
    planDetails,
    activeCompany,
    userCompanyDetails,
    signIn,
    signUp,
    signOut,
    newCompany,
    newCampaign,
    updateActiveCompany
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
