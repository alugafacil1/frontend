export function useCep() {
  
  const maskCep = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);
  };

  const fetchAddress = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    
    if (cleanCep.length !== 8) return null;

    try {
      // 1. Trocamos para o BrasilAPI (Zero problemas de CORS em localhost)
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);

      if (!response.ok) {
        console.warn('CEP não encontrado na base de dados');
        return null;
      }

      const data = await response.json();
      
      // 2. Mapeamos os campos do BrasilAPI para o formato que você já usava
      return {
        address: data.street,            // No BrasilAPI é street (ViaCEP era logradouro)
        city: data.city,                 // No BrasilAPI é city (ViaCEP era localidade)
        neighborhood: data.neighborhood, // No BrasilAPI é neighborhood (ViaCEP era bairro)
        uf: data.state                   // No BrasilAPI é state (ViaCEP era uf)
      };
      
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
      return null;
    }
  };

  return { maskCep, fetchAddress };
}