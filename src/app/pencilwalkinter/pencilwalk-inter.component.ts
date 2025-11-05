import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-pencilwalk-inter',
  standalone: true,
  imports: [NgFor],
  templateUrl: './pencilwalk-inter.component.html',
  styleUrls: ['./pencilwalk-inter.component.css']
})
export class PencilwalkInterComponent {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private stars!: THREE.Points;
  private animationId: number | null = null;
  private starSpeed = 0.001;

  pencilwalkTasks = [
    { task: 'Built responsive web apps with ReactJS', year: '2022', tools: 'ReactJS, Node.js, MongoDB' },
    { task: 'Created REST APIs and integrated with frontend', year: '2022', tools: 'Node.js, Express, MongoDB' },
    { task: 'Implemented authentication & authorization', year: '2022', tools: 'JWT, bcrypt' },
    { task: 'Optimized web app performance and SEO', year: '2022', tools: 'React Profiler, Lighthouse' },
  ];

  ngAfterViewInit(): void {
    this.initThree();
    this.addStars();
    this.animateStars();
    window.addEventListener('resize', this.onWindowResize);
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
  }

  private initThree() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    this.camera.position.z = 500;

    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('pencilCanvas') as HTMLCanvasElement,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
  }

  private addStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 4000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4000;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 1.5,
      transparent: true,
      opacity: 0.8
    });

    this.stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.stars);
  }

  private animateStars = () => {
    this.animationId = requestAnimationFrame(this.animateStars);
    this.stars.rotation.y += this.starSpeed;
    this.stars.rotation.x += this.starSpeed / 2;
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
}
