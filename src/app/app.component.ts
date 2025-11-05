import { Component, NgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SoundServiceService } from './sound.service.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
 
})
export class AppComponent {
  private audio!: HTMLAudioElement;
  isMusicPlaying = false;

  constructor(private zone: NgZone,private sfx: SoundServiceService) {}

  ngOnInit(): void {
    this.audio = new Audio('assets/Fainted.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.4;
  }

  toggleMusic(): void {
    if (!this.audio) return;

    if (this.isMusicPlaying) {
      this.fadeVolume(0, 350);
      setTimeout(() => {
        this.audio.pause();
        this.zone.run(() => (this.isMusicPlaying = false));
         this.sfx.setMuted(true); // 🔇 mute SFX
      }, 350);
    } else {
      this.audio
        .play()
        .then(() => {
          this.fadeVolume(0.4, 350);
          this.zone.run(() => (this.isMusicPlaying = true));
          this.sfx.setMuted(false); // 🔊 enable SFX
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
