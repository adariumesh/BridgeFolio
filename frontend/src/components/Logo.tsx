import logoImage from '../assets/6fe4bbb10a8d2499d70e3f35ea1abb2044c8aba6.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { container: 'h-12', text: 'text-xl' },
    md: { container: 'h-20', text: 'text-3xl' },
    lg: { container: 'h-32', text: 'text-5xl' }
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizes[size].container} aspect-square`}>
        <img 
          src={logoImage} 
          alt="BridgeFolio Logo"
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${sizes[size].text} font-bold`}>
            <span className="text-[#3B7EA1]">Bridge</span>
            <span className="text-[#4FD1C5]">Folio</span>
          </span>
        </div>
      )}
    </div>
  );
}