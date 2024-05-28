import { useState, useEffect, createContext, useContext } from 'react';
import { getCampaigns, useUser } from './useUser';
import { useCompany } from './CompanyContext';
import { useRouter } from 'next/router';

export const CampaignContext = createContext();

export const CampaignContextProvider = (props) => {
  const { userFinderLoaded } = useUser();
  const { activeCompany } = useCompany();
  const [userCampaignDetails, setUserCampaignDetails] = useState([]);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const router = useRouter();

  const fetchCampaignDetails = async (companyId) => {
    try {
      const results = await getCampaigns(companyId);
      const campaigns = Array.isArray(results) ? results : [results];
      console.log('Fetched campaigns:', campaigns);
      setUserCampaignDetails(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  useEffect(() => {
    if (userFinderLoaded && activeCompany?.company_id) {
      fetchCampaignDetails(activeCompany.company_id);
    }
  }, [userFinderLoaded, activeCompany]);

  useEffect(() => {
    const newActiveCampaign = userCampaignDetails.find(campaign => campaign.campaign_id === router.query.campaignId);
    setActiveCampaign(newActiveCampaign || null);
  }, [router.query.campaignId, userCampaignDetails]);

  const value = {
    activeCampaign,
    userCampaignDetails,
    fetchCampaignDetails, // Expose fetchCampaignDetails here
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
