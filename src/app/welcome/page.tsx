import Welcome from "@/features/welcome/Welcome";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bem-vindo | AlugaFácil",
  description: "Área logada do usuário",
};

export default function WelcomePage() {
  return <Welcome />;
}