import React, { useState } from 'react';
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

  const handleExport = () => {
    // In a real application, this would generate and download a report
    const csvContent = salesData.map(row => 
      `${row.date},${row.orders},${row.revenue},${row.avgOrder}`
    ).join('\n');
    
    const blob = new Blob([`Date,Orders,Revenue,Avg Order\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
                <p className="text-2xl font-bold text-gray-900">₹40,260</p>
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
                <p className="text-2xl font-bold text-gray-900">223</p>
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
                <p className="text-2xl font-bold text-gray-900">₹180</p>
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
                <p className="text-2xl font-bold text-gray-900">1,247</p>
                <p className="text-sm text-amber-600">+15% from last week</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

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
                {salesData.map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(day.date).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-600">₹{day.revenue}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(day.revenue / 10000) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>{day.orders} orders</span>
                        <span>Avg: ₹{day.avgOrder}</span>
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
                {topItems.map((item, index) => (
                  <div key={item.name} className="flex items-center space-x-4">
                    <div className="bg-amber-100 text-amber-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
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
                          style={{ width: `${item.percentage * 4}%` }}
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