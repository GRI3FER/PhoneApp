# App Specification: Broke or Not - Expense Tracker

## Overview
A simple, intuitive mobile expense tracking app that helps users monitor daily spending against a customizable budget. The app uses local data persistence to track expenses across multiple visits and provides clear visual feedback on budget status.

## Primary Purpose
Users can quickly log daily expenses by category, view their spending history, and track whether they're staying within their daily budget. The app provides a clear picture of spending patterns and budget adherence with minimal friction.

## User Stories

### Screen 1: Home Screen (Index)
**As a user, I want to quickly add expenses so that I can track my spending throughout the day.**

- Display current daily budget (e.g., "$30.00") and today's total spending
- Visual budget status indicator with pie chart (shows percentage of budget used)
- Color-coded feedback: Green (< 75%), Yellow (75-99%), Red (100%+)
- Category selector with 5 options: Food, Transport, Groceries, Fun, Other
- Colored dot indicators for each category (for visual distinction)
- Text input field for expense amount with large preview display
- Text input field for expense label with category-specific suggestions
- "Add Expense" button
- Display today's expenses list with inline edit and delete options (pencil icon)
- Edit modal to update amount/label/category or delete expense

**Acceptance Criteria:**
- [ ] User can select a category from the list (with colored indicators)
- [ ] User sees category-specific label suggestions (e.g., "Pizza, Ice Cream" for Food)
- [ ] User can enter an amount (decimal support required)
- [ ] Amount is displayed in large preview before submission
- [ ] Amount must be positive and valid
- [ ] User can add optional label (e.g., specific item name)
- [ ] Pressing "Add Expense" creates a new expense with timestamp
- [ ] New expense appears in the Today's Expenses list immediately
- [ ] Today's total updates in real-time
- [ ] Budget status color changes based on spending (green/yellow/red)
- [ ] Pie chart fill shows percentage of budget spent
- [ ] User can click pencil icon to edit any expense
- [ ] Edit modal allows changing amount, label, category, or deleting
- [ ] Delete from any modal shows confirmation dialog

### Screen 2: History Screen (Explore)
**As a user, I want to see all my past expenses organized by day so that I can review my spending patterns and see category breakdowns.**

- Display category breakdown with color-coded list
  - Each category shows: colored dot, name, amount, and percentage
- Storage UI style budget bar showing used vs remaining budget
  - Colored segments for each category proportional to spending
  - Grey segment showing remaining budget
- Display label showing total used (e.g., "Used: $45.20")
- Display all expenses grouped by date (most recent first)
- Show daily total for each date
- Each expense shows: category (with colored indicator), label, amount, and time
- Tap to delete functionality with confirmation dialog
- Empty state message when no expenses exist

**Acceptance Criteria:**
- [ ] Category breakdown appears at top of screen
- [ ] Each category shows name, total amount, and percentage of total
- [ ] Colored dot matches category colors from home screen
- [ ] Budget bar displays correctly (filled by category, grey for remaining)
- [ ] Used label shows total spending across all categories
- [ ] Expenses are grouped by date
- [ ] Dates are formatted readably (e.g., "Mon, Apr 5")
- [ ] Daily totals are calculated and displayed
- [ ] Each expense displays category with colored indicator
- [ ] Tapping an expense shows delete confirmation
- [ ] Confirming delete removes the expense
- [ ] History updates when new expenses are added
- [ ] Empty state appears when no data exists

### Screen 3: Settings Screen
**As a user, I want to customize my daily budget and manage my app data.**

- Display current daily budget
- Text input to edit daily budget
- "Save Budget" button with confirmation
- "Clear All Data" button (destructive action with confirmation)
- Proper error handling for invalid budget values

**Acceptance Criteria:**
- [ ] User can edit the budget amount
- [ ] Budget must be positive and valid
- [ ] Saving budget shows confirmation message
- [ ] Clear All Data shows destructive confirmation dialog
- [ ] Clearing data removes all expenses and resets budget
- [ ] Invalid budget values show error alert

## Data Model

### Expense
```typescript
type Expense = {
  id: string;           // Unique identifier (timestamp + random)
  category: ExpenseCategory;  // 'Food' | 'Transport' | 'Fun' | 'Groceries' | 'Other'
  amount: number;       // Dollar amount (rounded to 2 decimals)
  timestamp: number;    // Milliseconds since epoch
  label: string;        // Optional item name/description (e.g., "Pizza", "Uber")
};
```

### Budget
- Stored as a single number (dollar amount)
- Default value: $30.00
- User-configurable via Settings screen

## Data Persistence
- **Technology**: AsyncStorage (React Native local storage)
- **Storage Key**: `broke_or_not_data_v1`
- **Persisted Data**: Both expenses array and budget value
- **Data Validation**: Strict input validation and sanitization on load
- **Error Handling**: Graceful fallback to defaults if storage is corrupted

## Navigation
- Tab-based navigation with 3 tabs:
  1. Home (Add expenses)
  2. History (View all expenses)
  3. Settings (Configure budget)
- Simple, predictable navigation model
- Each tab is independent

## Visual Design

### Color Scheme
- **Dark theme** for modern, eye-friendly interface
- **Primary accent**: Light blue/cyan for buttons and highlights
- **Positive indicator (Green)**: Budget status OK
- **Warning indicator (Yellow)**: Spending warning
- **Alert indicator (Red)**: Over budget

### Layout Principles
- Consistent 16px horizontal padding
- Clear visual hierarchy with headers
- Readable font sizes (14-28px range)
- Touch-friendly button sizes (min 44px height)
- Proper spacing between UI elements (8-16px gaps)

## Technical Stack
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: React Context API with useState
- **Navigation**: React Navigation (Tab Navigator)
- **Storage**: AsyncStorage
- **Styling**: React Native StyleSheet

## Non-Functional Requirements
- App must start without errors
- Hot reload should work for development
- Data must persist after app close/reopen
- All input must be validated before storage
- App handles edge cases gracefully (empty state, invalid input, etc.)
- Loading state shown while hydrating from storage

## Future Enhancement Options (Out of Scope)
- Monthly/weekly budget targets
- Expense categories by month
- Data export/backup functionality
- Recurring expenses
- Budget notifications/alerts
- Charts and analytics
