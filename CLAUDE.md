# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack (faster builds)
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with Next.js TypeScript configuration

## Architecture

This is a **Next.js 15 application** using the **App Router** architecture with React 19 and TypeScript.

### Key Technologies
- **Next.js 15** with App Router (not Pages Router)
- **React 19** with TypeScript strict mode
- **Tailwind CSS 4** for styling
- **Turbopack** for fast development builds

### Project Structure
- `app/` - Main application directory (App Router pattern)
  - `layout.tsx` - Root layout with font configuration
  - `page.tsx` - Route pages
  - `globals.css` - Global styles with CSS custom properties
- `public/` - Static assets

### Code Patterns
- Uses `next/font/google` for font optimization (Geist Sans/Mono)
- CSS custom properties for theming with dark mode support
- TypeScript path mapping configured (`@/*` → root)
- Tailwind CSS utility classes for styling

### Configuration
- **TypeScript**: Strict mode enabled, ES2017 target
- **ESLint**: Flat config format with Next.js core web vitals
- **Next.js config**: TypeScript-based configuration file