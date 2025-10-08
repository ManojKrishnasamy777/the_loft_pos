import { useState, useEffect } from 'react';
import { Key, Plus, Shield } from 'lucide-react';
import { permissionService, Permission } from '../../services/supabaseClient';

export function PermissionManagement() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await permissionService.getAll();
      setPermissions(data);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const resources = Object.keys(groupedPermissions).sort();
  const filteredResources = filter === 'all' ? resources : resources.filter(r => r === filter);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <span className="ml-2 text-gray-600">Loading permissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Permission Registry</h2>
            <p className="text-sm text-gray-600 mt-1">View all available system permissions</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter by resource:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Resources</option>
            {resources.map((resource) => (
              <option key={resource} value={resource}>
                {resource.charAt(0).toUpperCase() + resource.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {filteredResources.map((resource) => (
            <div key={resource} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-gray-900 capitalize">{resource}</h3>
                  <span className="text-sm text-gray-500">
                    ({groupedPermissions[resource].length} permissions)
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {groupedPermissions[resource].map((permission) => (
                  <div key={permission.id} className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="bg-amber-100 text-amber-600 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <Key className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{permission.name}</h4>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                              {permission.action}
                            </span>
                          </div>
                          {permission.description && (
                            <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Resource: <span className="font-medium">{permission.resource}</span></span>
                            <span>Action: <span className="font-medium">{permission.action}</span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {permissions.length === 0 && (
          <div className="text-center py-12">
            <Key className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No permissions found</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{permissions.length}</div>
            <div className="text-sm text-gray-600">Total Permissions</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{resources.length}</div>
            <div className="text-sm text-gray-600">Resources</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {new Set(permissions.map(p => p.action)).size}
            </div>
            <div className="text-sm text-gray-600">Action Types</div>
          </div>
        </div>
      </div>
    </div>
  );
}
