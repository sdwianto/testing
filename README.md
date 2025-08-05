# NextGen ERP System

A comprehensive Enterprise Resource Planning (ERP) system built for NextGen Technology Limited, Papua New Guinea. This modern, full-stack ERP solution provides complete business management capabilities with offline support, real-time analytics, and modular architecture.

## 🚀 Features

### Core ERP Modules
- **Dashboard & Analytics**: Real-time KPI monitoring, business intelligence, and performance metrics
- **Inventory & Procurement**: Multi-warehouse inventory management, purchase orders, supplier management
- **Equipment & Rental**: Heavy equipment tracking, rental management, maintenance scheduling
- **Finance & Accounting**: General ledger, accounts payable/receivable, financial reporting
- **HRMS & Payroll**: Employee management, attendance tracking, payroll processing
- **CRM**: Customer relationship management, contact tracking, sales pipeline
- **Sales & Orders**: Order processing, customer management, payment integration

### Advanced Features
- **Offline Capability**: PouchDB integration for offline data entry and sync
- **Real-time Updates**: WebSocket integration for live dashboard updates
- **Role-based Access Control**: Granular permissions and security
- **Multi-warehouse Support**: Distributed inventory management
- **Equipment Maintenance**: Preventive and corrective maintenance tracking
- **Business Intelligence**: Advanced reporting and analytics
- **Audit Trail**: Complete system activity logging

### Technical Features
- **Authentication**: Clerk authentication with role-based access
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Updates**: tRPC for type-safe API calls
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Theme Support**: Dark/light mode toggle
- **Form Validation**: Zod schema validation
- **State Management**: Zustand for application state
- **Offline Sync**: PouchDB + CouchDB for offline capabilities

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
- **Offline Sync**: PouchDB, CouchDB
- **Real-time**: Socket.io
- **Charts**: Recharts
- **Tables**: TanStack Table
- **File Handling**: React Dropzone, PDF generation

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
cd nextgen-erp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nextgen_erp"
DIRECT_URL="postgresql://username:password@localhost:5432/nextgen_erp"

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

# Offline Sync (CouchDB)
COUCHDB_URL=your_couchdb_url
COUCHDB_USERNAME=your_couchdb_username
COUCHDB_PASSWORD=your_couchdb_password
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with initial data
npm run db:seed

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
nextgen-erp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layouts/        # Layout components
│   │   ├── shared/         # Shared components
│   │   ├── ui/            # Base UI components
│   │   └── modules/       # ERP module components
│   ├── pages/             # Next.js pages
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── inventory/     # Inventory management
│   │   ├── equipment/     # Equipment & rental
│   │   ├── finance/       # Finance & accounting
│   │   ├── hrms/          # HR & payroll
│   │   ├── crm/           # Customer management
│   │   ├── sales/         # Sales & orders
│   │   ├── reports/       # Reports & analytics
│   │   └── settings/      # System settings
│   ├── server/            # tRPC server setup
│   │   └── api/           # API routers
│   ├── store/             # State management
│   ├── utils/             # Utility functions
│   ├── forms/             # Form schemas
│   └── hooks/             # Custom hooks
├── prisma/                # Database schema
└── public/                # Static assets
```

## 🎯 Key Pages & Modules

### Dashboard (`/dashboard`)
- Real-time KPI monitoring
- Business intelligence widgets
- Recent activities feed
- Quick action buttons
- Upcoming events calendar

### Inventory (`/inventory`)
- Multi-warehouse inventory management
- Stock level monitoring
- Purchase order management
- Supplier management
- Inventory transactions

### Equipment (`/equipment`)
- Equipment tracking and management
- Rental order processing
- Equipment status monitoring
- Location tracking
- Utilization analytics

### Maintenance (`/maintenance`)
- Preventive maintenance scheduling
- Corrective maintenance tracking
- Maintenance history
- Parts management
- Cost tracking

### Finance (`/finance`)
- General ledger management
- Accounts payable/receivable
- Financial transactions
- Chart of accounts
- Financial reporting

### HRMS (`/hrms`)
- Employee management
- Attendance tracking
- Leave management
- Payroll processing
- Performance tracking

### CRM (`/crm`)
- Customer management
- Contact tracking
- Sales pipeline
- Customer interactions
- Lead management

### Sales (`/sales`)
- Order processing
- Customer management
- Payment integration
- Order tracking
- Sales analytics

### Reports (`/reports`)
- Business intelligence dashboards
- Custom report generation
- Data analytics
- Performance metrics
- Export capabilities

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
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio

## 🗄️ Database Schema

The ERP system uses a comprehensive database schema with the following main modules:

### Core System
- **User**: Authentication and user management
- **Role**: Role-based access control
- **Department**: Organizational structure
- **AuditLog**: System activity logging

### Inventory & Procurement
- **Category**: Product categorization
- **Product**: Product master data
- **Warehouse**: Multi-warehouse support
- **InventoryItem**: Stock levels per warehouse
- **InventoryTransaction**: Stock movements
- **PurchaseOrder**: Procurement management
- **Supplier**: Supplier master data

### Equipment & Maintenance
- **Equipment**: Equipment master data
- **MaintenanceRecord**: Maintenance history
- **RentalOrder**: Equipment rental management

### Finance & Accounting
- **FinancialTransaction**: Financial transactions
- **Account**: Chart of accounts

### HRMS & Payroll
- **Employee**: Employee master data
- **AttendanceRecord**: Attendance tracking
- **LeaveRequest**: Leave management
- **PayrollRecord**: Payroll processing

### CRM
- **Customer**: Customer master data
- **CustomerContact**: Customer interactions

### Sales & Orders
- **Order**: Sales order management
- **OrderItem**: Order line items

### Offline Sync
- **SyncLog**: Offline synchronization tracking

## 🔐 Authentication & Security

The application uses Clerk for authentication with:
- Role-based access control (RBAC)
- Granular permissions per module
- Audit trail for all activities
- Multi-factor authentication support
- Session management

## 💳 Payment Integration

The system integrates with Xendit for payment processing:
- Multiple payment methods
- QR code generation
- Webhook handling
- Payment status tracking
- Receipt generation

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme toggle functionality
- **Modern UI**: Clean, intuitive interface using Radix UI
- **Loading States**: Skeleton loaders and loading indicators
- **Toast Notifications**: User feedback for actions
- **Form Validation**: Real-time validation with error messages
- **Data Tables**: Sortable, filterable data tables
- **Charts & Graphs**: Business intelligence visualizations

## 🔄 Offline Capability

The ERP system supports offline operation:
- **PouchDB**: Local data storage on client devices
- **CouchDB**: Server-side sync database
- **Conflict Resolution**: Automatic conflict handling
- **Auto-sync**: Automatic synchronization when online
- **Data Integrity**: Ensures data consistency

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker Deployment

```bash
# Build the Docker image
docker build -t nextgen-erp .

# Run the container
docker run -p 3000:3000 nextgen-erp
```

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify
- Google Cloud Run

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

- **v1.0.0** - Initial ERP release
  - Complete ERP modules (Inventory, Equipment, Finance, HRMS, CRM)
  - Offline capability with PouchDB/CouchDB
  - Real-time dashboard and analytics
  - Role-based access control
  - Multi-warehouse support
  - Equipment maintenance tracking
  - Business intelligence features

---

Built with ❤️ for NextGen Technology Limited, Papua New Guinea using Next.js, TypeScript, and modern web technologies. 