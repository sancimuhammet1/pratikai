# PratikAI - Professional AI Assistant Platform

## Overview

PratikAI is a full-stack web application that provides profession-specific AI assistants powered by Google's Gemini AI. The platform offers tailored AI experiences for different professions like engineering, law, medicine, education, and business analysis. Users can engage in specialized conversations with AI assistants that understand their professional context and provide relevant, expert-level guidance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development builds and optimized production bundles
- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS custom properties for consistent theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Authentication**: Firebase Authentication with context-based user management

**Rationale**: This stack provides a modern, performant frontend with excellent developer experience. Vite offers faster builds than traditional bundlers, while shadcn/ui ensures consistent, accessible components.

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for consistency with frontend
- **API Design**: RESTful API with JSON responses
- **Development**: Hot reloading with Vite middleware integration
- **Production**: Static file serving with Express

**Rationale**: Express provides a minimal, flexible backend framework. TypeScript ensures type safety across the entire stack, reducing runtime errors.

### Database & ORM
- **Database**: PostgreSQL (configured for Neon Database serverless)
- **ORM**: Drizzle ORM with TypeScript support for type-safe database operations
- **Schema**: Shared schema definitions between client and server in `/shared` directory
- **Migrations**: Drizzle Kit for database schema management

**Rationale**: PostgreSQL offers reliability and advanced features. Drizzle provides better TypeScript integration than alternatives while maintaining performance.

## Key Components

### Authentication System
- **Provider**: Firebase Authentication with Google Sign-in and email/password options
- **Authorization**: JWT token verification on protected server routes
- **Session Management**: Firebase Auth state persistence with automatic token refresh
- **User Context**: React Context API for centralized user state management across components

**Implementation**: Server-side middleware validates Firebase ID tokens, while client-side context provides seamless authentication state management.

### AI Integration
- **Provider**: Google Gemini AI (2.5-flash model) for natural language processing
- **Architecture**: Server-side AI processing to protect API keys and ensure security
- **Profession Prompts**: Customized system prompts for each profession type (engineer, lawyer, doctor, teacher, business analyst)
- **Credit System**: Token-based usage tracking to manage AI interaction costs

**Rationale**: Server-side processing prevents API key exposure and allows for usage monitoring and rate limiting.

### Chat System
- **Architecture**: HTTP-based chat with optimistic UI updates for responsiveness
- **Session Management**: Persistent chat sessions with message history storage
- **Real-time Features**: Typing indicators and immediate message rendering
- **Message Storage**: All conversations stored in PostgreSQL for history and analytics

**Implementation**: Uses TanStack Query for efficient caching and synchronization of chat data.

## Data Flow

1. **User Authentication**: Firebase handles login, server validates tokens, user data stored in PostgreSQL
2. **Chat Initiation**: User selects profession, creates new session with profession-specific prompt
3. **Message Processing**: User messages sent to server, forwarded to Gemini AI with context, responses stored and returned
4. **Credit Management**: Each AI interaction deducts credits from user account
5. **Session Persistence**: All chat history maintained for future reference

## External Dependencies

### Authentication
- **Firebase Authentication**: Handles user registration, login, and token management
- **Firebase Admin SDK**: Server-side token verification and user management

### AI Services
- **Google Gemini AI**: Core natural language processing capabilities
- **API Key Management**: Secure server-side storage of AI service credentials

### Database
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling
- **Connection Pooling**: Efficient database connection management

### UI Components
- **Radix UI**: Accessible, unstyled component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide Icons**: Consistent iconography throughout the application

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite development server with Express middleware integration
- **TypeScript Compilation**: Real-time type checking and compilation
- **Environment Variables**: Separate configuration for development and production

### Production Build
- **Frontend**: Vite builds optimized static assets to `/dist/public`
- **Backend**: esbuild compiles TypeScript server code to `/dist`
- **Static Serving**: Express serves frontend assets and handles API routes

### Database Management
- **Schema Deployment**: Drizzle Kit push commands for schema updates
- **Migration Strategy**: Version-controlled schema changes through migration files
- **Connection Management**: Environment-specific database URLs

**Rationale**: This deployment strategy provides a simple, monolithic deployment while maintaining development flexibility. The build process optimizes both frontend and backend code for production performance.

### Environment Configuration
- **Firebase**: Project ID, API keys, and service account credentials
- **Database**: PostgreSQL connection string for Neon Database
- **AI Services**: Google Gemini API key for natural language processing
- **Security**: All sensitive credentials managed through environment variables

The architecture emphasizes type safety, developer experience, and scalability while maintaining simplicity in deployment and maintenance.