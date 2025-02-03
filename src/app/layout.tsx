import "regenerator-runtime/runtime";
import {
  ClerkProvider,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-gray-900 text-white min-h-screen flex flex-col">
          <header className="flex justify-between items-center p-4 bg-gray-800 shadow-md">
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          <main className="flex-grow">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
