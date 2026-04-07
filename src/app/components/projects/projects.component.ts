import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  NgZone,
  OnDestroy
} from '@angular/core';
import { NgFor, NgIf} from '@angular/common';
import { Router } from 'express';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [NgFor,RouterLink,NgIf],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) bgCanvas!: ElementRef<HTMLCanvasElement>;

  private animationId: number | null = null;
  private resizeCanvasFn: (() => void) | null = null;

  constructor(private zone: NgZone) {}

  webProjects = [
  {
    title: 'Kavi Travels',
    description: 'Angular, TypeScript, .NET, MySQL',
    image: 'assets/project-kavi.png',
    route: '/kavi',
    role: '',
    highlights: []
  },
  {
    title: 'CRM System (Company Project)',
    description: 'Angular, .NET, MySQL',
    image: 'assets/project-crm.png',
    route: '/crm',
    role: '',
    highlights: []
  },
  {
    title: 'On-Call Acting Driver (Live)',
    description: 'Angular, .NET, MySQL',
    image: 'assets/project-driver.png',
    route: '/driver',
    isLive: true,
    role: 'Full Stack Developer | Angular • .NET Web API • MAUI • MySQL',
    highlights: [
      'Developed a driver booking system with web and mobile applications used in production',
      'Built booking workflow including trip creation, driver mapping, and fare calculation',
      'Developed REST APIs for trip lifecycle, driver updates, and admin dashboards',
      'Worked on both frontend (Angular) and backend (.NET Web API) modules',
      'Developed MAUI mobile screens for booking, trip tracking, and user actions',
      'Integrated APIs for real-time data flow and seamless user experience',
      'Optimized performance, fixed bugs, and improved UI consistency across modules'
    ]
  },
  {
    title: 'E-Commerce Web App',
    description: 'Angular, .NET',
    image: 'assets/project-ecommerce.png',
    route: '/ecommerce',
    role: 'Full Stack Developer | Angular • .NET 8 • MySQL • MAUI',
    highlights: [
      'Built complete coupon and deals module with dynamic generation and discount logic',
      'Implemented full order lifecycle including placement, cancellation, and return management',
      'Integrated courier partner (Delhivery) APIs for shipment creation, tracking, and delivery updates',
      'Developed AWB tracking system for real-time shipment monitoring',
      'Worked on both frontend and backend development',
      'Designed product pages inspired by Amazon-style UI/UX'
    ]
  },
  {
    title: 'Dynamic CRM (Ongoing)',
    description: 'Angular, .NET, Azure',
    image: 'assets/project-dynamic-crm.png',
    route: '/dynamic-crm',
    role: 'Backend Developer | .NET Web API • MySQL',
    highlights: [
      'Developed Expense module with dynamic fields',
      'Built Task management system with flexible field structure Implemented dynamic reporting system (date-wise, monthly, yearly)',
      'Created bulk import features with item-level calculations',
      'Developed batch history tracking with stock reduction logic',
      'Built reusable APIs across multiple modules (quotation, invoice, product, etc.)',
      'Designed dynamic analytics system using configurable fields'
    ]
  }
];

mobileProjects = [
  {
    title: 'On-Call Acting Driver – User App',
    description: '.NET MAUI',
    image: 'assets/mobile-driver.png',
    route: '/mobile-driver',
    role: 'Full Stack Developer | Angular • .NET Web API • MAUI • MySQL',
    highlights: [
      'Developed a driver booking system with web and mobile applications used in production',
      'Developed MAUI mobile screens for booking, trip tracking, and user actions',
      'Integrated APIs for real-time data flow and seamless user experience'
    ]
  },
  {
    title: 'E-Commerce Mobile App',
    description: '.NET MAUI',
    image: 'assets/mobile-ecommerce.png',
    route: '/mobile-ecommerce',
    role: 'Full Stack Developer | Angular • .NET 8 • MySQL • MAUI',
    highlights: [
      'Developed mobile features including product listing and user interaction screens',
      'Designed product pages inspired by Amazon-style UI/UX'
    ]
  },
  {
    title: 'Influencer App',
    description: '.NET MAUI',
    image: 'assets/mobile-influencer.png',
    route: '/mobile-influencer',
    role: 'Mobile Developer | .NET MAUI',
    highlights: [
      'Developed mobile features for an influencer discovery platform',
      'Built filtering and discovery screens for selecting artists',
      'Implemented artist selection and rejection logic',
      'Designed responsive UI for smooth navigation',
      'Integrated backend APIs for dynamic data updates'
    ]
  }
];

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.startStarfield();
    });
  }

  startStarfield() {
    const canvas = this.bgCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: any[] = [];
    const shootingStars: any[] = [];
    const isLowSpec = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
    const numStars = isLowSpec ? 50 : 200;

    function randomColor() {
      const colors = ['#ffffff', '#ffe9c4', '#d4fbff'];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    // Create stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * canvas.width,
        size: Math.random() * 2,
        color: randomColor()
      });
    }

    function drawStars() {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

       for (let star of stars) 
        {
      star.z -= 2;
      if (star.z <= 0)
         {
        star.x = Math.random() * canvas.width - canvas.width / 2;
        star.y = Math.random() * canvas.height - canvas.height / 2;
        star.z = canvas.width;
      }

        const k = 128.0 / star.z;
        const sx = star.x * k + canvas.width / 2;
        const sy = star.y * k + canvas.height / 2;

        if (sx < 0 || sx >= canvas.width || sy < 0 || sy >= canvas.height) continue;

        const size = Math.max(0.3, (1 - star.z / canvas.width) * star.size);
        ctx.beginPath();
        ctx.fillStyle = star.color;
        if (!isLowSpec) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = star.color;
        }
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawShootingStars() {
      if (Math.random() < 0.005) {
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height / 2,
          length: Math.random() * 80 + 50,
          speed: Math.random() * 10 + 6,
          size: Math.random() + 0.5
        });
      }

      for (let i = 0; i < shootingStars.length; i++) {
        const s = shootingStars[i];
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.length, s.y + s.length / 3);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = s.size;
        if (!isLowSpec) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#fff';
        }
        ctx.stroke();

        s.x += s.speed;
        s.y += s.speed / 3;

        if (s.x > canvas.width || s.y > canvas.height) {
          shootingStars.splice(i, 1);
          i--;
        }
      }
    }

    const animate = () => {
      drawStars();
      drawShootingStars();
      this.animationId = requestAnimationFrame(animate);
    }

   animate();
   

  this.resizeCanvasFn = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  this.resizeCanvasFn(); // initial call

  window.addEventListener('resize', this.resizeCanvasFn);
  window.addEventListener('orientationchange', this.resizeCanvasFn);
  }

  ngOnDestroy() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.resizeCanvasFn) {
      window.removeEventListener('resize', this.resizeCanvasFn);
      window.removeEventListener('orientationchange', this.resizeCanvasFn);
    }
  }

  selectedProject: any = null;

  openProject(project: any) {
    this.selectedProject = project;
  }

  closeProject() {
    this.selectedProject = null;
  }
}
