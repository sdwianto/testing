import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  Building2,
  Receipt,
  CreditCard,
  Banknote,
  PieChart
} from 'lucide-react';

const FinancePage: React.FC = () => {
  // Mock data for demonstration
  const financialStats = {
    revenue: {
      monthly: 850000,
      growth: 12.5,
      trend: 'up'
    },
    expenses: {
      monthly: 320000,
      growth: -5.2,
      trend: 'down'
    },
    profit: {
      monthly: 530000,
      growth: 18.7,
      trend: 'up'
    },
    pendingPayments: {
      amount: 125000,
      count: 23
    }
  };

  const transactions = [
    {
      id: 1,
      type: 'income',
      description: 'Equipment Rental - Highlands Construction',
      amount: 45000,
      date: '2024-03-10',
      status: 'completed',
      category: 'Rental Revenue',
      reference: 'INV-2024-001'
    },
    {
      id: 2,
      type: 'expense',
      description: 'Equipment Maintenance - Excavator PC200',
      amount: -8500,
      date: '2024-03-09',
      status: 'completed',
      category: 'Maintenance',
      reference: 'EXP-2024-015'
    },
    {
      id: 3,
      type: 'income',
      description: 'Spare Parts Sale - Mining Corp PNG',
      amount: 12500,
      date: '2024-03-08',
      status: 'pending',
      category: 'Parts Sales',
      reference: 'INV-2024-002'
    },
    {
      id: 4,
      type: 'expense',
      description: 'Employee Payroll - March 2024',
      amount: -125000,
      date: '2024-03-07',
      status: 'completed',
      category: 'Payroll',
      reference: 'EXP-2024-016'
    },
    {
      id: 5,
      type: 'income',
      description: 'Equipment Rental - Port Moresby Construction',
      amount: 32000,
      date: '2024-03-06',
      status: 'completed',
      category: 'Rental Revenue',
      reference: 'INV-2024-003'
    }
  ];

  const accounts = [
    {
      id: 1,
      name: 'Cash & Bank',
      type: 'asset',
      balance: 245000,
      code: '1000'
    },
    {
      id: 2,
      name: 'Accounts Receivable',
      type: 'asset',
      balance: 125000,
      code: '1100'
    },
    {
      id: 3,
      name: 'Equipment Assets',
      type: 'asset',
      balance: 2500000,
      code: '1500'
    },
    {
      id: 4,
      name: 'Accounts Payable',
      type: 'liability',
      balance: -85000,
      code: '2000'
    },
    {
      id: 5,
      name: 'Rental Revenue',
      type: 'income',
      balance: 850000,
      code: '4000'
    },
    {
      id: 6,
      name: 'Maintenance Expenses',
      type: 'expense',
      balance: -125000,
      code: '5000'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'expense':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Finance & Accounting</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage financial transactions, accounts, and reporting</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              New Invoice
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Transaction
            </Button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financialStats.revenue.monthly)}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500" /> +{financialStats.revenue.growth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financialStats.expenses.monthly)}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="inline h-3 w-3 text-green-500" /> {financialStats.expenses.growth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financialStats.profit.monthly)}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500" /> +{financialStats.profit.growth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financialStats.pendingPayments.amount)}</div>
              <p className="text-xs text-muted-foreground">
                {financialStats.pendingPayments.count} invoices pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search transactions..." 
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getTypeIcon(transaction.type)}
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-gray-500">
                        {transaction.category} • {transaction.reference} • {transaction.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                    {getStatusBadge(transaction.status)}
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart of Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Chart of Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Account Code</th>
                    <th className="text-left p-3 font-medium">Account Name</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Balance</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3 font-mono">{account.code}</td>
                      <td className="p-3 font-medium">{account.name}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="capitalize">
                          {account.type}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className={`font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(account.balance)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Invoicing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" />
                View Invoices
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Overdue Invoices
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Banknote className="mr-2 h-4 w-4" />
                Payment History
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Pending Payments
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Profit & Loss
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Balance Sheet
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                Cash Flow
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinancePage; 