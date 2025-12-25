# Comparative Methods Live Lab

A real-time, interactive classroom application for teaching comparative case methods (Difference, Agreement, Nested Design, QCA).

Built with **Next.js 14**, **Supabase**, **Tailwind CSS**, and **Framer Motion**.

![Landing Page](https://github.com/user-attachments/assets/placeholder-landing.png)

## Features

- **Presenter Dashboard**: Create sessions, set timers, and reveal results live.
- **Projector View**: Large-screen interface for the classroom (QR codes, Timer, Live charts).
- **Student Interface**: Mobile-first design for real-time participation.
- **Real-time Sync**: Instant updates across all devices using Supabase Realtime.
- **Bot/Spam Protection**: Device fingerprinting to limit submissions.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Realtime)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/comparative-methods-lab.git
    cd comparative-methods-lab
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```

4.  **Database Setup**
    Run the SQL schema provided in `schema.sql` (found in the root or artifacts folder) in your Supabase SQL Editor to create the necessary tables.

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## Usage

1.  Go to `/presenter` to start a session.
2.  Open `/projector` on the main screen for the class to see.
3.  Students join via QR codes displayed on the projector.
