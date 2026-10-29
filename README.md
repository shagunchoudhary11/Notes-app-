# Notes App

A cloud notes app built with Next.js and Firebase.

**Live Demo:** https://notes-app-ten-amber.vercel.app

## Features
- Email/password and Google login (Firebase Authentication)
- Create, edit and delete notes
- Real-time sync with Cloud Firestore
- Tags and search
- Share a note via a link that expires in 24 hours

## Tech Stack
- Next.js (App Router, TypeScript)
- Firebase Authentication
- Cloud Firestore
- Deployed on Vercel

## Run Locally
1. Clone the repo and run `npm install`
2. Create a `.env.local` file with:
   - NEXT_PUBLIC_FIREBASE_API_KEY
   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
3. Run `npm run dev`
4. Open http://localhost:3000

## Author
Shagun Choudhary
