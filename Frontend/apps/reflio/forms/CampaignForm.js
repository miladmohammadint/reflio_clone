import { useState, useEffect } from 'react';
import { editCampaign, newCampaign, useUser } from '@/utils/useUser';
import { useCompany } from '@/utils/CompanyContext';
import Button from '@/components/Button';
import LoadingDots from '@/components/LoadingDots';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import ReactTooltip from 'react-tooltip';

export const CampaignForm = ({ edit, setupMode, companyId }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Initially set loading to true
  const [rewardType, setRewardType] = useState('percentage');
  const [discountType, setDiscountType] = useState('percentage');
  const { activeCompany, fetchCompanyDetails } = useCompany(); // Fetch activeCompany details from context
  const { userDetails } = useUser();
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  useEffect(() => {
    if (!activeCompany) {
      fetchCompanyDetails()
        .then(() => setLoading(false))
        .catch((error) => {
          console.error('Error fetching activeCompany:', error);
          setLoading(false);
          toast.error('Failed to fetch activeCompany details.');
        });
    }
  }, [activeCompany, fetchCompanyDetails]);

  useEffect(() => {
    console.log("Active Company:", activeCompany);
    console.log("User Details:", userDetails);
  }, [activeCompany, userDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (loading) {
      return false;
    }
  
    const formData = new FormData(e.target);
    const data = {};
  
    for (let entry of formData.entries()) {
      data[entry[0]] = entry[1];
    }
  
    data.default_campaign = data.default_campaign === "on";
  
    setLoading(true);
  
    const campaignData = {
      ...data,
      company: activeCompany.company_id,
      user: userDetails.id, // Include user ID in the campaignData object
      team: userDetails.team_id,
    };
  
    try {
      const result = edit
        ? await editCampaign(userDetails, edit.campaign_id, campaignData)
        : await newCampaign(userDetails, campaignData, companyId);
  
      if (result === "success") {
        const redirectUrl = setupMode
          ? `/dashboard/${companyId}/setup/add`
          : `/dashboard/${companyId}/campaigns`;
        router.replace(redirectUrl);
      } else {
        toast.error('There was an error when creating your campaign, please try again later.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingDots />;
  }

  return (
    <div>
      {activeCompany?.company_name ? (
        <form
          className="rounded-xl bg-white max-w-2xl overflow-hidden shadow-lg border-4 border-gray-300"
          action="#"
          method="POST"
          onSubmit={handleSubmit}
        >
          <div className="px-6 pt-8 pb-12">
            <div className="space-y-8 divide-y divide-gray-200">
              <div>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-12">
                    <label
                      data-tip="The name of your campaign"
                      htmlFor="campaign_name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Campaign Name
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        minLength="2"
                        required
                        defaultValue={edit ? edit.campaign_name : `${activeCompany.company_name}'s Affiliate Campaign`}
                        type="text"
                        name="campaign_name"
                        id="campaign_name"
                        autoComplete="campaign_name"
                        className="flex-1 block w-full min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-12">
                    <label
                      data-tip="The type of reward you want to give to your affiliate for each successful referral"
                      htmlFor="commission_type"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Reward type
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <select
                        defaultValue={rewardType}
                        onChange={(e) => setRewardType(e.target.value)}
                        className="rounded-xl border-2 border-gray-300 outline-none p-4 w-full"
                        required
                        name="commission_type"
                        id="commission_type"
                      >
                        <option value="percentage">Percentage of sale</option>
                        <option value="fixed">Fixed amount</option>
                      </select>
                    </div>
                  </div>

                  {rewardType === 'percentage' && (
                    <div className="sm:col-span-12">
                      <label htmlFor="commission_value" className="block text-sm font-medium
                      text-gray-700">
                      Commission percentage
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm items-center justify-between">
                      <input
                        minLength="1"
                        maxLength="100"
                        required
                        placeholder="20"
                        type="number"
                        name="commission_value"
                        id="commission_value"
                        defaultValue={edit?.commission_value ?? 20}
                        autoComplete="commission_value"
                        className="flex-1 block w-full min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-r-0 rounded-tr-none rounded-br-none border-gray-300"
                      />
                      <span className="min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 rounded-tl-none bg-gray-200 rounded-bl-none border-gray-300">
                        %
                      </span>
                    </div>
                  </div>
                )}

                {rewardType === 'fixed' && (
                  <div className="sm:col-span-12">
                    <label htmlFor="commission_value" className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm items-center justify-between">
                      <span className="min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-r-0 rounded-tr-none bg-gray-200 rounded-br-none border-gray-300">
                        {activeCompany?.company_currency}
                      </span>
                      <input
                        minLength="1"
                        maxLength="100"
                        required
                        placeholder="1"
                        type="number"
                        name="commission_value"
                        id="commission_value"
                        defaultValue={edit?.commission_value ?? 20}
                        autoComplete="commission_value"
                        className="flex-1 block w-full min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-r-0 rounded-tl-none rounded-bl-none border-gray-300"
                      />
                    </div>
                  </div>
                )}

                {showAdvancedOptions && (
                  <>
                    <div className="sm:col-span-12">
                      <label htmlFor="cookie_window" className="block text-sm font-medium text-gray-700">
                        Cookie window
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm items-center justify-between">
                        <input
                          minLength="1"
                          maxLength="100"
                          required
                          type="number"
                          name="cookie_window"
                          id="cookie_window"
                          defaultValue={edit?.cookie_window ?? 60}
                          className="flex-1 block w-full min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-r-0 rounded-tr-none rounded-br-none border-gray-300"
                        />
                        <span className="min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 rounded-tl-none bg-gray-200 rounded-bl-none border-gray-300">
                          days
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-12">
                      <label htmlFor="commission_period" className="block text-sm font-medium text-gray-700">
                        Commission period
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm items-center justify-between">
                        <input
                          minLength="1"
                          maxLength="100"
                          required
                          type="number"
                          name="commission_period"
                          id="commission_period"
                          defaultValue={edit?.commission_period ?? 30}
                          className="flex-1 block w-full min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-r-0 rounded-tr-none rounded-br-none border-gray-300"
                        />
                        <span className="min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 rounded-tl-none bg-gray-200 rounded-bl-none border-gray-300">
                          days
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="sm:col-span-12">
                  <div className="flex items-center">
                    <input
                      id="default_campaign"
                      name="default_campaign"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      defaultChecked={edit?.default_campaign ?? true}
                    />
                    <label htmlFor="default_campaign" className="ml-3 block text-sm font-medium text-gray-700">
                      Set as default campaign
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-6">
            <div className="flex justify-end">
              <Button type="submit" className="inline-flex">
                {loading ? <LoadingDots /> : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    ) : (
      <div>Loading...</div>
    )}
  </div>
);
};
