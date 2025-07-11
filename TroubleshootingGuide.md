# AquaCrew Project: Troubleshooting Guide

### **Purpose**

This document records the specific, non-obvious technical issues encountered during the initial setup and development of the AquaCrew project. Its purpose is to provide immediate, proven solutions to save future developers time and frustration.

---

### **Table of Contents**

1.  [Understanding Why Expo Go Fails and We Use a Development Build](#1-workflow-understanding-why-expo-go-fails)  
2.  [Fixing the](#2-native-build-error-fixing-the-googleservices-gradle-error)   
3.  [Resolving the](#3-javascript-bundling-error-resolving-the-babel-plugins-error)   
4.    
5.  [Correctly Typing Firebase Imports](#5-typescript-errors-correctly-typing-firebase-imports)

---

### 1\. Workflow: Understanding Why Expo Go Fails

* **Problem:** "Why can't I use the standard Expo Go app from the App Store? It crashes or complains about native modules."  
* **Symptom:** The app immediately crashes upon opening in Expo Go, often with an error message like `Native module "RNFBApp" cannot be found.`  
* **Cause:** Our project uses native libraries that are not included in the standard Expo Go app, most importantly `@react-native-firebase`. The JavaScript code is calling for native functionality that simply doesn't exist in the pre-built Expo Go environment.  
* **Solution:** We must use a custom **Development Build**. This is a version of our app, built by Expo Application Services (EAS), that includes all of our project's specific native dependencies.  
  1. Create the build one time using the command:  
  2. Generated bash  
  3. npx eas build \--profile development \--platform android  
  4. content\_copy  
  5. download  
  6. Use code [with caution](https://support.google.com/legal/answer/13505487).Bash  
  7.   
  8. Install the resulting `.apk` file on your device.  
  9. This installed app is now your custom "Expo Go" for this project. Start the dev server with `npx expo start --tunnel` and scan the QR code from within the app to connect.  
* 

### 2\. Native Build Error: Fixing the `google-services.json` Gradle Error

* **Problem:** The `eas build` command fails during the native Android build phase.  
* **Symptom:** The build log shows `> Task :app:processDebugGoogleServices FAILED` followed by the error `No matching client found for package name 'com.aquacrew.app.aquacrew'`.  
* **Cause:** The `google-services.json` file in the project root does not contain a configuration for the specific Android package ID (`com.aquacrew.app.aquacrew`). This usually happens when using a file generated for a web app or an app with a different ID. The native build requires a native-specific configuration.  
* **Solution:** Generate and place the correct `google-services.json` file.  
  1. Go to the **Firebase Console** and select your project.  
  2. Go to **Project settings ⚙️** \> **General** tab.  
  3. Under the "Your apps" card, click **"Add app"** and select the **Android icon (🤖)**.  
  4. In the "Android package name" field, enter the **exact** package name: `com.aquacrew.app.aquacrew`.  
  5. Leave the other fields blank and click **"Register app"**.  
  6. Click **"Download google-services.json"** to get the correct file.  
  7. Place this downloaded file in the **root directory** of the project, overwriting any existing one.  
  8. Re-run the `npx eas build` command.  
* 

### 3\. JavaScript Bundling Error: Resolving the Babel `plugins` Error

* **Problem:** The app fails to load the JavaScript bundle from the development server.  
* **Symptom:** The phone shows a red error screen with the message: `[BABEL] /path/to/project/node_modules/expo-router/entry.js: .plugins is not a valid Plugin property`.  
* **Cause:** A version incompatibility between the experimental v4 of `tailwindcss`/`nativewind` and the stable dependencies used by the rest of the Expo ecosystem (`react-native-css-interop`).  
* **Solution:** Pin the styling libraries to their latest stable versions.  
  1. Uninstall the problematic packages:  
  2. Generated bash  
  3. npm uninstall tailwindcss nativewind  
  4. content\_copy  
  5. download  
  6. Use code [with caution](https://support.google.com/legal/answer/13505487).Bash  
  7.   
  8. Install the known stable versions:  
  9. Generated bash  
  10. npm install tailwindcss@3.3.2 nativewind@2.0.11  
  11. content\_copy  
  12. download  
  13. Use code [with caution](https://support.google.com/legal/answer/13505487).Bash  
  14.   
  15. Ensure your `tailwind.config.js` does **not** contain a `presets` key, as it's not used by this version.  
* 

### 4\. Command-Line Errors: `command not found` and Stale Cache

* **Problem 1:** The terminal shows `bash: eas: command not found`.  
* **Cause:** The `eas-cli` package is installed locally to the project's `node_modules`, not globally on your system's PATH.  
* **Solution:** Prefix all locally-installed commands with `npx`. For example: `npx eas build...`.  
* **Problem 2:** The app shows a strange error you've already fixed, or the bundler fails with an unexplainable error.  
* **Cause:** The Metro bundler's cache is likely stale or corrupted.  
* **Solution:** Use the `--clear` flag when starting the server to force it to rebuild its cache from scratch.  
* Generated bash  
* npx expo start \--tunnel \--clear  
* content\_copy  
* download  
* Use code [with caution](https://support.google.com/legal/answer/13505487).Bash  
* 

### 5\. TypeScript Errors: Correctly Typing Firebase Imports

* **Problem:** TypeScript shows errors like `Module has no exported member 'X'` or `'Y' refers to a value, but is being used as a type`.  
* **Cause:** The `@react-native-firebase` SDK has a mix of default exports (for runtime instances) and named/namespaced exports (for types and static properties).  
* **Solution:** Use the correct import syntax for each case.  
  * **For the main**   
  * Generated typescript

// Incorrect: import { firebase } from '@react-native-firebase/app';  
// Correct:

* import firebase from '@react-native-firebase/app';  
  * content\_copy  
  * download  
  * Use code [with caution](https://support.google.com/legal/answer/13505487).TypeScript  
  *   
  * **For Type Definitions like**   
  * Generated typescript

// Incorrect: import FirebaseOptions from '...';  
// Correct:  
import { FirebaseApp } from '@react-native-firebase/app';

* const config: FirebaseApp.FirebaseOptions \= { /\* ... \*/ };  
  * content\_copy  
  * download  
  * Use code [with caution](https://support.google.com/legal/answer/13505487).TypeScript  
  *   
  * **For Static Properties like**   
  * Generated typescript

// 1\. Import the module  
import firestore from '@react-native-firebase/firestore';

// 2\. Export the property from your central file  
export const FieldValue \= firestore.FieldValue;

// 3\. Use it in your component  
await db.collection('users').doc(uid).set({  
  createdAt: FieldValue.serverTimestamp(),

* });  
  * content\_copy  
  * download  
  * Use code [with caution](https://support.google.com/legal/answer/13505487).TypeScript  
  *   
* 

---
### 6\. JavaScript Bundling Error: Resolving the `tslib` `__extends` Error

* **Problem:** The app fails to build, and the Metro terminal shows a `TypeError: Cannot destructure property ‘__extends’ of tslib.js`.
* **Symptom:** The Metro bundler logs the `tslib` error and fails to serve the JavaScript bundle.
* **Cause:** The Metro bundler is incorrectly resolving the main `tslib.js` file from the `tslib` dependency instead of the correct ES6 module version, which contains the proper exports.
* **Solution:** Create a `metro.config.js` file in the project root and add an `alias` to force the bundler to use the correct `tslib.es6.js` file.
    ```javascript
    // metro.config.js
    const { getDefaultConfig } = require('@expo/metro-config');
    const config = getDefaultConfig(__dirname);
    
    config.resolver.sourceExts.push('cjs');
    config.resolver.unstable_enablePackageExports = false;
    
    // Add this alias to fix the tslib error
    config.resolver.alias = {
      tslib: 'tslib/tslib.es6.js',
    };
    
    module.exports = config;
    ```
*

### 7\. Native Module Error: Fixing `AsyncStorage is null`

* **Problem:** The app crashes on launch after adding a new dependency that contains native code.
* **Symptom:** The app shows a red screen error `[@RNC/AsyncStorage]: NativeModule: AsyncStorage is null.`
* **Cause:** This error has two common causes:
    1. The version of the native dependency (e.g., `@react-native-async-storage/async-storage`) is incompatible with the installed Expo SDK version.
    2. The development build installed on the device is outdated and does not contain the native code for the newly added dependency.
* **Solution:** This is a two-step process.
    1.  First, run `npx expo install --check` to fix any version mismatches. This command ensures all native dependencies use versions that are compatible with your Expo SDK.
    2.  Then, create and install a new development build by running `npx eas build --profile development --platform android`. This step bundles the new, corrected native code into the application `.apk` file.
*

### 8\. TypeScript Errors: Resolving Stubborn Firebase Errors

* **Problem:** TypeScript persistently reports errors like `Module '"firebase/auth"' has no exported member 'getReactNativePersistence'`, even when all configurations and code appear to be correct.
* **Symptom:** The code editor shows red squiggly lines and reports TypeScript errors that prevent a clean build, even if workarounds like `@ts-ignore` are used.
* **Cause:** The local `node_modules` directory or the npm cache is in a corrupted state. This prevents the TypeScript server from correctly reading the `firebase` package's type definition files.
* **Solution:** Perform a "clean slate" re-installation of all project dependencies. This removes any possibility of a bad cache or corrupted file and is the definitive way to fix a broken local environment.
    1.  `npm uninstall firebase`
    2.  `npm cache clean --force`
    3.  `rm -rf node_modules package-lock.json`
    4.  `npm install`
    5.  Restart your code editor after the installation is complete.
*

### 9. Firebase Functions v2 Deployment and Runtime Errors

* **Problem:** Functions deploy successfully but crash on execution with runtime errors.
* **Symptom:** Function logs show `TypeError: event.data.data is not a function` or similar property access errors.
* **Cause:** Firebase Functions v2 uses a different event structure than v1. The `event.data` property is already the document data, not a DocumentSnapshot object with methods.
* **Solution:** Update data access patterns for v2 API.
   ```typescript
   // Incorrect (v1 syntax):
   const progressData = event.data.data() as DailyProgress;
   
   // Correct (v2 syntax):
   const progressData = event.data as DailyProgress;
   ```

### 10. ESLint Configuration Conflicts in Firebase Studio

* **Problem:** `firebase deploy --only functions` fails during the predeploy lint step.
* **Symptom:** Error message: `Invalid option '--ext' - perhaps you meant '-c'? You're using eslint.config.js, some command line flags are no longer available.`
* **Cause:** Firebase Studio uses ESLint flat config format, which doesn't support traditional command-line flags like `--ext`.
* **Solution:** Update the lint script in `functions/package.json` to use file patterns instead of flags.
   ```json
   // Before:
   "lint": "eslint --ext .js,.ts ."
   
   // After:
   "lint": "eslint src/**/*.ts"
   ```

### 11. Firebase Blaze Plan Requirements and Cost Monitoring

* **Problem:** Cloud Functions deployment fails with API enablement errors requiring paid plan.
* **Symptom:** Error message about missing required APIs like `cloudbuild.googleapis.com` and instructions to upgrade to Blaze plan.
* **Cause:** Firebase Cloud Functions (especially v2) require the Blaze (pay-as-you-go) plan to enable necessary Google Cloud APIs.
* **Solution:** Upgrade to Blaze plan and implement strict cost monitoring.
   1. Upgrade to Blaze plan at Firebase Console → Usage and Billing
   2. Set up budget alerts at $1, $2, $5 thresholds
   3. Implement usage monitoring dashboard in your app
   4. Create emergency killswitch functions for usage limits
   5. Monitor daily limits: 2M function calls/month, 50K Firestore reads/day, 20K writes/day

### 12. Firebase Functions v2 Import and Type Errors

* **Problem:** TypeScript compilation fails with missing type definitions or import errors.
* **Symptom:** Errors like `Module has no exported member 'Request'` or `Module has no exported member 'onRequest'`.
* **Cause:** Firebase Functions v2 has different import paths and type definitions than v1.
* **Solution:** Use correct import statements for Functions v2.
   ```typescript
   // Correct imports for Functions v2:
   import { onDocumentWritten } from "firebase-functions/v2/firestore";
   import { onRequest } from "firebase-functions/v2/https";
   import * as admin from "firebase-admin";
   import type { FirestoreEvent } from "firebase-functions/v2/firestore";
   
   // Function signatures:
   export const myFunction = onDocumentWritten(
     "path/{param}",
     async (event: FirestoreEvent<any>) => {
       // Use event.data directly, not event.data.data()
       const data = event.data;
     }
   );
   
   export const myHttpFunction = onRequest(async (req: any, res: any) => {
     // Use any types for req/res as specific types aren't exported
   });
   ```

### 13. Firebase Studio Cloud IDE Metro Bundling Issues

* **Problem:** Metro bundler shows tslib errors that resolve after browser refresh but reoccur on restart.
* **Symptom:** Error appears on first bundle but disappears on refresh: `Cannot destructure property '__extends' of '_tslib.default' as it is undefined.`
* **Cause:** Firebase Studio Cloud IDE has different file system timing than local development, causing race conditions in module resolution.
* **Solution:** This is a known Firebase Studio quirk. The error is cosmetic and resolves on refresh.
   * **Workaround 1:** Simply refresh the browser when the error appears
   * **Workaround 2:** Use more aggressive tslib resolution in metro.config.js:
   ```javascript
   config.resolver.alias = {
     tslib: require.resolve('tslib/tslib.es6.js'),
   };
   ```
   * **Note:** Don't spend time trying to "fix" this permanently - it's an environment limitation, not a code issue.

   ### 14. Expo Router Navigation State Management: Stuck Onboarding Screen

* **Problem:** User completes onboarding successfully (Firestore updates with `onboardingComplete: true`) but remains stuck on the onboarding screen instead of navigating to the main app.
* **Symptom:** 
 - Console logs show Firestore updating correctly: `"onboardingComplete": true`
 - Layout's Firebase listener detects the change and updates Zustand store
 - But the app remains on the onboarding screen indefinitely
 - No navigation occurs despite successful state updates
* **Cause:** **Critical Expo Router limitation**: When a component uses `<Redirect>` to navigate away, that component gets **unmounted** and can no longer react to state changes. The sequence is:
 1. Index page renders and sees `onboardingComplete: false`
 2. Index page renders `<Redirect href="/(onboarding)/setup" />`
 3. **Index component gets unmounted** by Expo Router
 4. User completes onboarding, Firestore updates, Zustand store updates
 5. **Nobody is listening** - the index component is gone from memory
* **Root Issue:** `<Redirect>` components are "one-way tickets" in Expo Router. They don't re-evaluate when state changes because the component that rendered them no longer exists.
* **Solution:** Move navigation responsibility to the **currently active component** that can listen for state changes.

**Implementation Steps:**

1. **In the onboarding screen** (`app/(onboarding)/setup.tsx`), add state-watching navigation:
  ```typescript
  import { useRouter } from 'expo-router';
  import { useEffect } from 'react';

  export default function OnboardingScreen() {
    const router = useRouter();
    const profile = useAuthStore((state) => state.profile);
    
    // Watch for onboarding completion and navigate
    useEffect(() => {
      if (profile?.onboardingComplete) {
        console.log('🎉 Onboarding complete detected, navigating to home');
        router.replace('/');
      }
    }, [profile?.onboardingComplete, router]);

    // ... rest of component