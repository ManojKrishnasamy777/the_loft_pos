import React from 'react';
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  Coffee,
  Star,
  Calendar
} from 'lucide-react';

export function Dashboard() {
  const stats = [
    {
      name: 'Today\'s Sales',
      value: '₹12,450',
      change: '+12%',
      changeType: 'positive' as const,
      icon: DollarSign
    },
    {
      name: 'Orders Today',
      value: '85',
      change: '+5%',
      changeType: 'positive' as const,
      icon: ShoppingCart
    },
    {
      name: 'Active Customers',
      value: '156',
      change: '+8%',
      changeType: 'positive' as const,
      icon: Users
    },
    {
      name: 'Average Order',
      value: '₹146',
      change: '-2%',
      changeType: 'negative' as const,
      icon: TrendingUp
    }
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', amount: 245, status: 'completed', time: '2 mins ago' },
    { id: 'ORD-002', customer: 'Jane Smith', amount: 180, status: 'pending', time: '5 mins ago' },
    { id: 'ORD-003', customer: 'Mike Johnson', amount: 320, status: 'completed', time: '8 mins ago' },
    { id: 'ORD-004', customer: 'Sarah Wilson', amount: 95, status: 'completed', time: '12 mins ago' }
  ];

  const topItems = [
    { name: 'Popcorn', sales: 45, revenue: 3600 },
    { name: 'Filter Coffee', sales: 38, revenue: 1140 },
    { name: 'Nachos with Cheese', sales: 25, revenue: 3000 },
    { name: 'Chicken Biryani', sales: 22, revenue: 4840 }
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
          {stats.map((stat) => {
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
              {recentOrders.map(order => (
                <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{order.amount}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                        <span className="text-xs text-gray-500">{order.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 bg-gray-50">
              <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
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
              <div className="space-y-4">
                {topItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-amber-100 text-amber-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.sales} sold today</p>
                      </div>
                    </div>
                    <p className="font-medium text-gray-900">₹{item.revenue}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
              <Coffee className="h-6 w-6 text-amber-600" />
              <span className="font-medium text-gray-900">New Order</span>
            </button>
            
            <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span className="font-medium text-gray-900">View Reports</span>
            </button>
            
            <button className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <Users className="h-6 w-6 text-green-600" />
              <span className="font-medium text-gray-900">Manage Menu</span>
            </button>
            
            <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <span className="font-medium text-gray-900">Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}