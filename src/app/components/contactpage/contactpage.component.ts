import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-contactpage',
  standalone: true,
  imports: [FormsModule,NgIf],
  templateUrl: './contactpage.component.html',
  styleUrl: './contactpage.component.css'
})
export class ContactpageComponent {

  downloadProgress = 0;
  isDownloading = false;
  downloadInterval: any;
  downloadSuccess = false;


  constructor() {
      emailjs.init('MSoYy-x1WG6Bl8Qz5');
  }


  // ===== Contact Info (Single Source of Truth) =====
  email = 'Visveswaran760@gmail.com';
  gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${this.email}`;
  
  linkedIn = {
    label: 'LinkedIn',
    text: 'Connect',
    url: 'www.linkedin.com/in/visveswaran-m'
  };

  resume = {
    label: 'Resume',
    text: 'Download PDF',
    url: 'assets/My-current-professional-resume.pdf'
  };

  // ===== Form Model =====
  contactForm = {
    name: '',
    email: '',
    message: ''
  };

  startDownload() {
    if(this.downloadSuccess) return;
    this.isDownloading = true;
    this.downloadInterval = setInterval(() => {
      this.downloadProgress += 2; // Fills in roughly 750ms
      if (this.downloadProgress >= 100) {
        this.finishDownload();
      }
    }, 15);
  }

  stopDownload() {
    if(this.downloadSuccess) return;
    this.isDownloading = false;
    clearInterval(this.downloadInterval);
    
    // Smoothly animate back to 0
    const returnInterval = setInterval(() => {
      this.downloadProgress -= 4;
      if (this.downloadProgress <= 0 || this.isDownloading) {
        this.downloadProgress = 0;
        clearInterval(returnInterval);
      }
    }, 10);
  }

  finishDownload() {
    clearInterval(this.downloadInterval);
    this.isDownloading = false;
    this.downloadProgress = 100;
    this.downloadSuccess = true;
    
    // Confetti pop
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#00ffff', '#ffffff', '#888888']
    });

    // Programmatically trigger the download
    const link = document.createElement('a');
    link.href = this.resume.url;
    link.download = 'My-current-professional-resume.pdf';
    link.click();
    link.remove();
    
    // Reset after success
    setTimeout(() => {
      this.downloadSuccess = false;
      this.downloadProgress = 0;
    }, 3000);
  }


  isSending = false;
  isSuccess = false;
  isError = false;



  onSubmit() {

  this.isSending = true;
  this.isSuccess = false;
  this.isError = false;


 emailjs.send(
  'service_34vpspb',
  'template_7yb4zhd',
  {
    from_name: this.contactForm.name,
    from_email: this.contactForm.email,
    message: this.contactForm.message
  }
)
  .then((response) => {
    console.log('SUCCESS!', response.status, response.text);
    this.isSuccess = true;
    this.contactForm = { name: '', email: '', message: '' };

    // Confetti pop on successful email send
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#00ffff', '#ffffff', '#888888']
    });
    // Reset success state after 5 seconds
    setTimeout(() => {
      this.isSuccess = false;
    }, 5000);
  })
  .catch((error) => {
    console.log('FAILED...', error);
    this.isError = true;
  })
  .finally(() => {
    this.isSending = false;
  });
}

}
