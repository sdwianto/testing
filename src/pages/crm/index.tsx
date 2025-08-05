import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Activity
} from 'lucide-react';

const CRMPage: React.FC = () => {
  // Mock data for demonstration
  const crmStats = {
    totalCustomers: 156,
    activeCustomers: 142,
    newCustomers: 8,
    totalRevenue: 1250000,
    averageOrderValue: 8500,
    customerSatisfaction: 4.6
  };

  const customers = [
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
  ];

  const leads = [
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
  ];

  const opportunities = [
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
  ];

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Relationship Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage customers, leads, opportunities, and sales pipeline</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Send Campaign
            </Button>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Customer
            </Button>
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
            <CardTitle>Customer Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
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
                Filters
              </Button>
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
                  {customers.map((customer) => (
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
                  <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">Assigned to</div>
                        <div className="text-sm text-gray-500">{lead.assignedTo}</div>
                      </div>
                      {getStatusBadge(lead.status)}
                      <Button size="sm" variant="outline">View</Button>
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
                  <div key={opportunity.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                      <Button size="sm" variant="outline">View</Button>
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
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Customer
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" />
                Customer Directory
              </Button>
              <Button variant="outline" className="w-full justify-start">
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
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Target className="mr-2 h-4 w-4" />
                Sales Opportunities
              </Button>
              <Button variant="outline" className="w-full justify-start">
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
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Send Email Campaign
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="mr-2 h-4 w-4" />
                Call Logs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Follow-up Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CRMPage; 