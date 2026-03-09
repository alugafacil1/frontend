"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth/useAuth";
import Button from "@/components/button";
import Link from "next/link";
import { useRegisterAgencyWithAdmin } from "@/services/queries/Agencies";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// ============================================================================
// 1. SCHEMAS DE VALIDAÇÃO (ZOD)
// ============================================================================
const personalSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(14, "Telefone incompleto"),
  cpf: z.string().length(14, "CPF incompleto"),
  type: z.enum(["TENANT", "OWNER"], { message: "Selecione um perfil" }),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
  passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
  message: "As senhas não coincidem",
  path: ["passwordConfirm"],
});

const agencySchema = z.object({
  // Passo 1: Legal
  corporateName: z.string().min(2, "Razão Social obrigatória"),
  agencyName: z.string().min(2, "Nome Fantasia obrigatório"),
  cnpj: z.string().min(14, "CNPJ inválido"),

  // Passo 2: Endereço (Novos Campos)
  postalCode: z.string().min(8, "CEP inválido"),
  street: z.string().min(3, "Rua obrigatória"),
  number: z.string().min(1, "Número obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "UF inválida"),

  // Passo 3: Contato e Midia
  agencyEmail: z.string().email("E-mail inválido"),
  agencyPhone: z.string().min(14, "Telefone incompleto"),
  website: z.string().url("URL inválida (ex: https://site.com)").optional().or(z.literal("")),
  photo: z.any().optional(),

  // Passo 4: Admin
  adminName: z.string().min(3, "Nome do administrador obrigatório"),
  adminEmail: z.string().email("E-mail de login inválido"),
  adminPassword: z.string().min(6, "Mínimo de 6 caracteres"),
  adminPasswordConfirm: z.string()
}).refine((data) => data.adminPassword === data.adminPasswordConfirm, {
  message: "As senhas não coincidem",
  path: ["adminPasswordConfirm"],
});

type PersonalFormData = z.infer<typeof personalSchema>;
type AgencyFormData = z.infer<typeof agencySchema>;

// ============================================================================
// 2. FUNÇÕES DE MÁSCARA
// ============================================================================
const maskPhone = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 10) return numbers.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return numbers.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 15);
};

const maskCPF = (value: string) => {
  return value.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").slice(0, 14);
};

const maskCNPJ = (value: string) => {
  return value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2").slice(0, 18);
};

// ============================================================================
// 3. COMPONENTE PRINCIPAL (MÁQUINA DE ESTADOS)
// ============================================================================
export default function SignUp() {
  type AccountType = "NONE" | "PERSONAL" | "AGENCY";
  const [accountType, setAccountType] = useState<AccountType>("NONE");

  return (
    <div className="signUp-page">
      <div className="signUp-container">

        {/* LADO DIREITO - CONTEÚDO DINÂMICO */}
        <div className="signUp-right">
          <div className="signUp-logo">
            <img src="/logo.svg" alt="AlugaFácil" />
          </div>

          {accountType === "NONE" && (
            <div className="flex flex-col h-full justify-center pb-20">
              <h1 className="signUp-title mb-2">Crie sua conta</h1>
              <p className="text-gray-500 mb-8">Como você deseja usar a plataforma?</p>

              <div className="flex flex-col gap-4">
                <button onClick={() => setAccountType("PERSONAL")} className="p-6 border-2 border-gray-200 rounded-xl hover:border-[#515DEF] hover:bg-blue-50 transition text-left flex items-center gap-4 group">
                  <span className="text-3xl bg-gray-100 p-4 rounded-full group-hover:bg-white transition">👤</span>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Para Mim</h3>
                    <p className="text-sm text-gray-500">Quero alugar um imóvel ou anunciar minha casa.</p>
                  </div>
                </button>

                <button onClick={() => setAccountType("AGENCY")} className="p-6 border-2 border-gray-200 rounded-xl hover:border-[#515DEF] hover:bg-blue-50 transition text-left flex items-center gap-4 group">
                  <span className="text-3xl bg-gray-100 p-4 rounded-full group-hover:bg-white transition">🏢</span>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Para Minha Empresa</h3>
                    <p className="text-sm text-gray-500">Sou uma Imobiliária ou Corretor Autônomo com CNPJ.</p>
                  </div>
                </button>
              </div>

              <p className="signUp-signup mt-8 text-center">
                Já tem uma conta? <Link href="/login" className="link-color">Entrar</Link>
              </p>
            </div>
          )}

          {accountType === "PERSONAL" && <PersonalForm onBack={() => setAccountType("NONE")} />}
          {accountType === "AGENCY" && <AgencyForm onBack={() => setAccountType("NONE")} />}

        </div>

        {/* LADO ESQUERDO - ILUSTRAÇÃO FIXA */}
        <div className="signUp-left">
          <div className="signUp-illustration-card">
            <img src="/signup-illustration.png" alt="signUp" />
            <div className="signUp-slider">
              <span className="active" />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. SUBCOMPONENTE: FORMULÁRIO PF
// ============================================================================
function PersonalForm({ onBack }: { onBack: () => void }) {
  const { signUp, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<PersonalFormData>({
    resolver: zodResolver(personalSchema),
  });

  const onSubmit = async (data: PersonalFormData) => {
    try {
      await signUp(data.name, data.email, data.phone, data.cpf, data.type, data.password);
      toast.success("Conta criada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta pessoal");
    }
  };

  return (
    <>
      <button onClick={onBack} className="text-sm text-gray-500 mb-4 hover:text-[#515DEF]">← Voltar</button>
      <h1 className="signUp-title">Cadastro Pessoal</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="signUp-form">
        <div className="form-group">
          <input type="text" id="name" {...register("name")} required placeholder=" " />
          <label htmlFor="name">Nome Completo</label>
          {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
        </div>

        <div className="signUp-grid">
          <div className="form-group">
            <input type="email" id="email" {...register("email")} required placeholder=" " />
            <label htmlFor="email">Email</label>
            {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              id="phone"
              {...register("phone", { onChange: (e) => e.target.value = maskPhone(e.target.value) })}
              required
              placeholder=" "
            />
            <label htmlFor="phone">Telefone</label>
            {errors.phone && <span className="text-red-500 text-xs mt-1 block">{errors.phone.message}</span>}
          </div>
        </div>

        <div className="signUp-grid">
          <div className="form-group">
            <input
              type="text"
              id="cpf"
              {...register("cpf", { onChange: (e) => e.target.value = maskCPF(e.target.value) })}
              required
              placeholder=" "
              maxLength={14}
            />
            <label htmlFor="cpf">CPF</label>
            {errors.cpf && <span className="text-red-500 text-xs mt-1 block">{errors.cpf.message}</span>}
          </div>

          <div className="form-group">
            <select id="type" {...register("type")} required>
              <option value="" disabled>Selecione o perfil</option>
              <option value="TENANT">Quero Alugar (Inquilino)</option>
              <option value="OWNER">Tenho imóvel (Proprietário)</option>
            </select>
            <label htmlFor="type">Eu sou:</label>
            {errors.type && <span className="text-red-500 text-xs mt-1 block">{errors.type.message}</span>}
          </div>
        </div>

        <div className="signUp-grid">
          <div className="form-group password">
            <input type={showPassword ? "text" : "password"} id="password" {...register("password")} required placeholder=" " />
            <label htmlFor="password">Senha</label>
            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              <img src={showPassword ? "/icons/eye-on.svg" : "/icons/eye-off.svg"} alt="Mostrar" />
            </button>
            {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
          </div>

          <div className="form-group password">
            <input type={showPasswordConfirm ? "text" : "password"} id="passwordConfirm" {...register("passwordConfirm")} required placeholder=" " />
            <label htmlFor="passwordConfirm">Confirmar Senha</label>
            <button type="button" className="toggle-password" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}>
              <img src={showPasswordConfirm ? "/icons/eye-on.svg" : "/icons/eye-off.svg"} alt="Mostrar" />
            </button>
            {errors.passwordConfirm && <span className="text-red-500 text-xs mt-1 block">{errors.passwordConfirm.message}</span>}
          </div>
        </div>

        <Button type="submit" loading={loading} loadingText="Criando..." className="w-full signUp-button mt-4">
          Criar Conta Pessoal
        </Button>
      </form>
    </>
  );
}

// ============================================================================
// 5. SUBCOMPONENTE: FORMULÁRIO PJ (MULTI-STEP)
// ============================================================================
function AgencyForm({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const router = useRouter();

  const { mutateAsync: registerAgency, isPending } = useRegisterAgencyWithAdmin();

  const { register, handleSubmit, trigger, setValue, formState: { errors } } = useForm<AgencyFormData>({
    resolver: zodResolver(agencySchema),
    mode: "onTouched",
  });

  const fetchCep = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();

      if (!data.erro) {
        setValue("street", data.logradouro, { shouldValidate: true });
        setValue("neighborhood", data.bairro, { shouldValidate: true });
        setValue("city", data.localidade, { shouldValidate: true });
        setValue("state", data.uf, { shouldValidate: true });

        document.getElementById("number")?.focus();
        toast.success("Endereço preenchido!");
      } else {
        toast.error("CEP não encontrado.");
      }
    } catch (error) {
      toast.error("Erro ao buscar CEP da API.");
    }
  };

  const onSubmit = async (data: AgencyFormData) => {
    try {
      const payload = {
        name: data.agencyName,
        corporateName: data.corporateName,
        cnpj: data.cnpj.replace(/\D/g, ""),

        address: {
          postalCode: data.postalCode,
          street: data.street,
          number: data.number,
          complement: data.complement || null,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state
        },

        email: data.agencyEmail,
        phoneNumber: data.agencyPhone.replace(/\D/g, ""),
        website: data.website || null,
        photoUrl: null,

        adminName: data.adminName,
        adminEmail: data.adminEmail,
        adminPassword: data.adminPassword
      };

      await registerAgency(payload);

      toast.success("Imobiliária cadastrada com sucesso! Faça login.");
      router.push("/login");

    } catch (error: any) {
      const backendMessage = error.response?.data?.message || "Ocorreu um erro ao conectar com o servidor.";
      toast.error(backendMessage);
    }
  };

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof AgencyFormData)[] = [];

    // Atualização dos Arrays de Validação por Passo
    if (step === 1) fieldsToValidate = ["agencyName", "cnpj", "corporateName"];
    else if (step === 2) fieldsToValidate = ["postalCode", "street", "number", "neighborhood", "city", "state"];
    else if (step === 3) fieldsToValidate = ["agencyEmail", "agencyPhone", "website", "photo"];

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    if (step === 1) onBack();
    else setStep((prev) => prev - 1);
  };

  return (
    <>
      <button onClick={handlePrevStep} className="text-sm text-gray-500 mb-6 hover:text-[#515DEF] flex items-center gap-2">
        <span>←</span> Voltar
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="signUp-title !mb-0 text-2xl sm:text-3xl" style={{ marginTop: 0 }}>
          Cadastro de Imobiliária
        </h1>
        <span className="text-sm font-bold text-[#515DEF] bg-blue-50 px-4 py-1.5 rounded-full whitespace-nowrap">
          Passo {step} de 4
        </span>
      </div>

      <div className="w-full bg-gray-200 h-2 rounded-full mb-8">
        <div
          className="bg-[#515DEF] h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        ></div>
      </div>

      <div className="overflow-y-auto pr-2 pb-4" style={{ maxHeight: '60vh' }}>
        <form onSubmit={handleSubmit(onSubmit)} className="signUp-form">

          {/* ===================================================================
                PASSO 1: IDENTIFICAÇÃO DA EMPRESA
                =================================================================== */}
          {step === 1 && (
            <div className="animate-fadeIn flex flex-col gap-6">
              <h3 className="text-[#515DEF] font-bold text-sm uppercase tracking-wider">Informações Legais</h3>

              <div className="signUp-grid">
                <div className="form-group">
                  <input type="text" id="agencyName" {...register("agencyName")} required placeholder=" " />
                  <label htmlFor="agencyName">Nome Fantasia</label>
                  {errors.agencyName && <span className="text-red-500 text-xs mt-1 block">{errors.agencyName.message}</span>}
                </div>
                <div className="form-group">
                  <input type="text" id="cnpj" {...register("cnpj", { onChange: (e) => e.target.value = maskCNPJ(e.target.value) })} required placeholder=" " maxLength={18} />
                  <label htmlFor="cnpj">CNPJ</label>
                  {errors.cnpj && <span className="text-red-500 text-xs mt-1 block">{errors.cnpj.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <input type="text" id="corporateName" {...register("corporateName")} required placeholder=" " />
                <label htmlFor="corporateName">Razão Social</label>
                {errors.corporateName && <span className="text-red-500 text-xs mt-1 block">{errors.corporateName.message}</span>}
              </div>

              <Button type="button" onClick={handleNextStep} className="w-full signUp-button mt-4">
                Avançar
              </Button>
            </div>
          )}

          {/* ===================================================================
                PASSO 2: ENDEREÇO FÍSICO (Novo Passo)
                =================================================================== */}
          {step === 2 && (
            <div className="animate-fadeIn flex flex-col gap-6">
              <h3 className="text-[#515DEF] font-bold text-sm uppercase tracking-wider">Sede da Imobiliária</h3>

              <div className="signUp-grid">
                <div className="form-group">
                  <input
                    type="text"
                    id="postalCode"
                    {...register("postalCode", {
                      onChange: (e) => e.target.value = e.target.value.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9),
                      onBlur: (e) => fetchCep(e.target.value)
                    })}
                    required placeholder=" "
                  />
                  <label htmlFor="postalCode">CEP</label>
                  {errors.postalCode && <span className="text-red-500 text-xs mt-1 block">{errors.postalCode.message}</span>}
                </div>

                <div className="form-group">
                  <input type="text" id="state" {...register("state")} required placeholder=" " maxLength={2} />
                  <label htmlFor="state">Estado (UF)</label>
                  {errors.state && <span className="text-red-500 text-xs mt-1 block">{errors.state.message}</span>}
                </div>
              </div>

              <div className="signUp-grid">
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <input type="text" id="street" {...register("street")} required placeholder=" " />
                  <label htmlFor="street">Logradouro (Rua, Av.)</label>
                  {errors.street && <span className="text-red-500 text-xs mt-1 block">{errors.street.message}</span>}
                </div>
              </div>

              <div className="signUp-grid">
                <div className="form-group">
                  <input type="text" id="number" {...register("number")} required placeholder=" " />
                  <label htmlFor="number">Número</label>
                  {errors.number && <span className="text-red-500 text-xs mt-1 block">{errors.number.message}</span>}
                </div>
                <div className="form-group">
                  <input type="text" id="complement" {...register("complement")} placeholder=" " />
                  <label htmlFor="complement">Complemento</label>
                </div>
              </div>

              <div className="signUp-grid">
                <div className="form-group">
                  <input type="text" id="neighborhood" {...register("neighborhood")} required placeholder=" " />
                  <label htmlFor="neighborhood">Bairro</label>
                  {errors.neighborhood && <span className="text-red-500 text-xs mt-1 block">{errors.neighborhood.message}</span>}
                </div>
                <div className="form-group">
                  <input type="text" id="city" {...register("city")} required placeholder=" " />
                  <label htmlFor="city">Cidade</label>
                  {errors.city && <span className="text-red-500 text-xs mt-1 block">{errors.city.message}</span>}
                </div>
              </div>

              <Button type="button" onClick={handleNextStep} className="w-full signUp-button mt-4">
                Avançar
              </Button>
            </div>
          )}

          {/* ===================================================================
                PASSO 3: CONTATO E PRESENÇA DIGITAL
                =================================================================== */}
          {step === 3 && (
            <div className="animate-fadeIn flex flex-col gap-6">
              <h3 className="text-[#515DEF] font-bold text-sm uppercase tracking-wider">Como os clientes te encontram</h3>

              <div className="signUp-grid">
                <div className="form-group">
                  <input type="email" id="agencyEmail" {...register("agencyEmail")} required placeholder=" " />
                  <label htmlFor="agencyEmail">E-mail da Empresa</label>
                  {errors.agencyEmail && <span className="text-red-500 text-xs mt-1 block">{errors.agencyEmail.message}</span>}
                </div>
                <div className="form-group">
                  <input type="text" id="agencyPhone" {...register("agencyPhone", { onChange: (e) => e.target.value = maskPhone(e.target.value) })} required placeholder=" " />
                  <label htmlFor="agencyPhone">Telefone</label>
                  {errors.agencyPhone && <span className="text-red-500 text-xs mt-1 block">{errors.agencyPhone.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <input type="text" id="website" {...register("website")} placeholder=" " />
                <label htmlFor="website">Website (Opcional)</label>
                {errors.website && <span className="text-red-500 text-xs mt-1 block">{errors.website.message}</span>}
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Logomarca da Empresa (Opcional)</label>
                <div className="flex items-center gap-4">

                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-gray-300 shadow-sm" />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center text-3xl border border-gray-300 shadow-inner">
                      🏢
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    {...register("photo", {
                      onChange: (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLogoPreview(URL.createObjectURL(file));
                        } else {
                          setLogoPreview(null);
                        }
                      }
                    })}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#515DEF] file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer transition-colors"
                  />
                </div>
              </div>

              <Button type="button" onClick={handleNextStep} className="w-full signUp-button mt-4">
                Avançar para Criar Login
              </Button>
            </div>
          )}

          {/* ===================================================================
                PASSO 4: DADOS DO ADMINISTRADOR (USER)
                =================================================================== */}
          {step === 4 && (
            <div className="animate-fadeIn flex flex-col gap-6">
              <h3 className="text-[#515DEF] font-bold text-sm uppercase tracking-wider mb-8">Crie o acesso do Dono/Admin</h3>

              <div className="form-group">
                <input type="text" id="adminName" {...register("adminName")} required placeholder=" " />
                <label htmlFor="adminName">Seu Nome Completo</label>
                {errors.adminName && <span className="text-red-500 text-xs mt-1 block">{errors.adminName.message}</span>}
              </div>

              <div className="form-group">
                <input type="email" id="adminEmail" {...register("adminEmail")} required placeholder=" " />
                <label htmlFor="adminEmail">E-mail de Acesso (Login)</label>
                {errors.adminEmail && <span className="text-red-500 text-xs mt-1 block">{errors.adminEmail.message}</span>}
              </div>

              <div className="signUp-grid">
                <div className="form-group password">
                  <input type={showPassword ? "text" : "password"} id="adminPassword" {...register("adminPassword")} required placeholder=" " />
                  <label htmlFor="adminPassword">Senha</label>
                  <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    <img src={showPassword ? "/icons/eye-on.svg" : "/icons/eye-off.svg"} alt="Mostrar" />
                  </button>
                </div>
                <div className="form-group password">
                  <input type={showPassword ? "text" : "password"} id="adminPasswordConfirm" {...register("adminPasswordConfirm")} required placeholder=" " />
                  <label htmlFor="adminPasswordConfirm">Confirmar Senha</label>
                </div>
              </div>
              {(errors.adminPassword || errors.adminPasswordConfirm) && (
                <span className="text-red-500 text-xs -mt-4 block">Verifique as senhas digitadas.</span>
              )}

              <Button
                type="submit"
                loading={isPending}
                loadingText="Registrando..."
                className="w-full signUp-button mt-2"
              >
                Finalizar Cadastro
              </Button>
            </div>
          )}

        </form>
      </div>
    </>
  );
}