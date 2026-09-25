# তাফহীমুল কুরআন — v3 Offline Mobile

এই সংস্করণটি v1-এর সবুজ/সাদা mobile design ধরে আরও mobile-first করা হয়েছে।

## নতুন
- IndexedDB offline Quran library
- Service Worker app shell caching
- ১১৪ সূরা একসাথে offline download
- Arabic + বাংলা অনুবাদ + English translation
- বাংলা শব্দে-শব্দে অর্থ (Quran.com content endpoint; fallback আছে)
- QuranEnc-এর Bengali Zakaria content থেকে বাংলা অনুবাদ/সংক্ষিপ্ত তাফসীর ও footnotes cache
- Offline search: ডাউনলোড করা সূরার মধ্যে
- Per-surah audio caching (ঐচ্ছিক; storage অনেক লাগতে পারে)
- Font size, dark mode, favorites localStorage
- Mobile safe-area + full-width bottom navigation

## Offline কীভাবে কাজ করে
প্রথমবার internet দিয়ে **সেটিংস → অফলাইন কুরআন লাইব্রেরি → সব ১১৪ সূরা ডাউনলোড** চাপুন। ডেটা IndexedDB-তে থাকবে। এরপর downloaded surahs সাধারণ পড়া, শব্দার্থ, অনুবাদ, সংক্ষিপ্ত তাফসীর ও local search-এর জন্য internet ছাড়াই কাজ করবে।

অডিও আলাদা করে সূরা অনুযায়ী cache করা যায়। সব ৬২৩৬টি audio একসাথে cache করলে ফোনে অনেক storage লাগতে পারে।

## Sources
- Quran Foundation / Quran.com content for word-by-word data.
- QuranEnc Bengali Zakaria for Bengali translation/short tafsir-style footnotes. Respect the source's republication terms and version information.

## Android
GitHub Actions workflow `.github/workflows/build-apk.yml` দিয়ে debug APK build করা যাবে।
