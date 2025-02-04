import "regenerator-runtime/runtime";
import {
  ClerkProvider,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ClerkProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <head></head>
          <body className="min-h-screen flex flex-col">
            <header className="flex justify-between items-center p-4">
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
              <div className="ml-auto">
                <ModeToggle />
              </div>
            </header>
            <main className="flex-grow">{children}</main>
          </body>
        </ThemeProvider>
      </ClerkProvider>
    </html>
  );
}
