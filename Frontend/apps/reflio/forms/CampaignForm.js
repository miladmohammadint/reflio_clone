import { useState } from 'react';
import { editCampaign, newCampaign, useUser } from '@/utils/useUser';
import { useCompany } from '@/utils/CompanyContext';
import Button from '@/components/Button';
import LoadingDots from '@/components/LoadingDots';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import ReactTooltip from 'react-tooltip';

export const CampaignForm = ({ edit, setupMode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rewardType, setRewardType] = useState('percentage');
  const [discountType, setDiscountType] = useState('percentage');
  const { activeCompany } = useCompany();
  const { userDetails } = useUser();
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(loading === true){
      return false;
    }

    const formData = new FormData(e.target);
    const data = {};
 
    for (let entry of formData.entries()) {
      data[entry[0]] = entry[1];
    }

    if(data?.default_campaign === "on"){
      data.default_campaign = true;
    } else {
      data.default_campaign = false;
    }

    setLoading(true);

    if(edit){
      await editCampaign(userDetails, edit?.campaign_id, data).then((result) => {
        if(result === "success"){
          router.replace(`/dashboard/${router?.query?.companyId}/campaigns/${edit?.campaign_id}`)
        } else {
          toast.error('There was an error when creating your campaign, please try again later.');
        }
  
        setLoading(false);
      });

    } else {

      await newCampaign(userDetails, data, router?.query?.companyId).then((result) => {
        if(result === "success"){
          if(setupMode){
            router.replace(`/dashboard/${router?.query?.companyId}/setup/add`)
          } else {
            router.replace(`/dashboard/${router?.query?.companyId}/campaigns`)
          }
        } else {
          toast.error('There was an error when creating your campaign, please try again later.');
        }
  
        setLoading(false);
      });

    }
  };

  if(edit && edit?.commission_type !== null && edit?.commission_type !== rewardType){
    setRewardType(edit?.commission_type);
  }

  if(edit && edit?.discount_type !== null && edit?.discount_type !== discountType){
    setDiscountType(edit?.discount_type);
  }

  return(
    <div>
      {
        activeCompany?.company_name ?
          <form className="rounded-xl bg-white max-w-2xl overflow-hidden shadow-lg border-4 border-gray-300" action="#" method="POST" onSubmit={handleSubmit}>
            <div className="px-6 pt-8 pb-12">
              <div className="space-y-8 divide-y divide-gray-200">
                <div>
                  <div>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-12">
                        <label data-tip="The name of your campaign" htmlFor="campaign_name" className="block text-sm font-medium text-gray-700">
                          Campaign Name
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <input
                            minLength="2"
                            required
                            defaultValue={edit ? edit?.campaign_name : `${activeCompany?.company_name}'s Affiliate Campaign`}
                            type="text"
                            name="campaign_name"
                            id="campaign_name"
                            autoComplete="campaign_name"
                            className="flex-1 block w-full min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-12">
                        <label data-tip="The type of reward you want to give to your affiliate for each successful referral" htmlFor="commission_type" className="block text-sm font-medium text-gray-700">
                          Reward type
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <select defaultValue={rewardType ? rewardType : edit && edit?.commission_type} onChange={e=>{setRewardType(e.target.value)}} className="rounded-xl border-2 border-gray-300 outline-none p-4 w-full" required="required" name="commission_type" id="commission_type">
                            <option value="percentage">Percentage of sale</option>
                            <option value="fixed">Fixed amount</option>
                          </select>
                        </div>
                      </div>

                      {
                        rewardType === 'percentage' &&
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
                              defaultValue={edit?.commission_value ?  edit?.commission_value : 20}
                              autoComplete="commission_value"
                              className="flex-1 block w-full min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-r-0 rounded-tr-none rounded-br-none border-gray-300"
                            />
                            <span className="min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 rounded-tl-none bg-gray-200 rounded-bl-none border-gray-300">%</span>
                          </div>
                        </div>
                      }

                      {
                        rewardType === 'fixed' &&
                        <div className="sm:col-span-12">
                          <label htmlFor="commission_value" className="block text-sm font-medium text-gray-700">
                            Amount
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm items-center justify-between">
                            <span className="min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-r-0 rounded-tr-none bg-gray-200 rounded-br-none border-gray-300">{activeCompany?.company_currency}</span>
                            <input
                              minLength="1"
                              maxLength="100"
                              required
                              placeholder="1"
                              type="number"
                              name="commission_value"
                              id="commission_value"
                              defaultValue={edit?.commission_value ?  edit?.commission_value : 20}
                              autoComplete="commission_value"
                              className="flex-1 block w-full min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 bor border-r-0 rounded-tl-none rounded-bl-none border-gray-300"
                            />
                          </div>
                        </div>
                      }

                      {
                        showAdvancedOptions &&
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
                                  defaultValue={edit?.cookie_window ? edit?.cookie_window : 60}
                                  className="flex-1 block w-full min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-r-0 rounded-tr-none rounded-br-none border-gray-300"
                                />
                                <span className="min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 rounded-tl-none bg-gray-200 rounded-bl-none border-gray-300">days</span>
                              </div>
                            </div>
                            <div className="sm:col-span-12">
                              <label htmlFor="commission_period" className="block text-sm font-medium text-gray-700">
                                Commission period
                              </label>
                              <div className="mt-1 flex rounded-md shadow-sm items-center justify-between">
                                <input
                                  minLength="1"
                                  maxLength="240"
                                  required
                                  placeholder="12"
                                  type="number"
                                  name="commission_period"
                                  id="commission_period"
                                  defaultValue={edit && edit?.commission_period}
                                  className="flex-1 block w-full min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-r-0 rounded-tr-none rounded-br-none border-gray-300"
                                />
                                <span className="min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 rounded-tl-none bg-gray-200 rounded-bl-none border-gray-300">months after the first sale</span>
                              </div>
                            </div>
                            <div className="sm:col-span-12">
                              <label htmlFor="minimum_days_payout" className="block text-sm font-medium text-gray-700">
                                Minimum days until payout
                              </label>
                              <div className="mt-1 flex rounded-md shadow-sm items-center justify-between">
                                <input
                                  minLength="1"
                                  maxLength="240"
                                  required
                                  placeholder="30"
                                  type="number"
                                  name="minimum_days_payout"
                                  id="minimum_days_payout"
                                  defaultValue={edit && edit?.minimum_days_payout}
                                  className="flex-1 block w-full min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-r-0 rounded-tr-none rounded-br-none border-gray-300"
                                />
                                <span className="min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 rounded-tl-none bg-gray-200 rounded-bl-none border-gray-300">days</span>
                              </div>
                            </div>
                            <div className="sm:col-span-12">
                              <label data-tip="Your discount type" htmlFor="discount_type" className="block text-sm font-medium text-gray-700">
                                Discount type
                              </label>
                              <div className="mt-1 flex rounded-md shadow-sm">
                                <select defaultValue={discountType ? discountType : edit && edit?.discount_type} onChange={e=>{setDiscountType(e.target.value)}} className="rounded-xl border-2 border-gray-300 outline-none p-4 w-full" required="required" name="discount_type" id="discount_type">
                                  <option value="percentage">Percentage off</option>
                                  <option value="fixed">Fixed amount off</option>
                                </select>
                              </div>
                            </div>

                            {
                              discountType === 'percentage' &&
                              <div className="sm:col-span-12">
                                <label htmlFor="discount_value" className="block text-sm font-medium text-gray-700">
                                  Discount percentage
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm items-center justify-between">
                                  <input
                                    minLength="1"
                                    maxLength="100"
                                    required
                                    placeholder="20"
                                    type="number"
                                    name="discount_value"
                                    id="discount_value"
                                    defaultValue={edit?.discount_value ? edit?.discount_value : 20}
                                    autoComplete="discount_value"
                                    className="flex-1 block w-full min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-r-0 rounded-tr-none rounded-br-none border-gray-300"
                                  />
                                  <span className="min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 rounded-tl-none bg-gray-200 rounded-bl-none border-gray-300">%</span>
                                </div>
                              </div>
                            }

                            {
                              discountType === 'fixed' &&
                              <div className="sm:col-span-12">
                                <label htmlFor="discount_value" className="block text-sm font-medium text-gray-700">
                                  Amount
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm items-center justify-between">
                                  <span className="min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-r-0 rounded-tr-none bg-gray-200 rounded-br-none border-gray-300">{activeCompany?.company_currency}</span>
                                  <input
                                    minLength="1"
                                    maxLength="100"
                                    required
                                    placeholder="1"
                                    type="number"
                                    name="discount_value"
                                    id="discount_value"
                                    defaultValue={edit?.discount_value ? edit?.discount_value : 1}
                                    autoComplete="discount_value"
                                    className="flex-1 block w-full min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 bor border-r-0 rounded-tl-none rounded-bl-none border-gray-300"
                                  />
                                </div>
                              </div>
                            }

                            <div className="sm:col-span-12">
                              <label htmlFor="minimum_purchase_amount" className="block text-sm font-medium text-gray-700">
                                Minimum purchase amount
                              </label>
                              <div className="mt-1 flex rounded-md shadow-sm items-center justify-between">
                                <span className="min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-r-0 rounded-tr-none bg-gray-200 rounded-br-none border-gray-300">{activeCompany?.company_currency}</span>
                                <input
                                  minLength="1"
                                  maxLength="240"
                                  required
                                  placeholder="100"
                                  type="number"
                                  name="minimum_purchase_amount"
                                  id="minimum_purchase_amount"
                                  defaultValue={edit && edit?.minimum_purchase_amount}
                                  className="flex-1 block w-full min-w-0 p-3 rounded-xl focus:outline-none sm:text-md border-2 border-r-0 rounded-tl-none rounded-bl-none border-gray-300"
                                />
                              </div>
                            </div>
                          </>
                      }

                      <div className="sm:col-span-12">
                        <label htmlFor="default_campaign" className="flex items-center h-5">
                          <input
                            id="default_campaign"
                            name="default_campaign"
                            type="checkbox"
                            defaultChecked={edit?.default_campaign}
                            className="focus:ring-gray-500 h-4 w-4 text-gray-600 border-gray-300 rounded mr-2"
                          />
                          <span className="block text-sm font-medium text-gray-700">Make this the default campaign for all of your new customers</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-5">
                <div className="flex flex-col justify-between md:flex-row">
                  <Button
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  >
                    {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
                  </Button>
                  <Button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    {loading ? <LoadingDots /> : edit ? 'Update Campaign' : 'Create Campaign'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        :
        <div className="py-4 text-gray-700 text-center">
          <LoadingDots />
        </div>
      }
      <ReactTooltip place="top" effect="solid" />
    </div>
  )
}
