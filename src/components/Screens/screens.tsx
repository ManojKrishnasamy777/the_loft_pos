import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '../../config/api';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';

interface Screen {
    id: string;
    name: string;
    capacity: number;
    description?: string;
    isActive: boolean;
    createdAt: string;
}

export function ScreenManagement() {
    const [screens, setScreens] = useState<Screen[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        capacity: '',
        description: '',
        isActive: true,
    });

    useEffect(() => {
        loadScreens();
    }, []);

    const loadScreens = async () => {
        try {
            const data = await apiClient.getScreens();
            setScreens(data);
        } catch (err) {
            console.error('Failed to load screens:', err);
            toast.error('Failed to load screens');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...formData,
            capacity: Number(formData.capacity) || null,
        };

        try {
            if (editingScreen) {
                await apiClient.updateScreen(editingScreen.id, payload);
            } else {
                await apiClient.createScreen(payload);
            }
            setShowForm(false);
            setEditingScreen(null);
            setFormData({ name: '', capacity: '', description: '', isActive: true });
            loadScreens();
            toast.success(editingScreen ? 'Screen updated successfully' : 'Screen created successfully');
        } catch (err) {
            console.error('Save failed:', err);
            toast.error('Failed to save screen. Please try again.');
        }
    };

    const handleEdit = (screen: Screen) => {
        setEditingScreen(screen);
        setFormData({
            name: screen.name,
            capacity: screen.capacity?.toString() || '',
            description: screen.description || '',
            isActive: screen.isActive,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this screen?')) {
            try {
                await apiClient.deleteScreen(id);
                loadScreens();
                toast.success('Screen deleted successfully');
            } catch (err) {
                console.error('Delete failed:', err);
                toast.error('Failed to delete screen');
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Screen Management</h2>
                        <p className="text-sm text-gray-600 mt-1">Manage cinema or hall screens for your venue</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowForm(true);
                            setEditingScreen(null);
                            setFormData({ name: '', capacity: '', description: '', isActive: true });
                        }}
                        className="flex items-center space-x-2 bg-amber-600 text-white px-5 py-2.5 rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Screen</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
                    <span className="text-gray-600">Loading screens...</span>
                </div>
            ) : (
                <div className="p-6">
                    {screens.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Layers className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No screens found</h3>
                            <p className="text-gray-500 mb-6">Get started by adding your first screen</p>
                            <button
                                onClick={() => {
                                    setShowForm(true);
                                    setEditingScreen(null);
                                    setFormData({ name: '', capacity: '', description: '', isActive: true });
                                }}
                                className="inline-flex items-center space-x-2 bg-amber-600 text-white px-5 py-2.5 rounded-lg hover:bg-amber-700"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Your First Screen</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {screens.map((screen) => (
                                <div
                                    key={screen.id}
                                    className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-amber-300"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-amber-100 text-amber-600 w-14 h-14 rounded-xl flex items-center justify-center shadow-sm">
                                            <Layers className="h-7 w-7" />
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${screen.isActive
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-red-100 text-red-700 border border-red-200'
                                                }`}
                                        >
                                            {screen.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{screen.name}</h3>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <span className="font-medium mr-2">Capacity:</span>
                                            <span className="text-gray-800">{screen.capacity || 'Not specified'}</span>
                                        </div>
                                        {screen.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2">{screen.description}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => handleEdit(screen)}
                                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                            <span className="font-medium">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(screen.id)}
                                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="font-medium">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {editingScreen ? 'Edit Screen' : 'Add Screen'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 text-sm text-gray-700">Active</label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                                >
                                    {editingScreen ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
