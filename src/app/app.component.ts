import { Component, NgZone } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { SoundServiceService } from './sound.service.service';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ChatbotComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private audio!: HTMLAudioElement;
  isMusicPlaying = false;

  // Custom Cursor References
  private cursorOutline!: HTMLElement | null;
  
  private mouseX = 0;
  private mouseY = 0;
  private outlineX = 0;
  private outlineY = 0;
  private isMobile = false;

  constructor(
    private zone: NgZone,
    private sfx: SoundServiceService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.audio = new Audio('assets/Fainted.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.4;

    this.isMobile = window.innerWidth < 768;
  }

  ngAfterViewInit(): void {
    if (!this.isMobile) {
      this.cursorOutline = document.querySelector('.custom-cursor-outline') as HTMLElement;
      
      this.zone.runOutsideAngular(() => {
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Handle hovering over clickable elements to expand the cursor
        document.body.addEventListener('mouseover', (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          if (target.closest('button, a, .cursor-pointer')) {
            if (this.cursorOutline) this.cursorOutline.style.transform += ' scale(1.5)';
            if (this.cursorOutline) this.cursorOutline.style.backgroundColor = 'rgba(0, 255, 255, 0.1)';
          }
        });
        
        document.body.addEventListener('mouseout', (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          if (target.closest('button, a, .cursor-pointer')) {
            if (this.cursorOutline) this.cursorOutline.style.transform = `translate(${this.outlineX}px, ${this.outlineY}px) translate(-50%, -50%) scale(1)`;
            if (this.cursorOutline) this.cursorOutline.style.backgroundColor = 'transparent';
          }
        });

        this.animateCursor();
      });
    }
  }

  private onMouseMove(e: MouseEvent) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  private animateCursor = () => {
    // Smooth trailing calculation for the outline
    this.outlineX += (this.mouseX - this.outlineX) * 0.15;
    this.outlineY += (this.mouseY - this.outlineY) * 0.15;

    if (this.cursorOutline) {
      this.cursorOutline.style.transform = `translate(${this.outlineX}px, ${this.outlineY}px) translate(-50%, -50%)`;
    }

    requestAnimationFrame(this.animateCursor);
  };
  // ─── Back Button ──────────────────────────────────────────────────────────
  goBack(): void {
    this.location.back();
  }

  // ─── Music ────────────────────────────────────────────────────────────────
  toggleMusic(): void {
    if (!this.audio) return;

    if (this.isMusicPlaying) {
      this.fadeVolume(0, 350);
      setTimeout(() => {
        this.audio.pause();
        this.zone.run(() => (this.isMusicPlaying = false));
        this.sfx.setMuted(true);
      }, 350);
    } else {
      this.audio
        .play()
        .then(() => {
          this.fadeVolume(0.4, 350);
          this.zone.run(() => (this.isMusicPlaying = true));
          this.sfx.setMuted(false);
        })
        .catch((err) => console.warn('Playback failed:', err));
    }
  }

  private fadeVolume(target: number, duration: number): void {
    const start = this.audio.volume;
    const steps = 15;
    const stepTime = Math.max(10, duration / steps);
    let step = 0;
    const fade = setInterval(() => {
      step++;
      this.audio.volume = start + (target - start) * (step / steps);
      if (step >= steps) {
        clearInterval(fade);
        this.audio.volume = target;
      }
    }, stepTime);
  }
}
