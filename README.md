# Mirage

**Mirage** is a self-hostable "rhythm" game score tracker that doesn’t rely on predefined seeds or chart metadata. It preseves your scores across games, even niche ones.

![https://github.com/user-attachments/assets/e1a03b39-3c6f-4d31-8a4e-7ae9abaa93a2](https://github.com/user-attachments/assets/e1a03b39-3c6f-4d31-8a4e-7ae9abaa93a2)
![https://github.com/user-attachments/assets/63341f3b-991c-4147-8014-30f27020dc05](https://github.com/user-attachments/assets/63341f3b-991c-4147-8014-30f27020dc05)

# ✨ Features
- **Import & Track Scores** – Keep a safe backup of your game scores.
- **Add Any Game** – Works with any rhythm game, even without official metadata.
- **Self-Host or Go Solo** – Use locally or host for group score tracking. Multi-user system.
- **Presets** - Comes pre-loaded with tracking functionality for various rhythm games

# Default Supported Games
- DANCERUSH
- DANCE aROUND
- Project DIVA Arcade: Future Tone
- MUSIC DIVER
- Nostalgia
- REFLEC BEAT
- Taiko no Tatsujin Arcade

> [!NOTE]
> Basically stuff that isn't supported by [Tachi](https://github.com/zkrising/Tachi) (*yet?*), you should use it for all the other games it does support


> ⚠️ **Warning:** Work in progress

# Development
Install dependencies:
```bash
pnpm install:all
```

Create a `.env` file in `backend` based on `backend/.env.template`. Fill in the fields as required.

Setup and Initialize Database:
```bash
pnpm db-init
```

Create a `.env` file in `frontend` based on `frontend/.env.template`
- If you did not change the port of the API in the backend env file. Then your `VITE_API_URL` is `http://localhost:5000/api`

Start Frontend and Backend
```bash
pnpm dev
```

## Stack
- React Typescript
- Express
- Prisma ORM
- Postgres

> You're welcome to join my [personal instance](https://mirage.pinapelz.com), but I make no guarantees about the integrity of data if something goes catastrophically wrong.
