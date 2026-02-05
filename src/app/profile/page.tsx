import Profile from "@/features/profile/profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meu Perfil | AlugaFácil",
  description: "Gerencie suas informações pessoais",
};

export default function Page() {
  return <Profile />;
}