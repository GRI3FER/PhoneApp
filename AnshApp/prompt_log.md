# Prompt Log: Broke or Not - Expense Tracker
**Project:** AnshApp (Expense Tracker)  
**Date Range:** April 4-5, 2026  
**AI Tools Used:** GitHub Copilot, Claude (for async work)  

---

## Key Prompts & Interactions

### 1. Initial React Native Explanation
**Prompt:**
```
I'm brand new to React Native and Expo. Can you explain at a high level how the files 
in an Expo project create a working app? What's the difference between React Native 
and a regular website? How is a View different from a <div>?
```

**Why Asked:** To understand the fundamental differences between web and mobile development before diving into building.

**Key Learning:**
- React Native compiles to native iOS/Android code, not HTML/CSS
- View is a container component (like div) but optimized for mobile
- Styling is done via JavaScript objects, not CSS files
- Hot reload allows rapid iteration

---

### 2. State Management & useState Explanation
**Prompt:**
```
How do I add a button and a text input to a React Native screen? Show me a simple 
example and explain what the useState hook does and how it works.
```

**Why Asked:** To understand state management before building interactive expense form.

**Key Learning:**
- useState creates state variable and setter function
- Component re-renders when state changes
- Form inputs need onChange handlers to update state
- Multiple state variables can be combined

---

### 3. Context API for App-Wide State
**Prompt:**
```
I need to share expense data across multiple screens (home, history, settings). 
Is Context API the right choice, or should I use Redux? Can you show me how to 
set up a Context that provides expenses and a function to add expenses?
```

**Why Asked:** Needed centralized state management across screens without heavy dependencies.

**Key Learning:**
- Context API is sufficient for this app (Redux would be overkill)
- useContext hook allows consuming context in any component
- Custom hook (useExpenses) provides clean API
- Context provider wraps entire app in RootLayout

---

### 4. AsyncStorage Implementation for Persistence
**Prompt:**
```
How do I save data locally in React Native so it persists after the app closes? 
I need to save an array of expenses and a budget value. Show me how to use AsyncStorage 
and explain when data gets saved/loaded.
```

**Why Asked:** Critical requirement for data persistence between sessions.

**Key Learning:**
- AsyncStorage is async (requires await/promises)
- Data must be JSON serialized before storing
- Load data on app startup using useEffect
- Save data whenever state changes (also in useEffect)
- Handle corrupted data with validation/sanitization

---

### 5. Expense Context with Validation
**Prompt:**
```
My app stores expenses with id, category, amount, and timestamp. The data comes from 
user input so it might be malformed. Show me how to validate/sanitize the data when 
loading from AsyncStorage so the app doesn't crash if the stored data is corrupted.
```

**Why Asked:** Need robust error handling for stored data.

**Key Learning:**
- Type guards check property types before use
- Sanitization functions validate each field
- Graceful fallback to defaults if data is corrupt
- Filter out invalid items rather than crashing

---

### 6. Tab Navigation Setup
**Prompt:**
```
How do I set up tab-based navigation in Expo Router with 3 screens? I want users 
to be able to switch between Home, History, and Settings tabs at the bottom. 
What's the simplest way to do this?
```

**Why Asked:** Need to understand Expo Router file-based routing and tab navigation.

**Key Learning:**
- File-based routing in Expo (file names = routes)
- NativeTabs component for tab navigation
- Each tab can have its own screen file
- Tab icons can be customized with image assets

---

### 7. Filtering Data by Date
**Prompt:**
```
I have an array of expenses with timestamp values (milliseconds since epoch). 
I need to:
1. Filter to get only today's expenses (for the home screen)
2. Group expenses by date (for history screen)

Show me how to do both efficiently. What's the best way to compare timestamps?
```

**Why Asked:** Complex data filtering needed for multiple screens.

**Key Learning:**
- Date() constructor can parse timestamps
- getFullYear/getMonth/getDate for date matching
- Array.map and reduce for grouping
- useMemo optimization for expensive calculations

---

### 8. Modal for Form Input
**Prompt:**
```
On my home screen, I have category buttons. When a user taps a category, I want 
to show a modal with a text input for the amount. How do I create a modal that 
pops up and gets dismissed after they submit or cancel?
```

**Why Asked:** Need to understand modal lifecycle and form submission flow.

**Key Learning:**
- Modal component with visible prop controls display
- animationType for enter/exit animations
- Separate state for modal visibility vs form input
- Reset form state on cancel/submit

---

### 9. Delete Confirmation Dialog
**Prompt:**
```
I want users to be able to tap an expense to delete it, but I need a confirmation 
dialog first (like "Are you sure?"). How do I show an alert in React Native before 
calling a delete function?
```

**Why Asked:** Need to prevent accidental data loss.

**Key Learning:**
- Alert.alert() for confirmation dialogs
- Buttons array with onPress callbacks
- style: 'destructive' for danger actions
- Handle both "Cancel" and "Confirm" scenarios

---

### 10. Budget Status Color Indicator
**Prompt:**
```
I want to show the user if they're within budget, getting close, or over budget:
- Under 80% of budget: "You're good" (green)
- 80-100% of budget: "Getting close" (yellow)  
- Over 100%: "Over budget" (red)

How should I implement this logic and return both the label and color?
```

**Why Asked:** Need to provide visual feedback on budget status.

**Key Learning:**
- Pure function for status calculation
- Object return with label and color
- Ratio-based thresholds make sense for this scenario
- Use colors that are colorblind-friendly

---

### 11. Formatting Currency and Time
**Prompt:**
```
I'm displaying money amounts and timestamps throughout my app. Should I format 
these in every component, or create helper functions? Show me how to format 
a number as currency ($X.XX) and a timestamp as time (3:45 PM).
```

**Why Asked:** Code reuse and consistency across screens.

**Key Learning:**
- Helper functions reduce duplication
- toFixed() for decimal places
- toLocaleTimeString/toLocaleDateString for formatting
- Export helpers from context for easy access

---

### 12. FlatList for Rendering Lists
**Prompt:**
```
I have an array of expenses to display. What's better, map() or FlatList? 
Show me how to use FlatList with keyExtractor and renderItem. Also, how do I 
show a message when the list is empty?
```

**Why Asked:** Performance and UX for scrollable lists.

**Key Learning:**
- FlatList is optimized for performance (virtualization)
- keyExtractor critical for rendering efficiency
- renderItem function receives item and index
- ListEmptyComponent for empty state UX

---

### 13. Debugging Console Errors
**Prompt:**
```
My app crashes with: "Cannot read property 'expenses' of undefined". 
It's happening in the useExpenses hook. Why would context be undefined?
```

**Why Asked:** Troubleshooting common Context API error.

**Key Learning:**
- Context must be wrapped by Provider
- useExpenses() must be inside Provider tree
- Error message in hook helps catch setup errors early
- Check component hierarchy in _layout.tsx

---

### 14. Dark Theme Styling
**Prompt:**
```
I want a dark theme for my expense app (dark backgrounds, light text). 
What's a good base color for dark mode, and how do I structure my StyleSheet 
to make colors consistent across all screens?
```

**Why Asked:** Visual consistency and modern design aesthetic.

**Key Learning:**
- Dark backgrounds: #0a0e27, #1f2937 for cards
- Light text: #ffffff for headers, #a0aec0 for secondary
- Define color palette once and reference throughout
- Dark theme reduces eye strain for financial tracking

---

### 15. Flexbox Layout in React Native
**Prompt:**
```
I'm trying to layout my category buttons in rows that wrap to the next line. 
Also, I need to put my expense rows with category on the left and amount on 
the right. How does Flexbox work in React Native?
```

**Why Asked:** Layout and positioning challenges.

**Key Learning:**
- flexDirection: 'row' for horizontal layout
- flexWrap: 'wrap' to wrap items to next line
- justifyContent and alignItems for distribution
- gap property for spacing between items

---

## Development Process Notes

### Iterative Approach
- Built one screen at a time (Home → History → Settings)
- Tested each feature on phone before moving to next
- Used hot reload for rapid iteration

### Key Decisions & Rationale
1. **Context API over Redux:** Simpler for this app's needs, less boilerplate
2. **AsyncStorage over file system:** Simpler API, Expo provides it out of box
3. **Tab navigation:** Most intuitive UX for three distinct screens
4. **Dark theme:** Reduces eye strain, modern aesthetic
5. **Category-based expenses:** Simpler UX than free-form labels

### Challenges Encountered
1. **Timestamp comparisons:** Initially compared entire Date objects; switched to year/month/day comparison
2. **Modal state management:** Had to separate category selection from amount input state
3. **Data sanitization:** Added validation to handle potential AsyncStorage corruption

### Testing Approach
- Manual testing on phone/simulator after each feature
- Tested edge cases: invalid amounts, empty lists, budget edge cases
- Verified data persists after app close/reopen

---

## Key Learnings About Mobile Development

### 1. State Management is Different
Mobile apps need to think about state more carefully due to app lifecycle events (pause, resume, etc.).

### 2. Form Input Pattern is Different
Modal-based forms are common in mobile UI, different from web forms.

### 3. Persistence is Expected
Users expect data to survive after closing the app—this is more critical than web.

### 4. Touch Targets Matter
Buttons need to be large enough to tap (44px minimum), affects layout more than web.

### 5. Performance Matters Sooner
Even simple lists need FlatList optimization on mobile, not just map().

---

## Commits Made
1. `Initial project setup with Expo`
2. `Add expense context with AsyncStorage`
3. `Build home screen with modal form`
4. `Add history screen with date grouping`
5. `Add settings screen with budget control`
6. `Polish UI and fix icon`
7. `Final review and cleanup`

---

**Summary:**
This app was built using an agile, test-driven approach where each feature was discussed with AI, implemented, tested on a phone, and then refined based on feedback. The prompt log shows an emphasis on learning (asking "why" and "how") rather than just generation (asking "build this"). Key concepts like Context API, AsyncStorage, React Native components, and Flexbox were explored thoroughly before implementation.
