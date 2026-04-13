export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-gray-800 p-4 bg-[#0a0a0a]/50 backdrop-blur-sm">
      {/* Sign in box */}
      <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl mb-4">
        <p className="text-gray-400 text-sm mb-3">Sign in to save your chats</p>
        <a href="/register" className="btn-primary">Sign Up</a>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 my-4"></div>

      {/* Chat history */}
      <div>
        <p className="text-gray-500 text-sm font-medium">Chat History</p>
        <p className="text-gray-600 text-xs mt-2">Sign in to see history</p>
      </div>
    </aside>
  );
}