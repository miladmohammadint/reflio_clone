import { useRouter } from 'next/router';
import { useState, useEffect, createContext, useContext } from 'react';
import { getCompanies, useUser, newTeam, handleActiveCompany } from './useUser'; // Ensure these functions are correctly defined

export const CompanyContext = createContext();

export const CompanyContextProvider = (props) => {
  const { user, team, userFinderLoaded, signOut } = useUser();
  const [userCompanyDetails, setUserCompanyDetails] = useState(null);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const router = useRouter();
  let value;

  const fetchCompanyDetails = async () => {
    if (user) {
      try {
        const results = await getCompanies(user?.id);
        const companies = Array.isArray(results) ? results : [results];
        setUserCompanyDetails(companies);
        return companies;
      } catch (error) {
        console.error("Error fetching company details:", error);
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    if (userCompanyDetails === null) {
      fetchCompanyDetails();
    }
  }, [userCompanyDetails]);

  useEffect(() => {
    if (userCompanyDetails !== null && userCompanyDetails.length === 0 && !router.asPath.includes('add-company') && router.pathname !== '/dashboard/create-team') {
      if (team === 'none' && router.pathname !== '/dashboard/create-team' && creatingTeam === false) {
        setCreatingTeam(true);
        newTeam(user, { "team_name": "My team" }).then((result) => {
          router.replace('/dashboard/add-company');
        });
      }

      if (team?.team_id) {
        router.replace('/dashboard/add-company');
      }
    }

    if (userCompanyDetails !== null && userCompanyDetails.length > 0 && router.asPath === '/dashboard') {
      const activeCompany = userCompanyDetails.filter(company => company.active_company === true);
      if (activeCompany.length > 0) {
        router.replace('/dashboard/' + activeCompany[0].company_id);
      } else {
        router.replace('/dashboard/' + userCompanyDetails[0].company_id);
      }
    }
  }, [userCompanyDetails, team, router, creatingTeam]);

  let activeCompany = router.query?.companyId ?
    userCompanyDetails?.find(company => company?.company_id === router.query?.companyId) :
    userCompanyDetails?.find(company => company?.active_company === true) || userCompanyDetails?.[0];

  value = {
    activeCompany,
    userCompanyDetails,
    fetchCompanyDetails,
    switchCompany: async (companyId) => {
      if (!companyId) return false;

      return await handleActiveCompany(companyId).then((result) => {
        if (result === 'success') {
          router.replace(`/dashboard/${companyId}`);
          fetchCompanyDetails();
        }
      });
    }
  };

  return <CompanyContext.Provider value={value} {...props} />;
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error(`useCompany must be used within a CompanyContextProvider.`);
  }
  return context;
};
