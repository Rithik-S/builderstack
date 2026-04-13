export default function Navbar() {
    return(
        <nav className="flex items-center justify-between h-16 px-8 bg-[#0a0a0a] text-white navbar-gradient">
            <h1 className="text-xl font-bold">
                <a href="/" className="gradient-text">Builder</a>Stack
            </h1>
            <div className="flex gap-6 items-center">
                <a href="/about" className="text-gray-400 hover:text-white transition-colors">About</a>
                <a href="/tools" className="text-gray-400 hover:text-white transition-colors">Tools</a>
                <a href="/login" className="btn-secondary">Login</a>
                <a href="/register" className="btn-primary">Sign Up</a>
            </div>
        </nav>
    )
}