export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-5xl font-bold mb-4">
        Your <span className="gradient-text">No-Code</span> Adviser
      </h2>
      <p className="text-gray-400 mb-16 text-lg">
        Tell us what you want to build. We'll find the tools.
      </p>
      
      {/* Input with glow effect */}
      <div className="flex items-center gap-4 w-full max-w-2xl">
        <div className="flex-1 glow-border">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 flex items-center">
            <input 
              type="text" 
              placeholder="I want to build a..."
              className="flex-1 bg-transparent focus:outline-none text-lg"
            />
            <button className="ml-2 p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>

        <button className="btn-pill">
          Suggest Tools
        </button>
      </div>
    </div>
  );
}