import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild
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
export class ProjectsComponent implements AfterViewInit {
  @ViewChild('bgCanvas', { static: true }) bgCanvas!: ElementRef<HTMLCanvasElement>;

 webProjects = [
  {
    title: 'Kavi Travels',
    description: 'Angular, TypeScript, .NET, MySQL',
    image: 'assets/project-kavi.png',
    route: '/kavi'
  },
  {
    title: 'CRM System (Company Project)',
    description: 'Angular, .NET, MySQL',
    image: 'assets/project-crm.png',
    route: '/crm'
  },
  {
    title: 'On-Call Acting Driver (Live)',
    description: 'Angular, .NET, MySQL',
    image: 'assets/project-driver.png',
    route: '/driver',
    isLive: true
  },
  {
    title: 'E-Commerce Web App',
    description: 'Angular, .NET',
    image: 'assets/project-ecommerce.png',
    route: '/ecommerce'
  },
  {
    title: 'Dynamic CRM (Ongoing)',
    description: 'Angular, .NET, Azure',
    image: 'assets/project-dynamic-crm.png',
    route: '/dynamic-crm'
  }
];

mobileProjects = [
  {
    title: 'On-Call Acting Driver – User App',
    description: '.NET MAUI',
    image: 'assets/mobile-driver.png',
    route: '/mobile-driver'
  },
  {
    title: 'E-Commerce Mobile App',
    description: '.NET MAUI',
    image: 'assets/mobile-ecommerce.png',
    route: '/mobile-ecommerce'
  },
  {
    title: 'Influencer App',
    description: '.NET MAUI',
    image: 'assets/mobile-influencer.png',
    route: '/mobile-influencer'
  }
];

  ngAfterViewInit() {
    this.startStarfield();
  }

  startStarfield() {
    const canvas = this.bgCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: any[] = [];
    const shootingStars: any[] = [];
    const numStars = 200;

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
        ctx.shadowBlur = 8;
        ctx.shadowColor = star.color;
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
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fff';
        ctx.stroke();

        s.x += s.speed;
        s.y += s.speed / 3;

        if (s.x > canvas.width || s.y > canvas.height) {
          shootingStars.splice(i, 1);
          i--;
        }
      }
    }

    function animate() {
      drawStars();
      drawShootingStars();
      requestAnimationFrame(animate);
    }

   animate();
   

 const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

resizeCanvas(); // initial call

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);
} // This closing brace was missing, causing the syntax error.

  selectedProject: any = null;

  openProject(project: any) {
    this.selectedProject = project;
  }

  closeProject() {
    this.selectedProject = null;
  }
}
