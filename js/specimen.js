import * as THREE from 'three';

export function crearProbeta(escena, posicion, escala = new THREE.Vector3(1,1,1)) {
    const ancho = 0.08, alto = 0.1, profundo = 0.55;
    const geo = new THREE.BoxGeometry(ancho, alto, profundo);
    const mat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.4, metalness: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(posicion);
    mesh.scale.copy(escala);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    escena.add(mesh);

    const datos = {
        mesh,
        mitades: null,
        particulas: [],
        _cancelarEstiramiento: null,
        fracturar(matSel, tipoFractura) {
            if (this.mitades) return;
            escena.remove(mesh);
            if (tipoFractura === 'Frágil') {
                this._fracturaFragil(matSel, escala);
            } else if (tipoFractura === 'Dúctil') {
                this._fracturaDuctil(matSel, escala);
            } else if (tipoFractura === 'Mixta') {
                this._fracturaMixta(matSel, escala);
            }
        },
        _fracturaFragil(matSel, escalaE) {
            // (código idéntico al de la versión anterior)
            const geoIzq = new THREE.BoxGeometry(ancho/2, alto, profundo);
            const geoDer = new THREE.BoxGeometry(ancho/2, alto, profundo);
            const matF = new THREE.MeshStandardMaterial({ color: matSel.color, roughness: 0.4, metalness: 0.7 });
            const izq = new THREE.Mesh(geoIzq, matF);
            const der = new THREE.Mesh(geoDer, matF);
            izq.position.copy(mesh.position).add(new THREE.Vector3(-ancho/4 * escalaE.x, 0, 0));
            der.position.copy(mesh.position).add(new THREE.Vector3(ancho/4 * escalaE.x, 0, 0));
            izq.scale.copy(escalaE); der.scale.copy(escalaE);
            escena.add(izq); escena.add(der);
            this.mitades = { izq, der };

            const objIzq = izq.position.clone().add(new THREE.Vector3(-0.35 * escalaE.x, 0.15, 0.1));
            const objDer = der.position.clone().add(new THREE.Vector3(0.35 * escalaE.x, -0.15, -0.1));
            let t = 0;
            const anim = () => {
                t += 0.25;
                if (t >= 1) { izq.position.copy(objIzq); der.position.copy(objDer); return; }
                izq.position.lerp(objIzq, t);
                der.position.lerp(objDer, t);
                requestAnimationFrame(anim);
            };
            anim();

            for (let i = 0; i < 80; i++) {
                const size = 0.003 + Math.random() * 0.008;
                const g = new THREE.SphereGeometry(size, 3, 3);
                const m = new THREE.MeshStandardMaterial({ color: matSel.color, roughness: 0.2, metalness: 0.3, emissive: new THREE.Color(0x331100) });
                const p = new THREE.Mesh(g, m);
                p.position.copy(izq.position);
                p.userData.vel = new THREE.Vector3((Math.random() - 0.5) * 1.2, Math.random() * 0.8 + 0.2, (Math.random() - 0.5) * 1.2);
                escena.add(p);
                this.particulas.push(p);
            }
            this._crearFlash(izq.position, 0xffffff, 1.5);
        },
        _fracturaDuctil(matSel, escalaE) {
            // (código idéntico al de la versión anterior, pero con animacionActiva corregida)
            escena.add(mesh);
            mesh.material.color.setHex(matSel.color);
            let estiramiento = 0;
            const maxEst = 0.3;
            let animacionActiva = true;
            this._cancelarEstiramiento = () => { animacionActiva = false; };

            function animarEstiramiento() {
                if (!animacionActiva) return;
                estiramiento += 0.015;
                const factor = 1 + estiramiento * maxEst;
                mesh.scale.set(
                    escalaE.x * (1 - estiramiento * 0.2),
                    escalaE.y * (1 - estiramiento * 0.5),
                    escalaE.z * factor
                );
                if (estiramiento >= 1) {
                    escena.remove(mesh);
                    crearMitadesDuctiles();
                    return;
                }
                requestAnimationFrame(animarEstiramiento);
            }
            animarEstiramiento();

            const self = this;
            function crearMitadesDuctiles() {
                const geoIzq = new THREE.BoxGeometry(ancho/2 - 0.005, alto * 0.7, profundo * 1.3);
                const geoDer = new THREE.BoxGeometry(ancho/2 - 0.005, alto * 0.7, profundo * 1.3);
                const matF = new THREE.MeshStandardMaterial({ color: matSel.color, roughness: 0.6, metalness: 0.6 });
                const izq = new THREE.Mesh(geoIzq, matF);
                const der = new THREE.Mesh(geoDer, matF);
                izq.position.copy(mesh.position).add(new THREE.Vector3(-ancho/4 * escalaE.x, 0, 0));
                der.position.copy(mesh.position).add(new THREE.Vector3(ancho/4 * escalaE.x, 0, 0));
                izq.scale.copy(escalaE); der.scale.copy(escalaE);
                escena.add(izq); escena.add(der);
                self.mitades = { izq, der };

                const objIzq = izq.position.clone().add(new THREE.Vector3(-0.12 * escalaE.x, 0.03, 0.15));
                const objDer = der.position.clone().add(new THREE.Vector3(0.12 * escalaE.x, -0.03, -0.15));
                let t = 0;
                const anim = () => {
                    t += 0.02;
                    if (t >= 1) { izq.position.copy(objIzq); der.position.copy(objDer); return; }
                    izq.position.lerp(objIzq, t);
                    der.position.lerp(objDer, t);
                    izq.rotation.z += 0.03;
                    der.rotation.z -= 0.03;
                    requestAnimationFrame(anim);
                };
                anim();

                for (let i = 0; i < 25; i++) {
                    const size = 0.01 + Math.random() * 0.02;
                    const g = new THREE.BoxGeometry(size, size, size);
                    const m = new THREE.MeshStandardMaterial({ color: matSel.color, roughness: 0.5, metalness: 0.4 });
                    const p = new THREE.Mesh(g, m);
                    p.position.copy(izq.position);
                    p.userData.vel = new THREE.Vector3((Math.random() - 0.5) * 0.3, Math.random() * 0.15, (Math.random() - 0.5) * 0.3);
                    escena.add(p);
                    self.particulas.push(p);
                }
                self._crearFlash(izq.position, 0xff6600, 0.7);
            }
        },
        _fracturaMixta(matSel, escalaE) {
            // Compresión moderada (menos que dúctil)
            escena.add(mesh);
            mesh.material.color.setHex(matSel.color);
            let compresion = 0;
            const maxComp = 0.15;
            let animacionActiva = true;
            this._cancelarEstiramiento = () => { animacionActiva = false; };

            function animarCompresion() {
                if (!animacionActiva) return;
                compresion += 0.02;
                const factor = 1 - compresion * maxComp;
                mesh.scale.set(
                    escalaE.x * (1 + compresion * 0.1),  // se ensancha ligeramente
                    escalaE.y * factor,
                    escalaE.z * (1 - compresion * 0.05)
                );
                if (compresion >= 1) {
                    escena.remove(mesh);
                    crearMitadesMixtas();
                    return;
                }
                requestAnimationFrame(animarCompresion);
            }
            animarCompresion();

            const self = this;
            function crearMitadesMixtas() {
                // Mitades con dos materiales: brillante (frágil) en el centro, mate (dúctil) en los bordes
                const geoIzq = new THREE.BoxGeometry(ancho/2 - 0.005, alto * 0.85, profundo);
                const geoDer = new THREE.BoxGeometry(ancho/2 - 0.005, alto * 0.85, profundo);
                
                // Material mixto: usamos un array de materiales para la superficie de fractura
                const matBrillante = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.8 });
                const matMate = new THREE.MeshStandardMaterial({ color: matSel.color, roughness: 0.8, metalness: 0.2 });
                
                // Para simular la mezcla, usamos un material con mapa de textura procedural (sencillo)
                // Pero para simplificar, pintamos las caras internas con el brillante y las externas con el mate
                const izq = new THREE.Mesh(geoIzq, [
                    matMate, matMate, matBrillante, matMate, matMate, matMate  // cara +X (interna) brillante
                ]);
                const der = new THREE.Mesh(geoDer, [
                    matMate, matMate, matBrillante, matMate, matMate, matMate
                ]);
                
                izq.position.copy(mesh.position).add(new THREE.Vector3(-ancho/4 * escalaE.x, 0, 0));
                der.position.copy(mesh.position).add(new THREE.Vector3(ancho/4 * escalaE.x, 0, 0));
                izq.scale.copy(escalaE); der.scale.copy(escalaE);
                escena.add(izq); escena.add(der);
                self.mitades = { izq, der };

                // Separación moderada
                const objIzq = izq.position.clone().add(new THREE.Vector3(-0.22 * escalaE.x, 0.08, 0.05));
                const objDer = der.position.clone().add(new THREE.Vector3(0.22 * escalaE.x, -0.08, -0.05));
                let t = 0;
                const anim = () => {
                    t += 0.08;
                    if (t >= 1) { izq.position.copy(objIzq); der.position.copy(objDer); return; }
                    izq.position.lerp(objIzq, t);
                    der.position.lerp(objDer, t);
                    izq.rotation.z += 0.02;
                    der.rotation.z -= 0.02;
                    requestAnimationFrame(anim);
                };
                anim();

                // Partículas medianas (40)
                for (let i = 0; i < 40; i++) {
                    const size = 0.008 + Math.random() * 0.015;
                    const g = i < 20 ? new THREE.SphereGeometry(size, 4, 4) : new THREE.BoxGeometry(size, size, size);
                    const m = new THREE.MeshStandardMaterial({ color: i < 20 ? 0xffffff : matSel.color, roughness: 0.3, metalness: 0.5 });
                    const p = new THREE.Mesh(g, m);
                    p.position.copy(izq.position);
                    p.userData.vel = new THREE.Vector3((Math.random() - 0.5) * 0.8, Math.random() * 0.4 + 0.1, (Math.random() - 0.5) * 0.8);
                    escena.add(p);
                    self.particulas.push(p);
                }
                self._crearFlash(izq.position, 0x88aaff, 1.0);
            }
        },
        _crearFlash(posicion, color, intensidad = 1) {
            const luz = new THREE.PointLight(color, intensidad * 5, 1);
            luz.position.copy(posicion);
            escena.add(luz);
            setTimeout(() => escena.remove(luz), 100);
        },
        deformar() {
            let s = 1;
            const anim = () => {
                s -= 0.02;
                if (s <= 0.75) return;
                this.mesh.scale.set(escala.x, s, escala.z);
                requestAnimationFrame(anim);
            };
            anim();
        },
        reset() {
            if (this._cancelarEstiramiento) {
                this._cancelarEstiramiento();
                this._cancelarEstiramiento = null;
            }
            if (this.mitades) {
                escena.remove(this.mitades.izq);
                escena.remove(this.mitades.der);
                this.mitades = null;
                escena.add(mesh);
            }
            mesh.scale.set(escala.x, escala.y, escala.z);
            mesh.position.copy(posicion);
            mesh.material.color.setHex(0x808080);
            this.particulas.forEach(p => escena.remove(p));
            this.particulas = [];
        }
    };
    return datos;
}

export function actualizarMaterialProbeta(datos, mat) {
    if (datos?.mesh) {
        datos.mesh.material.color.setHex(mat.color);
        datos.mesh.material.roughness = mat.rugosidad;
        datos.mesh.material.metalness = mat.metalness;
    }
}