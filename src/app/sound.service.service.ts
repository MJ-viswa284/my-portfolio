import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SoundServiceService {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private activeClones: HTMLAudioElement[] = [];
  private muted = false;

  constructor() {
    this.sounds['click'] = new Audio('assets/mouseclick.mp3');
    // this.sounds['hover'] = new Audio('assets/hover.mp3');
    this.sounds['type'] = new Audio('assets/biotype.wav');

    for (const key in this.sounds) {
      this.sounds[key].volume = 0.4;
      this.sounds[key].preload = 'auto';
    }
  }

  /** 🔇 Global mute/unmute — stops *everything* immediately */
  setMuted(mute: boolean): void {
    this.muted = mute;

    // Stop and reset every sound
    for (const key in this.sounds) {
      const a = this.sounds[key];
      a.pause();
      a.currentTime = 0;
    }
    this.activeClones.forEach(a => {
      try {
        a.pause();
        a.currentTime = 0;
      } catch {}
    });
    this.activeClones = [];
  }

  /** 🎧 Safe play — respects mute at all times */
  play(
    name: string,
    options?: { playbackRate?: number; volume?: number; pan?: number }
  ): HTMLAudioElement | null {
    // Double guard
    if (this.muted) return null;

    const base = this.sounds[name];
    if (!base) return null;

    const audio = base.cloneNode(true) as HTMLAudioElement;
    if (this.muted) return null; // check again after clone

    audio.currentTime = 0;
    audio.volume = typeof options?.volume === 'number' ? options.volume : base.volume;
    if (options?.playbackRate) audio.playbackRate = options.playbackRate;

    this.activeClones.push(audio);
    audio.addEventListener('ended', () => {
      this.activeClones = this.activeClones.filter(a => a !== audio);
    });

    // short "type" cutoff
    if (name === 'type') {
      audio.addEventListener('timeupdate', () => {
        if (audio.currentTime > 0.12) {
          audio.pause();
          this.activeClones = this.activeClones.filter(a => a !== audio);
        }
      });
    }

    // Block again in case mute toggled just now
    if (this.muted) return null;

    audio.play().catch(() => {});
    return audio;
  }

  stop(name: string) {
    const a = this.sounds[name];
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
  }

  /** Helper for components to check mute */
  isMuted(): boolean {
    return this.muted;
  }
}
