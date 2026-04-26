# WrapRoute AI Deployment Guide (Render.com)

To deploy this Python backend on Render:

1. **GitHub Upload**: Push your project to a GitHub repository.
2. **New Web Service**: Log in to [Render](https://render.com/), click **New** -> **Web Service**.
3. **Connect Repo**: Select your WrapRoute repository.
4. **Environment Settings**:
   - **Runtime**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**: Add these in the Render dashboard:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_KEY`: Your anon/public key
   - `GEMINI_API_KEY`: Your Google GenAI key
6. **Deploy**: Click "Create Web Service".

## Supabase Database Setup
Ensure you have the following tables in your Supabase project:

- **user_profiles**: `user_id` (uuid), `eco_coins` (int)
- **bins**: `id` (text), `location` (text), `capacity` (int)
- **transactions**: `id` (text), `user_id` (text), `type` (text), `amount` (int), `brand` (text), `bin_id` (text), `timestamp` (timestamptz)
- **dispatches**: `id` (uuid), `bin_id` (text), `location` (text), `status` (text), `priority` (text), `assigned_truck` (text)
