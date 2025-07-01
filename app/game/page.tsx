import PacManGame from '@/components/PacManGame';

export default function GamePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">PAC-MAN</h1>
          <p className="text-lg text-gray-300">
            Classic arcade game built with Next.js
          </p>
        </div>
        
        <PacManGame />
        
        <div className="mt-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">How to Play</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-bold text-lg mb-2">Controls</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Arrow Keys or WASD: Move Pac-Man</li>
                  <li>• Spacebar: Pause/Resume</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Objective</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Eat all dots to advance to next level</li>
                  <li>• Avoid ghosts or you&apos;ll lose a life</li>
                  <li>• Eat power pellets to make ghosts vulnerable</li>
                  <li>• Score points by eating dots and ghosts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}