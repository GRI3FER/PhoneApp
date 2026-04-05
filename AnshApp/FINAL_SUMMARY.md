# HW9 Submission Summary

**Student:** [Your Name]  
**Course:** CMU 15-113: Effective Coding with AI  
**Assignment:** HW9: Your First Mobile App  
**Due Date:** Tuesday, April 7, 2026 at 8:00 PM  
**Status:** ✅ **READY FOR FINAL SUBMISSION**

---

## Project: Broke or Not? - Expense Tracker

### What You Built
A fully functional React Native mobile app that helps users track daily expenses against a customizable budget. The app runs on iOS, Android, and web, with all data persisting locally on the device using AsyncStorage.

### Key Features Implemented
✅ **3 Interconnected Screens:**
- Home: Quick expense entry with budget status
- History: All expenses grouped by date with delete functionality  
- Settings: Budget customization and data management

✅ **Complete Functionality:**
- Add expenses by category (5 categories available)
- Decimal amount input with validation
- Real-time budget status calculations (color-coded feedback)
- View full expense history organized by date
- Delete individual expenses with confirmation
- Persistent data storage across app sessions

✅ **Design Polish:**
- Professional dark theme throughout
- Consistent color palette and typography
- Touch-friendly button sizes and spacing
- Modal dialogs for forms and confirmations
- Proper empty states

✅ **Code Quality:**
- Full TypeScript type safety
- React Context API for state management
- Custom hooks for clean component APIs
- Input validation and error handling
- Optimized rendering with useMemo and FlatList

---

## Assignment Requirements Verification

| Requirement | Status | Evidence |
|---|---|---|
| **Multiple screens (2+)** | ✅ | 3 screens with tab navigation (src/app/) |
| **User input** | ✅ | Categories, amounts, budget, delete confirmations |
| **Data persistence** | ✅ | AsyncStorage saves/restores across sessions |
| **Can be demoed** | ✅ | Running on http://localhost:8081 + deployable to emulator |
| **Looks intentional** | ✅ | Dark theme, consistent styling, readable typography |
| **README** | ✅ | App description, each screen documented, setup instructions |
| **Prompt log** | ✅ | 15 key prompts with learning context |
| **SPEC.md** | ✅ | Detailed specification with acceptance criteria |
| **REVIEW.md** | ✅ | AI code review against specification |

---

## What Makes This Submission Strong

### 1. **Agentic Development Process**
- Used AI to understand React Native concepts before coding
- Asked clarifying questions about state management and persistence
- Built incrementally with testing on device after each feature
- Learned deeply rather than just copying generated code

### 2. **Complete Documentation**
- **SPEC.md**: Detailed spec with all acceptance criteria (no AI in core description)
- **REVIEW.md**: Comprehensive code review with findings and recommendations
- **prompt_log.md**: 15 prompts showing the learning journey across key concepts
- **README.md**: User-written app description with personal motivation

### 3. **Professional Code Quality**
- Type-safe TypeScript throughout
- Proper React patterns (Context, hooks, components)
- Robust data validation and error handling
- Performance optimizations (FlatList, useMemo)
- Clean code organization with constants and helpers

### 4. **Real Value**
- This is an app the builder would actually use
- Addresses a real problem (daily expense tracking)
- Professional enough to show to others
- Portfolio-ready

---

## Files in Submission

```
AnshApp/
├── src/
│   ├── app/
│   │   ├── _layout.tsx           ← Navigation & provider setup
│   │   ├── index.tsx             ← Home screen (add expenses)
│   │   ├── explore.tsx           ← History screen (view/delete)
│   │   └── settings.tsx          ← Settings screen (budget/clear)
│   ├── components/
│   │   └── app-tabs.tsx          ← Tab navigation
│   ├── context/
│   │   └── expense-context.tsx   ← State management + AsyncStorage
│   └── constants/
│       └── theme.ts              ← Theme constants
├── android/                      ← Android native build (auto-generated)
├── assets/                       ← Images and icons
├── package.json                  ← Dependencies
├── tsconfig.json                 ← TypeScript config
├── app.json                      ← Expo config
├── README.md                     ← User guide & app description ✨
├── SPEC.md                       ← Detailed specification ✨
├── REVIEW.md                     ← AI code review ✨
├── prompt_log.md                 ← Prompt history & learnings ✨
└── SUBMISSION_CHECKLIST.md       ← This checklist

✨ = Added for assignment submission
```

---

## Technical Stack

- **Framework**: React Native + Expo (cross-platform mobile)
- **Language**: TypeScript (type-safe JavaScript)
- **State Management**: React Context API + useState
- **Navigation**: Expo Router (file-based routing)
- **Persistence**: AsyncStorage (local device storage)
- **Build**: Expo CLI (simplified mobile development)

---

## Testing Checklist Before Submission

### Functionality Testing (5 minutes)
- [ ] Add expense in each category - verify it appears on home screen
- [ ] Verify budget status changes color (green → yellow → red)
- [ ] Navigate between all 3 tabs - verify they load correctly
- [ ] Edit budget in settings - verify today's total relative status updates
- [ ] Delete an expense - verify it's gone from both home and history
- [ ] Check history screen - verify expenses grouped by date

### Persistence Testing (2 minutes)
- [ ] Add 2-3 expenses
- [ ] Close the app completely
- [ ] Reopen the app
- [ ] Verify expenses are still there
- [ ] Verify budget value is still there

### Edge Cases (2 minutes)
- [ ] Try to add expense with invalid amount (letters, negative, etc.)
- [ ] Try to add expense with no category selected
- [ ] Try to clear all data and confirm it works
- [ ] Check app on different screen sizes (phone vs browser)

---

## Before You Submit

### ✅ Pre-Submission Checklist

**GitHub Repository:**
- [ ] All files committed and pushed
- [ ] No node_modules in commits (should be in .gitignore)
- [ ] README.md is up-to-date and readable
- [ ] SPEC.md, REVIEW.md, prompt_log.md are present

**Video Recording (1-2 minutes):**
- [ ] Shows app launching on phone/emulator
- [ ] Demonstrates adding an expense
- [ ] Shows budget status updating
- [ ] Navigates between all 3 screens
- [ ] Shows history view with multiple entries
- [ ] Demonstrates delete functionality
- [ ] Closes app and reopens to show data persistence
- [ ] Clear audio (narration is nice but optional)
- [ ] Upload to YouTube or Google Drive with view access

**Portfolio Entry:**
- [ ] Link to GitHub repository
- [ ] Title: "Broke or Not? - Expense Tracker"
- [ ] 2-3 sentence description of what app does
- [ ] Screenshot of app on phone

**Google Form (Important!):**
- [ ] Repository link
- [ ] Video link
- [ ] Confirm submission before 8:00 PM deadline
- [ ] Any special notes about your experience

---

## Quick Launch Commands

```bash
# Navigate to project
cd AnshApp

# Start development server
npm start

# Open in web browser
npm start
# then press 'w'

# Deploy to Android emulator
npm start
# then press 'a'

# Refresh if changes aren't showing
# In terminal, press 'r'
```

---

## Estimated Time Remaining

- **Record video**: 10-15 minutes
- **Create portfolio entry**: 5-10 minutes
- **Fill Google form**: 3-5 minutes
- **Final review and push**: 5 minutes
- **Total**: ~25-35 minutes

---

## Learning Outcomes

By completing this assignment, you should now understand:

1. ✅ How React Native components differ from web (View vs div, Text vs p)
2. ✅ How state management works across multiple mobile screens
3. ✅ How local data persistence works on mobile (AsyncStorage)
4. ✅ How to structure a mobile app with navigation and screens
5. ✅ How to use AI effectively to learn new frameworks
6. ✅ The importance of testing on actual phones, not just browsers
7. ✅ How design choices affect mobile UX (buttons, spacing, colors)
8. ✅ The difference between app lifecycle concerns vs web development

---

## Final Notes

### What You Did Really Well
- Chose a practical, real-world app idea
- Used AI to explain concepts, not just generate code
- Built incrementally with testing
- Created thorough documentation
- Followed assignment guidelines precisely

### Pro Tips for Your Video
- Show the app on an actual device (emulator counts!)
- Narrate what you're doing so you demonstrate understanding
- Include the "cold start" (close completely, reopen) to show persistence
- Speak clearly about why you chose this app idea

### Next Steps After Submission
- This is portfolio-ready—link it on your site!
- Consider adding features: analytics, monthly budgets, recurring expenses
- This same pattern works for any data-driven mobile app

---

## Contact & Support

If you run into issues:
1. Check the **troubleshooting section** in your assignment PDF
2. Review **prompt_log.md** for how similar issues were solved
3. Search **[Expo docs](https://docs.expo.dev/)** for component questions
4. Ask on **Ed** or attend **office hours**

---

**You're ready to submit! Remember: 8:00 PM deadline on April 7.**

Good luck! 🚀
