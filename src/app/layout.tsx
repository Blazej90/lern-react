// import "regenerator-runtime/runtime";
// import {
//   ClerkProvider,
//   SignedIn,
//   SignedOut,
//   RedirectToSignIn,
//   UserButton,
// } from "@clerk/nextjs";
// import { ThemeProvider } from "@/components/theme-provider";
// import { ModeToggle } from "@/components/mode-toggle";
// import "./globals.css";

// export const metadata = {
//   title: "Learn React",
//   description: "Learn to React with AI",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <ClerkProvider>
//       <html lang="en" suppressHydrationWarning>
//         <body className="min-h-screen flex flex-col">
//           <ThemeProvider
//             attribute="class"
//             defaultTheme="system"
//             enableSystem
//             disableTransitionOnChange
//           >
//             <header className="flex justify-between items-center p-4">
//               <SignedIn>
//                 <div className="user-button">
//                   <UserButton />
//                 </div>
//               </SignedIn>
//               <SignedOut>
//                 <RedirectToSignIn />
//               </SignedOut>
//               <div className="ml-auto">
//                 <ModeToggle />
//               </div>
//             </header>
//             <main className="flex-grow w-full">{children}</main>
//           </ThemeProvider>
//         </body>
//       </html>
//     </ClerkProvider>
//   );
// }

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
        <body className="min-h-screen flex flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
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
