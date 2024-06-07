import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { getCampaigns, useUser } from './useUser';
import { useCompany } from './CompanyContext';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export const CampaignContext = createContext();

export const CampaignContextProvider = (props) => {
  const { userFinderLoaded } = useUser();
  const { activeCompany } = useCompany();
  const [userCampaignDetails, setUserCampaignDetails] = useState([]);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchCampaignDetails = useCallback(async (companyId) => {
    setLoading(true);
    try {
      const results = await getCampaigns(companyId);
      const campaigns = Array.isArray(results) ? results : [results];
      console.log('Fetched campaigns:', campaigns); // Debugging statement
      setUserCampaignDetails(campaigns);
    } catch (error) {
      toast.error('Error fetching campaigns');
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeCompany?.company_id) {
      fetchCampaignDetails(activeCompany.company_id);
    }
  }, [userFinderLoaded, activeCompany, fetchCampaignDetails]);

  useEffect(() => {
    console.log('Router query campaignId:', router.query.campaignId); // Debugging statement
    const newActiveCampaign = userCampaignDetails.find(campaign => campaign.campaign_id === router.query.campaignId);
    console.log('New active campaign:', newActiveCampaign); // Debugging statement
    setActiveCampaign(newActiveCampaign || null);
  }, [router.query.campaignId, userCampaignDetails]);

  const value = {
    activeCampaign,
    userCampaignDetails,
    fetchCampaignDetails,
    loading,
  };

  return <CampaignContext.Provider value={value} {...props} />;
};

export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error(`useCampaign must be used within a CampaignContextProvider.`);
  }
  return context;
};
