import "regenerator-runtime/runtime";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  UserButton,
} from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import "./globals.css";

export const metadata = {
  title: "Learn React",
  description: "Learn to React with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen flex flex-col relative overflow-x-hidden bg-background text-foreground">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* <div className="absolute -z-10 w-full h-full overflow-hidden">
              <div className="absolute top-[-10rem] left-[-5rem] w-[25rem] h-[25rem] bg-purple-300 dark:bg-purple-800 opacity-30 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
              <div className="absolute bottom-[-10rem] right-[-5rem] w-[30rem] h-[30rem] bg-blue-300 dark:bg-blue-800 opacity-30 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
              <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[50rem] h-[50rem] bg-purple-200 dark:bg-purple-700 opacity-20 rounded-full filter blur-3xl animate-blob" />
            </div> */}

            <header className="flex justify-between items-center p-4">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
              <ModeToggle />
            </header>

            <main className="flex-grow w-full">
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
              <SignedIn>{children}</SignedIn>
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
