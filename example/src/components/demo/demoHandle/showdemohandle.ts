import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import Stats from 'stats-js';
import originData from './data.json';
import force3D from './force-layout';

export default class ShowDemo {
	private renderer: THREE.WebGLRenderer;
	private camera: THREE.PerspectiveCamera;
	private scene: THREE.Scene;
	private controls: OrbitControls;
	private stats: Stats;
	private DEEP: number;
	private CAMERA_DISTANCE: number;

	name: string;
	container: HTMLDivElement;
	width: number;
	height: number;
	animateID: number;

	PAERICLE_SIZE: number;
	PAERICLE_NUMBER: number;
	LINES_NUMBER: number;
	PAERICLESDATA: any[];
	PAERICLES: any[];
	POINTS: any[];
	data: any;
	particleGeometry: any;
	lineGeometry: any;

	constructor(container: HTMLDivElement) {
		this.name = 'Earth';
		this.container = container;
		this.width = this.container.clientWidth;
		this.height = this.container.clientHeight;
		this.data = <any>originData;
		this.PAERICLE_SIZE = 10;
		this.PAERICLE_NUMBER = this.data.nodes.length;
		this.LINES_NUMBER = this.data.links.length;
		this.DEEP = 10000;
		this.CAMERA_DISTANCE = 1000;
		this.PAERICLESDATA = [];
		this.PAERICLES = [];
		this.POINTS = [];
	}

	init() {
		this.renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		this.renderer.setSize(this.width, this.height);
		this.container.appendChild(this.renderer.domElement);
		this.renderer.setClearColor(0x000000, 1);
	}

	initObject() {
		const particleMaterial = new THREE.PointsMaterial({
			fog: true,
			size: this.PAERICLE_SIZE,
			blending: THREE.AdditiveBlending,
			depthTest: !0,
			alphaTest: 0.1,
			opacity: 1,
			transparent: !0
		});
		const linematerial = new THREE.LineBasicMaterial({ color: '#fff', linewidth: 3 });

		this.particleGeometry = new THREE.Geometry();
		this.lineGeometry = new THREE.Geometry();

		for (let i = 0; i < this.PAERICLE_NUMBER; i++) {
			let point = new THREE.Vector3(this.data.nodes[i].x, this.data.nodes[i].y, this.data.nodes[i].z);
			this.particleGeometry.vertices.push(point);
			this.POINTS.push(point);
		}
		for (let i = 0; i < this.LINES_NUMBER; i++) {
			this.lineGeometry.vertices.push(this.POINTS[this.data.links[i].source.index]);
			this.lineGeometry.vertices.push(this.POINTS[this.data.links[i].target.index]);
		}

		const Points = new THREE.Points(this.particleGeometry, particleMaterial);
		const Line = new THREE.LineSegments(this.lineGeometry, linematerial);

		this.scene.add(Points);
		this.scene.add(Line);
	}

	initStats() {
		this.stats = new Stats();
		this.container.appendChild(this.stats.dom);
	}

	initHelper() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
	}

	initCamera() {
		this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 1, this.DEEP);
		this.camera.position.z = this.CAMERA_DISTANCE;
		this.camera.position.x = 0;
		this.camera.position.y = 0;
		this.scene.add(this.camera);
	}

	initScene() {
		this.scene = new THREE.Scene();
	}

	animation = () => {
		this.particleGeometry.verticesNeedUpdate = true;
		this.lineGeometry.verticesNeedUpdate = true;
		this.stats.begin();
		this.renderer.render(this.scene, this.camera);
		this.changePersetion();
		this.controls.update();
		// this.particleGeometry.computeBoundingSphere();
		this.stats.end();
		this.animateID = window.requestAnimationFrame(this.animation);
	};
	changePersetion = () => {
		for (let i = 0; i < this.PAERICLE_NUMBER; i++) {
			this.POINTS[i].x = this.data.nodes[i].x;
			this.POINTS[i].y = this.data.nodes[i].y;
			this.POINTS[i].z = this.data.nodes[i].z;
		}
	};
	public show = () => {
		this.init();
		this.initStats();
		this.initScene();
		this.initCamera();
		force3D(this.data);
		this.initObject();
		this.initHelper();

		this.animation();
	};

	public end = () => {
		cancelAnimationFrame(this.animateID);
	};
}
