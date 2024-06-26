import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCampaign } from '@/utils/CampaignContext';
import { useCompany } from '@/utils/CompanyContext';
import { useUser } from '@/utils/useUser';
import { newCampaign, editCampaign } from '@/utils/useUser';
import Button from '@/components/Button';
import LoadingDots from '@/components/LoadingDots';
import toast from 'react-hot-toast';

export const CampaignForm = ({ edit, setupMode, companyId }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rewardType, setRewardType] = useState('percentage');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const { activeCompany, fetchCompanyDetails } = useCompany();
  const { userDetails } = useUser();
  const { userCampaignDetails, fetchCampaignDetails } = useCampaign();

  useEffect(() => {
    if (!activeCompany) {
      fetchCompanyDetails()
        .then(() => setLoading(false))
        .catch((error) => {
          console.error('Error fetching activeCompany:', error);
          setLoading(false);
          toast.error('Failed to fetch activeCompany details.');
        });
    } else {
      setLoading(false);
    }
  }, [activeCompany, fetchCompanyDetails]);

  useEffect(() => {
    if (activeCompany) {
      fetchCampaignDetails(activeCompany.company_id)
        .catch((error) => {
          console.error('Error fetching campaign details:', error);
          toast.error('Failed to fetch campaign details.');
        });
    }
  }, [activeCompany, fetchCampaignDetails]);

  useEffect(() => {
    console.log("Active Company:", activeCompany);
    console.log("User Details:", userDetails);
    console.log("User Campaign Details:", userCampaignDetails);
  }, [activeCompany, userDetails, userCampaignDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted'); // Debugging statement

    if (loading) {
      return false;
    }

    const formData = new FormData(e.target);
    const data = {};

    for (let entry of formData.entries()) {
      data[entry[0]] = entry[1];
    }

    data.default_campaign = data.default_campaign === "on";
    console.log('Form data:', data); // Debugging statement

    setLoading(true);

    const campaignData = {
      ...data,
      company: activeCompany.company_id,
      user: userDetails.id,
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
          onSubmit={handleSubmit} // Ensure this is attached
        >
          <div className="px-6 pt-8 pb-12">
            <div className="space-y-8 divide-y divide-gray-200">
              <div>
                <div className="grid grid-3cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
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
                      <label htmlFor="commission_value" className="block text-sm font-medium text-gray-700">
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
                        <span className="min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-r-0 rounded-tr-none bg-gray-200 rounded-bl-none border-gray-300">
                          $
                        </span>
                        <input
                          minLength="1"
                          required
                          placeholder="20"
                          type="number"
                          name="commission_value"
                          id="commission_value"
                          defaultValue={edit?.commission_value ?? 20}
                          autoComplete="commission_value"
                          className="flex-1 block w-full min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-tl-none rounded-bl-none border-gray-300"
                        />
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-12">
                    <label htmlFor="campaign_description" className="block text-sm font-medium text-gray-700">
                      Campaign Description
                    </label>
                    <div className="mt-1">
                      <textarea
                        minLength="10"
                        required
                        name="campaign_description"
                        id="campaign_description"
                        rows="3"
                        defaultValue={edit ? edit.campaign_description : "Join our affiliate campaign and earn rewards for every referral!"}
                        className="block w-full shadow-sm p-3 focus:outline-none border-2 border-gray-300 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-12">
                    <label htmlFor="default_campaign" className="block text-sm font-medium text-gray-700">
                      Set as default campaign
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="checkbox"
                        name="default_campaign"
                        id="default_campaign"
                        defaultChecked={edit ? edit.default_campaign : false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-3 bg-gray-50 text-right">
            <Button
              type="submit" // Ensure this is of type submit
              loading={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? <LoadingDots /> : 'Save Campaign'}
            </Button>
          </div>
        </form>
      ) : (
        <LoadingDots />
      )}
    </div>
  );
};
