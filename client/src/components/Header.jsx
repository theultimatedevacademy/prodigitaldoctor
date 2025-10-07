import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

const Header = () => {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <h1 className="text-xl font-bold text-gray-800">ProDigitalDoctor</h1>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Header;
