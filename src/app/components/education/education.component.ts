import { Component, NgZone } from '@angular/core';
import { NgFor , NgIf } from '@angular/common';
import * as THREE from 'three';
import { Router } from '@angular/router';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent {

  constructor(private router: Router, private zone: NgZone) {}

  education = [
    {
      degree: '10th Grade',
      institution: 'Chandler Matric Hr.sec School',
      year: '2019 - 2020',
      summary: 'Achieved an average of 88%, with distinction in Mathematics and Science.',
      logo: 'assets/school.png'
    },
    {
      degree: '11th Grade',
      institution: 'Chandler Matric Hr.sec School',
      year: '2020 - 2021',
      summary: 'Specialized in Physics, Chemistry, Mathematics and Computer Science. Avg: 82%.',
      logo: 'assets/college.png'
    },
    {
      degree: '12th Grade',
      institution: 'Chandler Matric Hr.sec School',
      year: '2021 - 2022',
      summary: 'Graduated with 85% overall, topping in Computer Science.',
      logo: 'assets/college.png'
    },
    {
      degree: 'B.Sc. in Computer Science',
      institution: 'Mannar thirumalai naicker college',
      year: '2022 - 2025',
      summary: 'Focused on C,C++,RDBMS(relational database management system),DSA(data structure and algorithm),JAVA,C#',
      logo: 'assets/university.png'
    }
  ];

  interns = [
    {
      title: 'Full Stack Developer Intern',
      company: 'Pencil walk Pvt Ltd',
      year: '2022',
      description: 'Built responsive web apps using ReactJS, Node.js, and MongoDB.',
      logo: 'assets/intern1.png'
    },
    {
      title: 'Full Stack Developer Intern',
      company: 'E2O Technologies',
      year: '2025-present',
      description: 'Built responsive web apps using AngularJS, .NET, and MySql.',
      logo: 'assets/intern1.png'
    }
  ];

  certs = [
    { title: 'Fullstack Web Development', issuer: 'Kalvi Institute', year: '2025', logo: 'assets/shivam.png',image: 'assets/shivam.png'  },
  ];

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private stars!: THREE.Points;
  private animationId: number | null = null;
  private starSpeed = 0.0005;
  private clock = new THREE.Clock();

      selectedCert: any = null; //=> model pop

  // parallax tracking
  private mouseX = 0;
  private mouseY = 0;
  private targetX = 0;
  private targetY = 0;
  private parallaxFactor = 0.05;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.initThree();
      this.addStars();
      this.animateStars();
      window.addEventListener('resize', this.onWindowResize);
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('touchmove', this.onTouchMove);
    });
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchmove', this.onTouchMove);
    this.renderer.dispose();
  }



openCert(cert: any) {
  this.selectedCert = cert;
}

closeCert() {
  this.selectedCert = null;
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
      alpha: true,
      antialias: true,
    });
    const isLowSpec = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(isLowSpec ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
  }

 private addStars() {
  const starGeometry = new THREE.BufferGeometry();

  // 🌌 Super dense & rich galaxy
  const isLowSpec = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
  const starCount = isLowSpec ? 2000 : 20000;
  const positions = new Float32Array(starCount * 3);
  const opacities = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    // Slightly tighter cluster for realism
    positions[i * 3] = (Math.random() - 0.5) * 1500;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1500;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1500;
    opacities[i] = Math.random();
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('alpha', new THREE.BufferAttribute(opacities, 1));

  // 🌟 Load a glowing light texture
  const starTexture = new THREE.TextureLoader().load('assets/star-glow.png');
  starTexture.colorSpace = THREE.SRGBColorSpace;

  const starMaterial = new THREE.PointsMaterial({
    map: starTexture,
    color: 0xffffff,
    size: 2.6,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending, // 🔥 true glow effect
    depthWrite: false,
  });

  this.stars = new THREE.Points(starGeometry, starMaterial);
  this.scene.add(this.stars);
}

private animateStars = () => {
  this.animationId = requestAnimationFrame(this.animateStars);
  const time = this.clock.getElapsedTime();

  const alphas = this.stars.geometry.attributes['alpha'] as THREE.BufferAttribute;
  const starMat = this.stars.material as THREE.PointsMaterial;

  // 🌠 Twinkle & glow shimmer
  const baseOpacity = 0.85;
  const flickerSpeed = 2.5;

  for (let i = 0; i < alphas.count; i++) {
    const flicker = Math.sin(time * flickerSpeed + i * 0.7) * 0.3 + 0.7;
    alphas.setX(i, flicker);
  }
  alphas.needsUpdate = true;

  // Soft pulsing brightness (like cosmic energy)
  starMat.opacity = baseOpacity + Math.sin(time * 1.5) * 0.1;

  // 💫 Slight dynamic size shimmer
  starMat.size = 2.3 + Math.sin(time * 2) * 0.4;

  // 🌌 Parallax motion
  this.targetX += (this.mouseX - this.targetX) * 0.05;
  this.targetY += (this.mouseY - this.targetY) * 0.05;
  this.scene.rotation.y = this.targetX * this.parallaxFactor;
  this.scene.rotation.x = this.targetY * this.parallaxFactor;

  // ✨ Slow drift
  this.stars.rotation.y += this.starSpeed;

  this.renderer.render(this.scene, this.camera);
};



  // 🎯 Parallax handlers
  private onMouseMove = (event: MouseEvent) => {
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  private onTouchMove = (event: TouchEvent) => {
    if (event.touches.length > 0) {
      this.mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
      this.mouseY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  };

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  goToProjects() {
    this.router.navigate(['/pro']);
  }

  // 🌌 Portal / realm animation (unchanged)
  enterRealm(index: number) {
    const card = document.querySelectorAll('.intern-card')[index] as HTMLElement;
    const canvas = document.getElementById('starCanvas') as HTMLCanvasElement;
    if (!card || !canvas) return;

    card.classList.add('zoom-realm');
    canvas.style.filter = 'brightness(0.5) blur(2px)';

    if (this.stars.material instanceof THREE.PointsMaterial) {
      this.stars.material.opacity = 1;
    }

    const originalSpeed = this.starSpeed;
    this.starSpeed = 0.05;

    const positions = (this.stars.geometry.attributes['position'] as THREE.BufferAttribute).array as Float32Array;
    const explosionAmount = 300;

    const animatePortal = () => {
      return new Promise<void>(resolve => {
        let elapsed = 0;
        const portalAnimation = () => {
          elapsed += 16;
          this.stars.rotation.y += 0.07;
          for (let i = 0; i < positions.length; i += 3) {
            const factor = Math.sin((elapsed / 1000) * Math.PI) * explosionAmount;
            positions[i] += (positions[i] / 1000) * factor;
            positions[i + 1] += (positions[i + 1] / 1000) * factor;
          }
          (this.stars.geometry.attributes['position'] as THREE.BufferAttribute).needsUpdate = true;
          this.renderer.render(this.scene, this.camera);
          if (elapsed < 1000) requestAnimationFrame(portalAnimation);
          else resolve();
        };
        portalAnimation();
      });
    };

    animatePortal().then(() => {
      card.classList.remove('zoom-realm');
      canvas.style.filter = 'brightness(1) blur(0)';
      this.starSpeed = originalSpeed;
      if (index === 0) this.router.navigate(['/pencil']);
      else if (index === 1) this.router.navigate(['/e2o']);
    });
  }
}
