import { useRouter } from 'next/router';
import SetupProgress from '@/components/SetupProgress'; 
import Button from '@/components/Button'; 
import { SEOMeta } from '@/templates/SEOMeta'; 
import { manuallyVerifyDomain } from '@/utils/useUser';
import { useCompany } from '@/utils/CompanyContext';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function TrackingSetupPage() {
  const router = useRouter();
  const { activeCompany } = useCompany();
  const {width, height} = useWindowSize();

  const handleSkipDomainVerify = async () => {
    if (window.confirm('Are you sure you want to manually set this domain as verified? We always advise going through our standard verification process to ensure data is being properly received.')){
      const status = await manuallyVerifyDomain(activeCompany?.company_id);

      if(status === "success"){
        router.reload();
      } else {
        toast.error("There was an error when trying to continue. Please contact support.");
      }
    }
  };

  return (
    <div>
      <SEOMeta title="Verify Setup"/>
      <div className="py-12 border-b-4 border-gray-300">
        <div className="wrapper">
          <SetupProgress/>
        </div>
      </div>
      <div className="pt-12 mb-6">
        <div className="wrapper">
          <h1 className="text-2xl sm:text-3xl tracking-tight font-extrabold">Verify Setup</h1>
        </div>
      </div>
      <div className="wrapper">
        <div className="rounded-xl bg-white max-w-2xl overflow-hidden shadow-lg border-4 border-gray-300">
          <div className="p-6 bg-gray-200">
            {
              activeCompany?.domain_verified === true ?
                <div className="flex items-center">
                  <h2 className="text-lg font-semibold">Domain verified</h2>
                  <span className="h-2 w-2 bg-green-500 inline-block rounded-full ml-3 animate-pulse"></span>
                </div>
              :
                <div className="flex items-center">
                  <h2 className="text-lg font-semibold">Waiting for data</h2>
                  <span className="h-2 w-2 bg-red-500 inline-block rounded-full ml-3 animate-pulse"></span>
                </div>
            }
          </div>
          <div className="border-t-4 p-6 bg-white">
            <p className="text-xl leading-6 font-semibold text-gray-900">Website:</p>
            <p className="mb-4">{activeCompany?.company_url}</p>
            <a className="underline font-semibold" href={`/dashboard/${router?.query?.companyId}/settings`}>Edit Website URL</a>
          </div>
          <div className="border-t-4 p-6 bg-white flex items-center justify-start">
            {
              activeCompany?.domain_verified === true ?
                <Button
                  large
                  primary
                  href={`/dashboard/${router?.query?.companyId}/campaigns`}
                >
                  <span>Go to Campaigns</span>
                </Button>
              :
                <Button
                  large
                  primary
                  href={`http://${activeCompany?.company_url}?reflioVerify=true`}
                >
                  <span>Verify on website</span>
                </Button>
            }
          </div>
        </div>
        {
          activeCompany?.domain_verified === false &&
          <div className="mt-8">
            <button 
              className="text-gray-500 font-bold underline"
              onClick={e=>{handleSkipDomainVerify()}}
            >
              Manually verify domain
            </button>
          </div>
        }
      </div>
      {
        activeCompany?.domain_verified === true &&
        <div className="w-full h-full fixed top-0 left-0 z-10 pointer-events-none">
          <Confetti
            width={width}
            height={height}
          />
        </div>
      }
    </div>
  );
}