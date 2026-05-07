export interface Combustivel {
	tipo: 'gasolina' | 'diesel' | 'gás';
	preco: number;
	disponivel: boolean;
}

export interface Bomba {
	id: string;
	nome: string;
	endereco: string;
	latitude: number;
	longitude: number;
	combustiveis: Combustivel[];
	aberto: boolean;
	distancia?: number;
}

export interface BombaLocation {
	latitude: number;
	longitude: number;
}
