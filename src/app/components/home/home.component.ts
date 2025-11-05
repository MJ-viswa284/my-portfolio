import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import * as THREE from 'three';
import { Router } from '@angular/router';
import { SoundServiceService } from '../../sound.service.service';

@Component({
  selector: 'app-hero',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('typingElement', { static: true }) typingElementRef!: ElementRef;

  constructor(private router: Router, private sfx: SoundServiceService) {}

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private stars!: THREE.Points;
  private shootingStars: THREE.Mesh[] = [];

  private shootingStarMaterial!: THREE.MeshBasicMaterial;
  private shootingStarGeometry!: THREE.PlaneGeometry;
  private shootingStarIntervalId: any;
  private animationFrameId: number = 0;

  private texts: string[] = [
    "I'm a Full Stack Developer.",
    'Video Editor',
    'Web Designer',
    'Photographer',
    'Freelancer',
    'Welcome to my portfolio!',
  ];
  private currentText = 0;
  private charIndex = 0;

  // 🎧 Background music
  private audio!: HTMLAudioElement;

  // 🖱️ Parallax variables
  private mouseX = 0;
  private mouseY = 0;
  private targetX = 0;
  private targetY = 0;
  private motionX = 0;
  private motionY = 0;

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.animate();
    this.typeWriter();

    this.audio = new Audio('assets/Fainted.mp3');
    this.audio.volume = 0.5;
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    clearInterval(this.shootingStarIntervalId);
    if (this.audio) this.audio.pause();
  }

  @HostListener('window:resize', [])
  onWindowResize(): void {
    if (!this.renderer || !this.camera) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // @HostListener('document:click')
  // onFirstClick(): void {
  //   this.sfx.initializeAudio();
  // }

  /** ✨ Typewriter Animation */
  typeWriter(): void {
    const element = this.typingElementRef.nativeElement;
    const current = this.texts[this.currentText];

    if (this.charIndex < current.length) {
      element.textContent += current.charAt(this.charIndex);
      this.charIndex++;

       // 🎵 Typing sound disabled for now             |
      // if (Math.random() < 0.25) {                    |
      //   this.sfx.play('type', {                      |   <= typing sound effect commented for now       
      //     volume: 0.1 + Math.random() * 0.05,        | 
      //     playbackRate: 0.9 + Math.random() * 0.15,  |
      //   });
      // }

      const delay = 60 + Math.random() * 40;
      setTimeout(() => this.typeWriter(), delay);
    } else {
      this.sfx.stop('type');
      element.classList.add('text-pulse');
      setTimeout(() => {
        element.classList.remove('text-pulse');
        this.eraseText();
      }, 2000);
    }
  }

  eraseText(): void {
    const element = this.typingElementRef.nativeElement;
    if (this.charIndex > 0) {
      element.textContent = element.textContent.slice(0, -1);
      this.charIndex--;
      setTimeout(() => this.eraseText(), 30);
    } else {
      this.currentText = (this.currentText + 1) % this.texts.length;
      setTimeout(() => this.typeWriter(), 200);
    }
  }

  /** 🌌 Initialize Scene */
  initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    this.camera.position.z = 1.5;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 1);

    // ✨ Stars
    const starTexture = new THREE.TextureLoader().load('assets/glow.png');
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 10000;
    const positions: number[] = [];

    for (let i = 0; i < starCount; i++) {
      const radius = Math.random() * 2500 + 500;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      positions.push(x, y, z);
    }

    starsGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
      size: 2,
      map: starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      color: 0xffffff,
    });

    this.stars = new THREE.Points(starsGeometry, starMaterial);
    this.scene.add(this.stars);

    // 🌠 Shooting Stars
    this.shootingStarGeometry = new THREE.PlaneGeometry(5, 1.2);
    this.shootingStarMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    this.shootingStarIntervalId = setInterval(() => this.createShootingStar(), 500);
  }

  createShootingStar(): void {
    const star = new THREE.Mesh(this.shootingStarGeometry, this.shootingStarMaterial.clone());
    star.position.set(
      (Math.random() - 0.5) * 800,
      (Math.random() - 0.5) * 800,
      -Math.random() * 1000
    );
    const speed = new THREE.Vector3(Math.random() * 3 + 1, -Math.random() * 2 - 0.5, 0);
    (star.userData as any).velocity = speed;
    (star.userData as any).life = 0;
    this.scene.add(star);
    this.shootingStars.push(star);
  }

  // 🖱️ Mouse parallax (visual only)
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  // 📱 Mobile tilt
  @HostListener('window:deviceorientation', ['$event'])
  onDeviceOrientation(event: DeviceOrientationEvent): void {
    if (event.gamma && event.beta) {
      this.motionX = event.gamma / 45;
      this.motionY = event.beta / 45;
    }
  }

  /** 🎬 Animation */
  animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const combinedX = (this.mouseX + this.motionX) / 2;
    const combinedY = (this.mouseY + this.motionY) / 2;

    this.targetX += (combinedX - this.targetX) * 0.03;
    this.targetY += (combinedY - this.targetY) * 0.03;

    const baseX = Math.sin(Date.now() * 0.0001) * 0.5;
    const baseY = Math.cos(Date.now() * 0.0001) * 0.3;

    this.camera.position.x = baseX - this.targetX * 1.2;
    this.camera.position.y = baseY - this.targetY * 1.0;
    this.camera.lookAt(this.scene.position);

    this.stars.rotation.x += 0.0003 + this.targetY * 0.00005;
    this.stars.rotation.y += 0.00025 + this.targetX * 0.00005;

    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i];
      const velocity = (star.userData as any).velocity;
      star.position.add(velocity);
      (star.userData as any).life += 1;
      const mat = star.material as THREE.Material & { opacity: number };
      if (mat.opacity > 0) mat.opacity -= 0.015;
      if ((star.userData as any).life > 80 || mat.opacity <= 0) {
        this.scene.remove(star);
        this.shootingStars.splice(i, 1);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  goToAbout(): void {
    // this.sfx.play('click');
    this.router.navigate(['/about']);
  }
}
