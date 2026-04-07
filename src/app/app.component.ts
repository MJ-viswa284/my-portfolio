import { Component, NgZone, HostListener } from '@angular/core';
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
  
  // Cursor Physics State
  private targetHoverScale = 1;
  private currentHoverScale = 1;
  private currentAngle = 0;

  constructor(
    private zone: NgZone,
    private sfx: SoundServiceService,
    private location: Location,
    private router: Router
  ) {
    // Ensure cursor resets cleanly when navigating away from a page before a mouseout fires
    this.router.events.subscribe(() => {
      this.targetHoverScale = 1;
      if (this.cursorOutline) this.cursorOutline.style.backgroundColor = 'transparent';
    });
  }

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
            this.targetHoverScale = 1.5;
            if (this.cursorOutline) this.cursorOutline.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }
        });
        
        document.body.addEventListener('mouseout', (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          if (target.closest('button, a, .cursor-pointer')) {
            this.targetHoverScale = 1;
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
    const dx = this.mouseX - this.outlineX;
    const dy = this.mouseY - this.outlineY;
    
    this.outlineX += dx * 0.15;
    this.outlineY += dy * 0.15;

    // Smooth hover scaling (lerp)
    this.currentHoverScale += (this.targetHoverScale - this.currentHoverScale) * 0.15;

    // Calculate elasticity based on velocity
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0.1) {
      this.currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    }

    // Stretch scale: elongated along movement axis, squeezed on perpendicular axis
    const stretchBase = Math.min(distance * 0.004, 0.5); 
    const scaleX = this.currentHoverScale + stretchBase; 
    const scaleY = Math.max(this.currentHoverScale - stretchBase, 0.4);

    if (this.cursorOutline) {
      this.cursorOutline.style.transform = `translate(${this.outlineX}px, ${this.outlineY}px) translate(-50%, -50%) rotate(${this.currentAngle}deg) scaleX(${scaleX}) scaleY(${scaleY})`;
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

  // ─── Security Measures ───────────────────────────────────────────────────
  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: Event) {
    event.preventDefault(); // Disables right-click
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Prevent F12, Ctrl+Shift+I (DevTools), Ctrl+U (View Source), Ctrl+S (Save), Ctrl+P (Print), PrintScreen
    if (
      event.key === 'F12' ||
      (event.ctrlKey && event.shiftKey && (event.key.toLowerCase() === 'i' || event.key.toLowerCase() === 'j' || event.key.toLowerCase() === 'c')) ||
      (event.ctrlKey && (event.key.toLowerCase() === 'u' || event.key.toLowerCase() === 's' || event.key.toLowerCase() === 'p')) ||
      event.key === 'PrintScreen' ||
      (event.metaKey && event.shiftKey && event.key.toLowerCase() === 's')
    ) {
      event.preventDefault();
    }
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
      if (event.key === 'PrintScreen') {
          // Attempt to hijack clipboard for PrintScreen
          try {
             navigator.clipboard.writeText('Screenshots are disabled for this portfolio.');
          } catch(e) {}
      }
  }

  @HostListener('document:copy', ['$event'])
  onCopy(event: Event) {
    event.preventDefault(); // Disables copying text
  }

  @HostListener('document:dragstart', ['$event'])
  onDragStart(event: Event) {
    event.preventDefault(); // Disables dragging images/assets
  }
}

