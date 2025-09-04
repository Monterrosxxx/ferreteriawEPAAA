import { useState, useEffect } from "react";
import { X, Upload, User } from 'lucide-react';

const ProviderModal = ({ isOpen, onClose, onSave, provider = null }) => {
    // Estados para el formulario
    const [formData, setFormData] = useState({
        name: '',
        telephone: '',
        image: null
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Efecto para cargar datos del proveedor cuando se abre el modal
    useEffect(() => {
        if (provider) {
            // Modo edición: cargar datos existentes
            setFormData({
                name: provider.name || '',
                telephone: provider.telephone || '',
                image: null
            });
            setImagePreview(provider.image || null);
        } else {
            // Modo creación: limpiar formulario
            setFormData({
                name: '',
                telephone: '',
                image: null
            });
            setImagePreview(null);
        }
        
        // Limpiar errores al abrir/cerrar modal
        setErrors({});
    }, [provider, isOpen]);

    // Función para manejar cambios en los inputs de texto
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error específico cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Función para manejar cambios en la imagen
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({
                    ...prev,
                    image: 'Solo se permiten archivos JPG, JPEG y PNG'
                }));
                return;
            }

            // Validar tamaño del archivo (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    image: 'El archivo debe ser menor a 5MB'
                }));
                return;
            }

            // Actualizar estado con el archivo
            setFormData(prev => ({
                ...prev,
                image: file
            }));

            // Crear vista previa
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Limpiar error de imagen
            if (errors.image) {
                setErrors(prev => ({
                    ...prev,
                    image: ''
                }));
            }
        }
    };

    // Función para validar el formulario
    const validateForm = () => {
        const newErrors = {};

        // Validar nombre
        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'El nombre debe tener al menos 2 caracteres';
        }

        // Validar teléfono
        if (!formData.telephone.trim()) {
            newErrors.telephone = 'El teléfono es requerido';
        } else if (formData.telephone.trim().length < 8) {
            newErrors.telephone = 'El teléfono debe tener al menos 8 dígitos';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validar formulario antes de enviar
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Crear FormData para enviar datos multipart/form-data
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('telephone', formData.telephone.trim());

            // Agregar imagen solo si se seleccionó una nueva
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            // Llamar a la función de guardado proporcionada por el padre
            await onSave(formDataToSend, provider?._id);
            
            // Cerrar modal después del éxito
            onClose();
            
        } catch (error) {
            console.error('Error al guardar proveedor:', error);
            setErrors({ 
                general: 'Error al guardar el proveedor. Por favor, intenta de nuevo.' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Función para remover la imagen seleccionada
    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            image: null
        }));
        setImagePreview(provider?.image || null);
        if (errors.image) {
            setErrors(prev => ({
                ...prev,
                image: ''
            }));
        }
    };

    // No renderizar nada si el modal no está abierto
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header del modal */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {provider ? 'Editar Proveedor' : 'Agregar Proveedor'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isSubmitting}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Error general */}
                    {errors.general && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                            {errors.general}
                        </div>
                    )}

                    {/* Campo de nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Proveedor *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Ingrese el nombre del proveedor"
                            disabled={isSubmitting}
                            required
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Campo de teléfono */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teléfono *
                        </label>
                        <input
                            type="tel"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.telephone ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Ingrese el teléfono"
                            disabled={isSubmitting}
                            required
                        />
                        {errors.telephone && (
                            <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>
                        )}
                    </div>

                    {/* Campo de imagen */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imagen del Proveedor
                        </label>
                        <div className="space-y-3">
                            {/* Vista previa de la imagen */}
                            {imagePreview && (
                                <div className="flex justify-center relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                                    />
                                    {/* Botón para remover imagen solo si se seleccionó una nueva */}
                                    {formData.image && (
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                            disabled={isSubmitting}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Campo de selección de archivo */}
                            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                errors.image 
                                    ? 'border-red-300 bg-red-50' 
                                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {!imagePreview && <User className="w-8 h-8 mb-2 text-gray-400" />}
                                    <Upload className="w-6 h-6 mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-500">
                                        {imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                                    </p>
                                    <p className="text-xs text-gray-400">JPG, JPEG, PNG (máx. 5MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={handleImageChange}
                                    disabled={isSubmitting}
                                />
                            </label>
                            {errors.image && (
                                <p className="text-sm text-red-600">{errors.image}</p>
                            )}
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Guardando...
                                </div>
                            ) : (
                                provider ? 'Actualizar' : 'Agregar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProviderModal;