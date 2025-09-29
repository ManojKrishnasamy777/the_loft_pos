import React, { useState } from 'react';
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../config/api';
import { 
  Calendar, 
  Download, 
  Filter, 
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  BarChart3
} from 'lucide-react';

export function ReportsPage() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedReport, setSelectedReport] = useState('sales');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [selectedReport, dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const params = {
        ...(dateRange.from && { dateFrom: dateRange.from }),
        ...(dateRange.to && { dateTo: dateRange.to }),
      };

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
    } catch (error) {
      console.error('Failed to load report data:', error);
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

  const salesData = [
    { date: '2024-01-15', orders: 45, revenue: 8250, avgOrder: 183 },
    { date: '2024-01-14', orders: 52, revenue: 9340, avgOrder: 179 },
    { date: '2024-01-13', orders: 38, revenue: 6890, avgOrder: 181 },
    { date: '2024-01-12', orders: 41, revenue: 7520, avgOrder: 183 },
    { date: '2024-01-11', orders: 47, revenue: 8670, avgOrder: 184 }
  ];

  const topItems = [
    { name: 'Popcorn', quantity: 145, revenue: 11600, percentage: 22 },
    { name: 'Filter Coffee', quantity: 128, revenue: 3840, percentage: 18 },
    { name: 'Chicken Biryani', quantity: 89, revenue: 19580, percentage: 15 },
    { name: 'Nachos with Cheese', quantity: 76, revenue: 9120, percentage: 12 }
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
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500">
                  <option value="">All Payment Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
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
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedReport === type.id
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Sales Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-semibold text-gray-900">Daily Sales Trend</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {(reportData?.salesByHour || []).slice(0, 5).map((hour, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {hour.hour}:00 - {hour.hour + 1}:00
                        </span>
                        <span className="text-sm text-gray-600">₹{hour.sales.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((hour.sales / 1000) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>{hour.orderCount} orders</span>
                        <span>Avg: ₹{hour.orderCount > 0 ? (hour.sales / hour.orderCount).toFixed(0) : '0'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-semibold text-gray-900">Top Selling Items</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {(reportData?.topItems || []).slice(0, 4).map((item, index) => (
                  <div key={item.item?.name || index} className="flex items-center space-x-4">
                    <div className="bg-amber-100 text-amber-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.item?.name || 'Unknown Item'}</h3>
                          <p className="text-sm text-gray-600">{item.quantity} sold</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">₹{item.revenue}</p>
                          <p className="text-sm text-gray-600">{item.percentage}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((item.revenue / (reportData?.totalSales || 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}