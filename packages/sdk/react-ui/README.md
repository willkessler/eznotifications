# This is Not A Drill! Client SDKs -- UI Component

<img src="./packages/dashboard/public/ThisIsNotADrill_cutout.png" width="250" height="250">

## Purpose

The React-UI SDK provides a drop-in React component for adding This Is
Not A Drill! (TINAD) to your site.

(Separately, the core SDK (react-core) for TINAD is used to poll the
TINAD service for notifications to show your users.)

If you are developing a BFF or mobile application, see the API docs
for more detailed information on how to connect with the API directly,
without the use of this SDK.

## Installation Guide for Using the TINAD SDK

Normally, you'll want to use the version of the SDK in the npm repo. 

``` javascript
npm install @this-is-not-a-drill/react-core @this-is-not-a-drill/react-ui
```

Then, you can import the core and the UI SDK into your React project like so:

``` javascript
import { initTinadSDK } from '@thisisnotadrill/react-core';
import { TinadComponent, TinadTemplateProps } from '@thisisnotadrill/react-ui';
```


## Installation Guide for Using a Local copy of the SDKs (Less Common)

If you're developing against the SDK, you may wish to use it locally via this monorepo.

First, run `yarn` at the top level of the monorepo. Then:

``` javascript
cd packages/sdk/react-core
yarn build
```

The monorepo's `package.json` lists `react-core` as a workspace, so
you can list it as a dependency in your own `package.json` like this:

`    "@thisisnotadrill/react-core": "1.0.0",`

You can then import it with this line:

``` javascript
import { initTinadSDK } from '@thisisnotadrill/react-core';
```

If you want to use TINAD's UI components, you should also install 
`    "@thisisnotadrill/react-ui": "latest",`

and then you can include the UI component and its properties with:

``` javascript
import { TinadComponent, TinadTemplateProps } from '@thisisnotadrill/react-ui';
```

## Troubleshooting

See the website https://www.this-is-not-a-drill.com for support options.

## Purpose

The goal of this library is to make it easy for you to inject TINAD notifications into your React website with minimal code.

## Installation Guide

## Troubleshooting
