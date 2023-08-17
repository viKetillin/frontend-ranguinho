export type User = {
    role: Role,
    username: string,
    email: string,
    franquiaId?: number 
}

export type Role = "Admin" | "Proprietário" | "Operador" | "Cliente" | "Franqueado" | "Garçom" | "Motoboy"