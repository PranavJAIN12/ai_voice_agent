import { UserButton } from '@stackframe/stack';
import { Bot } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/ThemeToggle';

const AppHeader = () => {
  return (
    <header className="w-full  py-4 px-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8 " />
          <Link href="/">
            <h1 className="text-2xl font-bold tracking-tight">CoachLume</h1>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/dashboard" className="hover:text-indigo-200 transition-colors">
            Dashboard
          </Link>
          {/* <Link href="/experts" className="hover:text-indigo-200 transition-colors">
            Experts
          </Link> */}
          <Link href="#feedback-section" className="hover:text-indigo-200 transition-colors">
            History
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <div className=" bg-opacity-20 rounded-full p-1">
            <UserButton />
          </div>
          <div>
            {/* <ThemeProvider/> */}
            <ModeToggle/>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;