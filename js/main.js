import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { crearEntorno } from './environment.js';
import { categorias, obtenerTodosMateriales } from './materials.js';
import {
    setMasa,
    setLongitudBrazo,
    calcularEnergiaInicial,
    calcularResiliencia
} from './physics.js';
import { crearProbeta, actualizarMaterialProbeta } from './specimen.js';
import { animarPendulo, resetPendulo, setTiempoImpacto } from './pendulum.js';
import { initChart, updateChart } from './charts.js';
import { generarPDF } from './export.js';

let escena, camara, renderer, controls, mixer, action, probeta, modelo;
let matSel = obtenerTodosMateriales()[0];
let anguloInicial = 90;
let temperatura = 20;
let masaMartillo = 20;
let longitudBrazo = 1.2;
let ensayando = false;
let ultimoEnsayo = null;
const clock = new THREE.Clock();

async function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.getElementById('contenedor-3d').appendChild(renderer.domElement);

    escena = new THREE.Scene();
    escena.background = new THREE.Color(0xdae1e7);
    escena.environment = crearEntorno(renderer);

    camara = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camara.position.set(3.5, 2.2, 5.5);

    controls = new OrbitControls(camara, renderer.domElement);
    controls.target.set(0, -0.3, 0);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 2;
    controls.maxDistance = 12;

    escena.add(new THREE.AmbientLight(0xffffff, 1.2));
    const luzPrincipal = new THREE.DirectionalLight(0xffffff, 2.5);
    luzPrincipal.position.set(5, 10, 7);
    luzPrincipal.castShadow = true;
    luzPrincipal.shadow.mapSize.set(2048, 2048);
    luzPrincipal.shadow.bias = -0.0001;
    escena.add(luzPrincipal);
    const luzRelleno = new THREE.DirectionalLight(0xffffff, 0.8);
    luzRelleno.position.set(-5, 5, -5);
    escena.add(luzRelleno);

    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 512; i += 64) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
    }
    const texturaSuelo = new THREE.CanvasTexture(canvas);
    texturaSuelo.wrapS = texturaSuelo.wrapT = THREE.RepeatWrapping;
    texturaSuelo.repeat.set(6, 6);
    const suelo = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshStandardMaterial({ map: texturaSuelo, roughness: 0.7 })
    );
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.y = -1.8;
    suelo.receiveShadow = true;
    escena.add(suelo);

    try {
        const gltf = await new GLTFLoader().loadAsync('../impact_testing_machine_charpy/scene.gltf');
        modelo = gltf.scene;
        modelo.scale.set(0.5, 0.5, 0.5);
        const box = new THREE.Box3().setFromObject(modelo);
        modelo.position.set(0, -1.8 - box.min.y, 0);
        escena.add(modelo);

        modelo.traverse(child => {
            if (child.isMesh) {
                child.castShadow = child.receiveShadow = true;
                if (child.material) {
                    child.material.roughness = 0.4;
                    child.material.metalness = 0.5;
                }
            }
        });

        let probetaOriginal = null;
        modelo.traverse(child => {
            if (child.isMesh && child.material?.color?.getHex() === 0xff0000) probetaOriginal = child;
        });
        if (probetaOriginal) probetaOriginal.visible = false;
        const posProbeta = probetaOriginal ? probetaOriginal.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(0, -1.35, 0.2);
        probeta = crearProbeta(escena, posProbeta, modelo.scale.clone());

        mixer = new THREE.AnimationMixer(modelo);
        action = mixer.clipAction(gltf.animations[0]);
        action.play();
        action.paused = true;
    } catch (error) {
        console.error("Error cargando el modelo:", error);
    }

    llenarMaterialesAgrupados();
    configurarEventosUI();
    initChart();
    animar();
}

function configurarEventosUI() {
    function sincronizar(idSlider, idNum, esDecimal = false) {
        const slider = document.getElementById(idSlider);
        const num = document.getElementById(idNum);
        const actualizarNum = () => {
            num.value = esDecimal ? parseFloat(slider.value).toFixed(2) : parseInt(slider.value);
        };
        const actualizarSlider = () => {
            let val = esDecimal ? parseFloat(num.value) : parseInt(num.value);
            if (isNaN(val)) return;
            val = Math.max(parseFloat(slider.min), Math.min(parseFloat(slider.max), val));
            slider.value = val;
            num.value = esDecimal ? val.toFixed(2) : val;
            slider.dispatchEvent(new Event('input'));
        };
        slider.addEventListener('input', actualizarNum);
        num.addEventListener('input', actualizarSlider);
        actualizarNum();
    }

    sincronizar('angulo', 'angulo-num', false);
    sincronizar('temperatura', 'temperatura-num', false);
    sincronizar('masa-martillo', 'masa-martillo-num', true);
    sincronizar('longitud-brazo', 'longitud-brazo-num', true);

    document.getElementById('angulo').addEventListener('input', e => {
        anguloInicial = +e.target.value;
    });
    document.getElementById('temperatura').addEventListener('input', e => {
        temperatura = +e.target.value;
    });
    document.getElementById('masa-martillo').addEventListener('input', e => {
        masaMartillo = parseFloat(e.target.value);
        setMasa(masaMartillo);
    });
    document.getElementById('longitud-brazo').addEventListener('input', e => {
        longitudBrazo = parseFloat(e.target.value);
        setLongitudBrazo(longitudBrazo);
    });

    document.getElementById('btn-iniciar').onclick = iniciarEnsayo;
    document.getElementById('btn-reiniciar').onclick = reiniciar;

    document.getElementById('btn-grafica').onclick = () => document.getElementById('panel-grafica').classList.remove('oculto');
    document.getElementById('btn-cerrar-grafica').onclick = () => document.getElementById('panel-grafica').classList.add('oculto');
    document.getElementById('btn-pdf').onclick = () => generarPDF(ultimoEnsayo);
    document.getElementById('btn-educativo').onclick = () => document.getElementById('panel-educativo').classList.remove('oculto');
    document.getElementById('cerrar-educativo').onclick = () => document.getElementById('panel-educativo').classList.add('oculto');

    let tiempoImpacto = 4.585;
    setTiempoImpacto(tiempoImpacto);
    document.getElementById('slider-impacto').addEventListener('input', e => {
        tiempoImpacto = +e.target.value;
        document.getElementById('valor-impacto').textContent = tiempoImpacto.toFixed(3);
    });
    document.getElementById('btn-aplicar-calibracion').onclick = () => setTiempoImpacto(tiempoImpacto);
}

function llenarMaterialesAgrupados() {
    const select = document.getElementById('material');
    select.innerHTML = '';
    categorias.forEach(categoria => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = categoria.nombre;
        categoria.materiales.forEach(mat => {
            const option = document.createElement('option');
            option.value = mat.id;
            option.textContent = mat.nombre;
            optgroup.appendChild(option);
        });
        select.appendChild(optgroup);
    });
    select.onchange = () => {
        matSel = obtenerTodosMateriales().find(m => m.id === select.value);
        actualizarMaterialProbeta(probeta, matSel);
    };
    actualizarMaterialProbeta(probeta, matSel);
}

function animar() {
    requestAnimationFrame(animar);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    controls.update();

    if (window.camaraShake && window.camaraShakeFrames > 0) {
        const intensidad = window.camaraShakeIntensidad || 0.02;
        camara.position.x += (Math.random() - 0.5) * intensidad;
        camara.position.y += (Math.random() - 0.5) * intensidad;
        window.camaraShakeFrames--;
        if (window.camaraShakeFrames <= 0) window.camaraShake = false;
    }

    if (probeta?.particulas) {
        for (let i = probeta.particulas.length - 1; i >= 0; i--) {
            const p = probeta.particulas[i];
            p.position.add(p.userData.vel.clone().multiplyScalar(0.016));
            p.userData.vel.y -= 0.005;
            if (p.position.y < -2) {
                escena.remove(p);
                probeta.particulas.splice(i, 1);
            }
        }
    }
    renderer.render(escena, camara);
}

async function iniciarEnsayo() {
    if (ensayando) return;
    ensayando = true;
    document.getElementById('btn-iniciar').disabled = true;

    // Notificar que empieza el ensayo (para plegar el panel en móvil)
    window.dispatchEvent(new CustomEvent('ensayoIniciado'));

    const eIni = calcularEnergiaInicial(anguloInicial);
    document.getElementById('e-inicial').textContent = eIni.toFixed(2) + ' J';

    animarPendulo(mixer, action, anguloInicial, matSel, probeta, temperatura, (absorbida, tipo) => {
        const res = calcularResiliencia(absorbida);
        document.getElementById('e-absorbida').textContent = absorbida.toFixed(2) + ' J';
        document.getElementById('resiliencia').textContent = res.toFixed(2) + ' J/cm²';
        document.getElementById('tipo-fractura').textContent = tipo;

        ultimoEnsayo = {
            material: matSel.nombre,
            angulo: anguloInicial,
            temperatura,
            masa: masaMartillo,
            longitudBrazo,
            eInicial: eIni.toFixed(2),
            eAbsorbida: absorbida.toFixed(2),
            resiliencia: res.toFixed(2),
            tipoFractura: tipo
        };

        updateChart(`${matSel.nombre}`, absorbida);

        // Notificar que terminó el ensayo (por si quieres expandir el panel otra vez)
        window.dispatchEvent(new CustomEvent('ensayoTerminado'));

        document.getElementById('btn-iniciar').disabled = false;
        ensayando = false;
    });
}

function reiniciar() {
    resetPendulo(mixer, action);
    probeta.reset();
    document.getElementById('e-inicial').textContent = '0 J';
    document.getElementById('e-absorbida').textContent = '0 J';
    document.getElementById('resiliencia').textContent = '0 J/cm²';
    document.getElementById('tipo-fractura').textContent = '-';
}

window.addEventListener('resize', () => {
    camara.aspect = window.innerWidth / window.innerHeight;
    camara.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init().catch(console.error);