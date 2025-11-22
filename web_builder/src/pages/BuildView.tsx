
import React from 'react';
import ChatPanel from '../components/ChatPanel/ChatPanel';
import PreviewFrame from '../components/Preview/PreviewFrame';

const BuildView: React.FC = () => {
  return (
    <div className="flex h-full">
      {/* Left: Chat/Builder panel */}
      <div className="w-[380px] border-r">
        <ChatPanel />
      </div>
      {/* Right: Preview */}
      <div className="flex-1">
        <PreviewFrame />
      </div>
    </div>
  );
};

export default BuildView;
