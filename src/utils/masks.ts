export const formatCPF = (cpf: string) => {
    if (!cpf) return "CPF não informado";
    const cleanedCPF = cpf.replace(/\D/g, '');
    if (cleanedCPF.length !== 11) return cpf;
    
    return cleanedCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export const formatPhoneNumber = (phone: string) => {
    if (!phone) return "Telefone não informado";
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length === 11) {
        return cleanedPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleanedPhone.length === 10) {
        return cleanedPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
}

