import { useEffect, useState } from 'react';
//import Image from "next/image";
import Link from "next/link"
import { Anchor, Image } from '@mantine/core';
import { TargetInsertType, SDKConfiguration } from '../lib/types';
import '../../public/bank.css'; // note that the bank css file is now in the public dir so we can fetch and store in Ace editor

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/OU8t1Qfz3yx
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

export default function Bank() {

  const [ isMounted, setIsMounted ] = useState(false);
  
  const initialConfiguration: SDKConfiguration =
    {
      api: {
        displayMode: 'toast',
        key: (process.env.NEXT_PUBLIC_TINAD_API_KEY ? process.env.NEXT_PUBLIC_TINAD_API_KEY : 'defaultkey'),
        endpoint: (process.env.NEXT_PUBLIC_TINAD_API_BASEURL ? process.env.NEXT_PUBLIC_TINAD_API_BASEURL : 'https://demo-api.this-is-not-a-drill.com'),
        environments: [ 'Development' ],
        domains: [],
      },
      toast: {
        position: 'top-right',
        duration: 5000,
        progressBar: false,
        useCustomClasses: false,
      },
      modal: {
        confirmButtonLabel: 'OK',
        useCustomClasses: false,
        show: {
          confirm: true,
          dismiss: true,
        },
      },
      inline: {
        target: {
          useDefaults: true,
        },
        show: {
          confirm: true,
          dismiss: true,
        },
      },
      banner: {
        duration: 5000,
        target: {
          useDefaults: true,
        },
        show: {
          dismiss: true,
        },
      },
    };


  const handlePostMessage = async (event:MessageEvent) => {
    if (event.origin !== window.location.origin) {
      return; // ignore unknown origin messages
    }

    if (event.data && typeof(event.data) === 'string') {
      const receivedMessage = JSON.parse(event.data);
      if (receivedMessage.name === 'updateCss') {
        const newCss = receivedMessage.css;
        const previousStyle = document.getElementById('tinad-custom-styles');
        if (previousStyle) {
          previousStyle.remove();
        }

        // insert my custom stylesheet after all existing stylesheets
        const head = document.head;
        const stylesheets = head.querySelectorAll('style, link[rel="stylesheet"]');
        const newStyle = document.createElement('style');
        newStyle.id='tinad-custom-styles';
        newStyle.textContent = newCss;

        if (stylesheets.length > 0) {
          const lastStylesheet = stylesheets[stylesheets.length - 1];
          lastStylesheet.insertAdjacentElement('afterend', newStyle);
        } else {
          head.appendChild(newStyle); // Fallback if no stylesheets are found
        }
      }
    }
  }
  

  useEffect(() => {
    setIsMounted(true);
    window.addEventListener("message", handlePostMessage);  // listen for post messages from the configurator
    window.parent.postMessage('tinad-iframe-ready', '*'); // tell parent that we're ready to process msgs
    return () => {
      window.removeEventListener('message', handlePostMessage);
    };
  }, []);
  

  return (
    <main id="gradient-wrapper" className="flex min-h-screen flex-col items-center justify-between p-7" >
      <div className="flex flex-col w-full">
        <header className="bg-gray-900 text-white p-4 md:p-6 w-full">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold">Commercial Savings and Loan</h1>
            <div className="my-inline-container-2">
              <div className="my-content"></div>
              <button className="my-confirm">OK</button>
              <div className="my-dismiss">x</div>
            </div>
            <div className="hidden md:block">
              <Anchor href="https://this-is-not-a-drill.com" target="_blank" >
                <Image src="/ThisIsNotADrill_cutout.png" w={50} alt="This Is Not A Drill! Logo" className="w-12 h-auto" />
              </Anchor>              
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
            <div className="flex flex-col items-left justify-between mb-3">
              <h1 className="text-2xl font-bold">Welcome to Commercial Savings & Loan!</h1>
              { isMounted && 
                <>
                <div className="tinad-inline-container">
                  <div className="tinad-inline-content"></div>
                  <button className="tinad-inline-confirm">OK</button>
                  <div className="tinad-inline-dismiss">x</div>
                </div>
                <div className="my-inline-container-1">
                  <div className="my-content"></div>
                  <button className="my-confirm">OK</button>
                  <div className="my-dismiss">x</div>
                </div>
                </>
              }
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
        <div className="my-inline-container-3">
          <div className="my-content"></div>
          <button className="my-confirm">OK</button>
          <div className="my-dismiss">x</div>
        </div>
      </div>
      <div id="tinad-script-container">
        <script
          defer
          id="tinad-sdk"
          src={process.env.NEXT_PUBLIC_TINAD_SOURCE_SCRIPT_URL}
          tinad-configuration={JSON.stringify(initialConfiguration,null,2)}
        >
        </script>
      </div>
    </main>
  )
}

function BarChartIcon(props:any) {
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


function ChevronRightIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}


function CreditCardIcon(props:any) {
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


function HomeIcon(props:any) {
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


function MenuIcon(props:any) {
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


function SettingsIcon(props:any) {
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


function WalletIcon(props:any) {
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
