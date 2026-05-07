KS CMR SYSTEM — Mobile Companion App

Project Overview

Build a mobile companion app for an existing desktop CRM system (KS CMR SYSTEM). The

desktop app is built with Electron + React + TypeScript + PostgreSQL. The mobile app acts

as a lightweight field tool for employees — NOT a full CRM.

Tech Stack

React Native + Expo (developed on Windows, no Mac)

TypeScript

Supabase (cloud sync layer + auth + realtime)

PWA version for iOS (same codebase, web export via Expo)

Android → APK via Expo EAS Build

UI: Dark theme, black & gold color scheme (matches desktop identity)

RTL: Arabic language support required

User Roles

Only 2 employees will use this app

No public distribution — Android APK direct install, iOS via PWA

Employees can ONLY log daily events, they cannot edit core customer data

Security / Authentication Layer

First Launch

Supabase email + password login (one time only)

Session stored securely via expo-secure-store

Never ask for email/password again unless session expires

Every App Open

Biometric authentication via expo-local-authentication

Android: fingerprint or Face ID

iOS (React Native): Face ID or Touch ID

PWA iOS: PIN only (biometric not supported in PWA)

Fallback if biometric fails or not available: 4-digit PIN

PIN stored securely via expo-secure-store (never in plain text)

Auto-Lock

App locks automatically after 5 minutes in background

Requires biometric or PIN to unlock

Does NOT require Supabase login again

PIN Screen Requirements

Clean full-screen dark UI (black & gold)

4 dots indicator for PIN input

Numeric keypad custom designed

“Use Biometric” button if available

Arabic labels

Security Rules

5 wrong PIN attempts → logout completely → require Supabase login again

Biometric cancel → fallback to PIN immediately

No screenshot allowed (Android: FLAG_SECURE)

Core Features (3 Screens Only)

Screen 1 — Customer Search

Search bar (by name or phone number)

Fetch from Supabase  customers  table (5000 customers, load on search only)

Display customer card showing:

Customer name

Current balance (debt/credit)

Currency (IQD / USD)

Screen 2 — Log Event

Triggered from customer card

Form fields:

Event type: DEBT or PAYMENT (toggle/select)

Amount (numeric input)

Currency: IQD / USD

Note (optional text)

Submit → inserts record into Supabase  phone_events  table

Status set to  pending  automatically

Screen 3 — Today’s Events

List of all events logged today by this employee

Shows: customer name, type, amount, currency, note, time

Read-only, no edit or delete

Supabase Schema

Table:  phone_events

id            UUID PRIMARY KEY DEFAULT gen_random_uuid()

customer_id   INTEGER NOT NULL

customer_name TEXT NOT NULL

type          TEXT CHECK (type IN ('debt', 'payment'))

amount        NUMERIC(15,2) NOT NULL

currency      TEXT CHECK (currency IN ('IQD', 'USD'))

note          TEXT

created_at    TIMESTAMPTZ DEFAULT now()

status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'transferred'))

employee_id   UUID REFERENCES auth.users(id)

Table:  customers  (read-only from mobile)

id          INTEGER PRIMARY KEY

name        TEXT

phone       TEXT

balance_iqd NUMERIC(15,2)

balance_usd NUMERIC(15,2)

Sync Logic

Mobile app ONLY writes to  phone_events

Mobile app ONLY reads from  customers  (search + balance display)

Desktop app reads  phone_events  where status =  pending

Desktop employee manually reviews and transfers each event to main ledger

After transfer → desktop updates status to  transferred

Mobile has NO access to main ledger or any other table

Authentication (Supabase)

Supabase Auth (email + password) — first launch only

Each employee logs in with their own account

Row Level Security (RLS) on Supabase:

Employees can only INSERT into phone_events

Employees can only SELECT from customers

Employees can only SELECT their own phone_events

PWA Requirements (iOS)

Expo Web export

manifest.json with app name, icons, dark theme color

“Add to Home Screen” ready

Offline: show friendly Arabic message if no connection

PIN authentication only (no biometric in PWA)

UI/UX Requirements

Dark background:  #0a0a0a

Gold accent:  #c9a227

Arabic RTL layout throughout

Font: system Arabic font

Clean minimal design — no unnecessary elements

Loading states on all async operations

Error handling with Arabic messages

Project File Structure

/app

  /(auth)

    login.tsx          ← Supabase email/password (first launch)

    lock.tsx           ← PIN / biometric screen (every open)

  /(main)

    search.tsx

    log-event.tsx

    today.tsx

  _layout.tsx

/components

  CustomerCard.tsx

  EventForm.tsx

  EventList.tsx

  LoadingSpinner.tsx

  PinPad.tsx           ← custom numeric keypad

  BiometricPrompt.tsx  ← biometric trigger + fallback

/lib

  supabase.ts

  auth.ts              ← session + biometric + PIN logic

  types.ts

/constants

  colors.ts

  strings.ts           ← all Arabic text centralized here

app.json               ← Expo config + PWA manifest

Important Constraints

Do NOT connect to the desktop PostgreSQL database directly

Supabase is the ONLY bridge between mobile and desktop

Keep the app extremely simple — resist adding features

All Arabic strings must be in strings.ts (easy to update)

Handle network errors gracefully with Arabic messages

Test with 5000 customer records in mind (search optimization)

Use expo-local-authentication for biometric

Use expo-secure-store for PIN and session storage

FLAG_SECURE on Android to prevent screenshots