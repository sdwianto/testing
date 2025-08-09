import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Calendar,
  Search,
  Filter,
  Plus,
  MessageSquare,
  Target,
  UserPlus,
  Activity,
  X,
  Eye,
  Edit,
  Clock,
  FileText,
  BarChart3
} from 'lucide-react';

interface Customer {
  id: number;
  customerId: string;
  name: string;
  type: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  totalSpent: number;
  lastOrder: string;
  nextFollowUp: string;
  rating: number;
}

interface Lead {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  value: number;
  assignedTo: string;
  nextAction: string;
}

interface Opportunity {
  id: number;
  customerName: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expectedClose: string;
  assignedTo: string;
}

interface EmailCampaign {
  id: number;
  subject: string;
  recipientCount: number;
  sentDate: string;
  status: string;
  openRate: number;
  clickRate: number;
}

interface CallLog {
  id: number;
  customerName: string;
  contactPerson: string;
  phone: string;
  callDate: string;
  duration: string;
  outcome: string;
  notes: string;
  assignedTo: string;
}

interface FollowUp {
  id: number;
  customerName: string;
  contactPerson: string;
  followUpDate: string;
  type: string;
  status: string;
  notes: string;
  assignedTo: string;
}

interface FilterState {
  search: string;
  type: string;
  status: string;
  source: string;
  stage: string;
}

const CRMPage: React.FC = () => {
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    status: 'all',
    source: 'all',
    stage: 'all'
  });

  // Dialog state
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);
  const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] = useState(false);
  const [isViewCustomerDialogOpen, setIsViewCustomerDialogOpen] = useState(false);
  const [isViewLeadDialogOpen, setIsViewLeadDialogOpen] = useState(false);
  const [isViewOpportunityDialogOpen, setIsViewOpportunityDialogOpen] = useState(false);
  const [isCustomerDirectoryDialogOpen, setIsCustomerDirectoryDialogOpen] = useState(false);
  const [isCustomerAnalyticsDialogOpen, setIsCustomerAnalyticsDialogOpen] = useState(false);
  const [isSalesOpportunitiesDialogOpen, setIsSalesOpportunitiesDialogOpen] = useState(false);
  const [isPipelineAnalyticsDialogOpen, setIsPipelineAnalyticsDialogOpen] = useState(false);
  const [isEmailCampaignDialogOpen, setIsEmailCampaignDialogOpen] = useState(false);
  const [isCallLogsDialogOpen, setIsCallLogsDialogOpen] = useState(false);
  const [isFollowUpScheduleDialogOpen, setIsFollowUpScheduleDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  // Mock data for demonstration
  const crmStats = {
    totalCustomers: 156,
    activeCustomers: 142,
    newCustomers: 8,
    totalRevenue: 1250000,
    averageOrderValue: 8500,
    customerSatisfaction: 4.6
  };

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      customerId: 'CUST-001',
      name: 'Highlands Construction Ltd',
      type: 'Corporate',
      contactPerson: 'John Smith',
      email: 'john.smith@highlands.com',
      phone: '+675 1234 5678',
      address: 'Port Moresby, PNG',
      status: 'active',
      totalSpent: 125000,
      lastOrder: '2024-03-10',
      nextFollowUp: '2024-03-20',
      rating: 5
    },
    {
      id: 2,
      customerId: 'CUST-002',
      name: 'Mining Corporation PNG',
      type: 'Corporate',
      contactPerson: 'Sarah Johnson',
      email: 'sarah.j@miningcorp.com',
      phone: '+675 1234 5679',
      address: 'Lae, PNG',
      status: 'active',
      totalSpent: 89000,
      lastOrder: '2024-03-08',
      nextFollowUp: '2024-03-18',
      rating: 4
    },
    {
      id: 3,
      customerId: 'CUST-003',
      name: 'Port Moresby Construction',
      type: 'Corporate',
      contactPerson: 'Mike Wilson',
      email: 'mike.w@pomconstruction.com',
      phone: '+675 1234 5680',
      address: 'Port Moresby, PNG',
      status: 'active',
      totalSpent: 67000,
      lastOrder: '2024-03-05',
      nextFollowUp: '2024-03-15',
      rating: 5
    },
    {
      id: 4,
      customerId: 'CUST-004',
      name: 'Goroka Builders',
      type: 'SME',
      contactPerson: 'Lisa Brown',
      email: 'lisa.b@gorokabuilders.com',
      phone: '+675 1234 5681',
      address: 'Goroka, PNG',
      status: 'inactive',
      totalSpent: 45000,
      lastOrder: '2024-02-15',
      nextFollowUp: '2024-03-25',
      rating: 3
    }
  ]);

  const [leads, setLeads] = useState<Lead[]>([
    {
      id: 1,
      name: 'New Guinea Mining',
      contactPerson: 'David Lee',
      email: 'david.lee@ngmining.com',
      phone: '+675 1234 5682',
      source: 'Website',
      status: 'qualified',
      value: 75000,
      assignedTo: 'John Smith',
      nextAction: '2024-03-12'
    },
    {
      id: 2,
      name: 'Pacific Infrastructure',
      contactPerson: 'Anna Garcia',
      email: 'anna.g@pacificinfra.com',
      phone: '+675 1234 5683',
      source: 'Referral',
      status: 'prospecting',
      value: 120000,
      assignedTo: 'Sarah Johnson',
      nextAction: '2024-03-14'
    },
    {
      id: 3,
      name: 'Island Construction',
      contactPerson: 'Robert Chen',
      email: 'robert.c@islandconstruction.com',
      phone: '+675 1234 5684',
      source: 'Trade Show',
      status: 'contacted',
      value: 95000,
      assignedTo: 'Mike Wilson',
      nextAction: '2024-03-16'
    }
  ]);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      id: 1,
      customerName: 'Highlands Construction Ltd',
      title: 'Equipment Rental Contract',
      value: 250000,
      stage: 'negotiation',
      probability: 75,
      expectedClose: '2024-04-15',
      assignedTo: 'John Smith'
    },
    {
      id: 2,
      customerName: 'Mining Corporation PNG',
      title: 'Maintenance Service Agreement',
      value: 180000,
      stage: 'proposal',
      probability: 60,
      expectedClose: '2024-04-30',
      assignedTo: 'Sarah Johnson'
    },
    {
      id: 3,
      customerName: 'Port Moresby Construction',
      title: 'Spare Parts Supply',
      value: 85000,
      stage: 'qualification',
      probability: 40,
      expectedClose: '2024-05-15',
      assignedTo: 'Mike Wilson'
    }
  ]);

  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([
    {
      id: 1,
      subject: 'New Equipment Arrivals - March 2024',
      recipientCount: 156,
      sentDate: '2024-03-01',
      status: 'sent',
      openRate: 68,
      clickRate: 12
    },
    {
      id: 2,
      subject: 'Special Maintenance Service Offer',
      recipientCount: 142,
      sentDate: '2024-02-28',
      status: 'sent',
      openRate: 72,
      clickRate: 18
    },
    {
      id: 3,
      subject: 'Equipment Rental Promotions',
      recipientCount: 98,
      sentDate: '2024-02-25',
      status: 'draft',
      openRate: 0,
      clickRate: 0
    }
  ]);

  const [callLogs, setCallLogs] = useState<CallLog[]>([
    {
      id: 1,
      customerName: 'Highlands Construction Ltd',
      contactPerson: 'John Smith',
      phone: '+675 1234 5678',
      callDate: '2024-03-10',
      duration: '15:30',
      outcome: 'Follow-up scheduled',
      notes: 'Discussed new equipment requirements. Customer interested in excavator rental.',
      assignedTo: 'Sarah Johnson'
    },
    {
      id: 2,
      customerName: 'Mining Corporation PNG',
      contactPerson: 'Sarah Johnson',
      phone: '+675 1234 5679',
      callDate: '2024-03-09',
      duration: '08:45',
      outcome: 'Proposal sent',
      notes: 'Sent maintenance service proposal. Customer will review and respond by Friday.',
      assignedTo: 'Mike Wilson'
    },
    {
      id: 3,
      customerName: 'Port Moresby Construction',
      contactPerson: 'Mike Wilson',
      phone: '+675 1234 5680',
      callDate: '2024-03-08',
      duration: '22:15',
      outcome: 'Sale closed',
      notes: 'Successfully closed spare parts order. Customer very satisfied with service.',
      assignedTo: 'John Smith'
    }
  ]);

  const [followUps, setFollowUps] = useState<FollowUp[]>([
    {
      id: 1,
      customerName: 'Highlands Construction Ltd',
      contactPerson: 'John Smith',
      followUpDate: '2024-03-20',
      type: 'Equipment Demo',
      status: 'scheduled',
      notes: 'Schedule excavator demonstration for next week.',
      assignedTo: 'Sarah Johnson'
    },
    {
      id: 2,
      customerName: 'Mining Corporation PNG',
      contactPerson: 'Sarah Johnson',
      followUpDate: '2024-03-18',
      type: 'Proposal Review',
      status: 'pending',
      notes: 'Follow up on maintenance service proposal sent last week.',
      assignedTo: 'Mike Wilson'
    },
    {
      id: 3,
      customerName: 'Goroka Builders',
      contactPerson: 'Lisa Brown',
      followUpDate: '2024-03-25',
      type: 'Contract Renewal',
      status: 'overdue',
      notes: 'Contract renewal discussion. Customer has concerns about pricing.',
      assignedTo: 'John Smith'
    }
  ]);

  // Get unique values for filter options
  const types = useMemo(() => 
    Array.from(new Set(customers.map(item => item.type))), 
    [customers]
  );

  const statuses = useMemo(() => 
    Array.from(new Set(customers.map(item => item.status))), 
    [customers]
  );

  const sources = useMemo(() => 
    Array.from(new Set(leads.map(item => item.source))), 
    [leads]
  );

  const stages = useMemo(() => 
    Array.from(new Set(opportunities.map(item => item.stage))), 
    [opportunities]
  );

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(item => {
      // Search filter
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        item.name.toLowerCase().includes(searchLower) ||
        item.customerId.toLowerCase().includes(searchLower) || 
        item.contactPerson.toLowerCase().includes(searchLower) ||
        item.email.toLowerCase().includes(searchLower) ||
        item.type.toLowerCase().includes(searchLower);

      // Type filter
      const matchesType = !filters.type || filters.type === 'all' || item.type === filters.type;
      
      // Status filter
      const matchesStatus = !filters.status || filters.status === 'all' || item.status === filters.status;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [customers, filters]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      source: 'all',
      stage: 'all'
    });
  };

  // Close filter dialog
  const closeFilterDialog = () => {
    setIsFilterDialogOpen(false);
  };

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    customerId: '',
    name: '',
    type: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  });

  // Edit customer form state
  const [editCustomer, setEditCustomer] = useState({
    customerId: '',
    name: '',
    type: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  });

  // New lead form state
  const [newLead, setNewLead] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    source: '',
    status: 'prospecting',
    value: 0,
    assignedTo: '',
    nextAction: ''
  });

  // Add new customer
  const addNewCustomer = () => {
    const customer: Customer = {
      id: Math.max(...customers.map(item => item.id)) + 1,
      customerId: newCustomer.customerId,
      name: newCustomer.name,
      type: newCustomer.type,
      contactPerson: newCustomer.contactPerson,
      email: newCustomer.email,
      phone: newCustomer.phone,
      address: newCustomer.address,
      status: newCustomer.status,
      totalSpent: 0,
      lastOrder: '-',
      nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '',
      rating: 5
    };

    setCustomers(prevCustomers => [...prevCustomers, customer]);
    
    setNewCustomer({
      customerId: '',
      name: '',
      type: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      status: 'active'
    });
    setIsAddCustomerDialogOpen(false);
  };

  // Edit customer
  const editCustomerItem = () => {
    if (!selectedCustomer) return;

    const updatedCustomer: Customer = {
      ...selectedCustomer,
      customerId: editCustomer.customerId,
      name: editCustomer.name,
      type: editCustomer.type,
      contactPerson: editCustomer.contactPerson,
      email: editCustomer.email,
      phone: editCustomer.phone,
      address: editCustomer.address,
      status: editCustomer.status
    };

    setCustomers(prevCustomers => 
      prevCustomers.map(item => item.id === selectedCustomer.id ? updatedCustomer : item)
    );
    
    setEditCustomer({
      customerId: '',
      name: '',
      type: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      status: 'active'
    });
    setSelectedCustomer(null);
    setIsEditCustomerDialogOpen(false);
  };

  // Add new lead
  const addNewLead = () => {
    const lead: Lead = {
      id: Math.max(...leads.map(item => item.id)) + 1,
      name: newLead.name,
      contactPerson: newLead.contactPerson,
      email: newLead.email,
      phone: newLead.phone,
      source: newLead.source,
      status: newLead.status,
      value: newLead.value,
      assignedTo: newLead.assignedTo,
      nextAction: newLead.nextAction
    };

    setLeads(prevLeads => [...prevLeads, lead]);
    
    setNewLead({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      source: '',
      status: 'prospecting',
      value: 0,
      assignedTo: '',
      nextAction: ''
    });
    setIsAddLeadDialogOpen(false);
  };

  // Handle edit customer button click
  const handleEditCustomerClick = (item: Customer) => {
    setSelectedCustomer(item);
    setEditCustomer({
      customerId: item.customerId,
      name: item.name,
      type: item.type,
      contactPerson: item.contactPerson,
      email: item.email,
      phone: item.phone,
      address: item.address,
      status: item.status
    });
    setIsEditCustomerDialogOpen(true);
  };

  // Handle view customer button click
  const handleViewCustomerClick = (item: Customer) => {
    setSelectedCustomer(item);
    setIsViewCustomerDialogOpen(true);
  };

  // Handle view lead details
  const handleViewLeadClick = (item: Lead) => {
    setSelectedLead(item);
    setIsViewLeadDialogOpen(true);
  };

  // Handle view opportunity details
  const handleViewOpportunityClick = (item: Opportunity) => {
    setSelectedOpportunity(item);
    setIsViewOpportunityDialogOpen(true);
  };

  // Check if forms are valid
  const isNewCustomerFormValid = newCustomer.customerId && newCustomer.name && newCustomer.type && 
    newCustomer.contactPerson && newCustomer.email && newCustomer.phone && newCustomer.address;

  const isEditCustomerFormValid = editCustomer.customerId && editCustomer.name && editCustomer.type && 
    editCustomer.contactPerson && editCustomer.email && editCustomer.phone && editCustomer.address;

  const isNewLeadFormValid = newLead.name && newLead.contactPerson && newLead.email && 
    newLead.phone && newLead.source && newLead.assignedTo && newLead.nextAction;

  // Check if any filters are active
  const hasActiveFilters = filters.search || 
    (filters.type && filters.type !== 'all') || 
    (filters.status && filters.status !== 'all') || 
    (filters.source && filters.source !== 'all') || 
    (filters.stage && filters.stage !== 'all');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      case 'qualified':
        return <Badge variant="default">Qualified</Badge>;
      case 'prospecting':
        return <Badge variant="outline">Prospecting</Badge>;
      case 'contacted':
        return <Badge variant="secondary">Contacted</Badge>;
      case 'negotiation':
        return <Badge variant="default">Negotiation</Badge>;
      case 'proposal':
        return <Badge variant="secondary">Proposal</Badge>;
      case 'qualification':
        return <Badge variant="outline">Qualification</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'negotiation':
        return 'text-green-600';
      case 'proposal':
        return 'text-blue-600';
      case 'qualification':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Relationship Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage customers, leads, opportunities, and sales pipeline</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Dialog open={isEmailCampaignDialogOpen} onOpenChange={setIsEmailCampaignDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Send Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Email Campaigns</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Recent Campaigns</h3>
                    <Button size="sm" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      New Campaign
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {emailCampaigns.map((campaign) => (
                      <div key={campaign.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{campaign.subject}</div>
                            <div className="text-sm text-gray-500">
                              Sent to {campaign.recipientCount} recipients on {campaign.sentDate}
                            </div>
                          </div>
                          <Badge variant={campaign.status === 'sent' ? 'default' : 'outline'}>
                            {campaign.status}
                          </Badge>
                        </div>
                        {campaign.status === 'sent' && (
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Open Rate:</span> {campaign.openRate}%
                            </div>
                            <div>
                              <span className="text-gray-500">Click Rate:</span> {campaign.clickRate}%
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddCustomerDialogOpen} onOpenChange={setIsAddCustomerDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="customerId">Customer ID *</Label>
                      <Input
                        id="customerId"
                        placeholder="e.g., CUST-001"
                        value={newCustomer.customerId}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, customerId: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Company Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Highlands Construction Ltd"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Customer Type *</Label>
                      <Select 
                        value={newCustomer.type} 
                        onValueChange={(value) => setNewCustomer(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Corporate">Corporate</SelectItem>
                          <SelectItem value="SME">SME</SelectItem>
                          <SelectItem value="Individual">Individual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={newCustomer.status} 
                        onValueChange={(value) => setNewCustomer(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      placeholder="e.g., John Smith"
                      value={newCustomer.contactPerson}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, contactPerson: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g., john.smith@company.com"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        placeholder="e.g., +675 1234 5678"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      placeholder="e.g., Port Moresby, PNG"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setNewCustomer({
                        customerId: '',
                        name: '',
                        type: '',
                        contactPerson: '',
                        email: '',
                        phone: '',
                        address: '',
                        status: 'active'
                      });
                      setIsAddCustomerDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={addNewCustomer}
                    disabled={!isNewCustomerFormValid}
                  >
                    Add Customer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* CRM Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{crmStats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                <UserPlus className="inline h-3 w-3 text-green-500" /> +{crmStats.newCustomers} new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{crmStats.activeCustomers}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500" /> +5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(crmStats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                <DollarSign className="inline h-3 w-3 text-green-500" /> Avg: {formatCurrency(crmStats.averageOrderValue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{crmStats.customerSatisfaction}/5</div>
              <p className="text-xs text-muted-foreground">
                <CheckCircle className="inline h-3 w-3 text-green-500" /> Excellent rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Customer Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>Customer Management</CardTitle>
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
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search customers by name, ID, contact person, email, or type..." 
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
                          filters.source !== 'all' ? filters.source : null,
                          filters.stage !== 'all' ? filters.stage : null
                        ].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Filter Customers</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Customer Type</Label>
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
                              {type}
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
                              {status === 'active' ? 'Active' : 
                               status === 'inactive' ? 'Inactive' : status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    Type: {filters.type}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, type: 'all' }))}
                    />
                  </Badge>
                )}
                {filters.status && filters.status !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {filters.status === 'active' ? 'Active' : 
                            filters.status === 'inactive' ? 'Inactive' : filters.status}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-500">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Customer</th>
                    <th className="text-left p-3 font-medium">Contact</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Total Spent</th>
                    <th className="text-left p-3 font-medium">Last Order</th>
                    <th className="text-left p-3 font-medium">Next Follow-up</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.customerId}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{customer.contactPerson}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{customer.type}</Badge>
                        </td>
                        <td className="p-3">
                          {getStatusBadge(customer.status)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>{formatCurrency(customer.totalSpent)}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-gray-500">{customer.lastOrder}</td>
                        <td className="p-3 text-sm text-gray-500">{customer.nextFollowUp}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewCustomerClick(customer)}>View</Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditCustomerClick(customer)}>Edit</Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        No customers found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Leads & Opportunities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <UserPlus className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-sm text-gray-500">
                          {lead.contactPerson} • {lead.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          Source: {lead.source} • Value: {formatCurrency(lead.value)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <div className="text-sm font-medium">Assigned to</div>
                        <div className="text-sm text-gray-500">{lead.assignedTo}</div>
                      </div>
                      {getStatusBadge(lead.status)}
                      <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => handleViewLeadClick(lead)}>View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <div key={opportunity.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Target className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="font-medium">{opportunity.title}</div>
                        <div className="text-sm text-gray-500">
                          {opportunity.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Value: {formatCurrency(opportunity.value)} • Probability: {opportunity.probability}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">Expected Close</div>
                        <div className="text-sm text-gray-500">{opportunity.expectedClose}</div>
                      </div>
                      <Badge className={getStageColor(opportunity.stage)}>
                        {opportunity.stage}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => handleViewOpportunityClick(opportunity)}>View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsAddCustomerDialogOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Customer
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsCustomerDirectoryDialogOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                Customer Directory
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsCustomerAnalyticsDialogOpen(true)}
              >
                <Activity className="mr-2 h-4 w-4" />
                Customer Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Sales Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsAddLeadDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsSalesOpportunitiesDialogOpen(true)}
              >
                <Target className="mr-2 h-4 w-4" />
                Sales Opportunities
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsPipelineAnalyticsDialogOpen(true)}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Pipeline Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsEmailCampaignDialogOpen(true)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Email Campaign
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsCallLogsDialogOpen(true)}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call Logs
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsFollowUpScheduleDialogOpen(true)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Follow-up Schedule
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Edit Customer Dialog */}
        <Dialog open={isEditCustomerDialogOpen} onOpenChange={setIsEditCustomerDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editCustomerId">Customer ID *</Label>
                  <Input
                    id="editCustomerId"
                    placeholder="e.g., CUST-001"
                    value={editCustomer.customerId}
                    onChange={(e) => setEditCustomer(prev => ({ ...prev, customerId: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editName">Company Name *</Label>
                  <Input
                    id="editName"
                    placeholder="e.g., Highlands Construction Ltd"
                    value={editCustomer.name}
                    onChange={(e) => setEditCustomer(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editType">Customer Type *</Label>
                  <Select 
                    value={editCustomer.type} 
                    onValueChange={(value) => setEditCustomer(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                      <SelectItem value="SME">SME</SelectItem>
                      <SelectItem value="Individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editStatus">Status</Label>
                  <Select 
                    value={editCustomer.status} 
                    onValueChange={(value) => setEditCustomer(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editContactPerson">Contact Person *</Label>
                <Input
                  id="editContactPerson"
                  placeholder="e.g., John Smith"
                  value={editCustomer.contactPerson}
                  onChange={(e) => setEditCustomer(prev => ({ ...prev, contactPerson: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editEmail">Email *</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    placeholder="e.g., john.smith@company.com"
                    value={editCustomer.email}
                    onChange={(e) => setEditCustomer(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editPhone">Phone *</Label>
                  <Input
                    id="editPhone"
                    placeholder="e.g., +675 1234 5678"
                    value={editCustomer.phone}
                    onChange={(e) => setEditCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editAddress">Address *</Label>
                <Input
                  id="editAddress"
                  placeholder="e.g., Port Moresby, PNG"
                  value={editCustomer.address}
                  onChange={(e) => setEditCustomer(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditCustomer({
                    customerId: '',
                    name: '',
                    type: '',
                    contactPerson: '',
                    email: '',
                    phone: '',
                    address: '',
                    status: 'active'
                  });
                  setSelectedCustomer(null);
                  setIsEditCustomerDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={editCustomerItem}
                disabled={!isEditCustomerFormValid}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Customer Dialog */}
        <Dialog open={isViewCustomerDialogOpen} onOpenChange={setIsViewCustomerDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            {selectedCustomer ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Customer ID</Label>
                    <div className="font-medium">{selectedCustomer.customerId}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Company Name</Label>
                    <div className="font-medium">{selectedCustomer.name}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Customer Type</Label>
                    <div className="font-medium">
                      <Badge variant="outline">{selectedCustomer.type}</Badge>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <div className="font-medium">{getStatusBadge(selectedCustomer.status)}</div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Contact Person</Label>
                  <div className="font-medium">{selectedCustomer.contactPerson}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <div className="font-medium">{selectedCustomer.email}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <div className="font-medium">{selectedCustomer.phone}</div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Address</Label>
                  <div className="font-medium">{selectedCustomer.address}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Total Spent</Label>
                    <div className="font-medium">{formatCurrency(selectedCustomer.totalSpent)}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Rating</Label>
                    <div className="font-medium">{selectedCustomer.rating}/5</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Last Order</Label>
                    <div className="font-medium">{selectedCustomer.lastOrder}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Next Follow-up</Label>
                    <div className="font-medium">{selectedCustomer.nextFollowUp}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No customer selected for viewing.</div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setIsViewCustomerDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Lead Dialog */}
        <Dialog open={isViewLeadDialogOpen} onOpenChange={setIsViewLeadDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
            </DialogHeader>
            {selectedLead ? (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Company Name</Label>
                  <div className="font-medium">{selectedLead.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Contact Person</Label>
                    <div className="font-medium">{selectedLead.contactPerson}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <div className="font-medium">{getStatusBadge(selectedLead.status)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <div className="font-medium">{selectedLead.email}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <div className="font-medium">{selectedLead.phone}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Source</Label>
                    <div className="font-medium">{selectedLead.source}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Value</Label>
                    <div className="font-medium">{formatCurrency(selectedLead.value)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Assigned To</Label>
                    <div className="font-medium">{selectedLead.assignedTo}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Next Action</Label>
                    <div className="font-medium">{selectedLead.nextAction}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No lead selected for viewing.</div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setIsViewLeadDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Opportunity Dialog */}
        <Dialog open={isViewOpportunityDialogOpen} onOpenChange={setIsViewOpportunityDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Opportunity Details</DialogTitle>
            </DialogHeader>
            {selectedOpportunity ? (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Opportunity Title</Label>
                  <div className="font-medium">{selectedOpportunity.title}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Customer Name</Label>
                    <div className="font-medium">{selectedOpportunity.customerName}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Stage</Label>
                    <div className="font-medium">
                      <Badge className={getStageColor(selectedOpportunity.stage)}>
                        {selectedOpportunity.stage}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Value</Label>
                    <div className="font-medium">{formatCurrency(selectedOpportunity.value)}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Probability</Label>
                    <div className="font-medium">{selectedOpportunity.probability}%</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Assigned To</Label>
                    <div className="font-medium">{selectedOpportunity.assignedTo}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Expected Close</Label>
                    <div className="font-medium">{selectedOpportunity.expectedClose}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No opportunity selected for viewing.</div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setIsViewOpportunityDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Lead Dialog */}
        <Dialog open={isAddLeadDialogOpen} onOpenChange={setIsAddLeadDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="leadName">Company Name *</Label>
                <Input
                  id="leadName"
                  placeholder="e.g., New Guinea Mining"
                  value={newLead.name}
                  onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="leadContactPerson">Contact Person *</Label>
                <Input
                  id="leadContactPerson"
                  placeholder="e.g., David Lee"
                  value={newLead.contactPerson}
                  onChange={(e) => setNewLead(prev => ({ ...prev, contactPerson: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="leadEmail">Email *</Label>
                  <Input
                    id="leadEmail"
                    type="email"
                    placeholder="e.g., david.lee@company.com"
                    value={newLead.email}
                    onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="leadPhone">Phone *</Label>
                  <Input
                    id="leadPhone"
                    placeholder="e.g., +675 1234 5678"
                    value={newLead.phone}
                    onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="leadSource">Source *</Label>
                  <Select 
                    value={newLead.source} 
                    onValueChange={(value) => setNewLead(prev => ({ ...prev, source: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Trade Show">Trade Show</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Cold Call">Cold Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="leadStatus">Status</Label>
                  <Select 
                    value={newLead.status} 
                    onValueChange={(value) => setNewLead(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospecting">Prospecting</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="leadValue">Estimated Value</Label>
                  <Input
                    id="leadValue"
                    type="number"
                    placeholder="e.g., 75000"
                    value={newLead.value}
                    onChange={(e) => setNewLead(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="leadAssignedTo">Assigned To *</Label>
                  <Select 
                    value={newLead.assignedTo} 
                    onValueChange={(value) => setNewLead(prev => ({ ...prev, assignedTo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="John Smith">John Smith</SelectItem>
                      <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                      <SelectItem value="Mike Wilson">Mike Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="leadNextAction">Next Action Date *</Label>
                <Input
                  id="leadNextAction"
                  type="date"
                  value={newLead.nextAction}
                  onChange={(e) => setNewLead(prev => ({ ...prev, nextAction: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setNewLead({
                    name: '',
                    contactPerson: '',
                    email: '',
                    phone: '',
                    source: '',
                    status: 'prospecting',
                    value: 0,
                    assignedTo: '',
                    nextAction: ''
                  });
                  setIsAddLeadDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={addNewLead}
                disabled={!isNewLeadFormValid}
              >
                Add Lead
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Customer Directory Dialog */}
        <Dialog open={isCustomerDirectoryDialogOpen} onOpenChange={setIsCustomerDirectoryDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Customer Directory</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search customers..." 
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
              
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {customers.map((customer) => (
                  <div key={customer.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.customerId}</div>
                        <div className="text-sm text-gray-500">
                          {customer.contactPerson} • {customer.email} • {customer.phone}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(customer.status)}
                        <Button size="sm" variant="outline" onClick={() => handleViewCustomerClick(customer)}>
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Customer Analytics Dialog */}
        <Dialog open={isCustomerAnalyticsDialogOpen} onOpenChange={setIsCustomerAnalyticsDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Customer Analytics</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{crmStats.totalCustomers}</div>
                    <div className="text-sm text-gray-500">Total Customers</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{crmStats.activeCustomers}</div>
                    <div className="text-sm text-gray-500">Active Customers</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Customer Distribution by Type</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Corporate</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>SME</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Individual</span>
                    <span className="font-medium">5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Top Customers by Revenue</h3>
                <div className="space-y-2">
                  {customers
                    .sort((a, b) => b.totalSpent - a.totalSpent)
                    .slice(0, 5)
                    .map((customer, index) => (
                      <div key={customer.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">#{index + 1}</span>
                          <span>{customer.name}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(customer.totalSpent)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Sales Opportunities Dialog */}
        <Dialog open={isSalesOpportunitiesDialogOpen} onOpenChange={setIsSalesOpportunitiesDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Sales Opportunities</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(opportunities.reduce((sum, opp) => sum + opp.value, 0))}</div>
                  <div className="text-sm text-gray-500">Total Pipeline Value</div>
                </div>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Opportunity
                </Button>
              </div>
              
              <div className="space-y-3">
                {opportunities.map((opportunity) => (
                  <div key={opportunity.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{opportunity.title}</div>
                        <div className="text-sm text-gray-500">{opportunity.customerName}</div>
                        <div className="text-sm text-gray-500">
                          Value: {formatCurrency(opportunity.value)} • Probability: {opportunity.probability}%
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStageColor(opportunity.stage)}>
                          {opportunity.stage}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => handleViewOpportunityClick(opportunity)}>
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pipeline Analytics Dialog */}
        <Dialog open={isPipelineAnalyticsDialogOpen} onOpenChange={setIsPipelineAnalyticsDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Pipeline Analytics</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-sm text-gray-500">Total Opportunities</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(opportunities.reduce((sum, opp) => sum + opp.value, 0))}</div>
                    <div className="text-sm text-gray-500">Pipeline Value</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">58%</div>
                    <div className="text-sm text-gray-500">Avg Win Rate</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Pipeline by Stage</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Qualification</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(85000)}</span>
                      <span className="text-sm text-gray-500">1 opportunity</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Proposal</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(180000)}</span>
                      <span className="text-sm text-gray-500">1 opportunity</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Negotiation</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(250000)}</span>
                      <span className="text-sm text-gray-500">1 opportunity</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Win Probability Distribution</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>High (70%+)</span>
                    <span className="font-medium">{formatCurrency(250000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Medium (40-69%)</span>
                    <span className="font-medium">{formatCurrency(180000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Low (0-39%)</span>
                    <span className="font-medium">{formatCurrency(85000)}</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Call Logs Dialog */}
        <Dialog open={isCallLogsDialogOpen} onOpenChange={setIsCallLogsDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Call Logs</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Recent Call Activity</h3>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Log Call
                </Button>
              </div>
              
              <div className="space-y-3">
                {callLogs.map((call) => (
                  <div key={call.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{call.customerName}</div>
                        <div className="text-sm text-gray-500">
                          {call.contactPerson} • {call.phone}
                        </div>
                        <div className="text-sm text-gray-500">
                          {call.callDate} • Duration: {call.duration}
                        </div>
                        <div className="text-sm mt-1">
                          <span className="font-medium">Outcome:</span> {call.outcome}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Notes:</span> {call.notes}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Assigned to</div>
                        <div className="text-sm font-medium">{call.assignedTo}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Follow-up Schedule Dialog */}
        <Dialog open={isFollowUpScheduleDialogOpen} onOpenChange={setIsFollowUpScheduleDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Follow-up Schedule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Scheduled Follow-ups</h3>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Schedule Follow-up
                </Button>
              </div>
              
              <div className="space-y-3">
                {followUps.map((followUp) => (
                  <div key={followUp.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{followUp.customerName}</div>
                        <div className="text-sm text-gray-500">
                          {followUp.contactPerson} • {followUp.followUpDate}
                        </div>
                        <div className="text-sm text-gray-500">
                          Type: {followUp.type}
                        </div>
                        <div className="text-sm mt-1">
                          <span className="font-medium">Notes:</span> {followUp.notes}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          followUp.status === 'scheduled' ? 'default' : 
                          followUp.status === 'pending' ? 'outline' : 'destructive'
                        }>
                          {followUp.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Assigned to</div>
                          <div className="text-sm font-medium">{followUp.assignedTo}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CRMPage; 