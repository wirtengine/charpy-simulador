import * as THREE from 'three';

const GRAVEDAD = 9.81;
let MASA_MARTILLO = 20;
let LONGITUD_BRAZO = 1.2;
const AREA_PROBETA = 0.8;

export function setMasa(valor) { MASA_MARTILLO = valor; }
export function setLongitudBrazo(valor) { LONGITUD_BRAZO = valor; }
export function getLongitudBrazo() { return LONGITUD_BRAZO; }

export function calcularEnergiaInicial(anguloGrados) {
    const rad = THREE.MathUtils.degToRad(anguloGrados);
    const altura = LONGITUD_BRAZO * (1 - Math.cos(rad));
    return MASA_MARTILLO * GRAVEDAD * altura;
}

export function factorTemperatura(tempCelsius) {
    if (tempCelsius <= 20) {
        return Math.max(0.2, 1.0 - 0.008 * (20 - tempCelsius));
    } else {
        return 1.0 + 0.002 * (tempCelsius - 20);
    }
}

export function calcularAbsorbida(energiaInicial, material, temperatura) {
    const factor = factorTemperatura(temperatura);
    const resistenciaMax = material.resistenciaDuctil * factor;
    return Math.min(energiaInicial, resistenciaMax);
}

export function calcularResiliencia(energiaAbsorbida) {
    return energiaAbsorbida / AREA_PROBETA;
}