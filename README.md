Used a modified version of SPEC system started off without it got stuck and then 
wrote a SPEC.

My app is a daily budget tracker it basically allows you to set a daily budget
and then tracks how much you spent and what percent of your budget you have 
already used. It also allows you to check your past purchases and edit the budget
and other expenses.

Budget screen allows you to set the budget, edit the budget and clear the budget

Home screen allows you to see add, edit and delete items and expenses in a variety
of different categories. It also allows you to see what percent of your budget 
you've used up. 

History screen allows you too see past experiences and what percent of the 
budget each category is.

## How to set up and run the app

This is an Expo + React Native app located in the `AnshApp/` folder.

### Prerequisites
- Node.js (recommended: v18+)
- npm (comes with Node)

To run on Android:
- Android Studio Emulator + Expo Go installed on the emulator, **or**
- A physical Android device with Expo Go installed

### Install & start
From the repo root:

```bash
cd AnshApp
npm install
npm start
```

### Open the app
- On an Android emulator: open **Expo Go**, then open the project from the dev server (you can paste the `exp://...` URL shown in the terminal).
- On a physical device: open **Expo Go** and scan the QR code shown by the Expo dev server.

Something interesting I learned about Mobile Development: 

I realized that using Android Studio is miserable and that it is incredibly annoying and 
intensive compute-wise and also using and setting up Expo Studio was also hellish. 

Debugging is so much harder when developing Apps as the error messages are 
confusing and requires a lot more trial and error.