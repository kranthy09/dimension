## Flow of blog uploading:

#### 1. From Frontend, /upload is getting from _admin/upload/page.tsx_:

1. Raw fetching from backend api call is happening.
   - Change it to use lib api methods already defined upload method.
2. Directly uses useEffect for checking auth.
   - Create Cookies Manager for auth handling just as same as **"Companion-v1-frontend"**.

### \* Frontend Potential Issues:

- Direct calls to Backend.
- Lack of Cookies Manager.

#### 2. Calls _/content/upload?section=${section}_:

Both direct and api lib methods are pointed to same, correct endpoint.

1.

---

- Identify template/pattern required for successful - upload
- Find a way to show images from inside application folders
- Make in.evolune.dev for initial version of deployment
- Make evolune.dev for final version of deployment.
