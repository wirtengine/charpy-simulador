export const categorias = [
    {
        nombre: 'Metales',
        materiales: [
            { id: 'acero_1045', nombre: 'Acero 1045', resiliencia: 120, color: 0x7f8c8d, rugosidad: 0.35, metalness: 0.9 },
            { id: 'acero_inox', nombre: 'Acero Inox 304', resiliencia: 180, color: 0xb0b0b0, rugosidad: 0.3, metalness: 0.85 },
            { id: 'aluminio_6061', nombre: 'Aluminio 6061', resiliencia: 50, color: 0xbdc3c7, rugosidad: 0.3, metalness: 0.75 },
            { id: 'cobre', nombre: 'Cobre electrolítico', resiliencia: 80, color: 0xe67e22, rugosidad: 0.4, metalness: 0.85 },
            { id: 'titanio', nombre: 'Titanio Grado 5', resiliencia: 90, color: 0x95a5a6, rugosidad: 0.35, metalness: 0.8 },
            { id: 'fundicion', nombre: 'Fundición gris', resiliencia: 8, color: 0x4a4a4a, rugosidad: 0.7, metalness: 0.9 }
        ]
    },
    {
        nombre: 'Polímeros',
        materiales: [
            { id: 'abs', nombre: 'ABS', resiliencia: 2.5, color: 0x27ae60, rugosidad: 0.7, metalness: 0.05 },
            { id: 'policarbonato', nombre: 'Policarbonato', resiliencia: 6.5, color: 0x2ecc71, rugosidad: 0.5, metalness: 0.1 },
            { id: 'nylon', nombre: 'Nylon 6', resiliencia: 5.0, color: 0x3498db, rugosidad: 0.6, metalness: 0.1 },
            { id: 'epoxi', nombre: 'Resina Epoxi', resiliencia: 0.8, color: 0xe74c3c, rugosidad: 0.5, metalness: 0.1 },
            { id: 'pet', nombre: 'PET', resiliencia: 3.0, color: 0x1abc9c, rugosidad: 0.55, metalness: 0.05 },
            { id: 'petg', nombre: 'PETG', resiliencia: 0.8, color: 0x16a085, rugosidad: 0.5, metalness: 0.08 }
        ]
    },
    {
        nombre: 'Cerámicos',
        materiales: [
            { id: 'alumina', nombre: 'Alúmina (Al2O3)', resiliencia: 0.4, color: 0xecf0f1, rugosidad: 0.3, metalness: 0.0 },
            { id: 'zirconia', nombre: 'Zirconia (ZrO2)', resiliencia: 0.6, color: 0xf1c40f, rugosidad: 0.35, metalness: 0.0 },
            { id: 'vidrio', nombre: 'Vidrio templado', resiliencia: 0.2, color: 0xbdc3c7, rugosidad: 0.1, metalness: 0.0 }
        ]
    },
    {
        nombre: 'Compuestos',
        materiales: [
            { id: 'fibra_carbono', nombre: 'Fibra de carbono/epoxi', resiliencia: 7.0, color: 0x34495e, rugosidad: 0.4, metalness: 0.2 },
            { id: 'fibra_vidrio', nombre: 'Fibra de vidrio/poliéster', resiliencia: 4.5, color: 0x95a5a6, rugosidad: 0.5, metalness: 0.1 },
            { id: 'kevlar', nombre: 'Kevlar 49', resiliencia: 15.0, color: 0xd4ac0d, rugosidad: 0.45, metalness: 0.1 }
        ]
    }
];

export function obtenerTodosMateriales() {
    return categorias.flatMap(cat => cat.materiales);
}