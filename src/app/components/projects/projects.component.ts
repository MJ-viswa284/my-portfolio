import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import { NgFor } from '@angular/common';
import { Router } from 'express';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [NgFor,RouterLink],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements AfterViewInit {
  @ViewChild('bgCanvas', { static: true }) bgCanvas!: ElementRef<HTMLCanvasElement>;

  projects = [
    {
      title: 'Student Document Management System',
      description: 'HTML, CSS, PHP, MySQL',
      image: 'assets/project1.png',
      route: '/project1'
    },
    {
      title: 'Kavi Travels',
      description: 'Angular, TypeScript, .NET, MySQL Workbench',
      image: 'assets/project2.png',
      route: '/project2'
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

        const size = (1 - star.z / canvas.width) * star.size;
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

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Re-center stars after resize
    for (let star of stars) {
      star.x = Math.random() * canvas.width - canvas.width / 2;
      star.y = Math.random() * canvas.height - canvas.height / 2;
    }
  });
}
}