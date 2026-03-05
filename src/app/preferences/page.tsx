import PreferencesPage from "@/features/preferences/PreferencesPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preferências | AlugaFácil",
  description: "Gerencie suas preferências de busca",
};

export default function Page() {
  return <PreferencesPage />;
}
