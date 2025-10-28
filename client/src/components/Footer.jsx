import logo from '../assets/logo-mark.svg';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Ocura360" className="h-8 w-auto" />
            <span className="font-semibold text-white hidden sm:inline">Ocura360</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Ocura360. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
