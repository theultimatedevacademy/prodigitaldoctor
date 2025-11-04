# Ocura360 Blog - Deployment Guide

This is a standalone Next.js blog built with TypeScript. It is completely isolated from the main ProDigitalDoctor application.

## Project Structure

This blog is located in the `ocura360-blog` folder and is **independent** from:
- `/server` - Node.js/Express backend (JavaScript)
- `/client` - React frontend (JavaScript)
- `/mobile/ocura360-clinic` - React Native mobile app (JavaScript)

## Technology Stack

- **Framework**: Next.js 15.5.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Content**: Markdown files in `_posts/` directory
- **Features**: Dark mode, RSS feed, SEO optimized

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The blog will be available at `http://localhost:3000`

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push this folder to a Git repository
2. Import the project in Vercel
3. Set the root directory to `ocura360-blog`
4. Deploy

### Option 2: Netlify

1. Push this folder to a Git repository
2. Create a new site in Netlify
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Deploy

### Option 3: Self-hosted

```bash
npm run build
npm start
```

Set `PORT` environment variable to change the port (default: 3000)

## Adding Blog Posts

1. Create a new `.md` file in the `_posts/` directory
2. Follow the frontmatter format:

```markdown
---
title: "Your Post Title"
excerpt: "A brief description"
coverImage: "/assets/blog/preview/cover.jpg"
date: "2024-01-01T00:00:00.000Z"
author:
  name: Author Name
  picture: "/assets/blog/authors/author.jpg"
ogImage:
  url: "/assets/blog/preview/cover.jpg"
---

Your content here...
```

3. The post will automatically appear on the blog

## Configuration

### Next.js Config (`next.config.js`)

- Sets Turbopack root to prevent workspace conflicts
- Isolates the blog from parent directories
- Optimizes for production

### TypeScript Config (`tsconfig.json`)

- Strict mode enabled
- Path aliases configured (`@/*` → `./src/*`)
- Isolated to this directory only

## Important Notes

- This blog uses TypeScript exclusively
- It does NOT share dependencies with the parent project
- It has its own `package.json` and `package-lock.json`
- The `next.config.js` ensures complete isolation
- No TypeScript configuration affects the JavaScript projects in parent directories

## Troubleshooting

### Workspace Root Warning

If you see warnings about multiple lockfiles, ensure `next.config.js` has:

```javascript
turbopack: {
  root: __dirname,
}
```

### Hydration Errors

The theme switcher uses `suppressHydrationWarning` to handle localStorage access during SSR.

### Port Conflicts

If port 3000 is in use, set a different port:

```bash
PORT=3001 npm run dev
```

## Maintenance

- Keep dependencies updated: `npm update`
- Check for security issues: `npm audit`
- Test builds before deploying: `npm run build`
