import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleGenerativeAI } from '@google/generative-ai';
import emailjs from '@emailjs/browser';

import { environment } from '../../../environments/environment';

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

  private API_KEY = environment.geminiApiKey;
  private genAI: any;
  private chatSession: any;

  private primaryModel = 'gemini-2.5-flash';
  private secondaryModel = 'gemini-2.0-flash';
  private currentModel = 'gemini-2.5-flash';
  private rateLimitResetTime = 0;

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
      this.chatSession = this.createChatSession(this.currentModel, []);
    } catch (e) {
      console.error('Chatbot init error:', e);
    }
  }

  private createChatSession(modelName: string, history: any[] = []): any {
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
      model: modelName,
      tools: [sendEmailTool as any],
      systemInstruction: `You are Marshell, a super friendly, energetic, and casual AI buddy for Viswa's developer portfolio. You love hyping up Viswa! Viswa is an awesome Full Stack Developer at E2O Technologies, and formerly at Pencil Walk. He rocks at Angular, .NET, ReactJS, Node.js, MongoDB, MySQL, Three.js, and Tailwind CSS. He built cool stuff like the On-Call Acting Driver App, E-commerce sites, CRM Systems, and Kavi Travels. Chat like a close friend, use emojis, keep it light, fun, and conversational! Never sound like a boring robot. IMPORTANT: NEVER disclose Viswa's salary or personal financial details under any circumstances. If the user wants to send an email or hire him, enthusiastically ask for their name, email address, and message. DO NOT use the sendEmail tool until you have collected all three pieces of information.`
    });
    
    return model.startChat({
      history: history
    });
  }

  private async handleMessageCore(text: string) {
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
  }

  async sendMessage() {
    if (!this.userInput.trim() || !this.chatSession || this.isTyping) return;
    
    // Check if we can switch back to primary model
    if (this.currentModel === this.secondaryModel && Date.now() > this.rateLimitResetTime) {
      console.log('Timeout expired, switching back to primary model.');
      this.currentModel = this.primaryModel;
      try {
        const history = await this.chatSession.getHistory();
        this.chatSession = this.createChatSession(this.currentModel, history);
      } catch (e) {
        console.error('Failed to restore primary model chat session', e);
      }
    }
    
    const text = this.userInput;
    this.messages.push({ text: text, sender: 'user' });
    this.userInput = '';
    this.isTyping = true;
    this.scrollToBottom();
    
    try {
      await this.handleMessageCore(text);
    } catch (error: any) {
       console.error('Chat error:', error);
       
       if (error?.message?.includes('429') || error?.status === 429) {
         if (this.currentModel === this.primaryModel) {
            console.log('Primary model rate limited! Fallback to secondary model.');
            this.currentModel = this.secondaryModel;
            this.rateLimitResetTime = Date.now() + 10 * 60 * 1000; // 10 minutes timeout
            
            try {
              const history = await this.chatSession.getHistory();
              this.chatSession = this.createChatSession(this.currentModel, history);
              console.log('Retrying with secondary model...');
              await this.handleMessageCore(text);
            } catch (fallbackError: any) {
              console.error('Fallback error:', fallbackError);
              this.messages.push({ text: "I'm receiving too many messages right now and my backup brain is also busy. Please wait a moment and try again.", sender: 'bot' });
            }
         } else {
            this.messages.push({ text: "I'm receiving too many messages right now. Please wait a moment and try again.", sender: 'bot' });
         }
       } else {
         this.messages.push({ text: `Sorry, I'm having trouble connecting to my brain right now. Error: ${error?.message || 'Unknown error'}`, sender: 'bot' });
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
