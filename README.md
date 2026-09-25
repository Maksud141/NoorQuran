# তাফহীমুল কুরআন — Complete Reference Design App

এই সংস্করণে আপনার দেওয়া screenshots-এর layout language অনুসরণ করে পুরো navigation/app shell তৈরি করা হয়েছে।

## যেগুলো functional
- 114 Surah list — API থেকে dynamic
- Quran reader — Arabic + Bengali + English
- Ayah bookmark/favorite — localStorage
- Reading history
- Quran search
- Ayah audio — Alafasy CDN
- Prayer times — AlAdhan
- Qibla direction API
- Dark mode
- Settings
- Drawer menu-এর screenshot-এর সব major item
- Share/About/Rate/Update/Exit actions
- PWA manifest
- Capacitor Android wrapper configuration

## Run
1. `npm install`
2. `npx serve .`
3. browser-এ localhost খুলুন।

## Android APK
Android Studio/SDK লাগবে:
`npx cap add android`
`npx cap copy`
`npx cap open android`
তারপর Android Studio থেকে APK/AAB build করুন।

## Production note
Quran Foundation-এর current API documentation অনুযায়ী production Content APIs backend credentials ব্যবহার করে Quran/translation/tafsir content দেয়। এই project-এর base reader AlQuran.cloud-এর open REST API ব্যবহার করে, আর production-grade tafsir/user-sync যোগ করতে backend adapter দরকার। API sources:
- Quran Foundation docs: https://api-docs.quran.com/
- AlQuran.cloud docs: https://alquran.cloud/api
- AlAdhan prayer/qibla docs: https://aladhan.com/prayer-times-api

Prayer calculation times may differ from a local mosque; production app-এ location/method/tuning settings রাখা উচিত.
