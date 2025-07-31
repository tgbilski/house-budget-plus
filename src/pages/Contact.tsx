import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Breadcrumbs } from '@/components/Breadcrumbs';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mailto link with form data
    const subject = encodeURIComponent(formData.subject);
    const body = encodeURIComponent(
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n\n` +
      `Message:\n${formData.message}`
    );
    
    const mailtoLink = `mailto:homebudgetcalculator@gmail.com?subject=${subject}&body=${body}`;
    
    // Open user's email client
    window.location.href = mailtoLink;
    
    toast({
      title: "Opening your email client...",
      description: "Your email client should open with the message pre-filled.",
    });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <SEO 
        title="Contact Us - Home Budget Calculator"
        description="Get in touch with the Home Budget Calculator team. Send us your questions, feedback, or suggestions."
        keywords="contact, support, budget calculator, feedback, help"
      />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Contact Us</h1>
            <p className="text-muted-foreground">
              Have questions, feedback, or suggestions? We'd love to hear from you!
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll open your email client with the message pre-filled.
            </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What's this about?"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us what's on your mind..."
                    className="min-h-[120px]"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Open Email Client
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              You can also reach us directly at{' '}
              <a 
                href="mailto:homebudgetcalculator@gmail.com"
                className="text-primary hover:underline"
              >
                homebudgetcalculator@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;