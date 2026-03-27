import { NgClass, NgFor,NgIf } from '@angular/common';
import { Component, NgZone } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-pencilwalk-inter',
  standalone: true,
  imports: [NgClass],
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

  constructor(private zone: NgZone) {}

pencilwalkTasks = [
  {
    task: 'Built responsive web apps with ReactJS',
    year: '2022',
    tools: 'ReactJS, Node.js, MongoDB',
    image: 'assets/shivam.png'
  },
  {
    task: 'Created REST APIs and integrated with frontend',
    year: '2022',
    tools: 'Node.js, Express, MongoDB',
    image: 'assets/pencil/rest-api.png'
  },
  {
    task: 'Implemented authentication & authorization',
    year: '2022',
    tools: 'JWT, bcrypt',
    image: 'assets/pencil/auth.png'
  },
  {
    task: 'Optimized web app performance and SEO',
    year: '2022',
    tools: 'React Profiler, Lighthouse',
    image: 'assets/pencil/performance.png'
  }
];


  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.initThree();
      this.addStars();
      this.animateStars();
      window.addEventListener('resize', this.onWindowResize);
    });
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
    const isLowSpec = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(isLowSpec ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
  }

  private addStars() {
    const starGeometry = new THREE.BufferGeometry();
    const isLowSpec = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
    const starCount = isLowSpec ? 1000 : 4000;
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

  previewOpen = false;

  openPreview() {
    this.previewOpen = true;
  }

  closePreview() {
    this.previewOpen = false;
  }


images = [
  'assets/shivam.png',
  'assets/pencil/pencil-preview.png',
  'assets/shivam.png'
];

currentIndex = 0;
direction: 'left' | 'right' = 'right';

nextImage() {
  this.direction = 'right';
  this.currentIndex =
    (this.currentIndex + 1) % this.images.length;
}

prevImage() {
  this.direction = 'left';
  this.currentIndex =
    (this.currentIndex - 1 + this.images.length) % this.images.length;
}


}
