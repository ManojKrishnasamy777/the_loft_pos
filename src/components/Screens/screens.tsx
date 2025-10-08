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
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Screen Management</h2>
                    <p className="text-sm text-gray-600 mt-1">Manage cinema or hall screens</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(true);
                        setEditingScreen(null);
                        setFormData({ name: '', capacity: '', description: '', isActive: true });
                    }}
                    className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Screen</span>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                    <span className="ml-2 text-gray-600">Loading screens...</span>
                </div>
            ) : (
                <div className="p-6 space-y-3">
                    {screens.map((screen) => (
                        <div
                            key={screen.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="bg-amber-100 text-amber-600 w-10 h-10 rounded-full flex items-center justify-center">
                                    <Layers className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{screen.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        Capacity: {screen.capacity || 'N/A'}
                                    </p>
                                    {screen.description && (
                                        <p className="text-sm text-gray-500">{screen.description}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${screen.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {screen.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <button
                                    onClick={() => handleEdit(screen)}
                                    className="p-2 text-blue-600 hover:text-blue-800"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(screen.id)}
                                    className="p-2 text-red-600 hover:text-red-800"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {screens.length === 0 && (
                        <div className="text-center py-12">
                            <Layers className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">No screens found</p>
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
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
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

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700"
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