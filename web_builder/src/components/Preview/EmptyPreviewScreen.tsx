import React, { useEffect, useState } from "react";

const greetings = [
  "Hello!",
  "こんにちは!",
  "¡Hola!",
  "Bonjour!",
  "안녕하세요!",
  "Ciao!",
  "مرحبا!",
  "Hallo!",
];

export default function EmptyPreviewScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % greetings.length);
    }, 1200);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0d0d14]">
      <div className="text-center px-8 py-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10 shadow-xl">
        <h1 className="text-4xl font-semibold text-white mb-3 transition-all duration-500">
          {greetings[index]}
        </h1>

        <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
          Ready to build an app?  
          Just tell the Agent what you want to build —  
          you can even ask for suggestions.
        </p>
      </div>
    </div>
  );
}
