import { Edit, Trash2, User } from 'lucide-react';

const ProviderCard = ({ provider, onEdit, onDelete }) => {
    
    // Función para manejar la eliminación con confirmación
    const handleDelete = () => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar "${provider.name}"?`)) {
            onDelete(provider._id);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            {/* Sección de imagen del proveedor */}
            <div className="relative">
                {provider.image ? (
                    <img 
                        src={provider.image} 
                        alt={provider.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                            // Si la imagen falla al cargar, mostrar el ícono por defecto
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                
                {/* Contenedor para el ícono por defecto */}
                <div 
                    className="w-full h-48 bg-gray-200 flex items-center justify-center"
                    style={{ display: provider.image ? 'none' : 'flex' }}
                >
                    <User className="w-16 h-16 text-gray-400" />
                </div>
                
                {/* Botones de acción superpuestos */}
                <div className="absolute top-2 right-2 flex gap-2">
                    <button
                        onClick={() => onEdit(provider)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition-colors duration-200"
                        title="Editar proveedor"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-md transition-colors duration-200"
                        title="Eliminar proveedor"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            {/* Información del proveedor */}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate" title={provider.name}>
                    {provider.name}
                </h3>
                <div className="space-y-1">
                    <p className="text-gray-600">
                        <span className="font-medium">Teléfono:</span> {provider.telephone}
                    </p>
                    {/* Mostrar fecha de creación si está disponible */}
                    {provider.createdAt && (
                        <p className="text-xs text-gray-500">
                            Creado: {new Date(provider.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProviderCard;