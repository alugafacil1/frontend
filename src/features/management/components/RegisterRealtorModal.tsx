"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { BaseModal, ModalBody } from "@/components/Modal/Modal";
import { useRegisterRealtor } from "@/services/queries/Realtors";
import { useAuth } from "@/lib/auth/useAuth";

const realtorSchema = z.object({
    name: z.string().min(3, "Nome muito curto"),
    email: z.string().email("E-mail inválido"),
    cpf: z.string().min(14, "CPF inválido"), 
    creciNumber: z.string().min(4, "CRECI inválido"), 
    phoneNumber: z.string().min(14, "Telefone inválido"),
    password: z.string().min(6, "Senha muito curta"),
});

type RealtorFormData = z.infer<typeof realtorSchema>;

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export function RegisterRealtorModal({ isOpen, onClose }: Props) {
    const { user } = useAuth();
    const { mutateAsync: registerRealtor, isPending } = useRegisterRealtor();
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<RealtorFormData>({
        resolver: zodResolver(realtorSchema),
    });

    const onSubmit = async (data: RealtorFormData) => {
        if (!user?.agencyId || !user?.id) {
            toast.error("Sua sessão expirou ou você não tem permissão para cadastrar corretores.");
            return;
        }

        try {
            await registerRealtor({
                ...data,
                cpf: data.cpf.replace(/\D/g, ""),
                phoneNumber: data.phoneNumber.replace(/\D/g, ""),
                agencyId: user.agencyId,
                actingUserId: user.id, 
                creciNumber: data.creciNumber.trim(),
            });

            toast.success("Corretor cadastrado com sucesso!");
            reset();
            onClose();
        } catch (error: any) {
            const backendMessage = error.response?.data?.message || "Erro ao cadastrar corretor.";
            toast.error(backendMessage);
        }
    };

    // Estilos FORÇANDO a altura (h-12 = 48px) e um arredondamento leve (rounded-lg = 8px)
    const inputBase = "w-full h-12 px-4 bg-[#f8fafc] border-none rounded-lg text-sm text-[#334155] outline-none focus:ring-2 focus:ring-[#515DEF] transition-all placeholder:text-[#94A3B8]";
    const labelBase = "block text-[13px] font-medium text-[#64748b] mb-2";
    
    // Botões com largura e altura fixas para não espremerem nunca
    const btnCancel = "w-[160px] h-12 rounded-lg border border-[#515DEF] text-[#515DEF] font-semibold bg-white hover:bg-blue-50 transition-colors flex items-center justify-center";
    const btnSubmit = "w-[160px] h-12 rounded-lg bg-[#515DEF] text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";

    return (
        <BaseModal isOpen={isOpen} onRequestClose={onClose} title="Cadastrar Agente">
            <ModalBody>
                {/* Aumentei o gap geral do formulário para respirar mais */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 pt-4 pb-2">

                    {/* Linha 1: Nome, Email, Telefone */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className={labelBase}>Nome</label>
                            <input 
                                {...register("name")} 
                                placeholder="João Silva" 
                                className={inputBase} 
                            />
                            {errors.name && <span className="text-red-500 text-[11px] mt-1.5 block">{errors.name.message}</span>}
                        </div>

                        <div>
                            <label className={labelBase}>Email</label>
                            <input 
                                {...register("email")} 
                                placeholder="email@email.com" 
                                className={inputBase} 
                            />
                            {errors.email && <span className="text-red-500 text-[11px] mt-1.5 block">{errors.email.message}</span>}
                        </div>

                        <div>
                            <label className={labelBase}>Telefone</label>
                            <input 
                                {...register("phoneNumber", {
                                    onChange: (e) => {
                                        let v = e.target.value.replace(/\D/g, "");
                                        v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
                                        v = v.replace(/(\d)(\d{4})$/, "$1-$2");
                                        e.target.value = v.slice(0, 15);
                                    }
                                })} 
                                placeholder="(87) 9 9999-0000" 
                                className={inputBase} 
                            />
                            {errors.phoneNumber && <span className="text-red-500 text-[11px] mt-1.5 block">{errors.phoneNumber.message}</span>}
                        </div>
                    </div>

                    {/* Linha 2: CPF, CRECI, Senha */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className={labelBase}>CPF</label>
                            <input 
                                {...register("cpf", {
                                    onChange: (e) => {
                                        let v = e.target.value.replace(/\D/g, "");
                                        v = v.replace(/(\d{3})(\d)/, "$1.$2");
                                        v = v.replace(/(\d{3})(\d)/, "$1.$2");
                                        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                                        e.target.value = v.slice(0, 14);
                                    }
                                })} 
                                placeholder="999.999.999-00" 
                                className={inputBase} 
                            />
                            {errors.cpf && <span className="text-red-500 text-[11px] mt-1.5 block">{errors.cpf.message}</span>}
                        </div>

                        <div>
                            <label className={labelBase}>CRECI</label>
                            <input 
                                {...register("creciNumber")} 
                                placeholder="Ex: 12345" 
                                className={inputBase} 
                            />
                            {errors.creciNumber && <span className="text-red-500 text-[11px] mt-1.5 block">{errors.creciNumber.message}</span>}
                        </div>

                        <div>
                            <label className={labelBase}>Senha</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")} 
                                    placeholder="Ex: ********" 
                                    className={inputBase} 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#1E293B]"
                                >
                                    {showPassword ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                      </svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <span className="text-red-500 text-[11px] mt-1.5 block">{errors.password.message}</span>}
                        </div>
                    </div>

                    {/* Botões perfeitamente alinhados no centro e grandes */}
                    <div className="flex justify-center items-center gap-6 mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                onClose();
                            }}
                            className={btnCancel}
                        >
                            Cancelar
                        </button>
                        
                        <button
                            type="submit"
                            disabled={isPending}
                            className={btnSubmit}
                        >
                            {isPending ? "Cadastrando..." : "Cadastrar"}
                        </button>
                    </div>

                </form>
            </ModalBody>
        </BaseModal>
    );
}