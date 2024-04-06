import Link from 'next/link';
import { Fragment, useState } from 'react';
import { MenuAlt1Icon, XIcon } from '@heroicons/react/outline';
import { AffiliateLogo } from '@/components/Icons/AffiliateLogo';
import { Dialog, Transition } from '@headlessui/react';
import { AdminNavItems } from '@/templates/AdminNavbar/AdminNavItems';
import { VercelLogo } from '../VercelLogo';

export const AdminMobileNav = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          static
          className="fixed inset-0 z-50 flex lg:hidden"
          open={sidebarOpen}
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-gradient-to-b from-white to-gray-200 pt-5 pb-4">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex flex-shrink-0 items-center px-4">
                <Link href="/dashboard" className="m-auto block">
                  <VercelLogo size={100} />
                </Link>
              </div>
              <AdminNavItems />
            </div>
          </Transition.Child>
          <div className="w-14 flex-shrink-0" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      <div className="to-gray-5 relative z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-gradient-to-b from-white lg:hidden lg:border-none">
        <button
          className="border-r border-gray-200 px-4 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <MenuAlt1Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex w-full justify-center px-6 lg:justify-end">
          <div className="flex flex-shrink-0 items-center px-4 lg:hidden">
            <Link href="/dashboard" className="m-auto block">
              <VercelLogo size={120} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminMobileNav;
