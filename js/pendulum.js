import * as THREE from 'three';
import { getLongitudBrazo, calcularEnergiaInicial, calcularAbsorbida, factorTemperatura } from './physics.js';

let mixer, action, materialObj, probetaObj, callbackFin;
let activo = false;
let temperatura = 20;
const DURACION = 9.17;
let tiempoImpacto = 4.585;

export function setTiempoImpacto(t) { tiempoImpacto = t; }

function anguloToTime(ang) {
    const frac = 1 - (ang / 90);
    return frac * tiempoImpacto;
}

function timeToAngulo(t) {
    const frac = t / tiempoImpacto;
    return 90 * (1 - frac);
}

export function animarPendulo(_mixer, _action, angInicial, mat, prob, temp, cb) {
    if (activo) return;
    activo = true;
    mixer = _mixer;
    action = _action;
    materialObj = mat;
    probetaObj = prob;
    callbackFin = cb;
    temperatura = temp;
    action.paused = true;
    let tActual = anguloToTime(angInicial);
    action.time = tActual;
    mixer.update(0);
    let velAng = 0;
    const dt = 1 / 60;

    function paso() {
        if (!activo) return;
        const L = getLongitudBrazo();
        const angRad = THREE.MathUtils.degToRad(timeToAngulo(tActual));
        const acelRad = -(9.81 / L) * Math.sin(angRad);
        const acelGrad = THREE.MathUtils.radToDeg(acelRad);
        velAng += acelGrad * dt;
        velAng *= 0.999;
        const nuevoAng = timeToAngulo(tActual) + velAng * dt;
        tActual = anguloToTime(Math.max(0, Math.min(90, nuevoAng)));
        action.time = tActual;
        mixer.update(dt);

        if (nuevoAng <= 0 && velAng < 0) {
            impacto(angInicial);
            return;
        }
        if (velAng > 0 && nuevoAng >= angInicial) {
            terminar();
            return;
        }
        requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
}

function impacto(angInicial) {
    const eInicial = calcularEnergiaInicial(angInicial);
    const absorbida = calcularAbsorbida(eInicial, materialObj, temperatura);
    const factor = factorTemperatura(temperatura);
    const umbralFragil = materialObj.resistenciaFragil * factor;
    let tipo = 'Sin fractura';

    if (absorbida >= umbralFragil * 0.95) {
        const umbralDuctil = materialObj.resistenciaDuctil * factor;
        if (absorbida <= umbralFragil) {
            tipo = 'Frágil';
        } else if (absorbida >= umbralDuctil) {
            tipo = 'Dúctil';
        } else {
            tipo = 'Mixta';
        }

        probetaObj.fracturar(materialObj, tipo);

        if (tipo === 'Frágil') {
            window.camaraShake = true;
            window.camaraShakeFrames = 15;
            window.camaraShakeIntensidad = 0.04;
            window.timeScale = 0.1;
            setTimeout(() => window.timeScale = 1, 400);
            sonidoImpacto('fragil');
        } else if (tipo === 'Dúctil') {
            window.camaraShake = true;
            window.camaraShakeFrames = 30;
            window.camaraShakeIntensidad = 0.015;
            window.timeScale = 0.2;
            setTimeout(() => window.timeScale = 1, 800);
            sonidoImpacto('ductil');
        } else if (tipo === 'Mixta') {
            window.camaraShake = true;
            window.camaraShakeFrames = 22;
            window.camaraShakeIntensidad = 0.025;
            window.timeScale = 0.15;
            setTimeout(() => window.timeScale = 1, 600);
            sonidoImpacto('mixto');
        }
    } else {
        probetaObj.deformar();
        window.camaraShake = true;
        window.camaraShakeFrames = 10;
        window.camaraShakeIntensidad = 0.01;
        tipo = 'Sin fractura';
        sonidoImpacto('deformacion');
    }

    if (callbackFin) callbackFin(absorbida, tipo);
    terminar();
}

function sonidoImpacto(tipo) {
    try {
        // Crear contexto de audio (puede fallar si no hay interacción previa, pero ya hay clic)
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const ahora = ctx.currentTime;

        switch (tipo) {
            case 'fragil':
                osc.type = 'square';
                osc.frequency.setValueAtTime(800, ahora);
                osc.frequency.exponentialRampToValueAtTime(100, ahora + 0.1);
                gain.gain.setValueAtTime(0.3, ahora);
                gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.1);
                osc.start(ahora);
                osc.stop(ahora + 0.1);
                break;
            case 'ductil':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, ahora);
                osc.frequency.linearRampToValueAtTime(40, ahora + 0.4);
                gain.gain.setValueAtTime(0.2, ahora);
                gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.4);
                osc.start(ahora);
                osc.stop(ahora + 0.4);
                break;
            case 'mixto':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, ahora);
                osc.frequency.exponentialRampToValueAtTime(80, ahora + 0.25);
                gain.gain.setValueAtTime(0.25, ahora);
                gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.25);
                osc.start(ahora);
                osc.stop(ahora + 0.25);
                break;
            case 'deformacion':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, ahora);
                osc.frequency.linearRampToValueAtTime(50, ahora + 0.15);
                gain.gain.setValueAtTime(0.15, ahora);
                gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.15);
                osc.start(ahora);
                osc.stop(ahora + 0.15);
                break;
        }
    } catch (e) {
        // El navegador podría bloquear el audio si no hay interacción, pero ya se hizo clic.
        console.warn('Error al reproducir sonido:', e);
    }
}

function terminar() {
    activo = false;
}

export function resetPendulo(_mixer, _action) {
    activo = false;
    if (_action) {
        _action.time = 0;
        _action.paused = true;
        _mixer.update(0);
    }
}