import { Object3D, RawShaderMaterial, InstancedBufferGeometry, BufferAttribute, Vector2, } from 'three';
import { glslify } from 'glslify';
import { random } from 'gsap/gsap-core';


export default class Particles {
    constructor(webgl) {
        this.webgl = webgl;
        this.container = new Object3D();
    }
    init(src) {
        const loader = new THREE.TextureLoader();
        loader.load(src, (texture) => {
            this.texture = texture;
            this.texture.minFilter = THREE.LinearFilter;
            this.texture.magFilter = THREE.LinearFilter;
            this.texture.format = THREE.RGBFormat;
            this.width = texture.image.width;
            this.height = texture.image.height;
            this.initPoints(true);
            this.initHitArea();
            this.initTouch();
            this.resize();
            this.show();
        });

     }
        initPoints(discard) {
            numPoints = this.width * this.height;
            let numVisible = this.numPoints;
            let threshold = 0;
            let originalColors;

            if (discard) {
                numVisible = 0;
                threshold = 34;
                const img = this.texture.image;
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = this.width;
                canvas.height = this.height;
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                originalColors = Float32Array.from(imgData.data);

                for (let i = 0; i < this.numPoints; i++) {
                    if (originalColors[i * 4 + 0] > threshold) numVisible++;
                }
            }
        
            //write code according to latest three.js version and gsap version
            //https://threejs.org/docs/#api/en/core/InstancedBufferGeometry
            //https://greensock.com/docs/v3/GSAP/gsap-core
            //https://greensock.com/docs/v3/GSAP/gsap-core/random
          	const uniforms = {
              uTime: { value: 0 },
              uRandom: { value: 1.0 },
              uDepth: { value: 2.0 },
              uSize: { value: 0.0 },
              uTextureSize: {
                value: new THREE.Vector2(this.width, this.height),
              },
              uTexture: { value: this.texture },
              uTouch: { value: null },
            };

            const material = new RawShaderMaterial({
              uniforms,
              vertexShader: glslify("../../../shaders/particles.vert"),
              fragmentShader: glslify("../../../shaders/particles.frag"),
              transparent: true,
              depthTest: false,
            });
            const geometry = new THREE.InstancedBufferGeometry();

            const positions = new THREE.BufferAttribute(
                new Float32Array(4 * 3), 3);
            positions.setXYZ(0, -1, -1, 0);
            positions.setXYZ(1, 1, -1, 0);
            positions.setXYZ(2, 1, 1, 0);
            positions.setXYZ(3, -1, 1, 0);
            geometry.setAttribute("position", positions);

            const uvs = new THREE.BufferAttribute(
                new Float32Array(4 * 2), 2);
            uvs.setXY(0, 0, 0);
            uvs.setXY(1, 1, 0);
            uvs.setXY(2, 1, 1);
            uvs.setXY(3, 0, 1);
            geometry.setAttribute("uv", uvs);

            geometry.setIndex(
              new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1)
            );

            const indices = new Uint16Array(numVisible);
            const offsets = new Float32Array(numVisible * 3);
            const angles = new Float32Array(numVisible);

            for (let i = 0, j = 0; i < this.numPoints; i++) {
              if (discard && originalColors[i * 4 + 0] <= threshold) continue;

              offsets[j * 3 + 0] = i % this.width;
              offsets[j * 3 + 1] = Math.floor(i / this.width);

              indices[j] = i;

              angles[j] = Math.random() * Math.PI;

              j++;
            }


        }


}

