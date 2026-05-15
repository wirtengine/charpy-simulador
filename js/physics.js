import * as THREE from 'three';

const GRAVEDAD = 9.81;
let MASA_MARTILLO = 20;
let LONGITUD_BRAZO = 1.2;
const AREA_PROBETA = 0.8; // cm²

export function setMasa(valor) { MASA_MARTILLO = valor; }
export function setLongitudBrazo(valor) { LONGITUD_BRAZO = valor; }
export function getLongitudBrazo() { return LONGITUD_BRAZO; }

export function calcularEnergiaInicial(anguloGrados) {
    const rad = THREE.MathUtils.degToRad(anguloGrados);
    const altura = LONGITUD_BRAZO * (1 - Math.cos(rad));
    return MASA_MARTILLO * GRAVEDAD * altura; // julios
}

// Energía máxima que puede absorber el material antes de fracturarse
export function energiaMaximaMaterial(material) {
    return material.resiliencia * AREA_PROBETA; // J
}

// Determina el tipo de fractura según la resiliencia del material
export function determinarTipoFractura(material) {
    const r = material.resiliencia;
    if (r < 30) return 'Frágil';
    if (r < 80) return 'Mixta';
    return 'Dúctil';
}

// Factor de corrección por temperatura (afecta la resiliencia)
export function factorTemperatura(tempCelsius) {
    if (tempCelsius <= 20) {
        return Math.max(0.2, 1.0 - 0.008 * (20 - tempCelsius));
    } else {
        return 1.0 + 0.002 * (tempCelsius - 20);
    }
}

// Energía absorbida real en el impacto (limitada por la capacidad del material)
export function calcularEnergiaAbsorbida(energiaCinetica, material, temperatura) {
    const factor = factorTemperatura(temperatura);
    const maxAbs = material.resiliencia * AREA_PROBETA * factor;
    return Math.min(energiaCinetica, maxAbs);
}