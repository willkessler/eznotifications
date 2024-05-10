// pages/_app.tsx
import Layout from '../app/layout.tsx';  // Adjust the path as necessary
import '../app/globals.css'; // Global styles
import { useState, useEffect } from 'react'

/*
import { Libre_Franklin } from 'next/font/google'
import { DM_Sans } from 'next/font/google'

const libre_franklin = Libre_Franklin({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-libre_franklin',
})
const dm_sans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm_sans',
})
*/

function Configurator({ Component, pageProps }) {
  const [isClient, setIsClient] = useState(false)
 
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <Layout>
      <Component {...pageProps} /> : 'nothing')
    </Layout>
  );
}

export default Configurator;
