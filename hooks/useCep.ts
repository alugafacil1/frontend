export function useCep() {
  
  const maskCep = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);
  };

  const fetchAddress = async (cep: string) => {
    const cleanCep = cep.replace("-", "");
    if (cleanCep.length !== 8) return null;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (data.erro) return null;
      
      return {
        address: data.logradouro,
        city: data.localidade,
        neighborhood: data.bairro,
        uf: data.uf
      };
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
      return null;
    }
  };

  return { maskCep, fetchAddress };
}