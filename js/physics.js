import * as THREE from 'three';

const GRAVEDAD = 9.81;
let MASA_MARTILLO = 20;
let LONGITUD_BRAZO = 1.2;
const AREA_PROBETA = 0.8; // cm²

export function setMasa(valor) { MASA_MARTILLO = valor; }
export function getMasa() { return MASA_MARTILLO; }
export function setLongitudBrazo(valor) { LONGITUD_BRAZO = valor; }
export function getLongitudBrazo() { return LONGITUD_BRAZO; }

export function calcularEnergiaInicial(anguloGrados) {
    const rad = THREE.MathUtils.degToRad(anguloGrados);
    const altura = LONGITUD_BRAZO * (1 - Math.cos(rad));
    return MASA_MARTILLO * GRAVEDAD * altura;
}

export function energiaMaximaMaterial(material) {
    return material.resiliencia * AREA_PROBETA;
}

export function determinarTipoFractura(material) {
    const r = material.resiliencia;
    if (r < 30) return 'Frágil';
    if (r < 80) return 'Mixta';
    return 'Dúctil';
}

export function factorTemperatura(tempCelsius) {
    if (tempCelsius <= 20) {
        return Math.max(0.2, 1.0 - 0.008 * (20 - tempCelsius));
    } else {
        return 1.0 + 0.002 * (tempCelsius - 20);
    }
}

export function calcularEnergiaAbsorbida(energiaCinetica, material, temperatura) {
    const factor = factorTemperatura(temperatura);
    const maxAbs = material.resiliencia * AREA_PROBETA * factor;
    return Math.min(energiaCinetica, maxAbs);
}

export function calcularResiliencia(energiaAbsorbida) {
    return energiaAbsorbida / AREA_PROBETA;
}