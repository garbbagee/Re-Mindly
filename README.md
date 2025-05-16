📱 Re-Mindly
Re-Mindly is a mobile app designed especially for students. Unlike other productivity tools, Re-Mindly implements a system of persistent and intelligent reminders to help users fight procrastination and complete their daily tasks efficiently.

🎯 Objective
To help students stay on track with their post-class tasks through friendly but consistent reminders. The app is ideal for those who typically manage 2–3 important tasks per day and want to avoid forgetting or dismissing them too quickly.

🛠️ Technologies Used
Ionic + Angular – Cross-platform mobile development.
Firebase Firestore – Real-time cloud database.
Capacitor – Native device functionality integration.
Firebase Cloud Messaging (FCM) – Push and local notifications.
Android Studio – Emulator and deployment testing
📦 Key Features
✅ Create, edit, and delete daily tasks.
🔔 Persistent reminders with interactive options: Yes, No, Not yet.
🔁 Intelligent reinforcement: If "Not yet" is selected, the app will remind the user again later.
📊 Task completion history and daily progress tracking.
⚙️ Customizable settings (reminder times, reinforcement frequency, etc.).
🚀 Getting Started
# Clone the repository
git clone https://github.com/garbbagee/re-mindly.git

# Navigate to the project folder
cd remindly

# Install dependencies
npm install

# Run the app in development
ionic serve

# To build for Android
ionic build
npx cap sync android
npx cap open android
