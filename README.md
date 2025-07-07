# AquaCrew Project

AquaCrew is a mobile-first social wellness app designed to transform hydration from a chore into a fun, rewarding, and connected experience. By leveraging positive social accountability and gamification, AquaCrew aims to build a supportive community where users feel celebrated for their progress, fostering intrinsic motivation and long-term habit formation.

The core problem we are solving is that millions of people struggle to drink enough water because they forget, find it boring, or lack motivation. Existing trackers are often isolating and feel like work. AquaCrew's solution is to make hydration a collective goal, built on a foundation of team encouragement and shared achievements.

---

### Our Guiding Principles

Every feature and technical decision for AquaCrew will be measured against these three core product pillars:

* **Social First:** The core value comes from connection. Features should encourage positive interaction, friendly competition, and shared success.
* **Radically Simple:** The core tracking experience must be effortless and joyful. We will reduce friction at every step and avoid feature bloat.
* **Fun & Rewarding:** The app should feel like a game, not a medical device. We will use positive reinforcement and delightful UI to make users feel good about their progress.

---

### Stack-at-a-Glance

| Category           | Technology               | Reason                                                                                                                                              |
| :----------------- | :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mobile Framework** | React Native, TypeScript | Leverages our team's existing React expertise for rapid, cross-platform (iOS & Android) development with end-to-end type safety.                    |
| **Backend Platform** | Firebase (Google Cloud)  | A comprehensive Backend-as-a-Service (BaaS) providing our database, authentication, serverless functions, and analytics in a tightly integrated, scalable suite. |
| **Database**| Firestore                | A real-time, NoSQL document database that allows for live data synchronization between clients, perfect for features like the team dashboard.          |
| **Authentication**| Firebase Authentication  | A secure, managed identity service that handles sign-up, sign-in (including social providers), and user session management.                            |
| **Serverless Logic**| Firebase Cloud Functions | Event-driven, serverless functions that react to database and authentication events, used for backend logic like sending nudges and awarding badges. |
| **State Management**| Zustand                  | A lightweight, minimalist state management library for React that simplifies managing global app state without excessive boilerplate.               |
| **Styling**| NativeWind               | A utility-first styling solution that brings the power and developer experience of Tailwind CSS to React Native.                                        |

---
### Architecture Diagram

```markdown
```mermaid
graph TD
    A[User's Device: AquaCrew App] --> B{Firebase Auth};
    A --> C{Firestore Database};
    C -- Triggers --> D[Cloud Functions];
    D -- Sends --> E[Push Notifications];

    subgraph "React Native Client"
        A
    end

    subgraph "Firebase (Google Cloud Platform)"
        B
        C
        D
        E
    end
```
---

### Core Technologies & Principles

#### Mobile Framework: React Native + TypeScript
* **Our Philosophy**: We are leveraging our team's deep expertise in React to build a native mobile application for both iOS and Android from a single codebase. **TypeScript** is non-negotiable, ensuring type safety from the database to the UI components, which drastically reduces runtime errors.
>   **Developer Takeaway**: Build small, reusable components. Fully type all props, state, and API payloads.

#### Backend: Firebase BaaS
* **Our Philosophy**: We are "Serverless First." Instead of building and managing our own backend infrastructure, we are using the comprehensive Firebase suite. This allows us to focus entirely on building a great user experience. Our backend is not a traditional REST API; instead, the client interacts directly and securely with Firebase services.
>   **Developer Takeaway**: Familiarize yourself with the Firebase SDKs. Most backend "work" is done by writing clever client-side queries and robust security rules.

#### Database & Security: Firestore + Security Rules
* **Our Philosophy**: Firestore provides real-time data synchronization out of the box, which is essential for our social features. Our security is not handled in API middleware, but rather in **Firestore Security Rules**. These are powerful, declarative rules hosted on Firebase that define who can read, write, and query data. For example, a user can only update their *own* profile and can only read the profiles of their teammates.
>   **Developer Takeaway**: Always think about security rules when designing a feature. Before writing a query, ask "What rule will I need to write to make this query possible and secure?"

#### Serverless Logic: Firebase Cloud Functions (with Triggers)
* **Our Philosophy**: Our serverless functions are not for creating simple CRUD APIs. They are reserved for privileged actions and, most importantly, for reacting to events within our Firebase project. We use an event-driven architecture.
>   **Developer Takeaway**: Don't write a Cloud Function to simply get or set data. Use the client SDK for that. Write a function when you need to do something the client *can't* or *shouldn't* do, like sending a push notification after data is written.

#### State Management: Zustand
* **Our Philosophy**: For managing global state that is shared across many components (like the current user's profile or team information), we use Zustand. It's simple, unopinionated, and uses a hooks-based API that feels natural in a React environment. It helps us avoid "prop drilling" and keeps our component logic clean.
>   **Developer Takeaway**: Use component state (`useState`) for local UI state. Use a Zustand store for global data that needs to be accessed or updated from multiple, distant parts of the app.

---

### Getting Started: Running Locally

This project uses native libraries (like Firebase) and therefore requires a custom **Development Build** to run on a physical device or simulator. You cannot use the standard Expo Go app.

**1. Installation:**

*   Clone the repository: `git clone [repo-url]`
*   Navigate into the project directory: `cd aquacrew`
*   Install dependencies: `npm install`

**2. Create the Development Build (One-Time Setup):**

This command uses Expo Application Services (EAS) to build a custom version of the app that includes all our native dependencies. This can take 10-15 minutes.

npx eas build --profile development --platform android
Use code with caution.
Markdown
(Use --platform ios for an iOS simulator build).
After the build is complete, scan the resulting QR code with your device's camera to download and install the AquaCrew.apk file.

**3. Run the Development Server:**
This is the command you will run for daily development. It starts the Metro server that bundles your JavaScript code and serves it to your app.

npx expo start --tunnel

**4. Connect the App:**
Open the AquaCrew app you installed on your phone.
In the developer menu that appears, tap "Scan QR code".
Scan the QR code shown in your terminal from the npx expo start command.
The app will now connect to the server and load the project. Any changes you make to the code will appear instantly on your device.


---

### Troubleshooting
Common issues and their solutions encountered during setup.

### Error: Red screen with [BABEL] ... .plugins is not a valid Plugin property
* Symptom: The app fails to load and shows a red error screen mentioning a Babel plugin error.
* Cause: A version conflict between experimental versions of nativewind/tailwindcss (v4) and other stable libraries in the project.

* Solution: This project is now pinned to stable versions. If this error re-appears, your node_modules are likely in a bad state. Fix it by reinstalling the correct versions:

#### 1. Uninstall any incorrect versions
```markdown
npm uninstall tailwindcss nativewind
```
#### 2. Install the known stable versions
```markdown
npm install tailwindcss@3.3.2 nativewind@2.0.11
```

### Error: bash: eas: command not found
* Symptom: Your terminal cannot find the eas command.

* Cause: The eas-cli tool is installed locally to the project, not globally on your system.

* Solution: Prefix the command with npx. This tells npm to run the version of the tool located inside your project's node_modules folder.
```markdown
Incorrect: eas build ...
Correct: npx eas build ...
```
### Error: Bundling fails or app shows old code/errors
* Symptom: The npx expo start command fails with a strange error, or the app shows an error that you believe you've already fixed.

* Cause: The Metro bundler's cache has become stale or corrupted.

* Solution: Use the --clear flag when starting the server to force it to rebuild its cache from scratch.
```markdown
npx expo start --tunnel --clear
```
---

## Development Workflow

This project follows a **Feature Branching** workflow to ensure the `main` branch remains stable and deployable at all times.

1.  **Create a New Branch**: For any new feature or bug fix, create a new, descriptive branch from `main` (e.g., `feat/user-onboarding` or `fix/streak-counter-bug`).
2.  **Develop in Isolation**: All work for the feature should be done on this branch.
3.  **Open a Pull Request**: Once the feature is complete and tested, open a Pull Request to merge the feature branch back into `main`. This allows for code review and discussion.

---

### Project Status & Roadmap

#### Current Status
* **Foundation Stable:** The project's foundation is stable and correctly configured.
* **Authentication Complete:** Includes sign-up, sign-in, and session persistence.
* **Onboarding Complete:** A one-time flow for new users to set up their profile.
* **Home Screen v1 Complete:** The home screen UI is built and connected to Firestore for real-time progress tracking.

#### Immediate Next Steps (MVP v1.0)
1.  **Streak Logic:**
    * Create a Cloud Function to calculate and update the user's daily streak.
    * Display the live streak value on the home screen.
2.  **Team Goal / Social Tracking:**
    * Design the Firestore data model for teams.
    * Build the UI for creating and joining a team.
    * Implement the "Team Goal" progress view on the home screen.
3.  **UI/UX Polish (Future Task):**
    * Add a "show/hide" password toggle icon to the auth screens.