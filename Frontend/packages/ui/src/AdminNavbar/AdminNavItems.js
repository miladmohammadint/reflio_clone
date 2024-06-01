import { Fragment, useEffect } from 'react';
import { useUser } from '@/utils/useUser';
import { useRouter } from 'next/router';
import { classNames } from '@/utils/helpers';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import {
  CreditCardIcon,
  CogIcon,
  ClipboardCheckIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  CloudDownloadIcon,
  CollectionIcon,
  GiftIcon,
  BellIcon,
  BookOpenIcon,
  MapIcon,
  SupportIcon
} from '@heroicons/react/outline';
import Link from 'next/link';

export const AdminNavItems = () => {
  console.log('AdminNavItems component mounted');
  const { signOut, planDetails, activeCompany, userCompanyDetails, updateActiveCompany } = useUser();
  const router = useRouter();

  // Log userCompanyDetails to ensure it is populated
  useEffect(() => {
    console.log('userCompanyDetails:', userCompanyDetails);
  }, [userCompanyDetails]);

  const manageNavigation = [
    { name: 'Analytics', href: `/dashboard/${activeCompany?.company_id}/analytics`, icon: ChartBarIcon },
    { name: 'Campaigns', href: `/dashboard/${activeCompany?.company_id}/campaigns`, icon: CollectionIcon },
    { name: 'Affiliates', href: `/dashboard/${activeCompany?.company_id}/affiliates`, icon: UserGroupIcon },
    { name: 'Referrals', href: `/dashboard/${activeCompany?.company_id}/referrals`, icon: SparklesIcon },
    { name: 'Sales & Commissions', href: `/dashboard/${activeCompany?.company_id}/commissions`, icon: CurrencyDollarIcon },
    { name: 'Assets', href: `/dashboard/${activeCompany?.company_id}/assets`, icon: CloudDownloadIcon },
    { name: 'Company', href: `/dashboard/${activeCompany?.company_id}/settings`, icon: CogIcon }
  ];

  const settingsNavigation = [
    { name: 'Setup', href: `/dashboard/${activeCompany?.company_id}/setup`, icon: ClipboardCheckIcon },
    { name: 'Billing / Plans', href: `/dashboard/billing`, icon: CreditCardIcon }
  ];

  const navItemClass = 'flex items-center py-1 px-2 my-0.5 text-[15px] font-semibold rounded-lg hover:bg-gray-300';

  const handleCompanySwitch = async (companyId) => {
    if (!companyId) return false;

    const result = await updateActiveCompany(companyId);
    if (result === 'success') {
      router.replace(`/dashboard/${companyId}`);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered');
    if (typeof Canny !== 'undefined') {
      Canny('initChangelog', {
        appID: '63109013e111097776764cdd',
        position: 'bottom',
        align: 'left',
      });
    }
  }, []);

  return (
    <>
      <nav className="mt-6 flex-1 flex flex-col overflow-y-auto" aria-label="Sidebar">
        <div className="px-4 space-y-1 pb-3">
          <Listbox onChange={handleCompanySwitch} value={activeCompany?.company_id}>
            {({ open }) => (
              <>
                <div className="relative">
                  <Listbox.Button className="relative w-full bg-gray-200 border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default sm:text-sm">
                    <span className="flex items-center">
                      <span className="ml-3 block truncate">
                        {activeCompany ? activeCompany.company_name : 'No active company'}
                      </span>
                    </span>
                    <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>

                  <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {userCompanyDetails?.map((company) => (
                        <Listbox.Option
                          key={company.company_id}
                          className={({ active }) =>
                            classNames(
                              active ? 'text-white bg-primary-600' : 'text-gray-900',
                              'cursor-default select-none relative py-2 pl-3 pr-9'
                            )
                          }
                          value={company.company_id}
                        >
                          {({ selected, active }) => (
                            <>
                              <div className="flex items-center">
                                <span
                                  className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                >
                                  {company.company_name}
                                </span>
                              </div>

                              {selected ? (
                                <span
                                  className={classNames(
                                    active ? 'text-white' : 'text-primary-600',
                                    'absolute inset-y-0 right-0 flex items-center pr-4'
                                  )}
                                >
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                      <Link
                        passHref
                        href="/dashboard/add-company"
                        className="relative cursor-default select-none py-2 pl-3 pr-9 text-secondary-600 hover:text-secondary-800 hover:bg-gray-100"
                      >
                        + Add company
                      </Link>
                    </Listbox.Options>
                  </Transition>
                </div>
              </>
            )}
          </Listbox>
        </div>
        <div className="px-5 py-2">
          <p className="px-2 uppercase text-sm font-semibold text-gray-500 tracking-wide mb-2">Manage</p>
          {manageNavigation.map((item) => (
            <Link
              passHref
              key={item.name}
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                router?.asPath?.includes(item.href) && 'bg-gray-300',
                navItemClass
              )}
            >
              <item.icon className="mr-2 flex-shrink-0 h-5 w-5" aria-hidden="true" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
        <div className="px-5 py-2">
          <p className="px-2 uppercase text-sm font-semibold text-gray-500 tracking-wide mb-2">Settings</p>
          {settingsNavigation.map((item) => (
            <Link
              passHref
              key={item.name}
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                router?.asPath?.includes(item.href) && 'bg-gray-300',
                navItemClass
              )}
            >
              <item.icon className="mr-2 flex-shrink-0 h-5 w-5" aria-hidden="true" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
        <div className="px-5 py-2">
          <p className="px-2 uppercase text-sm font-semibold text-gray-500 tracking-wide mb-2">Resources</p>
          {
            planDetails === "free" &&
            <Link
              passHref
              href="/pricing"
              className={classNames(
                navItemClass,
                "text-secondary-2"
              )}
            >
              <GiftIcon className="mr-2 flex-shrink-0 h-5 w-5" aria-hidden="true" />
              <span>Upgrade</span>
            </Link>
          }
          {
            typeof Canny !== 'undefined' &&
            <button
              data-canny-changelog
              className={classNames(
                navItemClass,
                'w-full'
              )}
            >
              <div className="flex items-center">
                <BellIcon className="mr-2 flex-shrink-0 h-5 w-5" aria-hidden="true" />
                <span>What's New</span>
              </div>
            </button>
          }
          <Link
            passHref
            href="https://reflio.com/resources"
            className={classNames(
              navItemClass
            )}
            rel="noreferrer"
            target="_blank"
          >
            <BookOpenIcon className="mr-2 flex-shrink-0 h-5 w-5" aria-hidden="true" />
            <span>Docs & Guides</span>
          </Link>
          <Link
            passHref
            href="https://reflio.canny.io/"
            className={classNames(
              navItemClass
            )}
            rel="noreferrer"
            target="_blank"
          >
            <MapIcon className="mr-2 flex-shrink-0 h-5 w-5" aria-hidden="true" />
            <span>Roadmap</span>
          </Link>
          <Link
            passHref
            href="https://reflio.canny.io/feature-requests"
            className={classNames(
              navItemClass
            )}
            rel="noreferrer"
            target="_blank"
          >
            <SupportIcon className="mr-2 flex-shrink-0 h-5 w-5" aria-hidden="true" />
            <span>Give Feedback</span>
          </Link>
        </div>
        <div className="pt-3 mt-auto border-t-4 border-gray-300 sticky bottom-0 left-0 bg-gray-200">
          <div className="px-4 space-y-1">
            <button
              onClick={() => signOut()}
              className={'items-center px-2 py-2 text-md font-semibold rounded-md'}
            >
              Sign out
            </button>
            <a className="items-center px-2 py-2 text-md font-semibold rounded-md" href={process.env.NEXT_PUBLIC_AFFILIATE_SITE_URL} target="_blank" rel="noreferrer">Affiliate Dashboard</a>
          </div>
        </div>
      </nav>
    </>
  );
};

export default AdminNavItems;
