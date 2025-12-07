# AI Audio Generator

A premium AI-powered audio generation application built with Next.js 15, TypeScript, and ElevenLabs.

## Features

- **Text-to-Speech**: Generate lifelike audio from text prompts using ElevenLabs API.
- **Voice Selection**: Choose from multiple high-quality voice personas (Adam, Rachel, Domi, Bella, Antoni).
- **Audio Visualization**: Real-time waveform visualization using Wavesurfer.js.
- **Session Isolation**: **[NEW]** Users have their own private history without needing to log in. The app uses a client-side UUID stored in `localStorage` to isolate sessions.
- **History Management**: 
    - Automatically saves generated audio clips.
    - Delete individual clips or clear entire history.
    - History persists across page reloads for the same browser.
- **Premium UI**: Modern, dark-themed interface built with TailwindCSS and Shadcn/UI.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS, Shadcn/UI, Lucide React
- **Database**: PostgreSQL (Supabase), Prisma ORM
- **Audio**: Wavesurfer.js
- **Testing**: Playwright (E2E)

## Architecture & Decisions

### Session Isolation vs. Authentication
For this iteration, we decided **not to implement full user authentication** (like Email/Password or OAuth) to keep the user experience frictionless. 
- **Decision**: We implemented a **Session Isolation** mechanism.
- **How it works**: A unique UUID is generated on the client side and stored in `localStorage`. This ID is sent with every API request (`X-User-Id` header or body).
- **Benefit**: Users get a private "workspace" immediately upon visiting the site, without the barrier of sign-up forms.
- **Trade-off**: History is tied to the browser/device. Clearing browser storage loses the history.

### Database
- **Supabase**: We migrated from a local Docker container to **Supabase** for a production-ready managed PostgreSQL database.
- **Prisma**: Used as the ORM for type-safe database interactions and schema management.

## Setup & Run

### Prerequisites

- Node.js 18+
- Supabase Project (or any PostgreSQL database)
- ElevenLabs API Key

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd audiogen
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory:
    ```env
    # Connect to Supabase Transaction Pooler (port 6543)
    DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
    
    # Direct connection for migrations (port 5432)
    DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-region.pooler.supabase.com:5432/postgres"
    
    ELEVENLABS_API_KEY="your_api_key_here"
    ```

4.  **Sync Database Schema**:
    ```bash
    npx prisma db push
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## Testing

Run the End-to-End test suite with Playwright:

```bash
npx playwright test
```
