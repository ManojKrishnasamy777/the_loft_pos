import { useState, useEffect } from 'react';
import { apiClient } from '../../config/api';
import toast from 'react-hot-toast';
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  BarChart3,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export function ReportsPage() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedReport, setSelectedReport] = useState('sales');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');

  useEffect(() => {
    loadReportData();
  }, [selectedReport, dateRange, paymentMethodFilter]);

  const loadReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        ...(dateRange.from && { dateFrom: dateRange.from }),
        ...(dateRange.to && { dateTo: dateRange.to }),
      };

      if (paymentMethodFilter) {
        params.paymentMethod = paymentMethodFilter;
      }

      let data;
      switch (selectedReport) {
        case 'sales':
          data = await apiClient.getSalesReport(params);
          break;
        case 'items':
          data = await apiClient.getItemPerformanceReport(params);
          break;
        case 'customers':
          data = await apiClient.getCustomerAnalytics(params);
          break;
        case 'trends':
          data = await apiClient.getDailySalesReport(params);
          break;
        default:
          data = await apiClient.getSalesReport(params);
      }

      setReportData(data);
    } catch (error: any) {
      console.error('Failed to load report data:', error);
      setError(error?.message || 'Failed to load report data');
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', icon: DollarSign },
    { id: 'items', name: 'Item Performance', icon: ShoppingBag },
    { id: 'customers', name: 'Customer Analytics', icon: Users },
    { id: 'trends', name: 'Sales Trends', icon: TrendingUp }
  ];


  const handleExport = async () => {
    try {
      const params = {
        ...(dateRange.from && { dateFrom: dateRange.from }),
        ...(dateRange.to && { dateTo: dateRange.to }),
      };

      const blob = await apiClient.exportReport(selectedReport, params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport}-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Track your theatre's performance and insights</p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">All Payment Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="razorpay">Razorpay</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="mb-8">
          <div className="flex space-x-2 overflow-x-auto">
            {reportTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedReport(type.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${selectedReport === type.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{type.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sales Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{reportData?.totalSales?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-green-600">+12% from last week</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData?.totalOrders || 0}
                </p>
                <p className="text-sm text-blue-600">+8% from last week</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{reportData?.averageOrderValue?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-purple-600">+5% from last week</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData?.totalCustomers || 0}
                </p>
                <p className="text-sm text-amber-600">+15% from last week</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <span className="ml-2 text-gray-600">Loading report data...</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900">Error Loading Report</h3>
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={loadReportData}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {!loading && !error && reportData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales by Hour Chart */}
            {selectedReport === 'sales' && reportData?.salesByHour && reportData.salesByHour.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-amber-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Hourly Sales</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {reportData.salesByHour.slice(0, 6).map((hour: any, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-20 text-sm font-medium text-gray-700">
                          {hour.hour}:00
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((hour.sales / Math.max(...reportData.salesByHour.map((h: any) => h.sales))) * 100, 100)}%` }}
                              />
                            </div>
                            <div className="w-32 text-right">
                              <p className="text-sm font-medium text-gray-900">₹{Number(hour.sales || 0).toFixed(2)}</p>
                              <p className="text-xs text-gray-500">{hour.orderCount} orders</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Top Selling Items */}
            {(selectedReport === 'sales' || selectedReport === 'items') && reportData?.topItems && reportData.topItems.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="h-5 w-5 text-amber-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Top Selling Items</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {reportData.topItems.slice(0, 5).map((item: any, index: number) => (
                      <div key={item.item?.id || index} className="flex items-center space-x-4">
                        <div className="bg-amber-100 text-amber-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium text-gray-900">{item.item?.name || item.menuItem?.name || 'Unknown Item'}</h3>
                              <p className="text-sm text-gray-600">{item.quantity || item.totalQuantity} sold</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">₹{Number(item.revenue || item.totalRevenue || 0).toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(((item.revenue || item.totalRevenue) / (reportData?.totalSales || 1)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Daily Sales Trend */}
            {selectedReport === 'trends' && Array.isArray(reportData) && reportData.length > 0 && (
              <div className="bg-white rounded-lg shadow lg:col-span-2">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Daily Sales Trend</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {reportData.slice(-10).map((day: any) => (
                      <div key={day.date} className="flex items-center">
                        <div className="w-28 text-sm font-medium text-gray-700">
                          {new Date(day.date).toLocaleDateString()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((day.sales / Math.max(...reportData.map((d: any) => d.sales))) * 100, 100)}%` }}
                              />
                            </div>
                            <div className="w-32 text-right">
                              <p className="text-sm font-medium text-gray-900">₹{Number(day.sales || 0).toFixed(2)}</p>
                              <p className="text-xs text-gray-500">{day.orderCount} orders</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Customer Analytics */}
            {selectedReport === 'customers' && reportData?.topCustomers && reportData.topCustomers.length > 0 && (
              <div className="bg-white rounded-lg shadow lg:col-span-2">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-amber-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Top Customers</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Spent</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Order</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.topCustomers.slice(0, 10).map((customer: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">{customer.customerName || 'Walk-in'}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{customer.customerEmail || '-'}</td>
                            <td className="py-3 px-4 text-sm text-right text-gray-900">{customer.orderCount}</td>
                            <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">₹{Number(customer.totalSpent || 0).toFixed(2)}</td>
                            <td className="py-3 px-4 text-sm text-right text-gray-600">₹{Number(customer.averageOrderValue || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !error && reportData && (
          selectedReport === 'sales' && reportData.salesByCategory && reportData.salesByCategory.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Sales by Category</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportData.salesByCategory.map((cat: any) => (
                    <div key={cat.category?.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{cat.category?.name || 'Unknown'}</h3>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-amber-600">₹{Number(cat.sales || 0).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{cat.orderCount} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}