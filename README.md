# Simple POS (Point of Sale) System

A modern, full-stack Point of Sale (POS) system built with Next.js, TypeScript, and Prisma. This application provides a complete solution for managing products, categories, orders, and sales with a beautiful, responsive UI.

## 🚀 Features

### Core Functionality
- **Product Management**: Create, edit, and delete products with image uploads
- **Category Management**: Organize products by categories
- **Order Processing**: Create orders with cart functionality
- **Sales Dashboard**: Track sales performance and analytics
- **Payment Integration**: Xendit payment gateway integration
- **QR Code Generation**: Generate QR codes for payments

### Technical Features
- **Authentication**: Clerk authentication system
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Updates**: tRPC for type-safe API calls
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Theme Support**: Dark/light mode toggle
- **Form Validation**: Zod schema validation
- **State Management**: Zustand for cart management

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Payment**: Xendit
- **State Management**: Zustand
- **API**: tRPC
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom components with Radix UI primitives

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- PostgreSQL database
- Clerk account for authentication
- Xendit account for payments
- Supabase account (optional, for hosting)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mySimplePOS
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/simple_pos"
DIRECT_URL="postgresql://username:password@localhost:5432/simple_pos"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Payment Gateway (Xendit)
XENDIT_SECRET_KEY=your_xendit_secret_key
XENDIT_CALLBACK_TOKEN=your_xendit_callback_token

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
mySimplePOS/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layouts/        # Layout components
│   │   ├── shared/         # Shared components
│   │   └── ui/            # Base UI components
│   ├── pages/             # Next.js pages
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Dashboard pages
│   │   ├── products/      # Product management
│   │   └── sales/         # Sales dashboard
│   ├── server/            # tRPC server setup
│   │   └── api/           # API routers
│   ├── store/             # State management
│   ├── utils/             # Utility functions
│   └── forms/             # Form schemas
├── prisma/                # Database schema
└── public/                # Static assets
```

## 🎯 Key Pages

### Dashboard (`/dashboard`)
- Main POS interface
- Product catalog with search and filtering
- Shopping cart functionality
- Category-based product filtering

### Products (`/products`)
- Product management interface
- Create, edit, and delete products
- Image upload functionality
- Category assignment

### Categories (`/categories`)
- Category management
- Create and edit categories
- Product count tracking

### Sales (`/sales`)
- Sales analytics dashboard
- Order tracking and management
- Revenue reporting
- Order status management

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run typecheck` - Run TypeScript type checking
- `npm run format:write` - Format code with Prettier
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## 🗄️ Database Schema

The application uses the following main models:

- **User**: Authentication and user management
- **Category**: Product categories
- **Product**: Products with pricing and images
- **Order**: Order management with payment status
- **OrderItem**: Individual items in orders

## 🔐 Authentication

The application uses Clerk for authentication. Users can:
- Sign up with email/password
- Sign in with various providers
- Access protected routes
- Manage their profile

## 💳 Payment Integration

The system integrates with Xendit for payment processing:
- QR code generation for payments
- Webhook handling for payment status updates
- Multiple payment method support

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme toggle functionality
- **Modern UI**: Clean, intuitive interface using Radix UI
- **Loading States**: Skeleton loaders and loading indicators
- **Toast Notifications**: User feedback for actions
- **Form Validation**: Real-time validation with error messages

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔄 Version History

- **v0.1.0** - Initial release with core POS functionality
  - Product and category management
  - Order processing
  - Sales dashboard
  - Payment integration

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies. 