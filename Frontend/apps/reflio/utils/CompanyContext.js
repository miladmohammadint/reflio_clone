import { useRouter } from 'next/router';
import { useState, useEffect, createContext, useContext } from 'react';
import { getCompanies, useUser, newTeam, handleActiveCompany } from './useUser'; // Ensure these functions are correctly defined

export const CompanyContext = createContext();

export const CompanyContextProvider = (props) => {
  const { user, team, userFinderLoaded, signOut } = useUser();
  const [userCompanyDetails, setUserCompanyDetails] = useState([]);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const router = useRouter();
  const [activeCompany, setActiveCompany] = useState(null);

  const fetchCompanyDetails = async () => {
    if (user) {
      try {
        const results = await getCompanies(user.id);
        const companies = Array.isArray(results) ? results : [results];
        console.log('Fetched Company Details:', companies);  // Log fetched company details
        setUserCompanyDetails(companies);
        // Determine the active company here after fetching
        determineActiveCompany(companies);
        return companies;
      } catch (error) {
        console.error("Error fetching company details:", error);
        return [];
      }
    }
    return [];
  };

  const determineActiveCompany = (companies) => {
    if (companies.length > 0) {
      const activeCompany = router.query.companyId
        ? companies.find(company => company.company_id === router.query.companyId)
        : companies.find(company => company.active_company === true) || companies[0];
      setActiveCompany(activeCompany);
      console.log('Determined Active Company:', activeCompany);  // Log active company
    } else {
      setActiveCompany(null);
    }
  };

  useEffect(() => {
    if (userCompanyDetails.length === 0) {
      fetchCompanyDetails();
    }
  }, [user]);

  useEffect(() => {
    if (userCompanyDetails.length > 0) {
      determineActiveCompany(userCompanyDetails);
    }
  }, [userCompanyDetails, router.query.companyId]);

  useEffect(() => {
    if (userCompanyDetails.length === 0 && !router.asPath.includes('add-company') && router.pathname !== '/dashboard/create-team') {
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

    if (userCompanyDetails.length > 0 && router.asPath === '/dashboard') {
      const activeCompany = userCompanyDetails.find(company => company.active_company === true) || userCompanyDetails[0];
      router.replace('/dashboard/' + activeCompany.company_id);
    }
  }, [userCompanyDetails, team, router, creatingTeam]);

  const value = {
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
