import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
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
  PieChart,
  DollarSign,
  X,
  Eye,
  Edit
} from 'lucide-react';

interface Transaction {
  id: number;
  type: string;
  description: string;
  amount: number;
  date: string;
  status: string;
  category: string;
  reference: string;
}

interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
  code: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientName: string;
  description: string;
  amount: number;
  date: string;
  dueDate: string;
  status: string;
  paidAmount: number;
}

interface Payment {
  id: number;
  paymentNumber: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
  status: string;
}

interface FilterState {
  search: string;
  type: string;
  status: string;
  category: string;
  amount: string;
}

const FinancePage: React.FC = () => {
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    status: 'all',
    category: 'all',
    amount: ''
  });

  // Dialog state
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isNewTransactionDialogOpen, setIsNewTransactionDialogOpen] = useState(false);
  const [isNewInvoiceDialogOpen, setIsNewInvoiceDialogOpen] = useState(false);
  const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
  const [isViewTransactionDialogOpen, setIsViewTransactionDialogOpen] = useState(false);
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false);
  const [isViewAccountDialogOpen, setIsViewAccountDialogOpen] = useState(false);
  const [isNewPaymentDialogOpen, setIsNewPaymentDialogOpen] = useState(false);
  const [isViewInvoicesDialogOpen, setIsViewInvoicesDialogOpen] = useState(false);
  const [isOverdueInvoicesDialogOpen, setIsOverdueInvoicesDialogOpen] = useState(false);
  const [isPaymentHistoryDialogOpen, setIsPaymentHistoryDialogOpen] = useState(false);
  const [isPendingPaymentsDialogOpen, setIsPendingPaymentsDialogOpen] = useState(false);
  const [isProfitLossDialogOpen, setIsProfitLossDialogOpen] = useState(false);
  const [isBalanceSheetDialogOpen, setIsBalanceSheetDialogOpen] = useState(false);
  const [isCashFlowDialogOpen, setIsCashFlowDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

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

  const [transactions, setTransactions] = useState<Transaction[]>([
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
  ]);

  const [accounts, setAccounts] = useState<Account[]>([
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
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      clientName: 'Highlands Construction Ltd',
      description: 'Equipment Rental - Excavator PC200',
      amount: 45000,
      date: '2024-03-01',
      dueDate: '2024-03-31',
      status: 'paid',
      paidAmount: 45000
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      clientName: 'PNG Mining Corporation',
      description: 'Spare Parts - Hydraulic Pump Assembly',
      amount: 12500,
      date: '2024-03-05',
      dueDate: '2024-04-05',
      status: 'pending',
      paidAmount: 0
    },
    {
      id: 3,
      invoiceNumber: 'INV-2024-003',
      clientName: 'Port Moresby Construction',
      description: 'Equipment Rental - Bulldozer D6T',
      amount: 32000,
      date: '2024-03-10',
      dueDate: '2024-04-10',
      status: 'overdue',
      paidAmount: 0
    }
  ]);

  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 1,
      paymentNumber: 'PAY-2024-001',
      invoiceNumber: 'INV-2024-001',
      clientName: 'Highlands Construction Ltd',
      amount: 45000,
      date: '2024-03-15',
      method: 'Bank Transfer',
      reference: 'BT-2024-001',
      status: 'completed'
    },
    {
      id: 2,
      paymentNumber: 'PAY-2024-002',
      invoiceNumber: 'INV-2024-004',
      clientName: 'Goroka Engineering',
      amount: 28000,
      date: '2024-03-12',
      method: 'Cash',
      reference: 'CASH-2024-001',
      status: 'completed'
    }
  ]);

  // Get unique values for filter options
  const types = useMemo(() => 
    Array.from(new Set(transactions.map(item => item.type))), 
    [transactions]
  );

  const statuses = useMemo(() => 
    Array.from(new Set(transactions.map(item => item.status))), 
    [transactions]
  );

  const categories = useMemo(() => 
    Array.from(new Set(transactions.map(item => item.category))), 
    [transactions]
  );

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(item => {
      // Search filter
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        item.description.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) || 
        item.reference.toLowerCase().includes(searchLower);

      // Type filter
      const matchesType = !filters.type || filters.type === 'all' || item.type === filters.type;
      
      // Status filter
      const matchesStatus = !filters.status || filters.status === 'all' || item.status === filters.status;
      
      // Category filter
      const matchesCategory = !filters.category || filters.category === 'all' || item.category === filters.category;
      
      // Amount filter
      const matchesAmount = !filters.amount || item.amount.toString() === filters.amount;

      return matchesSearch && matchesType && matchesStatus && matchesCategory && matchesAmount;
    });
  }, [transactions, filters]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      category: 'all',
      amount: ''
    });
  };

  // Close filter dialog
  const closeFilterDialog = () => {
    setIsFilterDialogOpen(false);
  };

  // New transaction form state
  const [newTransaction, setNewTransaction] = useState({
    type: 'income',
    description: '',
    amount: '',
    category: '',
    reference: '',
    status: 'completed'
  });

  // Edit transaction form state
  const [editTransaction, setEditTransaction] = useState({
    type: 'income',
    description: '',
    amount: '',
    category: '',
    reference: '',
    status: 'completed'
  });

  // Edit account form state
  const [editAccount, setEditAccount] = useState({
    name: '',
    type: '',
    code: '',
    balance: ''
  });

  // New invoice form state
  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: '',
    clientName: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: ''
  });

  // New payment form state
  const [newPayment, setNewPayment] = useState({
    invoiceNumber: '',
    clientName: '',
    amount: '',
    method: 'Bank Transfer',
    reference: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Add new transaction
  const addNewTransaction = () => {
    const transaction: Transaction = {
      id: Math.max(...transactions.map(item => item.id)) + 1,
      type: newTransaction.type,
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount) || 0,
      date: new Date().toISOString().split('T')[0] ?? '',
      status: newTransaction.status,
      category: newTransaction.category,
      reference: newTransaction.reference
    };

    setTransactions(prevTransactions => [...prevTransactions, transaction]);
    
    setNewTransaction({
      type: 'income',
      description: '',
      amount: '',
      category: '',
      reference: '',
      status: 'completed'
    });
    setIsNewTransactionDialogOpen(false);
  };

  // Edit transaction
  const editTransactionItem = () => {
    if (!selectedTransaction) return;

    const updatedTransaction: Transaction = {
      ...selectedTransaction,
      type: editTransaction.type,
      description: editTransaction.description,
      amount: parseFloat(editTransaction.amount) || 0,
      category: editTransaction.category,
      reference: editTransaction.reference,
      status: editTransaction.status
    };

    setTransactions(prevTransactions => 
      prevTransactions.map(item => item.id === selectedTransaction.id ? updatedTransaction : item)
    );
    
    setEditTransaction({
      type: 'income',
      description: '',
      amount: '',
      category: '',
      reference: '',
      status: 'completed'
    });
    setSelectedTransaction(null);
    setIsEditTransactionDialogOpen(false);
  };

  // Edit account
  const editAccountItem = () => {
    if (!selectedAccount) return;

    const updatedAccount: Account = {
      ...selectedAccount,
      name: editAccount.name,
      type: editAccount.type,
      code: editAccount.code,
      balance: parseFloat(editAccount.balance) || 0
    };

    setAccounts(prevAccounts => 
      prevAccounts.map(item => item.id === selectedAccount.id ? updatedAccount : item)
    );
    
    setEditAccount({
      name: '',
      type: '',
      code: '',
      balance: ''
    });
    setSelectedAccount(null);
    setIsEditAccountDialogOpen(false);
  };

  // Add new invoice
  const addNewInvoice = () => {
    const invoice: Invoice = {
      id: Math.max(...invoices.map(item => item.id)) + 1,
      invoiceNumber: newInvoice.invoiceNumber,
      clientName: newInvoice.clientName,
      description: newInvoice.description,
      amount: parseFloat(newInvoice.amount) || 0,
      date: newInvoice.date!,
      dueDate: newInvoice.dueDate,
      status: 'pending',
      paidAmount: 0
    };

    setInvoices(prevInvoices => [...prevInvoices, invoice]);
    
    setNewInvoice({
      invoiceNumber: '',
      clientName: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: ''
    });
    setIsNewInvoiceDialogOpen(false);
    alert('Invoice created successfully!');
  };

  // Add new payment
  const addNewPayment = () => {
    const payment: Payment = {
      id: Math.max(...payments.map(item => item.id)) + 1,
      paymentNumber: `PAY-${new Date().getFullYear()}-${String(Math.max(...payments.map(item => item.id)) + 1).padStart(3, '0')}`,
      invoiceNumber: newPayment.invoiceNumber,
      clientName: newPayment.clientName,
      amount: parseFloat(newPayment.amount) || 0,
      date: newPayment.date!,
      method: newPayment.method,
      reference: newPayment.reference,
      status: 'completed'
    };

    setPayments(prevPayments => [...prevPayments, payment]);
    
    // Update invoice paid amount
    setInvoices(prevInvoices => 
      prevInvoices.map(invoice => 
        invoice.invoiceNumber === newPayment.invoiceNumber 
          ? { ...invoice, paidAmount: invoice.paidAmount + parseFloat(newPayment.amount) || 0 }
          : invoice
      )
    );
    
    setNewPayment({
      invoiceNumber: '',
      clientName: '',
      amount: '',
      method: 'Bank Transfer',
      reference: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsNewPaymentDialogOpen(false);
    alert('Payment recorded successfully!');
  };

  // Handle edit transaction button click
  const handleEditTransactionClick = (item: Transaction) => {
    setSelectedTransaction(item);
    setEditTransaction({
      type: item.type,
      description: item.description,
      amount: item.amount.toString(),
      category: item.category,
      reference: item.reference,
      status: item.status
    });
    setIsEditTransactionDialogOpen(true);
  };

  // Handle view transaction button click
  const handleViewTransactionClick = (item: Transaction) => {
    setSelectedTransaction(item);
    setIsViewTransactionDialogOpen(true);
  };

  // Handle edit account button click
  const handleEditAccountClick = (item: Account) => {
    setSelectedAccount(item);
    setEditAccount({
      name: item.name,
      type: item.type,
      code: item.code,
      balance: item.balance.toString()
    });
    setIsEditAccountDialogOpen(true);
  };

  // Handle view account button click
  const handleViewAccountClick = (item: Account) => {
    setSelectedAccount(item);
    setIsViewAccountDialogOpen(true);
  };

  // Check if forms are valid
  const isNewTransactionFormValid = newTransaction.description && newTransaction.amount && 
    newTransaction.category && newTransaction.reference;

  const isEditTransactionFormValid = editTransaction.description && editTransaction.amount && 
    editTransaction.category && editTransaction.reference;

  const isEditAccountFormValid = editAccount.name && editAccount.type && editAccount.code && editAccount.balance;

  const isNewInvoiceFormValid = newInvoice.invoiceNumber && newInvoice.clientName && 
    newInvoice.description && newInvoice.amount && newInvoice.dueDate;

  const isNewPaymentFormValid = newPayment.invoiceNumber && newPayment.clientName && 
    newPayment.amount && newPayment.reference;

  // Check if any filters are active
  const hasActiveFilters = filters.search || 
    (filters.type && filters.type !== 'all') || 
    (filters.status && filters.status !== 'all') || 
    (filters.category && filters.category !== 'all') || 
    filters.amount;

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
            <Dialog open={isNewInvoiceDialogOpen} onOpenChange={setIsNewInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  New Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                      <Input
                        id="invoiceNumber"
                        placeholder="e.g., INV-2024-001"
                        value={newInvoice.invoiceNumber}
                        onChange={(e) => setNewInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="invoiceDate">Invoice Date *</Label>
                      <Input
                        id="invoiceDate"
                        type="date"
                        value={newInvoice.date}
                        onChange={(e) => setNewInvoice(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      placeholder="e.g., Highlands Construction"
                      value={newInvoice.clientName}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, clientName: e.target.value }))}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      placeholder="e.g., Equipment rental services"
                      value={newInvoice.description}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="e.g., 45000"
                        value={newInvoice.amount}
                        onChange={(e) => setNewInvoice(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newInvoice.dueDate}
                        onChange={(e) => setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewInvoiceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addNewInvoice} disabled={!isNewInvoiceFormValid}>
                    Create Invoice
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isNewTransactionDialogOpen} onOpenChange={setIsNewTransactionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="transactionType">Transaction Type *</Label>
                      <Select 
                        value={newTransaction.type} 
                        onValueChange={(value) => setNewTransaction(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="transactionStatus">Status</Label>
                      <Select 
                        value={newTransaction.status} 
                        onValueChange={(value) => setNewTransaction(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="transactionDescription">Description *</Label>
                    <Input
                      id="transactionDescription"
                      placeholder="e.g., Equipment Rental - Highlands Construction"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="transactionAmount">Amount *</Label>
                      <Input
                        id="transactionAmount"
                        type="number"
                        placeholder="e.g., 45000"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="transactionCategory">Category *</Label>
                      <Input
                        id="transactionCategory"
                        placeholder="e.g., Rental Revenue"
                        value={newTransaction.category}
                        onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="transactionReference">Reference *</Label>
                    <Input
                      id="transactionReference"
                      placeholder="e.g., INV-2024-001"
                      value={newTransaction.reference}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, reference: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setNewTransaction({
                        type: 'income',
                        description: '',
                        amount: '',
                        category: '',
                        reference: '',
                        status: 'completed'
                      });
                      setIsNewTransactionDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={addNewTransaction}
                    disabled={!isNewTransactionFormValid}
                  >
                    Add Transaction
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search transactions by description, category, or reference..." 
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
              </div>
              
              <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1">
                        {[
                          filters.type !== 'all' ? filters.type : null,
                          filters.status !== 'all' ? filters.status : null,
                          filters.category !== 'all' ? filters.category : null,
                          filters.amount
                        ].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Filter Transactions</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Transaction Type</Label>
                      <Select 
                        value={filters.type} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {types.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type === 'income' ? 'Income' : 'Expense'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={filters.status} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status === 'completed' ? 'Completed' : 
                               status === 'pending' ? 'Pending' : 
                               status === 'overdue' ? 'Overdue' : status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={filters.category} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input 
                        type="number"
                        placeholder="Enter amount"
                        value={filters.amount}
                        onChange={(e) => setFilters(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All
                    </Button>
                    <Button onClick={closeFilterDialog}>
                      Apply Filters
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.type && filters.type !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {filters.type === 'income' ? 'Income' : 'Expense'}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, type: 'all' }))}
                    />
                  </Badge>
                )}
                {filters.status && filters.status !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {filters.status === 'completed' ? 'Completed' : 
                            filters.status === 'pending' ? 'Pending' : 
                            filters.status === 'overdue' ? 'Overdue' : filters.status}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                    />
                  </Badge>
                )}
                {filters.category && filters.category !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {filters.category}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                    />
                  </Badge>
                )}
                {filters.amount && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Amount: {filters.amount}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, amount: '' }))}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-500">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>

            <div className="space-y-4">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
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
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewTransactionClick(transaction)}>View</Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditTransactionClick(transaction)}>Edit</Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No transactions found matching your filters.
                </div>
              )}
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
                          <Button size="sm" variant="outline" onClick={() => handleViewAccountClick(account)}>View</Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditAccountClick(account)}>Edit</Button>
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
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsNewInvoiceDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsViewInvoicesDialogOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                View Invoices
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsOverdueInvoicesDialogOpen(true)}
              >
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
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsNewPaymentDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsPaymentHistoryDialogOpen(true)}
              >
                <Banknote className="mr-2 h-4 w-4" />
                Payment History
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsPendingPaymentsDialogOpen(true)}
              >
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
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsProfitLossDialogOpen(true)}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Profit & Loss
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsBalanceSheetDialogOpen(true)}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Balance Sheet
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsCashFlowDialogOpen(true)}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Cash Flow
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Edit Transaction Dialog */}
        <Dialog open={isEditTransactionDialogOpen} onOpenChange={setIsEditTransactionDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editTransactionType">Transaction Type *</Label>
                  <Select 
                    value={editTransaction.type} 
                    onValueChange={(value) => setEditTransaction(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editTransactionStatus">Status</Label>
                  <Select 
                    value={editTransaction.status} 
                    onValueChange={(value) => setEditTransaction(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editTransactionDescription">Description *</Label>
                <Input
                  id="editTransactionDescription"
                  placeholder="e.g., Equipment Rental - Highlands Construction"
                  value={editTransaction.description}
                  onChange={(e) => setEditTransaction(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editTransactionAmount">Amount *</Label>
                  <Input
                    id="editTransactionAmount"
                    type="number"
                    placeholder="e.g., 45000"
                    value={editTransaction.amount}
                    onChange={(e) => setEditTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editTransactionCategory">Category *</Label>
                  <Input
                    id="editTransactionCategory"
                    placeholder="e.g., Rental Revenue"
                    value={editTransaction.category}
                    onChange={(e) => setEditTransaction(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editTransactionReference">Reference *</Label>
                <Input
                  id="editTransactionReference"
                  placeholder="e.g., INV-2024-001"
                  value={editTransaction.reference}
                  onChange={(e) => setEditTransaction(prev => ({ ...prev, reference: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditTransaction({
                    type: 'income',
                    description: '',
                    amount: '',
                    category: '',
                    reference: '',
                    status: 'completed'
                  });
                  setSelectedTransaction(null);
                  setIsEditTransactionDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={editTransactionItem}
                disabled={!isEditTransactionFormValid}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Transaction Dialog */}
        <Dialog open={isViewTransactionDialogOpen} onOpenChange={setIsViewTransactionDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            {selectedTransaction ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Transaction Type</Label>
                    <div className="font-medium">{selectedTransaction.type === 'income' ? 'Income' : 'Expense'}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <div className="font-medium">{getStatusBadge(selectedTransaction.status)}</div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <div className="font-medium">{selectedTransaction.description}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Amount</Label>
                    <div className={`font-medium ${selectedTransaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(selectedTransaction.amount)}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <div className="font-medium">{selectedTransaction.category}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Reference</Label>
                    <div className="font-medium">{selectedTransaction.reference}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Date</Label>
                    <div className="font-medium">{selectedTransaction.date}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No transaction selected for viewing.</div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setIsViewTransactionDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Account Dialog */}
        <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editAccountCode">Account Code *</Label>
                  <Input
                    id="editAccountCode"
                    placeholder="e.g., 1000"
                    value={editAccount.code}
                    onChange={(e) => setEditAccount(prev => ({ ...prev, code: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editAccountType">Account Type *</Label>
                  <Select 
                    value={editAccount.type} 
                    onValueChange={(value) => setEditAccount(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asset">Asset</SelectItem>
                      <SelectItem value="liability">Liability</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editAccountName">Account Name *</Label>
                <Input
                  id="editAccountName"
                  placeholder="e.g., Cash & Bank"
                  value={editAccount.name}
                  onChange={(e) => setEditAccount(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editAccountBalance">Balance *</Label>
                <Input
                  id="editAccountBalance"
                  type="number"
                  placeholder="e.g., 245000"
                  value={editAccount.balance}
                  onChange={(e) => setEditAccount(prev => ({ ...prev, balance: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditAccount({
                    name: '',
                    type: '',
                    code: '',
                    balance: ''
                  });
                  setSelectedAccount(null);
                  setIsEditAccountDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={editAccountItem}
                disabled={!isEditAccountFormValid}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Account Dialog */}
        <Dialog open={isViewAccountDialogOpen} onOpenChange={setIsViewAccountDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Account Details</DialogTitle>
            </DialogHeader>
            {selectedAccount ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Account Code</Label>
                    <div className="font-medium">{selectedAccount.code}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Account Name</Label>
                    <div className="font-medium">{selectedAccount.name}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Account Type</Label>
                    <div className="font-medium">
                      <Badge variant="outline" className="capitalize">
                        {selectedAccount.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Balance</Label>
                    <div className={`font-medium ${selectedAccount.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(selectedAccount.balance)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No account selected for viewing.</div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setIsViewAccountDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Payment Dialog */}
        <Dialog open={isNewPaymentDialogOpen} onOpenChange={setIsNewPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="paymentInvoiceNumber">Invoice Number *</Label>
                  <Input
                    id="paymentInvoiceNumber"
                    placeholder="e.g., INV-2024-001"
                    value={newPayment.invoiceNumber}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentDate">Payment Date *</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={newPayment.date}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paymentClientName">Client Name *</Label>
                <Input
                  id="paymentClientName"
                  placeholder="e.g., Highlands Construction"
                  value={newPayment.clientName}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, clientName: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="paymentAmount">Amount *</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    placeholder="e.g., 45000"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select 
                    value={newPayment.method} 
                    onValueChange={(value) => setNewPayment(prev => ({ ...prev, method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paymentReference">Reference *</Label>
                <Input
                  id="paymentReference"
                  placeholder="e.g., BT-2024-001"
                  value={newPayment.reference}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, reference: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addNewPayment} disabled={!isNewPaymentFormValid}>
                Record Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Invoices Dialog */}
        <Dialog open={isViewInvoicesDialogOpen} onOpenChange={setIsViewInvoicesDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>All Invoices</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-500">{invoice.clientName}</div>
                      <div className="text-sm text-gray-500">{invoice.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(invoice.amount)}</div>
                      <div className="text-sm text-gray-500">Due: {invoice.dueDate}</div>
                      <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'outline'}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsViewInvoicesDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Overdue Invoices Dialog */}
        <Dialog open={isOverdueInvoicesDialogOpen} onOpenChange={setIsOverdueInvoicesDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Overdue Invoices</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {invoices.filter(invoice => invoice.status === 'overdue').map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <div className="font-medium">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-500">{invoice.clientName}</div>
                      <div className="text-sm text-gray-500">{invoice.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(invoice.amount)}</div>
                      <div className="text-sm text-red-600">Overdue since: {invoice.dueDate}</div>
                      <Badge variant="destructive">Overdue</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsOverdueInvoicesDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment History Dialog */}
        <Dialog open={isPaymentHistoryDialogOpen} onOpenChange={setIsPaymentHistoryDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Payment History</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{payment.paymentNumber}</div>
                      <div className="text-sm text-gray-500">{payment.clientName}</div>
                      <div className="text-sm text-gray-500">Invoice: {payment.invoiceNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(payment.amount)}</div>
                      <div className="text-sm text-gray-500">{payment.date}</div>
                      <div className="text-sm text-gray-500">{payment.method}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsPaymentHistoryDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pending Payments Dialog */}
        <Dialog open={isPendingPaymentsDialogOpen} onOpenChange={setIsPendingPaymentsDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Pending Payments</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {invoices.filter(invoice => invoice.status === 'pending').map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div>
                      <div className="font-medium">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-500">{invoice.clientName}</div>
                      <div className="text-sm text-gray-500">{invoice.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(invoice.amount)}</div>
                      <div className="text-sm text-yellow-600">Due: {invoice.dueDate}</div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsPendingPaymentsDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Profit & Loss Dialog */}
        <Dialog open={isProfitLossDialogOpen} onOpenChange={setIsProfitLossDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Profit & Loss Statement</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-green-600">Revenue</h3>
                  <div className="text-2xl font-bold">{formatCurrency(financialStats.revenue.monthly)}</div>
                  <div className="text-sm text-gray-500">Monthly Revenue</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-red-600">Expenses</h3>
                  <div className="text-2xl font-bold">{formatCurrency(financialStats.expenses.monthly)}</div>
                  <div className="text-sm text-gray-500">Monthly Expenses</div>
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-green-50">
                <h3 className="font-medium text-green-600">Net Profit</h3>
                <div className="text-3xl font-bold text-green-600">{formatCurrency(financialStats.profit.monthly)}</div>
                <div className="text-sm text-gray-500">Monthly Net Profit</div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsProfitLossDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Balance Sheet Dialog */}
        <Dialog open={isBalanceSheetDialogOpen} onOpenChange={setIsBalanceSheetDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Balance Sheet</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Assets</h3>
                <div className="space-y-2">
                  {accounts.filter(account => account.type === 'asset').map((account) => (
                    <div key={account.id} className="flex justify-between p-2 border rounded">
                      <span>{account.name}</span>
                      <span className="font-medium">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">Liabilities</h3>
                <div className="space-y-2">
                  {accounts.filter(account => account.type === 'liability').map((account) => (
                    <div key={account.id} className="flex justify-between p-2 border rounded">
                      <span>{account.name}</span>
                      <span className="font-medium">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsBalanceSheetDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cash Flow Dialog */}
        <Dialog open={isCashFlowDialogOpen} onOpenChange={setIsCashFlowDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Cash Flow Statement</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="p-4 border rounded-lg bg-green-50">
                <h3 className="font-medium text-green-600">Cash Inflows</h3>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(financialStats.revenue.monthly)}</div>
                <div className="text-sm text-gray-500">From Operations</div>
              </div>
              <div className="p-4 border rounded-lg bg-red-50">
                <h3 className="font-medium text-red-600">Cash Outflows</h3>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(financialStats.expenses.monthly)}</div>
                <div className="text-sm text-gray-500">Operating Expenses</div>
              </div>
              <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="font-medium text-blue-600">Net Cash Flow</h3>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(financialStats.profit.monthly)}</div>
                <div className="text-sm text-gray-500">Monthly Net Cash Flow</div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsCashFlowDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default FinancePage; 