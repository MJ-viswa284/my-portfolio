import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleGenerativeAI } from '@google/generative-ai';
import emailjs from '@emailjs/browser';

interface ChatMessage {
  text: string;
  sender: 'bot' | 'user';
  isTyping?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  @ViewChild('chatBody') private chatBody!: ElementRef;

  isOpen = false;
  showGreeting = false;
  isTyping = false;
  messages: ChatMessage[] = [];
  userInput = '';

  private API_KEY = 'AIzaSyB50CM0Frb2KOz4fx-BxQwHFfmahGqAtmA';
  private genAI: any;
  private chatSession: any;

  ngOnInit() {
    this.messages = [
      { text: "Hey! I'm Marshell, Viswa's AI assistant. Ask me anything about his skills, experience, or projects!", sender: 'bot' }
    ];

    setTimeout(() => {
      if (!this.isOpen) {
        this.showGreeting = true;
      }
    }, 2000);
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.showGreeting = false;
      if (!this.chatSession) {
        this.initChat();
      }
    }
  }

  private initChat() {
    try {
      this.genAI = new GoogleGenerativeAI(this.API_KEY);

      const sendEmailTool = {
        functionDeclarations: [
          {
            name: "sendEmail",
            description: "Sends an email to Viswa using his contact form. Use this tool ONLY when the user explicitly asks to send an email, hire him, or contact him.",
            parameters: {
              type: "object",
              properties: {
                name: { type: "string", description: "The name of the user." },
                email: { type: "string", description: "The contact email address of the user." },
                message: { type: "string", description: "The message body to send." }
              },
              required: ["name", "email", "message"]
            }
          }
        ]
      };

      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-flash-latest',
        tools: [sendEmailTool as any],
        systemInstruction: `You are Marshell, an AI assistant for Viswa's developer portfolio. Viswa is currently a working Full Stack Developer at E2O Technologies, and formerly worked at Pencil Walk. He knows Angular, .NET, ReactJS, Node.js, MongoDB, MySQL, Three.js, and Tailwind CSS. Built: On-Call Acting Driver App, E-commerce, CRM Systems, Kavi Travels. Be professional and concise. IMPORTANT: NEVER disclose Viswa's salary or personal financial details under any circumstances. If the user wants to send an email, politely ask for their name, email address, and message. DO NOT use the sendEmail tool until you have collected all three pieces of information.`
      });
      this.chatSession = model.startChat({
        history: []
      });
    } catch (e) {
      console.error('Chatbot init error:', e);
    }
  }

  async sendMessage() {
    if (!this.userInput.trim() || !this.chatSession || this.isTyping) return;
    
    const text = this.userInput;
    this.messages.push({ text: text, sender: 'user' });
    this.userInput = '';
    this.isTyping = true;
    this.scrollToBottom();
    
    try {
      const result = await this.chatSession.sendMessage(text);
      const response = await result.response;
      
      const funcCalls = response.functionCalls();
      if (funcCalls && funcCalls.length > 0 && funcCalls[0].name === "sendEmail") {
        const args = funcCalls[0].args as any;
        this.messages.push({ text: "Sending your message securely to Viswa via EmailJS...", sender: 'bot' });
        this.scrollToBottom();

        try {
          emailjs.init('MSoYy-x1WG6Bl8Qz5');
          await emailjs.send('service_34vpspb', 'template_7yb4zhd', {
            from_name: args.name,
            from_email: args.email,
            message: args.message
          });

          const toolRes = await this.chatSession.sendMessage([{
            functionResponse: { name: "sendEmail", response: { result: "Success! Email successfully delivered to Viswa." } }
          }]);
          let finalReply = toolRes.response.text().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
          this.messages.push({ text: finalReply, sender: 'bot' });

        } catch (emailErr) {
          console.error("EmailJS Error:", emailErr);
          const toolErr = await this.chatSession.sendMessage([{
            functionResponse: { name: "sendEmail", response: { error: "Failed to send email due to a network provider issue." } }
          }]);
          this.messages.push({ text: toolErr.response.text(), sender: 'bot' });
        }
      } else {
        let replyText = response.text();
        replyText = replyText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        replyText = replyText.replace(/\n/g, '<br>');
        this.messages.push({ text: replyText, sender: 'bot' });
      }

      this.scrollToBottom();
    } catch (error: any) {
       console.error('Chat error:', error);
       if (error?.message?.includes('429')) {
         this.messages.push({ text: "I'm receiving too many messages right now. Please wait a moment and try again.", sender: 'bot' });
       } else {
         this.messages.push({ text: "Sorry, I'm having trouble connecting to my brain right now.", sender: 'bot' });
       }
    } finally {
      this.isTyping = false;
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if(this.chatBody && this.chatBody.nativeElement) {
          this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
        }
      } catch(err) { }
    }, 50);
  }
}
