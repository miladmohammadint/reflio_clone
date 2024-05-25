import { Fragment, useEffect } from 'react';
import { useUser, handleActiveCompany } from '@/utils/useUser';
import { useRouter } from 'next/router';
import { classNames } from '@/utils/helpers';
import { useCompany } from '@/utils/CompanyContext';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import {
  CreditCardIcon,
  TemplateIcon,
  CogIcon,
  ClipboardCheckIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
  ChatAltIcon,
  BookOpenIcon,
  MapIcon,
  SupportIcon,
  CurrencyDollarIcon,
  BellIcon,
  GiftIcon,
  CollectionIcon,
  ChipIcon,
  CloudDownloadIcon
} from '@heroicons/react/outline';
import Link from 'next/link';

export const AdminNavItems = () => {
  console.log('AdminNavItems component mounted');
  const { signOut, planDetails } = useUser();
  const { activeCompany, userCompanyDetails } = useCompany();
  const router = useRouter();
  console.log("User Company Details:", userCompanyDetails);
  


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

    await handleActiveCompany(companyId).then((result) => {
      if (result === "success") {
        router.replace(`/dashboard/${companyId}`);
      }
    });
  };

  useEffect(() => {
    console.log('useEffect triggered');
    console.log("userCompanyDetails:", userCompanyDetails);
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
          <Listbox onChange={value => { handleCompanySwitch(value) }} value={activeCompany?.company_id}>
            {({ open }) => (
              <>
                <div className="relative">
                  <Listbox.Button className="relative w-full bg-white rounded-xl font-semibold pl-3 pr-10 py-3 flex text-left cursor-pointer focus:outline-none sm:text-sm border-2 border-gray-300">
                    <span className="relative w-5 h-5 rounded-full flex items-center mr-2">
                      {activeCompany?.company_url &&
                        <img
                          className="w-full h-full object-fit-contain"
                          src={'https://s2.googleusercontent.com/s2/favicons?domain=' + activeCompany?.company_url}
                          alt={`${activeCompany?.company_name} Image`}
                        />
                      }
                    </span>
                    <span className="flex items-center truncate">
                      {activeCompany?.company_name}
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <SelectorIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </Listbox.Button>

                  <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options
                      static
                      className="top-0 left-0 absolute rounded-lg z-20 w-full bg-white max-h-60 text-base overflow-auto focus:outline-none sm:text-sm border-4 border-primary-2 shadow-xl shadow-secondary"
                    >
                      {userCompanyDetails?.map((company) => (
                        <Listbox.Option
                          key={company?.company_id}
                          className={({ selected, active }) =>
                            classNames(
                              selected && 'bg-primary',
                              'cursor-pointer select-none relative py-3 px-5 border-b-2'
                            )
                          }
                          value={company?.company_id}
                        >
                          {({ selected, active }) => (
                            <>
                              <div className="flex">
                                <span className={classNames(selected ? 'font-bold' : 'font-medium', 'flex items-center truncate pl-4')}>
                                  {company?.company_name}
                                </span>
                              </div>

                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
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
                        className="block bg-gray-200 cursor-pointer select-none font-semibold relative py-3 px-5 -mt-1"
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
          {planDetails === "free" &&
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
          {typeof Canny !== 'undefined' &&
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
