# 📱 Re-Mindly

**Re-Mindly** is a mobile app designed especially for students. Unlike other productivity tools, Re-Mindly implements a system of **persistent and intelligent reminders** to help users fight procrastination and complete their daily tasks efficiently.

---

## 🎯 Objective

To help students stay on track with their post-class tasks through friendly but consistent reminders. The app is ideal for those who typically manage 2–3 important tasks per day and want to avoid forgetting or dismissing them too quickly.

---

## 🛠️ Technologies Used

- **Ionic + Angular** – Cross-platform mobile development.
- **Firebase Firestore** – Real-time cloud database.
- **Capacitor** – Native device functionality integration.
- **Firebase Cloud Messaging (FCM)** – Push and local notifications.
- **Android Studio** – Emulator and deployment testing  
  *(Target device: Motorola MotoG35)*

---

## 📦 Key Features

- ✅ Create, edit, and delete daily tasks.
- 🔔 Persistent reminders with interactive options: **Yes**, **No**, **Not yet**.
- 🔁 Intelligent reinforcement: If "Not yet" is selected, the app will remind the user again later.
- 📊 Task completion history and daily progress tracking.
- ⚙️ Customizable settings (reminder times, reinforcement frequency, etc.).

---

## 📁 Project Structure

- `1_Documentation/` – Project charter, requirements, user stories, test plan.
- `2_UI_UX_Design/` – Wireframes and mockups.
- `3_Code/` – Full app source code.
- `4_Deliverables/` – Final presentation, user manual.
- `5_Final_Product/` – Final APK ready for installation and demo.

---

## 👨‍💻 Developer

This app is 100% developed by **[Your Name Here]**, including planning, documentation, design integration, and implementation.

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/remindly.git

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
