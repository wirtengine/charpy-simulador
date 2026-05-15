export const categorias = [
    {
        nombre: 'Metales',
        materiales: [
            { id: 'acero_1045', nombre: 'Acero 1045', resistenciaFragil: 80, resistenciaDuctil: 160, ductilidad: 0.25, color: 0x7f8c8d, rugosidad: 0.35, metalness: 0.9, tipoBase: 'Frágil' },
            { id: 'acero_inox', nombre: 'Acero Inox 304', resistenciaFragil: 100, resistenciaDuctil: 200, ductilidad: 0.55, color: 0xb0b0b0, rugosidad: 0.3, metalness: 0.85, tipoBase: 'Dúctil' },
            { id: 'aluminio_6061', nombre: 'Aluminio 6061', resistenciaFragil: 40, resistenciaDuctil: 120, ductilidad: 0.6, color: 0xbdc3c7, rugosidad: 0.3, metalness: 0.75, tipoBase: 'Dúctil' },
            { id: 'cobre', nombre: 'Cobre electrolítico', resistenciaFragil: 50, resistenciaDuctil: 130, ductilidad: 0.8, color: 0xe67e22, rugosidad: 0.4, metalness: 0.85, tipoBase: 'Dúctil' },
            { id: 'titanio', nombre: 'Titanio Grado 5', resistenciaFragil: 70, resistenciaDuctil: 150, ductilidad: 0.5, color: 0x95a5a6, rugosidad: 0.35, metalness: 0.8, tipoBase: 'Dúctil' },
            { id: 'fundicion', nombre: 'Fundición gris', resistenciaFragil: 15, resistenciaDuctil: 30, ductilidad: 0.05, color: 0x4a4a4a, rugosidad: 0.7, metalness: 0.9, tipoBase: 'Frágil' }
        ]
    },
    {
        nombre: 'Polímeros',
        materiales: [
            { id: 'abs', nombre: 'ABS', resistenciaFragil: 8, resistenciaDuctil: 30, ductilidad: 0.85, color: 0x27ae60, rugosidad: 0.7, metalness: 0.05, tipoBase: 'Dúctil' },
            { id: 'policarbonato', nombre: 'Policarbonato', resistenciaFragil: 25, resistenciaDuctil: 70, ductilidad: 0.9, color: 0x2ecc71, rugosidad: 0.5, metalness: 0.1, tipoBase: 'Dúctil' },
            { id: 'nylon', nombre: 'Nylon 6', resistenciaFragil: 15, resistenciaDuctil: 55, ductilidad: 0.8, color: 0x3498db, rugosidad: 0.6, metalness: 0.1, tipoBase: 'Dúctil' },
            { id: 'epoxi', nombre: 'Resina Epoxi', resistenciaFragil: 5, resistenciaDuctil: 15, ductilidad: 0.15, color: 0xe74c3c, rugosidad: 0.5, metalness: 0.1, tipoBase: 'Frágil' },
            { id: 'pet', nombre: 'PET', resistenciaFragil: 10, resistenciaDuctil: 35, ductilidad: 0.7, color: 0x1abc9c, rugosidad: 0.55, metalness: 0.05, tipoBase: 'Dúctil' },
            { id: 'petg', nombre: 'PETG', resistenciaFragil: 12, resistenciaDuctil: 40, ductilidad: 0.75, color: 0x16a085, rugosidad: 0.5, metalness: 0.08, tipoBase: 'Dúctil' }
        ]
    },
    {
        nombre: 'Cerámicos',
        materiales: [
            { id: 'alumina', nombre: 'Alúmina (Al2O3)', resistenciaFragil: 5, resistenciaDuctil: 10, ductilidad: 0.01, color: 0xecf0f1, rugosidad: 0.3, metalness: 0.0, tipoBase: 'Frágil' },
            { id: 'zirconia', nombre: 'Zirconia (ZrO2)', resistenciaFragil: 8, resistenciaDuctil: 12, ductilidad: 0.03, color: 0xf1c40f, rugosidad: 0.35, metalness: 0.0, tipoBase: 'Frágil' },
            { id: 'vidrio', nombre: 'Vidrio templado', resistenciaFragil: 3, resistenciaDuctil: 5, ductilidad: 0.0, color: 0xbdc3c7, rugosidad: 0.1, metalness: 0.0, tipoBase: 'Frágil' }
        ]
    },
    {
        nombre: 'Compuestos',
        materiales: [
            { id: 'fibra_carbono', nombre: 'Fibra de carbono/epoxi', resistenciaFragil: 40, resistenciaDuctil: 90, ductilidad: 0.2, color: 0x34495e, rugosidad: 0.4, metalness: 0.2, tipoBase: 'Frágil' },
            { id: 'fibra_vidrio', nombre: 'Fibra de vidrio/poliéster', resistenciaFragil: 25, resistenciaDuctil: 60, ductilidad: 0.35, color: 0x95a5a6, rugosidad: 0.5, metalness: 0.1, tipoBase: 'Frágil' },
            { id: 'kevlar', nombre: 'Kevlar 49', resistenciaFragil: 50, resistenciaDuctil: 110, ductilidad: 0.4, color: 0xd4ac0d, rugosidad: 0.45, metalness: 0.1, tipoBase: 'Dúctil' }
        ]
    }
];

export function obtenerTodosMateriales() {
    return categorias.flatMap(cat => cat.materiales);
}