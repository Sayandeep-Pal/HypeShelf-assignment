// app/components/Navbar.tsx
"use client";

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

export function Navbar() {
  const { isSignedIn, user } = useUser();

  return (
    <nav className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl font-black tracking-tight text-indigo-600 shrink-0">
            HypeShelf
          </span>
          <span className="text-gray-400 text-sm hidden sm:inline truncate">
            Collect and share the stuff you&apos;re hyped about.
          </span>
        </div>

        {/* Auth actions */}
        <div className="flex items-center gap-3 shrink-0">
          {isSignedIn ? (
            <>
              <span className="text-sm text-gray-500 hidden sm:inline">
                Hi, {user.firstName ?? user.emailAddresses[0]?.emailAddress} 👋
              </span>
              <SignOutButton>
                <button className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                  Sign out
                </button>
              </SignOutButton>
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer">
                Sign in to add yours
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
}
