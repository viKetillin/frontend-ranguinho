export interface Categoria {
    id: number;
    exibirCardapio: boolean;
    descricao: string;
    description?: string;
    imagemFiltro?: string; 
}

export default interface Produto {
    id: number,
    valor: number,
    valorPromocional?: number,
    nome: string,
    ativo: boolean,
    descricao: string,
    description?: string,
    imagem: string,
    categoria?: Categoria,
    linkCardapio?: string
    produtoEstabelecimentoId?: number
}