import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "@/assets/styles/global.css";
import 'react-toastify/dist/ReactToastify.css';
import Providers from "./providers";
import QueryProvider from "@/lib/providers/QueryProvider";
import { ToastContainer } from "react-toastify";
import Footer from "@/components/Footer"; // Importe seu Footer aqui

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "AlugaFácil",
  description: "Encontre o imóvel ideal com facilidade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${poppins.variable} antialiased`}>
        <Providers>
          <QueryProvider>
            <ToastContainer 
               position="top-right" 
               autoClose={3000} 
               theme="light" 
            />
            
            {/* Estrutura Flex para empurrar o footer para baixo */}
            <div className="layout-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <main style={{ flex: '1 0 auto' }}>
                {children}
              </main>
              
              <Footer />
            </div>

          </QueryProvider>
        </Providers>
      </body>
    </html>
  );
}