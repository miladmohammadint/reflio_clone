import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useCompany } from '@/utils/CompanyContext';
import LoadingTile from '@/components/LoadingTile';
import { SEOMeta } from '@/templates/SEOMeta';
import Button from '@/components/Button';
import { ArrowNarrowLeftIcon } from '@heroicons/react/outline';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import { priceString, generateInviteUrl } from '@/utils/helpers';
import { backendBaseUrl } from '../../../../../pages/api/user';

export default function SingleCampaignPage() {
  const router = useRouter();
  const { activeCompany } = useCompany();
  const [activeCampaign, setActiveCampaign] = useState(null);

  useEffect(() => {
    const { companyId, campaignId } = router.query;
    if (companyId && campaignId) {
      fetch(`${backendBaseUrl}/api/campaign-details/${companyId}/${campaignId}/`)
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            console.error(data.error);
            router.replace(`/dashboard/${companyId}/campaigns`);
          } else {
            setActiveCampaign(data);
          }
        })
        .catch(error => {
          console.error('Error fetching campaign details:', error);
          router.replace(`/dashboard/${companyId}/campaigns`);
        });
    }
  }, [router.query]);

  if (!activeCampaign) {
    return <LoadingTile />;
  }

  return (
    <>
      <SEOMeta title={activeCampaign.campaign_name} />
      <div>
        <div className="py-8 border-b-4">
          <div className="wrapper">
            <Button
              href={`/dashboard/${router.query.companyId}/campaigns`}
              small
              gray
            >
              <ArrowNarrowLeftIcon className="mr-2 w-6 h-auto" />
              <span>Back to campaigns</span>
            </Button>
          </div>
        </div>
        <div>
          <div className="py-12 border-b-4 bg-gray-100">
            <div className="wrapper">
              <div>
                <div className="flex flex-col items-start mb-6">
                  <div className="mb-3">
                    {activeCampaign.default_campaign && (
                      <div className="text-xs font-semibold mb-2 bg-gray-600 text-white inline-flex px-3 py-1.5 rounded-full">
                        Default Campaign
                      </div>
                    )}
                    <h1 className="text-2xl sm:text-3xl tracking-tight font-extrabold">
                      {activeCampaign.campaign_name}
                    </h1>
                  </div>
                  <div>
                    <Button
                      href={`/dashboard/${router.query.companyId}/campaigns/${router.query.campaignId}/edit`}
                      small
                      primary
                    >
                      <span>Edit campaign</span>
                    </Button>
                    <Button
                      className="ml-3"
                      href={`${backendBaseUrl}/dashboard/${router.query.companyId}/campaigns/${router.query.campaignId}/customize`}
                      small
                      secondary
                    >
                      <span>Customize campaign</span>
                    </Button>
                  </div>
                </div>
                <div className="mb-8">
                  <p className="text-lg font-semibold">
                    {activeCampaign.commission_type === 'percentage'
                      ? `${activeCampaign.commission_value}% commission on all paid referrals.`
                      : `${priceString(activeCampaign.commission_value, activeCompany.company_currency)} commission on all paid referrals.`}
                  </p>
                </div>
                <div>
                  <p className="mb-1">Affiliates can join your campaign using the link below:</p>
                  <CopyToClipboard
                    text={generateInviteUrl(activeCampaign.default_campaign, activeCompany.company_handle, activeCampaign.campaign_id)}
                    onCopy={() => toast.success('URL copied to clipboard')}
                  >
                    <input
                      type="text"
                      className="flex w-full max-w-lg cursor-pointer min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-gray-300 bg-white"
                      value={generateInviteUrl(activeCampaign.default_campaign, activeCompany.company_handle, activeCampaign.campaign_id)}
                    />
                  </CopyToClipboard>
                  <p className="mt-3">
                    If you'd prefer to manually invite your affiliates, you can invite them{' '}
                    <a className="font-semibold underline" href={`/dashboard/${router.query.companyId}/affiliates/invite`}>
                      here
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
