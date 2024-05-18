"use client";

// This is the root layout component for your Next.js app.
// Learn more: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required

import type { Metadata } from "next";
import "./globals.css";
import { ConfigurationContextProvider } from '../lib/configuratorContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConfigurationContextProvider>
      <div>
        {children}
      </div>
    </ConfigurationContextProvider>
  )
}
