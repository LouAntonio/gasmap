import { create } from 'zustand';
import { Bomba } from '../types/bomba';

interface BombaStore {
	bombas: Bomba[];
	bombaSelecionada: Bomba | null;
	setBombaSelecionada: (bomba: Bomba | null) => void;
}

const mockBombas: Bomba[] = [
	{
		id: '1',
		nome: 'Shell Kilamba',
		endereco: 'Urbanização Kilamba, Luanda',
		latitude: -8.923,
		longitude: 13.289,
		combustiveis: [
			{ tipo: 'gasolina', preco: 1050, disponivel: true },
			{ tipo: 'diesel', preco: 850, disponivel: true },
			{ tipo: 'gás', preco: 550, disponivel: false },
		],
		aberto: true,
	},
	{
		id: '2',
		nome: 'Petrogal Talatona',
		endereco: 'Talatona, Luanda',
		latitude: -8.914,
		longitude: 13.295,
		combustiveis: [
			{ tipo: 'gasolina', preco: 1045, disponivel: true },
			{ tipo: 'diesel', preco: 845, disponivel: false },
			{ tipo: 'gás', preco: 545, disponivel: true },
		],
		aberto: true,
	},
	{
		id: '3',
		nome: 'Total Mutamba',
		endereco: 'Av. Mutamba, Luanda',
		latitude: -8.89,
		longitude: 13.26,
		combustiveis: [
			{ tipo: 'gasolina', preco: 1035, disponivel: true },
			{ tipo: 'diesel', preco: 835, disponivel: true },
			{ tipo: 'gás', preco: 535, disponivel: true },
		],
		aberto: true,
	},
	{
		id: '4',
		nome: 'BP Benfica',
		endereco: 'Benfica, Luanda',
		latitude: -8.88,
		longitude: 13.24,
		combustiveis: [
			{ tipo: 'gasolina', preco: 1025, disponivel: false },
			{ tipo: 'diesel', preco: 825, disponivel: false },
			{ tipo: 'gás', preco: 525, disponivel: false },
		],
		aberto: false,
	},
	{
		id: '5',
		nome: 'Sonangol Maculusso',
		endereco: 'Rua do Maculusso, Luanda',
		latitude: -8.91,
		longitude: 13.27,
		combustiveis: [
			{ tipo: 'gasolina', preco: 1040, disponivel: true },
			{ tipo: 'diesel', preco: 840, disponivel: true },
			{ tipo: 'gás', preco: 540, disponivel: false },
		],
		aberto: true,
	},
	{
		id: '6',
		nome: 'Shell Cazenga',
		endereco: 'Cazenga, Luanda',
		latitude: -8.87,
		longitude: 13.25,
		combustiveis: [
			{ tipo: 'gasolina', preco: 1060, disponivel: true },
			{ tipo: 'diesel', preco: 860, disponivel: false },
			{ tipo: 'gás', preco: 560, disponivel: true },
		],
		aberto: true,
	},
	{
		id: '7',
		nome: 'Pumangol Cacuaco',
		endereco: 'Cacuaco, Luanda',
		latitude: -8.85,
		longitude: 13.23,
		combustiveis: [
			{ tipo: 'gasolina', preco: 1055, disponivel: true },
			{ tipo: 'diesel', preco: 855, disponivel: true },
			{ tipo: 'gás', preco: 555, disponivel: true },
		],
		aberto: true,
	},
	{
		id: '8',
		nome: 'Total Sambizanga',
		endereco: 'Sambizanga, Luanda',
		latitude: -8.9,
		longitude: 13.245,
		combustiveis: [
			{ tipo: 'gasolina', preco: 1042, disponivel: false },
			{ tipo: 'diesel', preco: 842, disponivel: true },
			{ tipo: 'gás', preco: 542, disponivel: true },
		],
		aberto: true,
	},
	{
		id: '9',
		nome: 'Shell Kinan',
		endereco: 'Kinan, Luanda',
		latitude: -8.935,
		longitude: 13.275,
		combustiveis: [
			{ tipo: 'gasolina', preco: 1065, disponivel: true },
			{ tipo: 'diesel', preco: 865, disponivel: true },
			{ tipo: 'gás', preco: 565, disponivel: true },
		],
		aberto: true,
	},
	{
		id: '10',
		nome: 'Sonangol Castelanos',
		endereco: 'Castelanos, Luanda',
		latitude: -8.865,
		longitude: 13.23,
		combustiveis: [
			{ tipo: 'gasolina', preco: 1058, disponivel: true },
			{ tipo: 'diesel', preco: 858, disponivel: true },
			{ tipo: 'gás', preco: 558, disponivel: false },
		],
		aberto: true,
	},
];

export const useBombaStore = create<BombaStore>((set) => ({
	bombas: mockBombas,
	bombaSelecionada: null,
	setBombaSelecionada: (bomba) => set({ bombaSelecionada: bomba }),
}));
