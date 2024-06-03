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

export const getSales = async (companyId, date, page) => {
  try {
    const response = await fetch(backendBaseUrl + `/api/get_sales/?company_id=${companyId}&date=${date}&page=${page}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sales data');
    }
    const salesData = await response.json();
    return salesData;
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return { error: 'Failed to fetch sales data' };
  }
};

export const continueWithoutStripe = async (companyId) => {
  try {
    const response = await fetch(backendBaseUrl + `/api/continue_without_stripe/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_id: companyId }),
    });

    if (!response.ok) {
      throw new Error('Failed to update company stripe information');
    }

    return 'success';
  } catch (error) {
    console.error('Error updating company stripe information:', error);
    return 'error';
  }
};

export const getAffiliates = async (companyId) => {
  try {
    const response = await axios.get(`${backendBaseUrl}/api/get_affiliates`, {
      params: { company_id: companyId },
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch affiliates data');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching affiliates data:', error);
    return { error: 'Failed to fetch affiliates data' };
  }
};

export const getReferrals = async (companyId, date, page) => {
  try {
    const response = await axios.get(`${backendBaseUrl}/api/get_referrals`, {
      params: {
        company_id: companyId,
        date: date,
        page: page,
      },
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch referrals');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return { error: 'Failed to fetch referrals' };
  }
};

export const getReflioCommissionsDue = async (teamId) => {
  try {
    const response = await axios.get(`${backendBaseUrl}/api/get_reflio_commissions_due`, {
      params: { team_id: teamId },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Assuming you are using token-based authentication
      },
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch Reflio commissions due');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching Reflio commissions due:', error);
    return { error: 'Failed to fetch Reflio commissions due' };
  }
};


export const payCommissions = async (companyId, checkedCommissions, eligibleCommissions) => {
  if (!companyId || !eligibleCommissions) return "error";

  try {
    const response = await axios.post(`${backendBaseUrl}/api/pay_commissions/`, {
      companyId: companyId,
      checkedCommissions: checkedCommissions,
      eligibleCommissions: eligibleCommissions
    });

    if (response.status === 200 && response.data.status === "success") {
      return "success";
    } else {
      return "error";
    }
  } catch (error) {
    console.warn(error);
    return "error";
  }
};

export const newTeam = async (userId, teamName) => {
  try {
    const response = await axios.post(`${backendBaseUrl}/api/new_team/`, {
      userId: userId,
      team_name: teamName,
    });

    if (response.status === 201) {
      return 'success';
    } else {
      return 'error';
    }
  } catch (error) {
    console.error('Error creating team:', error);
    return 'error';
  }
};

export const getCampaigns = async (companyId) => {
  try {
    const response = await axios.get(`${backendBaseUrl}/api/get_campaigns/`, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: { companyId },
    });

    if (response.status === 200) {
      return response.data; // This should return an array of campaigns
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error getting campaigns:', error);
    return [];
  }
};

export const editCampaign = async (user, campaignId, formFields) => {
  try {
    const apiUrl = `${backendBaseUrl}/api/edit_campaign/`;
    const response = await axios.post(apiUrl, {
      campaign_id: campaignId,
      form_fields: formFields,
    });

    if (response.status === 200 && response.data.status === "success") {
      return "success";
    } else {
      return "error";
    }
  } catch (error) {
    console.error('Error editing campaign:', error);
    return "error";
  }
};

export const editCampaignMeta = async (campaignId, metaData) => { 
  try {
    const apiUrl = `${backendBaseUrl}/api/edit_campaign_meta/`;
    const response = await axios.post(apiUrl, {
      campaign_id: campaignId,
      meta_data: metaData,
    });

    if (response.status === 200 && response.data.status === "success") {
      return "success";
    } else {
      return "error";
    }
  } catch (error) {
    console.error('Error editing campaign meta data:', error);
    return "error";
  }
};

export const newStripeAccount = async (userId, stripeId, companyId) => {
  try {
    const response = await axios.post(`${backendBaseUrl}/api/new_stripe_account/`, {
      userId: userId,
      stripeId: stripeId,
      companyId: companyId,
    });

    if (response.status === 200 && response.data.status === "success") {
      return "success";
    } else {
      return "error";
    }
  } catch (error) {
    console.error('Error creating new Stripe account:', error);
    return "error";
  }
};

export const manuallyVerifyDomain = async (companyId) => {
  try {
    const response = await axios.post(`${backendBaseUrl}/api/manually_verify_domain/`, {
      companyId: companyId,
    });

    if (response.status === 200 && response.data.status === "success") {
      return "success";
    } else {
      return "error";
    }
  } catch (error) {
    console.error('Error manually verifying domain:', error);
    return "error";
  }
};

export const deleteAffiliate = async (id) => {
  try {
    const response = await axios.post(`${backendBaseUrl}/api/delete_affiliate/`, {
      id: id,
    });

    if (response.status === 200 && response.data.status === "success") {
      return "success";
    } else {
      return "error";
    }
  } catch (error) {
    console.error('Error deleting affiliate:', error);
    return "error";
  }
};

export const deleteCompany = async (id) => {
  try {
    const response = await axios.post(`${backendBaseUrl}/api/delete_company/`, {
      id: id,
    });

    if (response.status === 200 && response.data.status === "success") {
      return "success";
    } else {
      return "error";
    }
  } catch (error) {
    console.error('Error deleting company:', error);
    return "error";
  }
};

export const editCurrency = async (companyId, data) => {
  if (!data?.companyCurrency) {
    return "error";
  }

  try {
    const response = await axios.post(`${backendBaseUrl}/api/edit_currency/`, {
      companyId: companyId,
      companyCurrency: data.companyCurrency,
    });

    if (response.status === 200 && response.data.status === "success") {
      return "success";
    } else {
      return "error";
    }
  } catch (error) {
    console.error('Error editing company currency:', error);
    return "error";
  }
};

export const editCompanyWebsite = async (companyId, data) => {
  if (!data?.companyUrl) {
    return "error";
  }

  try {
    const response = await axios.post(`${backendBaseUrl}/api/edit_company_website/`, {
      companyId: companyId,
      companyUrl: data.companyUrl,
    });

    if (response.status === 200 && response.data.status === "success") {
      return "success";
    } else {
      return "error";
    }
  } catch (error) {
    console.error('Error editing company website:', error);
    return "error";
  }
};

export const disableEmails = async (companyId, type) => {
  try {
    const response = await axios.post(`${backendBaseUrl}/api/disable_emails/`, {
      companyId: companyId,
      type: type,
    });

    if (response.status === 200 && response.data.status === "success") {
      return "success";
    } else {
      return "error";
    }
  } catch (error) {
    console.error('Error disabling emails:', error);
    return "error";
  }
};

export const archiveSubmission = async (id, type) => {
  try {
    const response = await axios.post(`${backendBaseUrl}/api/archive_submission/`, {
      id: id,
      type: type,
    });

    if (response.status === 200 && response.data.status === "success") {
      return "success";
    } else {
      return "error";
    }
  } catch (error) {
    console.error('Error archiving submission:', error);
    return "error";
  }
};

export const uploadLogoImage = async (companyId, file) => {
  try {
    const formData = new FormData();
    formData.append('companyId', companyId);
    formData.append('file', file);

    const response = await axios.post(`${backendBaseUrl}/api/upload_logo_image/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200 && response.data.status === "success") {
      return "success";
    } else {
      return "error";
    }
  } catch (error) {
    console.error('Error uploading logo image:', error);
    return "error";
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await axios.post(`${backendBaseUrl}/api/reset_password/`, {
      token: token,
      password: password
    });

    if (response.status === 200 && response.data.status === "success") {
      return "success";
    } else {
      return "error";
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    return "error";
  }
};