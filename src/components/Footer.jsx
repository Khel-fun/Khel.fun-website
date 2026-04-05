import { FaTwitter} from "react-icons/fa"

const links = [
  {href: 'https://x.com/kheldotfun?s=21', icon: <FaTwitter />},
]
const Footer = () => {
  return (
    <footer className='relative w-screen overflow-hidden bg-gradient-to-b from-violet-300 to-violet-400 py-8 text-black'>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>
      
      <div className='container relative z-10 mx-auto flex flex-col items-center justify-between gap-6 px-4 md:flex-row'>
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <img src="/img/logo.png" alt="Khel.fun" loading="lazy" className="h-12 w-12" />
          <div>
            <p className='font-zentry text-2xl font-bold'>KHEL.FUN</p>
            <p className="text-xs opacity-70">Onchain Gaming Platform</p>
          </div>
        </div>
        
        {/* Social Links with Gaming Icons */}
        <div className='flex flex-col items-center gap-4'>
          <p className="font-mono text-xs uppercase tracking-wider">Join the Arena</p>
          <div className='flex justify-center gap-4'>
            {links.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-black/20 bg-black/10 text-xl transition-all duration-300 hover:scale-110 hover:border-black hover:bg-black hover:text-violet-300 hover:shadow-lg"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
        
        {/* Copyright and Links */}
        <div className="flex flex-col items-center gap-2 text-center md:items-end md:text-right">
          <p className='text-sm font-bold'>
            &copy; Drongo Games 2025
          </p>
          <div className="flex gap-4 text-xs">
            <a href="#privacy-policy" className="opacity-70 hover:underline hover:opacity-100">
              Privacy Policy
            </a>
            <a href="#terms" className="opacity-70 hover:underline hover:opacity-100">
              Terms
            </a>
          </div>
        </div>
      </div>
      
      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-black/30 to-transparent" />
    </footer>
  )
}

export default Footer