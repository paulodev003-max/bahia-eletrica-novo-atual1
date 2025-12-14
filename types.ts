
export enum Category {
  MATERIAIS = 'Materiais Elétricos',
  AUTOMACAO = 'Automação Industrial',
  ILUMINACAO = 'Iluminação',
  FERRAMENTAS = 'Ferramentas',
  CABOS = 'Fios e Cabos',
  SEGURANCA = 'Segurança e EPI'
}

export enum ServiceCategory {
  INSTALACAO = 'Instalação Elétrica',
  MANUTENCAO = 'Manutenção Preventiva',
  PROJETOS = 'Projetos e Consultoria',
  AUTOMACAO_SERV = 'Programação e Automação',
  REPARO = 'Reparo de Equipamentos'
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  picture: string;
  role?: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category | string;
  stock: number;
  minStock: number; // For stock alerts
  cost: number;
  price: number;
  supplier: string;
  batch?: string;
  expiryDate?: string;
  entryDate: string;
  lastUpdated: string;
  image?: string;
  observation?: string;
}

export interface PriceHistoryItem {
  date: string;
  price: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'other';
  url: string; // Base64 data URI
  size: number;
  uploadedAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory | string;
  price: number;     // Selling price to customer
  cost: number;      // Internal cost (labor + overhead)
  description: string;
  estimatedHours: number;
  active: boolean;
  priceHistory?: PriceHistoryItem[];
  attachments?: Attachment[];
}

// --- Customer & Sales Types ---

export interface OrderItem {
  itemId: string;
  name: string;
  type: 'product' | 'service';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'completed' | 'canceled';
  items: OrderItem[];
  totalValue: number;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  document?: string; // CPF/CNPJ
  address?: string;
  orders: Order[];
  createdAt: string;
}

// --- Agenda Types ---

export type AppointmentStatus = 'pending' | 'in_progress' | 'completed' | 'canceled';

export interface Appointment {
  id: string;
  title: string;
  customerId?: string; // Optional link to existing customer
  customerName: string; // Fallback or direct name
  date: string; // ISO Date YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // in minutes
  status: AppointmentStatus;
  description?: string;
  responsible: string; // Technician/Employee name
  location?: string;
}

// --- Budget Types ---

export type BudgetStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'converted';

export interface Budget {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  date: string;
  validityDate: string;
  status: BudgetStatus;
  items: OrderItem[];
  totalValue: number;
  notes?: string;
  warrantyNotes?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  discount?: number;
  signature?: string;
}

// Mock Sales Data Structure for Projections
export interface MonthlyMetric {
  month: string;
  revenue: number;
  profit: number;
}

export interface SimulationResult {
  currentProfit: number;
  projectedProfit: number;
  difference: number;
  differencePercent: number;
}

export interface AiInsight {
  suggestedPrice: number;
  reasoning: string;
  confidence: 'High' | 'Medium' | 'Low';
  marketTrend: string;
}

export enum View {
  DASHBOARD = 'dashboard',
  INVENTORY = 'inventory',
  SERVICES = 'services',
  CUSTOMERS = 'customers',
  AGENDA = 'agenda',
  SIMULATOR = 'simulator',
  BUDGETS = 'budgets',
  KANBAN = 'kanban',
  EXPENSES = 'expenses',
  SETTINGS = 'settings'
}

export interface UserSettings {
  fullName: string;
  role: string;
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyPhone: string;
  companyEmail: string;
}

export enum ExpenseCategory {
  FUEL = 'Combustível',
  FOOD = 'Alimentação',
  TOOLS = 'Ferramentas',
  MAINTENANCE = 'Manutenção Veículos',
  MARKETING = 'Marketing',
  UTILITIES = 'Contas (Água/Luz/Internet)',
  OTHER = 'Outros'
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: ExpenseCategory | string;
  paymentMethod: string;
  notes?: string;
}

export type ProjectStatus = string;

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
}

export interface Project {
  id: string;
  title: string;
  customerName: string;
  status: ProjectStatus;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  description?: string;
  responsible?: string;
}
