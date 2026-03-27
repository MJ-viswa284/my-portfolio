import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  NgZone
} from '@angular/core';
import * as THREE from 'three';
import gsap from 'gsap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) bgCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private router: Router, private zone: NgZone) {}

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private stars!: THREE.Points;
  private clock = new THREE.Clock();
  private animationId!: number;

  private mouseX = 0;
  private mouseY = 0;
  private targetX = 0;
  private targetY = 0;

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.initScene();
      document.addEventListener('mousemove', this.onMouseMove.bind(this));
    });
  }

  ngAfterViewInit(): void {
    this.pageIntroAnimation();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }

  private pageIntroAnimation() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

    tl.from('.about-intro', { opacity: 0, y: 50 })
      .from('.about-title', { opacity: 0, y: 40, stagger: 0.2 }, '-=0.7')
      .from('.about-img', { opacity: 0, scale: 0.8, rotateY: 45 }, '-=0.5')
      .from('.about-text', { opacity: 0, y: 30 }, '-=0.4');
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 8;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.bgCanvas.nativeElement,
      antialias: true
    });
    const isLowSpec = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(isLowSpec ? 1 : Math.min(window.devicePixelRatio, 2));

    const loader = new THREE.TextureLoader();
    loader.load('assets/galaxy.jpg', (texture) => {
      this.scene.background = texture;
    });

    this.addStars();
    this.animate();
  }

  private addStars() {
  const starGeometry = new THREE.BufferGeometry();
  const isLowSpec = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
  const starCount = isLowSpec ? 800 : 3000;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1500;   // closer range
positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
positions[i * 3 + 2] = (Math.random() - 0.5) * 1500;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const loader = new THREE.TextureLoader();
  const starTexture = loader.load('assets/glow.png'); // 🌟 your image

  const starMaterial = new THREE.PointsMaterial({
    map: starTexture,       // use image as texture
    color: 0xffffff,        // white glow tint
    size: 1,                // slightly bigger for texture visibility
    transparent: true,
    opacity: 0.9, 
    blending: THREE.AdditiveBlending, // makes glow stronger
    depthWrite: false       // avoids z-fighting glow dimming
  });

  this.stars = new THREE.Points(starGeometry, starMaterial);
  this.scene.add(this.stars);
  this.scene.background = null; // disable background texture first

}





  // 🖱️ Track mouse movement
  onMouseMove(event: MouseEvent) {
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    const elapsed = this.clock.getElapsedTime();

    // Parallax movement
    this.targetX += (this.mouseX - this.targetX) * 0.03;
    this.targetY += (this.mouseY - this.targetY) * 0.03;
    this.camera.position.x = this.targetX * 2;
    this.camera.position.y = this.targetY * 1.5;
    this.camera.lookAt(this.scene.position);

     // 💫 Add gentle orbit tilt here
  this.camera.rotation.z = Math.sin(elapsed * 0.1) * 0.02;

    // Twinkle & rotation
    const starMaterial = this.stars.material as THREE.PointsMaterial;
    starMaterial.size = 1 + Math.sin(elapsed * 5) * 0.3;
    
    this.stars.rotation.y += 0.0005;

    this.renderer.render(this.scene, this.camera);
  };

  goToSkills() {
    this.router.navigate(['/skills']);
  }
}
