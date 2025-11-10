# Ocura360 Blog - Quick Start

## Installation

```bash
cd ocura360-blog
npm install
```

## Development

```bash
npm run dev
```

Visit: http://localhost:3000

## Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint
npm run lint
```

## Project Status

✅ **Fully Isolated** - Independent from main ProDigitalDoctor (Ocura360) project technically but will be used for marketing of Ocura360.
✅ **TypeScript** - Strict mode enabled  
✅ **No Warnings** - Workspace root configured correctly  
✅ **No Hydration Errors** - Theme switcher fixed  
✅ **Deploy Ready** - Can be deployed as standalone app

## Key Features

- 📝 Markdown-based blog posts
- 🌙 Dark mode with theme switcher
- 📱 Fully responsive
- ⚡ Next.js 15 with Turbopack
- 🎨 Tailwind CSS
- 🔍 SEO optimized
- 📊 RSS feed support

## Adding Posts

Create a new `.md` file in `_posts/` directory:

```markdown
---
title: "Post Title"
excerpt: "Brief description"
coverImage: "/assets/blog/preview/cover.jpg"
date: "2024-01-01T00:00:00.000Z"
author:
  name: Author Name
  picture: "/assets/blog/authors/author.jpg"
---

Your content here...
```

## Deployment Options

- **Vercel**: Recommended (zero-config)
- **Netlify**: Set root to `ocura360-blog`
- **Self-hosted**: Use `npm start` after build

## Documentation

- `DEPLOYMENT.md` - Full deployment guide
- `ISOLATION_SETUP.md` - Technical isolation details
- `README.md` - Original template documentation

## Support

For issues specific to the blog, check the documentation files above.
