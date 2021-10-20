import './style.css'
import * as THREE from 'three';
import gsap from "gsap";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.01, 100);
camera.position.set(0, 0, 4);
camera.lookAt(new THREE.Vector3())

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Mouse Movement
const mouse = {
	x: undefined,
	y: undefined,
};
// addEventListener("mousemove", () => {
// 	mouse.y = (event.clientX / window.innerWidth) * 2 - 1;
// 	mouse.x = (event.clientY / window.innerHeight) * 2 - 1;
// });

// Gyroscope
const orientation = {
	x: null
}
if (window.DeviceOrientationEvent) {
	if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
		document.getElementById("helper").remove();
	}
	window.addEventListener('deviceorientation', (params) => {
		orientation.x = params.beta/45 - 1;
	}, false);
}
else {
	document.getElementById("helper").remove();
}

// Game Loop
function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	mesh.rotation.y -= 0.05;
	// gsap.to(mesh.rotation, {
	// 	y: 0.3
	// });
	if(mouse.y) {
		gsap.to(mesh.rotation, {
			x: mouse.x,
			y: mesh.rotation.y + mouse.y + 0.3,
			z: mouse.x*0.1 + mouse.y*0.1,
			duration: 2,
		});
	}
	if(orientation.x) {
		gsap.to(mesh.rotation, {
			x: orientation.x,
			duration: 2,
		});
	}
	
}
// animate();

// Lights
// const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
const ambient = new THREE.AmbientLight(0xcccccc, 1.3);
scene.add(ambient);
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(2, 0.5, 1);
light.castShadow = true;
light.shadow.mapSize.height = 2048;
light.shadow.mapSize.width = 2048;
light.shadow.camera.right = 2;
light.shadow.camera.left = -2;
light.shadow.camera.top = 2;
light.shadow.camera.bottom = -2;
light.shadow.bias = 0.0000001;
scene.add(light);

// Light Helpers
// const ambientHelper = new THREE.HemisphereLightHelper(ambient);
// const lightHelper = new THREE.DirectionalLightHelper(light);
// scene.add(ambientHelper, lightHelper);
// scene.add(lightHelper);

// Orbit Controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(0, 0, 0);
// controls.update();

// Resize
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
});

// Meshes
const geometry = new THREE.ParametricGeometry(helicoid, 250, 250);
const material = specialMaterial();
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
mesh.castShadow = mesh.receiveShadow = true;

function specialMaterial() {
	const material = new THREE.MeshPhysicalMaterial({
		color: 0xffffff,
		roughness: 0,
		metalness: 0.5,
		clearcoat: 0.8,
		clearcoatRoughness: 0.4,
		//wireframe: true,
		side: THREE.DoubleSide
	});
	material.onBeforeCompile = (shader) => {
		shader.uniforms.playhead = { value: 0 };
		shader.fragmentShader = `uniform float playhead;\n` + shader.fragmentShader;
		shader.fragmentShader = shader.fragmentShader.replace(
			"#include <logdepthbuf_fragment>",
			`
			vec3 a = vec3(0.5, 0.5, 0.5);
			vec3 b = vec3(0.5, 0.5, 0.5);
			vec3 c = vec3(1.0, 1.0, 1.0);
			vec3 d = vec3(0.30, 0.20, 0.20);
			float diff = dot(vec3(1.), vNormal);
			vec3 cc = a + b * cos(2.*3.141592*(c*diff+d+playhead*0.));
			diffuseColor.rgb = vec3(diff,0.,0.);
			diffuseColor.rgb = cc;
			` + "#include <logdepthbuf_fragment>"
		);
		material.userData.shader = shader;
	}
	return material;
}

function helicoid(u, v, target) {
	// const alpha = Math.PI * 2 * (u - 0.5);
	// const theta = Math.PI * 2 * (v - 0.5);
	// const torsion = 5;
	// const denominator = 1 + Math.cosh(alpha) * Math.cosh(theta);
	// const x = Math.sinh(alpha) * Math.cos(torsion * theta) / denominator;
	// const z = Math.sinh(alpha) * Math.sin(torsion * theta) / denominator;
	// const y = 1.5 * Math.cosh(alpha) * Math.sinh(theta) / denominator;
	u = Math.PI * 2 * (u-0.5);
	v = Math.PI * 2 * (v-0.5);
	const torsion = 5;
	const denominator = 1 + Math.cosh(u) * Math.cosh(v);
	const x = Math.sinh(v) * Math.cos(torsion * u) / denominator;
	const z = Math.sinh(v) * Math.sin(torsion * u) / denominator;
	const y = Math.cosh(v) * Math.sinh(u) / denominator;
	target.set(x, y, z);
}

animate();