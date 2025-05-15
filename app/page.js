"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun, ChevronRight, Mic, BookOpen, UserCheck, HeartPulse } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "@/app/_context/UserContext";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const { userData } = useContext(UserContext);
  const [scrollY, setScrollY] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [expertRolesVisible, setExpertRolesVisible] = useState(false);
  const [testimonialVisible, setTestimonialVisible] = useState(false);
  const featuresRef = useRef(null);
  const expertRolesRef = useRef(null);
  const testimonialRef = useRef(null);

  // Handle scroll effects and element visibility
  useEffect(() => {
    setHeroVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      if (featuresRef.current && window.scrollY > featuresRef.current.offsetTop - window.innerHeight * 0.75) {
        setFeaturesVisible(true);
      }
      
      if (expertRolesRef.current && window.scrollY > expertRolesRef.current.offsetTop - window.innerHeight * 0.75) {
        setExpertRolesVisible(true);
      }
      
      if (testimonialRef.current && window.scrollY > testimonialRef.current.offsetTop - window.innerHeight * 0.75) {
        setTestimonialVisible(true);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    // Trigger initial check
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Custom gradient text component
  const GradientText = ({ children, className = "" }) => (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700 ${className}`}>
      {children}
    </span>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* Navbar with scroll effect */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 
          ? "py-3 bg-background/95 backdrop-blur-sm shadow-sm" 
          : "py-5 bg-transparent"
      }`}>
        <div className="container mx-auto flex justify-between items-center px-4">
          <Link href="/" className="group flex items-center">
            <h1 className="text-xl font-bold relative">
              <GradientText>CoachLume</GradientText>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="transition-transform hover:scale-110"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </Button>

            {/* User Info */}
            {userData && (
              <div className="text-sm border-l border-border pl-4">
                <p className="font-medium">{userData.name}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-blue-500">{userData.credits}</span> Credits
                </p>
              </div>
            )}

            {/* Dashboard CTA */}
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                className="group border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-300"
              >
                Dashboard
                <ChevronRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-4">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            {/* Main heading with subtle gradient background */}
            <div className="relative inline-block">
              <div className="absolute -inset-1 rounded-lg blur-xl bg-gradient-to-r from-blue-500/20 to-blue-700/20 opacity-70 animate-pulse"></div>
              <h1 className="relative text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4">
                Master Communication Through
                <br />
                <GradientText className="font-extrabold">AI Voice Interactions</GradientText>
              </h1>
            </div>
            
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Practice interviews, improve language skills, and learn from experts through 
              natural voice conversations with intelligent AI coaches.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
                >
                  Start Learning
                  <ChevronRight size={18} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <Link href="/pricing">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="group border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-300 w-full sm:w-auto"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
            
            {/* Social proof */}
            <div className="mt-12 pt-6 border-t border-border/50 text-sm text-muted-foreground">
              <p>Trusted by 500+ users from leading organizations worldwide</p>
              <div className="mt-4 flex flex-wrap justify-center gap-8">
                {["TechCorp", "EduLearn", "GlobalSpeak", "FutureTalent"].map((company) => (
                  <span key={company} className="opacity-70 hover:opacity-100 transition-opacity">
                    {company}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Key Features Section */}
      <section ref={featuresRef} className="py-16 bg-blue-50/5">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-700 ${
            featuresVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <GradientText>Powerful Features</GradientText> for Effective Learning
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              CoachLume combines cutting-edge AI with intuitive design to create
              the most natural and effective voice-based learning experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: <Mic className="h-8 w-8 text-blue-600" />,
                title: "Voice-Based Conversations",
                description: "Interact with AI agents using natural speech, making the experience immersive and hands-free.",
                delay: 100
              },
              {
                icon: <BookOpen className="h-8 w-8 text-blue-600" />,
                title: "Personalized Learning",
                description: "Choose your topic or role, and the AI adapts the conversation to your specific learning needs.",
                delay: 200
              },
              {
                icon: <UserCheck className="h-8 w-8 text-blue-600" />,
                title: "Summarized Feedback",
                description: "Receive detailed session summaries highlighting key learnings and areas for improvement.",
                delay: 300
              },
              {
                icon: <HeartPulse className="h-8 w-8 text-blue-600" />,
                title: "Flexible Credits System",
                description: "Pay only for what you use with our transparent credit-based pricing model.",
                delay: 400
              },
            ].map((feature, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-xl border border-border bg-card hover:border-blue-500/50 hover:shadow-md transition-all duration-500 ${
                  featuresVisible 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${feature.delay}ms` }}
              >
                <div className="p-3 rounded-full bg-blue-100/10 w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Expert Roles Section */}
      <section ref={expertRolesRef} className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-700 ${
            expertRolesVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Learn From <GradientText>Multiple AI Experts</GradientText>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each AI agent is specially designed to excel in different learning scenarios,
              providing expert guidance across various domains.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Lecturer",
                description: "Learn complex topics through clear, structured explanations and interactive Q&A sessions.",
                icon: "🎓",
                delay: 100
              },
              {
                title: "Mock Interviewer",
                description: "Practice job interviews with realistic scenarios and receive actionable feedback to improve.",
                icon: "🤝",
                delay: 200
              },
              {
                title: "Language Coach",
                description: "Enhance your language skills through natural conversations with pronunciation guidance.",
                icon: "🗣️",
                delay: 300
              },
              {
                title: "Meditation Guide",
                description: "Develop mindfulness and mental clarity with guided meditation sessions.",
                icon: "🧘",
                delay: 400
              },
            ].map((role, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-xl border border-border bg-card hover:shadow-md transition-all duration-500 ${
                  expertRolesVisible 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${role.delay}ms` }}
              >
                <div className="flex gap-4 items-start">
                  <div className="text-4xl">{role.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
                    <p className="text-muted-foreground">{role.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className={`mt-12 text-center transition-all duration-700 delay-500 ${
            expertRolesVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <Link href="/experts">
              <Button 
                variant="outline"
                className="group border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-300"
              >
                Explore All Expert Roles
                <ChevronRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonial Section */}
      <section ref={testimonialRef} className="py-16 bg-blue-50/5">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto transition-all duration-700 ${
            testimonialVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Our <GradientText>Users Say</GradientText>
              </h2>
            </div>
            
            <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-sm">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-20 h-20 rounded-full bg-blue-100/20 flex items-center justify-center text-3xl">
                  👩‍💼
                </div>
                <div>
                  <p className="italic text-lg">
                    "CoachLume transformed our team's interview preparation process. The voice interactions feel remarkably natural, and the feedback has helped our candidates improve significantly. It's like having a professional coach available 24/7."
                  </p>
                  <div className="mt-4">
                    <p className="font-semibold">Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">Director of HR, TechVision Inc.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Link href="/testimonials">
                <Button 
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Read More Success Stories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative inline-block">
              <div className="absolute -inset-1 rounded-lg blur-xl bg-gradient-to-r from-blue-500/10 to-blue-700/10 opacity-70"></div>
              <h2 className="relative text-3xl md:text-4xl font-bold mb-6">
                Ready to <GradientText>Enhance Your Skills</GradientText>?
              </h2>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of professionals who are already improving their communication
              and learning new skills with CoachLume.
            </p>
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300"
              >
                Start Your Learning Journey
                <ChevronRight size={18} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/30 border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">
                <GradientText>CoachLume</GradientText>
              </h3>
              <p className="text-sm text-muted-foreground">
                The AI-powered voice learning platform helping users practice, learn, and grow 
                through real-time, interactive conversations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-blue-500 transition-colors">Voice Interactions</Link></li>
                <li><Link href="/" className="hover:text-blue-500 transition-colors">AI Experts</Link></li>
                <li><Link href="/" className="hover:text-blue-500 transition-colors">Personalized Learning</Link></li>
                <li><Link href="/" className="hover:text-blue-500 transition-colors">Feedback & Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-blue-500 transition-colors">Blog</Link></li>
                <li><Link href="/" className="hover:text-blue-500 transition-colors">Help Center</Link></li>
                <li><Link href="/" className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/" className="hover:text-blue-500 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="https://www.linkedin.com/in/pranav-jain-32179722a/" className="hover:text-blue-500 transition-colors">LinkedIn</Link></li>
                <li><Link href="https://book-appointment-pranav.vercel.app/" className="hover:text-blue-500 transition-colors">Help Center(book a meeting)</Link></li>
               
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/50 text-sm text-muted-foreground text-center">
            <p>© {new Date().getFullYear()} CoachLume by Pranav Jain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}