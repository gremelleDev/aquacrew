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
