"use client";
import { api } from '@/convex/_generated/api';
import { ExpertName } from '@/services/options';
import { UserButton } from '@stackframe/stack';
import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const DiscussionRoom = () => {
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid });

  const [expert, setExpert] = useState(null);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'I am AI', isAI: true },
    { sender: 'user', text: 'hello world', isAI: false },
    { sender: 'ai', text: 'I am AI', isAI: true },
    { sender: 'user', text: 'hello world', isAI: false },
    { sender: 'ai', text: 'I am AI', isAI: true },
    { sender: 'user', text: 'hello world', isAI: false },
    { sender: 'ai', text: 'I am AI', isAI: true },
    { sender: 'user', text: 'hello world', isAI: false },
    { sender: 'ai', text: 'I am AI', isAI: true },
    { sender: 'user', text: 'hello world', isAI: false },
    { sender: 'ai', text: 'I am AI', isAI: true },
    { sender: 'ai', text: 'I am AI', isAI: true },
  ]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (DiscussionRoomData) {
      const matchedExpert = ExpertName.find(
        item => item.name.toLowerCase() === DiscussionRoomData.expertName?.toLowerCase()
      );
      setExpert(matchedExpert || null);
    }
  }, [DiscussionRoomData]);

  // const handleConnect = () => {
  //   setIsConnected(true);
  // };

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 px-6 md:px-8">
      <h1 className="text-xl font-semibold mb-4">Mockup Interview</h1>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Main interview area */}
        <div className="w-full md:w-4/5 bg-gray-100 rounded-xl overflow-hidden relative min-h-[500px] flex flex-col items-center justify-center">
          {expert && (
            <div className="flex flex-col items-center mt-8">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src={expert.image || "/placeholder-expert.jpg"}
                  alt={expert.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-2 text-center">{expert.name || 'Sallie'}</p>
            </div>
          )}
          
          {/* User self view */}
          <div className="absolute bottom-4 right-4 border-2 p-5 px-9 bg-gray-300 rounded-xl">

            <UserButton/>
          </div>
          
          {/* Connect button */}
          {!isConnected && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button 
                // onClick={handleConnect}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-full"
              >
                Connect Now
              </button>
            </div>
          )}
        </div>
        
        {/* Chat area */}
        <div className="w-full md:w-1/5 bg-white rounded-xl p-4 flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className="flex mb-3">
                <div 
                  className={`${
                    msg.isAI 
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  } rounded-xl py-2 px-4 text-sm max-w-full`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-500 px-2">
            At the end of conversation we will automatically generate feedback/notes from your conversation
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionRoom;