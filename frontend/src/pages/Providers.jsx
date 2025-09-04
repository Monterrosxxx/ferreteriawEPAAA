import { useState, useEffect } from "react";
import { Plus, Search, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import ProviderCard from '../components/ProviderCard';
import ProviderModal from '../components/ProviderModal';

const Providers = ({ onLogOut, onNavigateToProducts, onNavigateToBrands, userInfo }) => {
    // Estados para manejar los datos y la UI
    const [providers, setProviders] = useState([]);
    const [filteredProviders, setFilteredProviders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // URL base de la API - CORREGIDA para usar la URL de producción correcta
    const API_BASE_URL = 'https://ferreteriawepaaa.onrender.com/api/providers';

    // Cargar proveedores al montar el componente
    useEffect(() => {
        fetchProviders();
    }, []);

    // Filtrar proveedores basado en el término de búsqueda
    useEffect(() => {
        const filtered = providers.filter(provider =>
            provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            provider.telephone.includes(searchTerm)
        );
        setFilteredProviders(filtered);
    }, [providers, searchTerm]);

    // Función para obtener todos los proveedores del servidor
    const fetchProviders = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(API_BASE_URL);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setProviders(data);
            
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
            setError(`Error al cargar proveedores: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para guardar un proveedor (crear o actualizar)
    const handleSaveProvider = async (formData, providerId = null) => {
        try {
            // Determinar URL y método según si es creación o actualización
            const url = providerId ? `${API_BASE_URL}/${providerId}` : API_BASE_URL;
            const method = providerId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: formData // FormData se envía directamente
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            const savedProvider = await response.json();

            // Actualizar el estado local según la operación
            if (providerId) {
                // Actualización: reemplazar el proveedor existente
                setProviders(prev => prev.map(provider =>
                    provider._id === providerId ? savedProvider : provider
                ));
            } else {
                // Creación: agregar el nuevo proveedor al inicio de la lista
                setProviders(prev => [savedProvider, ...prev]);
            }

            // Cerrar modal y limpiar estado de edición
            setIsModalOpen(false);
            setEditingProvider(null);
            
        } catch (error) {
            console.error('Error al guardar proveedor:', error);
            alert(`Error al guardar proveedor: ${error.message}`);
            throw error;
        }
    };

    // Función para abrir modal de edición
    const handleEditProvider = (provider) => {
        setEditingProvider(provider);
        setIsModalOpen(true);
    };

    // Función para eliminar un proveedor
    const handleDeleteProvider = async (providerId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/${providerId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
                }

                // Eliminar del estado local
                setProviders(prev => prev.filter(provider => provider._id !== providerId));
                
            } catch (error) {
                console.error('Error al eliminar proveedor:', error);
                alert(`Error al eliminar proveedor: ${error.message}`);
            }
        }
    };

    // Función para abrir modal de creación
    const handleAddProvider = () => {
        setEditingProvider(null);
        setIsModalOpen(true);
    };

    // Función para cerrar modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProvider(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header con navegación */}
            <Header
                onLogOut={onLogOut}
                onNavigateToProducts={onNavigateToProducts}
                onNavigateToBrands={onNavigateToBrands}
                onNavigateToProviders={() => { }}
                currentPage="providers"
            />
            
            {/* Información de usuario (oculta) */}
            {userInfo && <span className="text-gray-600" style={{ display: 'none' }}>Bienvenido, {String(userInfo.userType || 'Usuario')}</span>}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Encabezado de la página */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
                            <p className="mt-2 text-gray-600">Gestiona los proveedores de tu ferretería</p>
                        </div>
                        <button
                            onClick={handleAddProvider}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            Agregar Proveedor
                        </button>
                    </div>

                    {/* Campo de búsqueda */}
                    <div className="mt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar proveedores por nombre o teléfono..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Contenido principal con estados condicionales */}
                {isLoading ? (
                    // Estado de carga
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Cargando proveedores...</span>
                    </div>
                ) : error ? (
                    // Estado de error
                    <div className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                        <p className="text-gray-600 text-center mb-4">{error}</p>
                        <button
                            onClick={fetchProviders}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : filteredProviders.length === 0 ? (
                    // Estado vacío
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Plus className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'No se encontraron proveedores' : 'No hay proveedores'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm
                                ? 'Intenta con otros términos de búsqueda'
                                : 'Comienza agregando tu primer proveedor'
                            }
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={handleAddProvider}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                            >
                                <Plus className="w-5 h-5" />
                                Agregar Primer Proveedor
                            </button>
                        )}
                    </div>
                ) : (
                    // Lista de proveedores
                    <>
                        <div className="mb-6">
                            <p className="text-gray-600">
                                {searchTerm
                                    ? `${filteredProviders.length} proveedor${filteredProviders.length !== 1 ? 'es' : ''} encontrado${filteredProviders.length !== 1 ? 's' : ''}`
                                    : `${providers.length} proveedor${providers.length !== 1 ? 'es' : ''} registrado${providers.length !== 1 ? 's' : ''}`
                                }
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProviders.map((provider) => (
                                <ProviderCard
                                    key={provider._id}
                                    provider={provider}
                                    onEdit={handleEditProvider}
                                    onDelete={handleDeleteProvider}
                                />
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* Modal para crear/editar proveedores */}
            <ProviderModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveProvider}
                provider={editingProvider}
            />
        </div>
    );
};

export default Providers;