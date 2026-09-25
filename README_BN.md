# তাফহীমুল কুরআন — Android Build Ready

এই project-টি Capacitor ভিত্তিক Android build-এর জন্য প্রস্তুত। Capacitor-এর official workflow অনুযায়ী web project-এ Android platform যোগ করে sync/open/build করা যায়।

## প্রয়োজন
- Node.js LTS
- Android Studio
- Android SDK
- JDK (Android Studio-এর bundled JDK ব্যবহার করা যায়)

## Windows
PowerShell/CMD-এ project folder খুলে:

```bat
npm install
npx cap add android
npx cap sync android
npx cap open android
```

তারপর Android Studio-তে Gradle sync শেষ হলে:
**Build → Build Bundle(s) / APK(s) → Build APK(s)**

Debug APK সাধারণত:
`android/app/build/outputs/apk/debug/app-debug.apk`

## Linux/macOS
```bash
npm install
npx cap add android
npx cap sync android
npx cap open android
```

## সরাসরি ফোনে চালানো
USB debugging চালু করে:
```bash
npx cap run android
```

## App identity
- App name: তাফহীমুল কুরআন
- Package ID: `com.noorquran.premium`

## গুরুত্বপূর্ণ
এই ZIP-এ `android/` generated folder রাখা হয়নি, কারণ Android/Gradle native projectটি আপনার কম্পিউটারে `npx cap add android` দিয়ে তৈরি করাই নির্ভরযোগ্য এবং ছোট ZIP রাখে। একবার command চালালেই `android/` folder তৈরি হবে।
