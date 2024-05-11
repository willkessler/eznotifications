import Image from "next/image";
import Link from "next/link"
import { useEffect, useState } from 'react';
import { TargetInsertType, SDKConfiguration } from '../vanillajs/src/types';

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/OU8t1Qfz3yx
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

export default function Bank() {

  const defaultConfiguration:SDKConfiguration = 
    {
      api: {
        displayMode : 'inline',
        userId: undefined, // will be set later by either the user or autoset
        key: '',
        endpoint: 'https://api.this-is-not-a-drill.com',
        environments: [ 'Development' ],
        domains: [],
      },
      inline: {
        targetClassname: '',
        targetPlacement: 'target-inside' as TargetInsertType,
        customControlClasses: {
          content: 'my-content',
          confirm: 'my-confirm',
          dismiss: 'my-dismiss',
        },
      },
      toast: {
        position: 'bottom-end',
        duration: 5000,
      },
      banner: {
        duration: 5000,
      },
      modal: {
        confirmButtonLabel: 'OK',
      }
    };

  const [sdkConfig, setSdkConfig] = useState<Object>(defaultConfiguration);
  const handlePostMessage = (event:MessageEvent) => {
    if (event.origin !== window.location.origin) {
      return; // ignore unknown origin messages
    }

    if (event.data?.startsWith('RELOAD_SDK:')) {
      const updatedSdkConfigStr = event.data.replace('RELOAD_SDK:', '');
      const updatedSdkConfig = JSON.parse(updatedSdkConfigStr);
      setSdkConfig(prevData => ({
        ...prevData,
        ...updatedSdkConfig,
      }));
    }
  }

  useEffect(() => {
    window.addEventListener('message', handlePostMessage);
    return () => {
      window.removeEventListener('message', handlePostMessage); // remove postMessage listener on component unmount
    }
  }, []);

  useEffect(() => {
      console.log('Latest bank side SDK config:', sdkConfig);
  }, [sdkConfig]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-7">
      <div className="flex flex-col">
        <header className="bg-gray-900 text-white p-4 md:p-6">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold">Commercial Savings and Loan</h1>
            <div className="hidden md:block">
            </div>
          </div>
        </header>
        <div className="flex-1 bg-gray-100 p-6 md:p-8 md:flex">
          <div className="hidden md:block md:w-32 md:mr-8">
            <nav className="space-y-5 flex-1">
              <a className="flex items-center hover:bg-gray-200 rounded-md p-2" href="#">
                <HomeIcon className="h-5 w-5 mr-2" />
                <span>Home</span>
              </a>
              <a className="flex items-center hover:bg-gray-200 rounded-md p-2" href="#">
                <WalletIcon className="h-5 w-5 mr-2" />
                <span>Accounts</span>
              </a>
              <a className="flex items-center hover:bg-gray-200 rounded-md p-2" href="#">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                <span>Payments</span>
              </a>
              <a className="flex items-center hover:bg-gray-200 rounded-md p-2" href="#">
                <BarChartIcon className="h-5 w-5 mr-2" />
                <span>Reporting</span>
              </a>
              <a className="flex items-center hover:bg-gray-200 rounded-md p-2" href="#">
                <SettingsIcon className="h-5 w-5 mr-2" />
                <span>Settings</span>
              </a>
            </nav>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold">Welcome to Commercial Savings & Loan!</h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 min-w-min">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Checking Account</h2>
                  <ChevronRightIcon className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-gray-500 mb-4">
                  Access your checking account, view transactions, and manage your money.
                </p>
                <Link className="text-blue-500 hover:underline" href="#">
                  View Checking Account
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 min-w-min">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Savings Account</h2>
                  <ChevronRightIcon className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-gray-500 mb-4">Grow your money with a high-yield savings account.</p>
                <Link className="text-blue-500 hover:underline" href="#">
                  View Savings Account
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 min-w-min">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Statements</h2>
                  <ChevronRightIcon className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-gray-500 mb-4">Access your account statements and transaction history.</p>
                <Link className="text-blue-500 hover:underline" href="#">
                  View Statements
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function BarChartIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  )
}


function ChevronRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}


function CreditCardIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}


function HomeIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}


function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}


function SettingsIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}


function WalletIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  )
}
