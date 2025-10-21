import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../config/api';
import {
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Coffee,
  Star,
  Calendar,
  FileText,
  Menu,
  BarChart3,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todaysSales: 0,
    ordersToday: 0,
    activeCustomers: 0,
    averageOrder: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [salesByHour, setSalesByHour] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

      const [orderStats, todaysOrders, salesReport, customerAnalytics] = await Promise.all([
        apiClient.getOrderStats(startOfDay, endOfDay),
        apiClient.getTodaysOrders(),
        apiClient.getSalesReport({ dateFrom: startOfDay, dateTo: endOfDay }),
        apiClient.getCustomerAnalytics({ dateFrom: startOfDay, dateTo: endOfDay }).catch(() => ({ totalCustomers: 0 })),
      ]);

      setStats({
        todaysSales: salesReport.totalSales || 0,
        ordersToday: salesReport.totalOrders || 0,
        activeCustomers: customerAnalytics.totalCustomers || 0,
        averageOrder: salesReport.averageOrderValue || 0,
      });

      setRecentOrders(todaysOrders.slice(0, 5));
      setTopItems(salesReport.topItems?.slice(0, 4) || []);
      setSalesByHour(salesReport.salesByHour || []);
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError(error?.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">Failed to Load Dashboard</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      name: 'Today\'s Sales',
      value: `₹${stats.todaysSales.toFixed(2)}`,
      change: '+12%',
      changeType: 'positive' as const,
      icon: DollarSign
    },
    {
      name: 'Orders Today',
      value: stats.ordersToday.toString(),
      change: '+5%',
      changeType: 'positive' as const,
      icon: ShoppingCart
    },
    {
      name: 'Active Customers',
      value: stats.activeCustomers.toString(),
      change: '+8%',
      changeType: 'positive' as const,
      icon: Users
    },
    {
      name: 'Average Order',
      value: `₹${stats.averageOrder.toFixed(2)}`,
      change: '-2%',
      changeType: 'negative' as const,
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to The Loft POS System</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change} from yesterday
                    </p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Icon className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.customerName || 'Walk-in Customer'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{Number(order.total || 0).toFixed(2)}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No recent orders</p>
                </div>
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50">
              <button
                onClick={() => navigate('/orders')}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                View all orders →
              </button>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-semibold text-gray-900">Top Selling Items</h2>
              </div>
            </div>
            <div className="p-6">
              {topItems.length > 0 ? (
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <div key={item.item?.id || index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-amber-100 text-amber-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.item?.name || 'Unknown Item'}</p>
                          <p className="text-sm text-gray-600">{item.quantity} sold today</p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900">₹{Number(item.revenue || 0).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No sales data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sales by Hour Chart */}
        {salesByHour.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-semibold text-gray-900">Hourly Sales Overview</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {salesByHour.slice(0, 6).map((hour) => (
                  <div key={hour.hour} className="flex items-center">
                    <div className="w-24 text-sm font-medium text-gray-700">
                      {hour.hour}:00
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((hour.sales / Math.max(...salesByHour.map(h => h.sales))) * 100, 100)}%` }}
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

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/pos')}
              className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Coffee className="h-6 w-6 text-amber-600" />
              <span className="font-medium text-gray-900">New Order</span>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="font-medium text-gray-900">View Reports</span>
            </button>

            <button
              onClick={() => navigate('/menu')}
              className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Menu className="h-6 w-6 text-green-600" />
              <span className="font-medium text-gray-900">Manage Menu</span>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="flex items-center space-x-3 p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <TrendingUp className="h-6 w-6 text-teal-600" />
              <span className="font-medium text-gray-900">Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}