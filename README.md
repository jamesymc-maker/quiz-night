# Quiz Night

A self-hosted family quiz game for the shared screen. Build rounds, generate questions with ChatGPT, review them, then run the quiz pub-quiz style with live scoring.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** and run the SQL in [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor.

3. **Configure environment variables** (copy `.env.local.example` to `.env.local`):

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   OPENAI_API_KEY=...
   OPENAI_MODEL=gpt-4o
   ```

   Get an OpenAI API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

4. **Run locally**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

Add the same environment variables in your Vercel project settings. Deploy as a standard Next.js app.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | List quizzes, create new |
| `/build/[quizId]` | Quiz builder |
| `/play/[quizId]` | Game runner |
| `/play/[quizId]/scoreboard` | Final results |
| `/design` | Static design preview |
