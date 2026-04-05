# Broke or Not? - Expense Tracker

## About This App

Broke or Not? is a mobile expense tracker that helps users monitor their daily spending against a customizable budget. Whether you're grabbing coffee, ordering lunch, or catching an Uber, this app makes it easy to track every dollar and stay mindful of your budget. The app provides instant visual feedback so you always know if you're good, getting close, or already over budget for the day.

I chose to build this app because personal finance tracking is a real problem I face—I often lose track of how much I've spent throughout the day, and by the time I check my balance, I'm already over. This simple, friction-free app removes that anxiety with just two taps.

## Features & Screens

### Home Screen
The main screen displays:
- **Daily Budget Status**: Shows today's total spending vs. your daily budget (e.g., "$12.50 / $30.00")
- **Budget Indicator**: Color-coded status ("You're good", "Getting close", or "Over budget") in green, yellow, or red
- **Quick Add**: Five category buttons (Food, Coffee, Transport, Fun, Other) for fast expense entry
- **Amount Modal**: When you tap a category, a modal pops up to enter the exact amount
- **Today's Expenses**: Scrollable list of expenses added today with time stamps

### History Screen
Shows all your expenses throughout time:
- **Date-Based Grouping**: Expenses are organized by day (most recent first)
- **Daily Totals**: Each date section shows the total spend for that day
- **Expense Details**: Each expense displays category, amount, and time
- **Delete Ability**: Tap any expense to delete it (with confirmation)
- **Empty State**: A friendly message appears when you have no expenses

### Settings Screen
Manage your app data:
- **Daily Budget Input**: Edit your daily budget limit and save it
- **Save Confirmation**: Get feedback when your budget is updated
- **Clear All Data**: Destructive action to wipe all expenses and reset budget to $30 default
- **Safety**: Confirmation dialog prevents accidental deletion

## How to Set Up & Run

### Prerequisites
- **Node.js** (v18 or higher): Download from [nodejs.org](https://nodejs.org/)
- **Expo Go app** on your phone (iOS or Android) OR an Android Studio emulator
- **Git** (optional, for cloning)

### Installation & Running

1. **Clone the repository** (or download the code):
   ```bash
   git clone <repository-url>
   cd AnshApp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start
   ```

4. **Open on your phone or emulator**:
   - **Android phone with Expo Go**: Scan the QR code in your terminal with your camera or Expo Go app
   - **Android emulator**: Press `a` in the terminal to automatically build and run on emulator
   - **iOS simulator** (Mac only): Press `i` to open the iOS simulator
   - **Web browser** (for testing): Press `w` to open in your browser at `http://localhost:8081`

### Environment & Platforms Tested
- **Development**: Windows PC with Android Studio emulator and web browser
- **Platforms**: Android (via emulator), Web (via browser)
- **Framework**: Expo with React Native and TypeScript

### No External Dependencies Required
This app uses only local storage (AsyncStorage) and does not require any API keys or external services.

---

## What Surprised Me About Mobile Development

The thing that surprised me most was how **different the state management workflow feels** compared to web development. In a web app, you can usually assume the browser state persists (or refresh starts over). But in mobile with Expo, you constantly think about the **app lifecycle**—the app can pause, stop, and resume at any time. This means I had to be much more intentional about saving data and restoring it correctly. 

I assumed it would be as simple as calling `localStorage.setItem()` once, but AsyncStorage requires async/await and careful handling of the hydration flow. Getting it right meant learning about useEffect cleanup, ensuring data loads before the UI renders, and handling corrupted data gracefully. It made me realize that **mobile development is more stateful and persistence-conscious than web development**, and I have much more respect for mobile developers now.

---

## Project Structure

```
AnshApp/
├── src/
│   ├── app/
│   │   ├── _layout.tsx          # Navigation layout with context provider
│   │   ├── index.tsx            # Home screen (add expenses)
│   │   ├── explore.tsx          # History screen
│   │   └── settings.tsx         # Settings screen
│   ├── components/
│   │   ├── app-tabs.tsx         # Tab navigation component
│   │   └── ... (other components)
│   ├── context/
│   │   └── expense-context.tsx  # Expense state, persistence, and helpers
│   ├── constants/
│   │   └── theme.ts             # Color and theme constants
│   └── global.css               # Global styles
├── assets/                      # Images and icons
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── SPEC.md                      # Detailed app specification
├── REVIEW.md                    # AI code review
├── prompt_log.md                # Prompt history and learning notes
└── README.md                    # This file
```

---

## Technologies Used

- **React Native**: Framework for building native mobile apps with JavaScript
- **Expo**: Platform & tools for building, testing, and deploying React Native apps
- **TypeScript**: Type-safe JavaScript for better code reliability
- **Expo Router**: File-based routing for navigation (similar to Next.js)
- **AsyncStorage**: Local database for persisting user data
- **React Hooks**: useState, useContext, useEffect, useMemo for state management
- **React Navigation**: Navigation library integrated with Expo

---

## Design Decisions

### Why Dark Theme?
Expense tracking is a finance app, and dark themes reduce eye strain during repeated use. They also feel modern and professional.

### Why Tab Navigation?
Three distinct screens benefit from simple tab navigation—it's the most common pattern on mobile and makes switching between views effortless.

### Why Context API Instead of Redux?
For an app this size, Context API is simpler and lighter. Redux would add unnecessary complexity without proportional benefit.

### Why Separate Modal for Amount Input?
Modal forms are a common mobile pattern. It forces the user to complete the amount entry once they've selected a category, providing a clear workflow.

---

## Known Limitations & Future Enhancements

**Current Limitations:**
- No monthly budget targets (only daily)
- No data export/backup functionality
- No recurring expenses or budget alerts
- No charts or analytics

**Possible Enhancements:**
- Monthly budget tracking and trends
- Push notifications for budget alerts
- CSV export of expense history
- Budget comparison with previous months
- Integration with bank accounts (future)
- Recurring expense templates

---

## Files in This Repository

- **`src/`**: All source code
- **`android/`**: Android native project (generated by Expo)
- **`app.json`**: Expo configuration
- **`package.json`**: Dependencies and scripts
- **`SPEC.md`**: Detailed specification of features
- **`REVIEW.md`**: AI code review against specification
- **`prompt_log.md`**: Prompts used during development and learnings

---

## Questions & Support

For issues or questions:
1. Check the [Expo documentation](https://docs.expo.dev/)
2. See [React Native docs](https://reactnative.dev/) for component usage
3. Check the **prompt_log.md** for how specific features were built

---

**Built for CMU 15-113: Effective Coding with AI**  
**Spring 2026**

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
