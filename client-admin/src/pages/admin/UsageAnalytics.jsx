import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  BarChart3,
  FileText,
  Users,
  Shield,
  Database,
  Search,
  Filter
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { apiRequest } from '../../lib/queryClient';

// Event type options
const eventTypes = [
  { value: 'all', label: 'All Events', icon: BarChart3 },
  { value: 'document_upload', label: 'Document Uploads', icon: FileText },
  { value: 'document_download', label: 'Document Downloads', icon: Download },
  { value: 'api_call', label: 'API Calls', icon: Database },
  { value: 'user_creation', label: 'User Creations', icon: Users },
  { value: 'compliance_check', label: 'Compliance Checks', icon: Shield }
];

const UsageAnalytics = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter states
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch usage analytics
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: [
      'usage-analytics',
      selectedEventType,
      dateRange,
      searchQuery,
      page,
      sortBy,
      sortOrder
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy,
        sortOrder
      });

      if (selectedEventType !== 'all') {
        params.append('eventType', selectedEventType);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (dateRange.from) {
        params.append('startDate', dateRange.from.toISOString());
      }
      
      if (dateRange.to) {
        params.append('endDate', dateRange.to.toISOString());
      }

      const response = await apiRequest('GET', `/usage/analytics?${params}`);
      return response.json();
    }
  });

  // Fetch usage limits
  const { data: limitsData, isLoading: limitsLoading } = useQuery({
    queryKey: ['usage-limits'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/usage/limits');
      return response.json();
    }
  });

  // Fetch billing summary
  const { data: billingData, isLoading: billingLoading } = useQuery({
    queryKey: ['billing-summary', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (dateRange.from) {
        params.append('billingPeriodStart', dateRange.from.toISOString());
      }
      
      if (dateRange.to) {
        params.append('billingPeriodEnd', dateRange.to.toISOString());
      }

      const response = await apiRequest('GET', `/billing/summary?${params}`);
      return response.json();
    }
  });

  // Export data mutation
  const exportMutation = useMutation({
    mutationFn: async ({ format, includeDetails }) => {
      const params = new URLSearchParams({
        format,
        includeDetails: includeDetails.toString()
      });

      if (selectedEventType !== 'all') {
        params.append('eventType', selectedEventType);
      }
      
      if (dateRange.from) {
        params.append('startDate', dateRange.from.toISOString());
      }
      
      if (dateRange.to) {
        params.append('endDate', dateRange.to.toISOString());
      }

      const response = await fetch(`/api/usage/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usage-data-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Export Successful",
        description: "Usage data has been downloaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle export
  const handleExport = (format, includeDetails = true) => {
    exportMutation.mutate({ format, includeDetails });
  };

  // Filter usage events by search query
  const filteredEvents = analyticsData?.data?.events?.filter(event =>
    event.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.resourceId && event.resourceId.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="usage-analytics-page">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
            Usage Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor usage patterns and track billing metrics
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={exportMutation.isPending}
            data-testid="button-export-csv"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            disabled={exportMutation.isPending}
            data-testid="button-export-json"
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Usage Limits Overview */}
      {limitsData?.data && (
        <Card data-testid="card-usage-limits">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Usage Limits
            </CardTitle>
            <CardDescription>
              Current usage against your plan limits for {limitsData.data.plan}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {limitsData.data.limitChecks.map((check, index) => (
                <div key={index} className="space-y-2" data-testid={`limit-check-${check.eventType}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">
                      {check.eventType.replace('_', ' ')}
                    </span>
                    <Badge 
                      variant={check.isOverLimit ? 'destructive' : check.isNearLimit ? 'secondary' : 'default'}
                      data-testid={`badge-limit-status-${check.eventType}`}
                    >
                      {check.percentUsed}%
                    </Badge>
                  </div>
                  <Progress 
                    value={check.percentUsed} 
                    className={cn(
                      "h-2",
                      check.isOverLimit && "bg-red-100",
                      check.isNearLimit && "bg-yellow-100"
                    )}
                    data-testid={`progress-usage-${check.eventType}`}
                  />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {check.currentUsage} / {check.limit || '∞'} used
                    {check.remaining !== null && (
                      <span className="ml-2">({check.remaining} remaining)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Summary */}
      {billingData?.data && (
        <Card data-testid="card-billing-summary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Billing Summary
            </CardTitle>
            <CardDescription>
              Usage-based charges for current billing period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center" data-testid="billing-subscription-fee">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${billingData.data.subscriptionFee}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Subscription Fee
                </div>
              </div>
              <div className="text-center" data-testid="billing-usage-charges">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${billingData.data.totalUsageCharges}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Usage Charges
                </div>
              </div>
              <div className="text-center" data-testid="billing-total-amount">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${billingData.data.totalAmount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Amount
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card data-testid="card-filters">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Event Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Event Type</label>
              <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                <SelectTrigger data-testid="select-event-type">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                    data-testid="button-date-range"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    data-testid="calendar-date-range"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Search Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}>
                <SelectTrigger data-testid="select-sort">
                  <SelectValue placeholder="Sort options" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="eventType-asc">Event Type A-Z</SelectItem>
                  <SelectItem value="eventType-desc">Event Type Z-A</SelectItem>
                  <SelectItem value="quantity-desc">Highest Quantity</SelectItem>
                  <SelectItem value="quantity-asc">Lowest Quantity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Content */}
      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events" data-testid="tab-events">Events</TabsTrigger>
          <TabsTrigger value="summary" data-testid="tab-summary">Summary</TabsTrigger>
          <TabsTrigger value="charts" data-testid="tab-charts">Charts</TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          {analyticsLoading ? (
            <div className="flex justify-center items-center py-8" data-testid="loading-events">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : analyticsError ? (
            <Alert variant="destructive" data-testid="alert-error">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to load usage analytics: {analyticsError.message}
              </AlertDescription>
            </Alert>
          ) : (
            <Card data-testid="card-events-list">
              <CardHeader>
                <CardTitle>Usage Events</CardTitle>
                <CardDescription>
                  {analyticsData?.data?.pagination?.total || 0} total events found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`event-item-${event.id}`}
                      >
                        <div className="flex items-center gap-4">
                          {eventTypes.find(type => type.value === event.eventType)?.icon && (
                            React.createElement(eventTypes.find(type => type.value === event.eventType).icon, {
                              className: "h-5 w-5 text-gray-500"
                            })
                          )}
                          <div>
                            <div className="font-medium capitalize" data-testid={`event-type-${event.id}`}>
                              {event.eventType.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400" data-testid={`event-resource-${event.id}`}>
                              {event.resourceId}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium" data-testid={`event-quantity-${event.id}`}>
                            {event.quantity} {event.quantity === 1 ? 'unit' : 'units'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400" data-testid={`event-time-${event.id}`}>
                            {new Date(event.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500" data-testid="no-events">
                      No usage events found for the selected filters.
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {analyticsData?.data?.pagination && analyticsData.data.pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6" data-testid="pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      data-testid="button-prev-page"
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2 text-sm" data-testid="page-info">
                      Page {page} of {analyticsData.data.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(analyticsData.data.pagination.totalPages, page + 1))}
                      disabled={page === analyticsData.data.pagination.totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          {analyticsData?.data?.summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyticsData.data.summary.map((summaryItem, index) => (
                <Card key={index} data-testid={`summary-card-${summaryItem.eventType}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg capitalize">
                      {summaryItem.eventType.replace('_', ' ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Events:</span>
                        <span className="font-medium" data-testid={`total-events-${summaryItem.eventType}`}>
                          {summaryItem.totalEvents}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Quantity:</span>
                        <span className="font-medium" data-testid={`total-quantity-${summaryItem.eventType}`}>
                          {summaryItem.totalQuantity}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Charts Tab - Placeholder for future implementation */}
        <TabsContent value="charts" className="space-y-4">
          <Card data-testid="card-charts-placeholder">
            <CardHeader>
              <CardTitle>Usage Charts</CardTitle>
              <CardDescription>
                Visual analytics and trends (coming soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Chart visualizations will be implemented in the next phase.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsageAnalytics;