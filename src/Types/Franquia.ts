import CategoriaEstabelecimento from "./CategoriaEstabelecimento"
interface Franquia {
    id: number,
    nome: string,
    uf: string,
    cidade: string,
    endereco: string,
    telefone: string,
    whatsapp: string,
    facebook: string,
    instagram: string,
    linkCardapio: string,
    logo: string,
    categoriaEstabelecimento: CategoriaEstabelecimento
}

export default Franquia