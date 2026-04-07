import { Component, OnInit, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import * as THREE from 'three';
import gsap from 'gsap';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-skill',
  standalone: true,
  imports: [NgFor],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillComponent implements OnInit, AfterViewInit, OnDestroy {
  frontendSkills = [
  { name: 'Angular', logo: 'assets/angular.png' },
  { name: 'TypeScript', logo: 'assets/typescript.png' },
  { name: 'Tailwind CSS', logo: 'assets/tailwindcss.png' },
  { name: 'Bootstrap', logo: 'assets/bootstrap.png' }
];


 backendSkills = [
  { name: '.NET', logo: 'assets/.net.png' },
  { name: 'MySQL', logo: 'assets/mysql.png' }
];


 tools = [
  { name: 'GitHub', logo: 'assets/github.png' },
  { name: 'Thunder Client', logo: 'assets/tc.png' }
];


  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private stars!: THREE.Points;

  private animationId!: number;

  constructor(private router: Router, private zone: NgZone) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.initThree();
      this.addStars();
      this.animateStars();

      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('resize', this.onWindowResize);

      // Handle mobile device tilt motion (with permission)
      if (typeof DeviceOrientationEvent !== 'undefined' &&
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const btn = document.createElement('button');
        btn.textContent = 'Enable Motion';
        Object.assign(btn.style, {
          position: 'fixed', bottom: '20px', left: '50%',
          transform: 'translateX(-50%)', zIndex: '10000',
          padding: '12px 18px', background: 'rgba(255,255,255,0.1)',
          color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px'
        });
        document.body.appendChild(btn);

        btn.onclick = () => {
          (DeviceOrientationEvent as any).requestPermission().then((response: string) => {
            if (response === 'granted') {
              window.addEventListener('deviceorientation', this.onDeviceOrientation);
              btn.remove();
            }
          });
        };
      } else {
        window.addEventListener('deviceorientation', this.onDeviceOrientation);
      }
    });
  }

  private initThree() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.camera.position.z = 500;

    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('starCanvas') as HTMLCanvasElement,
      alpha: true
    });
    const isLowSpec = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(isLowSpec ? 1 : Math.min(window.devicePixelRatio, 2));
  }

private addStars() {
  const starGeometry = new THREE.BufferGeometry();
  const isLowSpec = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
  const starCount = isLowSpec ? 1000 : 5000;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const color = new THREE.Color();

  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 3000;
    positions[i * 3 + 2] = Math.random() * -8000;

    // Brighter vivid tones (deep blue → pink → violet)
    color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.75 + Math.random() * 0.15);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const texture = new THREE.TextureLoader().load('assets/glow.png');
  const material = new THREE.PointsMaterial({
    map: texture,
    vertexColors: true,
    size: 5, // bigger, more visible
    transparent: true,
    opacity: 1, // full glow
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  this.stars = new THREE.Points(starGeometry, material);
  this.scene.add(this.stars);
}

private animateStars = () => {
  this.animationId = requestAnimationFrame(this.animateStars);
  const elapsed = performance.now() * 0.001;

  const positions = (this.stars.geometry as THREE.BufferGeometry).attributes['position'] as THREE.BufferAttribute;
  const colors = (this.stars.geometry as THREE.BufferGeometry).attributes['color'] as THREE.BufferAttribute;
  const material = this.stars.material as THREE.PointsMaterial;
  
  const isMobile = window.innerWidth < 768;

  // 🚀 Forward movement
  for (let i = 0; i < positions.count; i++) {
    let z = positions.getZ(i);
    z += isMobile ? 3.0 : 7.5; // smoother/slower on mobile
    if (z > 600) {
      z = -8500;
      positions.setX(i, (Math.random() - 0.5) * 4200);
      positions.setY(i, (Math.random() - 0.5) * 3200);
    }
    positions.setZ(i, z);
  }
  positions.needsUpdate = true;

  // 🌟 Skip heavy color calculations on mobile to save CPU and Battery
  if (!isMobile) {
    const tempColor = new THREE.Color();
    for (let i = 0; i < colors.count; i++) {
      const basePhase = elapsed * 4 + i * 0.2;
      const flicker = Math.sin(basePhase * (Math.random() * 5 + 1)) * 0.9 + Math.random() * 0.4;
      let burst = Math.random() < 0.015 ? Math.random() * 2.5 : 0;
      const hue = 0.55 + Math.sin(elapsed * 1.2 + i * 0.03) * 0.25;
      const lightness = Math.min(1, 0.8 + flicker * 0.5 + burst);
      
      tempColor.setHSL(hue, 1.0, lightness); // avoid instantiating new Color() per star per frame!
      colors.setXYZ(i, tempColor.r, tempColor.g, tempColor.b);
    }
    colors.needsUpdate = true;
  }

  // 🌠 Material pulse shimmer (like twinkling field)
  material.opacity = 0.85 + Math.sin(elapsed * 6) * 0.4;

  // ✨ Subtle random scale flicker
  material.size = isMobile ? 4 : 5 + Math.sin(elapsed * 10) * 2.5;

  this.stars.rotation.y += 0.0004;
  this.stars.rotation.x += 0.0001;

  this.renderer.render(this.scene, this.camera);
};











  private onMouseMove = (event: MouseEvent) => {
    if (!this.camera) return;
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;

    gsap.to(this.camera.rotation, {
      x: y * 0.3,
      y: x * 0.3,
      duration: 1.5,
      ease: 'power2.out'
    });
  };

  private onDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (!this.camera) return;
    const beta = event.beta || 0;
    const gamma = event.gamma || 0;

    gsap.to(this.camera.rotation, {
      x: THREE.MathUtils.degToRad(beta * 0.05),
      y: THREE.MathUtils.degToRad(gamma * 0.05),
      duration: 1.5,
      ease: 'power2.out'
    });
  };

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  goToSkills() {
    this.router.navigate(['/edu']);
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('deviceorientation', this.onDeviceOrientation);
    window.removeEventListener('resize', this.onWindowResize);
  }
}
