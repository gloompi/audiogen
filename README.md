# AI Audio Generator

A premium AI-powered audio generation application built with Next.js 15, TypeScript, and ElevenLabs.

## Features

- **Text-to-Speech**: Generate lifelike audio from text prompts using ElevenLabs API.
- **Voice Selection**: Choose from multiple high-quality voice personas.
- **Audio Visualization**: Real-time waveform visualization using Wavesurfer.js.
- **History Tracking**: Automatically saves generated audio clips to a PostgreSQL database.
- **Premium UI**: Modern, dark-themed interface built with TailwindCSS and Shadcn/UI.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS, Shadcn/UI, Lucide React
- **Database**: PostgreSQL, Prisma ORM
- **Audio**: Wavesurfer.js
- **Testing**: Playwright

## Setup & Run

### Prerequisites

- Node.js 18+
- Docker (for local PostgreSQL)
- ElevenLabs API Key

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd hyroscale-app
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://postgres:password@localhost:5432/hyroscale?schema=public"
    ELEVENLABS_API_KEY="your_api_key_here"
    ```

4.  **Start Database**:
    ```bash
    docker-compose up -d
    ```

5.  **Run Migrations**:
    ```bash
    npx prisma migrate dev --name init
    ```

6.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## Technical Decisions

- **Next.js 15**: Chosen for its robust App Router, server actions capabilities (though API routes were used for clear separation), and performance.
- **Prisma & PostgreSQL**: Selected to demonstrate full-stack data management capabilities beyond simple API wrappers.
- **Wavesurfer.js**: Used to provide a professional and engaging audio playback experience, differentiating the app from basic implementations.
- **Playwright**: Implemented for reliable end-to-end testing of the critical user flows.
