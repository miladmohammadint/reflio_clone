import { useRouter } from 'next/router';
import { useCompany } from '@/utils/CompanyContext';
import LoadingTile from '@/components/LoadingTile';
import { SEOMeta } from '@/templates/SEOMeta'; 

export default function InnerDashboardPage() {
  const router = useRouter();
  const { activeCompany } = useCompany();

  // Check if activeCompany exists and both stripe_account_data and stripe_id are not null
  const isReadyToShowDashboard = activeCompany && activeCompany.stripe_account_data !== null && activeCompany.stripe_id !== null;

  // If the activeCompany is not fully set up, show the loading tile without redirecting
  if (!isReadyToShowDashboard) {
    return (
      <>
        <SEOMeta title="Dashboard"/>
        <div className="pt-12 wrapper">
          <LoadingTile/>
        </div>
      </>
    );
  }
  
  // If the activeCompany is fully set up, return null to render nothing
  return null;
}