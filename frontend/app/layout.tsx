import type { Metadata } from "next";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuizForge",
  description: "Create timed quiz rooms, invite players, and compete in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      suppressHydrationWarning={true}>
        {children}
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss={true}
          draggable={true}
          pauseOnHover={true}
          theme="light"
          transition={Slide}
          limit={3}
          toastClassName="!bg-white !text-gray-900 !rounded-lg !shadow-lg !border !border-gray-200"
          progressClassName="!bg-blue-500"
          closeButton={true}
          style={{
            fontSize: "14px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        />
      </body>
    </html>
  );
}

