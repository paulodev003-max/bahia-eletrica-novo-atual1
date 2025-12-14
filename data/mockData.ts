import { Product, Category, Service, ServiceCategory, Customer, Appointment, KanbanColumn, UserProfile } from '../types';
import { addDays, subDays, format } from '../utils/dateUtils';

export const INITIAL_USERS: UserProfile[] = [
    {
        id: '1',
        name: 'Convidado (Admin)',
        email: 'admin@bahia.com',
        picture: '',
        role: 'Administrador'
    }
];

export const INITIAL_PRODUCTS: Product[] = [
    { id: '5', name: 'Multímetro Digital True RMS', category: Category.FERRAMENTAS, stock: 15, minStock: 5, cost: 120.00, price: 249.90, supplier: 'Minipa', lastUpdated: '2023-10-12', entryDate: '2023-04-01' },
    { id: '6', name: 'Lâmpada LED Industrial High Bay 100W', category: Category.ILUMINACAO, stock: 20, minStock: 8, cost: 180.00, price: 320.00, supplier: 'Avant', lastUpdated: '2023-10-14', entryDate: '2023-04-10' },
    { id: '7', name: 'Fonte Chaveada 24V 5A', category: Category.AUTOMACAO, stock: 2, minStock: 5, cost: 75.00, price: 120.00, supplier: 'Mean Well', lastUpdated: '2023-10-15', entryDate: '2023-04-20' },
];

export const INITIAL_SERVICES: Service[] = [
    {
        id: '1',
        name: 'Instalação de Inversor de Frequência (até 10cv)',
        category: ServiceCategory.INSTALACAO,
        price: 450.00,
        cost: 150.00,
        estimatedHours: 3,
        description: 'Fixação, conexão elétrica e parametrização básica.',
        active: true,
        priceHistory: [
            { date: '2023-01-15', price: 380.00 },
            { date: '2023-06-20', price: 420.00 },
            { date: '2023-10-25', price: 450.00 }
        ]
    },
    {
        id: '2',
        name: 'Visita Técnica e Diagnóstico',
        category: ServiceCategory.MANUTENCAO,
        price: 180.00,
        cost: 80.00,
        estimatedHours: 1.5,
        description: 'Deslocamento e até 1h de análise técnica no local.',
        active: true,
        priceHistory: [
            { date: '2023-02-10', price: 150.00 },
            { date: '2023-08-05', price: 180.00 }
        ]
    },
    { id: '3', name: 'Programação de CLP (Hora Técnica)', category: ServiceCategory.AUTOMACAO_SERV, price: 250.00, cost: 100.00, estimatedHours: 1, description: 'Desenvolvimento e ajuste de lógica ladder/estruturada.', active: true },
    { id: '4', name: 'Montagem de Painel de Comando (Pequeno)', category: ServiceCategory.INSTALACAO, price: 1200.00, cost: 600.00, estimatedHours: 8, description: 'Montagem mecânica e elétrica de quadro até 40x40cm.', active: true },
];

export const INITIAL_CUSTOMERS: Customer[] = [
    {
        id: '1', name: 'Indústria Química Beta', company: 'Beta Químicos Ltda', email: 'compras@beta.com', phone: '(71) 3333-4444',
        createdAt: '2023-01-20',
        orders: [
            { id: 'o1', date: '2023-09-15', status: 'completed', totalValue: 2400.00, items: [] }
        ]
    },
    { id: '2', name: 'João da Silva Eletricista', email: 'joao.eletro@gmail.com', phone: '(71) 99999-8888', createdAt: '2023-03-10', orders: [] },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
    { id: '1', title: 'Manutenção Preventiva QGBT', customerName: 'Indústria Química Beta', customerId: '1', date: format(new Date(), 'yyyy-MM-dd'), time: '09:00', duration: 120, status: 'pending', responsible: 'Técnico A', location: 'Planta Industrial' },
    { id: '2', title: 'Orçamento Automação', customerName: 'João da Silva', date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), time: '14:00', duration: 60, status: 'pending', responsible: 'Consultor' },
    { id: '3', title: 'Troca de Inversor', customerName: 'Fábrica de Papel Delta', date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), time: '10:00', duration: 180, status: 'completed', responsible: 'Técnico B' },
    { id: '4', title: 'Visita Técnica Urgente', customerName: 'Mercado Local', date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), time: '16:00', duration: 90, status: 'canceled', responsible: 'Técnico A' }
];

export const INITIAL_RESPONSIBLES = ['Técnico A', 'Técnico B', 'Consultor', 'Engenheiro Chefe'];

export const INITIAL_COLUMNS = [
    { id: 'waiting_parts', title: 'Aguardando Peças', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'bench_assembly', title: 'Montagem em Bancada', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { id: 'installation', title: 'Instalação no Cliente', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { id: 'testing', title: 'Testes/Comissionamento', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { id: 'finished', title: 'Finalizado', color: 'bg-green-100 text-green-800 border-green-200' }
];
