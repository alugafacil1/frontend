import ManagementPage from "@/features/management/ManagementPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gerenciamento | AlugaFácil",
  description: "Gerencie usuários, imóveis e agências de forma eficiente",
};

export default function Page() {
  return <ManagementPage />;
}