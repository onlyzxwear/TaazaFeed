# TaazaFeed — starter project

TaazaFeed is an Expo + React Native app that can run on Android and the web, with Supabase planned for authentication, database, media storage, and realtime chat.

## 1. Requirements
- Node.js LTS
- Expo Go on an Android phone (for early testing), or Android Studio for an emulator
- A free Supabase project at https://supabase.com

## 2. Install and run
```bash
npm install
cp .env.example .env
npm run start
```
For web:
```bash
npm run web
```
For Android, scan the QR code with Expo Go or run `npm run android`.

## 3. Connect Supabase
1. Create a Supabase project.
2. Open Project Settings → API and copy the Project URL and anon/public key into `.env`.
3. Open SQL Editor and run `supabase/schema.sql`.
4. Never put a Supabase `service_role` key in this app. Only use the anon/public key; RLS policies protect user data.

## Current starter features
- TaazaFeed branded responsive shell
- Email/password sign-in and sign-up screen
- Feed, Reels, Create, Activity, and Profile tabs
- Feed reads posts from Supabase when configured; friendly empty state otherwise
- Like button UI scaffold (database interaction is next implementation step)

## Build order for the complete app
1. Authentication and profile setup
2. Posts, media uploads, likes, and comments
3. Follow/follower graph and feed ranking
4. Stories with expiry
5. Reels video upload/playback and moderation/reporting
6. One-to-one chat using Supabase Realtime
7. Notifications, blocking, reporting, privacy controls
8. Android release build and web deployment

This is a working foundation, not yet a production-ready Instagram replacement. Before public launch, add rate limits, content moderation, abuse reporting, backups, and privacy/legal pages.
