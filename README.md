
# Echo Code Detective

## Vision

Echo Code Detective lets anyone generate and play unique detective games where players are truly free to question AI-driven characters. Unlike traditional scripted games, every investigation is dynamic and player-driven for true immersion.

## Problem Solved

Most mystery games are too scripted, limiting player freedom and replayability. Echo Code Detective empowers everyone to create and experience unscripted, AI-powered investigations—no coding or art skills required.

## Features

- **Prompt-based Generation:** Instantly create a full investigation (story, suspects, clues, and visual assets) from a simple text prompt.
- **AI Characters:** Each character has a unique personality, secrets, and knowledge. Players can freely interrogate them with natural language.
- **Dynamic Clues & Visuals:** The app generates clues and backgrounds as images, making each case visually unique.
- **Immersive Gameplay:** Explore, question, and accuse suspects in a living, unscripted world.

## Architecture

```
/echo-code-detective-quest
  public/                # Static assets
  src/
    api/                # API calls (e.g. Gemini, Supabase)
    components/         # React UI components (game, prompt, scene, UI, etc.)
    context/            # React context providers (game state, etc.)
    data/               # Static or mock data
    hooks/              # Custom React hooks
    integrations/       # External services (supabase, etc.)
    lib/                # Utility libraries
    pages/              # Main app pages (routing)
    types/              # TypeScript types & interfaces
    utils/              # Utility functions (Cloudinary, asset management, etc.)
  README.md
  package.json
  ...
```

- **Frontend:** All logic is in `src/` (React, TypeScript, Vite, Tailwind CSS)
- **Backend:** Supabase (database, auth)
- **AI:** Gemini API (text), Cloudinary (image upload)

## How to Run

1. **Clone the repository:**
   ```sh
   git clone https://github.com/killer-pro/echo-code-detective-quest
   cd echo-code-detective-quest
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure environment variables:** 
### (To make things easier for you in the context of the hackathon, API keys are hard-coded, but they will be revoked after the evaluation period.)
   - Create a `.env` file if needed for API keys (Gemini, Supabase, Cloudinary, etc.)
   - Example:
     ```env
     VITE_SUPABASE_URL=...
     VITE_SUPABASE_ANON_KEY=...
     VITE_GEMINI_API_KEY=...
     VITE_CLOUDINARY_PRESET=...
     ```
4. **Start the development server:**
   ```sh
   npm run dev
   ```
5. **Open your browser:**
   - Visit [http://localhost:8080](http://localhost:8080) (or the port shown in your terminal)

## Deployment

You can deploy this project easily on [Lovable](https://lovable.dev/) or your preferred platform. For custom domains, see the Lovable documentation.

## License

MIT
