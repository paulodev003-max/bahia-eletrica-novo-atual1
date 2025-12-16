
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import PricingSimulator from './components/PricingSimulator';
import ServicesManager from './components/ServicesManager';
import CustomersManager from './components/CustomersManager';
import AgendaManager from './components/AgendaManager';
import BudgetsManager from './components/BudgetsManager';
import ExpensesManager from './components/ExpensesManager';
import SettingsManager from './components/SettingsManager';
import Sidebar from './components/Layout/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import LoginScreen from './components/Auth/LoginScreen';
import Header from './components/Layout/Header';
import { Product, Service, Customer, Appointment, UserProfile, View, Budget, Project, KanbanColumn, Expense, UserSettings } from './types';
import { INITIAL_PRODUCTS, INITIAL_SERVICES, INITIAL_CUSTOMERS, INITIAL_APPOINTMENTS, INITIAL_RESPONSIBLES, INITIAL_COLUMNS, INITIAL_USERS } from './data/mockData';

import { SupabaseService } from './services/SupabaseService';
import { supabase } from './services/supabaseClient';
import { seedDatabase } from './services/seeder';
import PWAInstallPrompt from './components/PWA/PWAInstallPrompt';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);

  // User Settings State
  const [userSettings, setUserSettings] = useState<UserSettings>({
    fullName: 'Consultor Comercial',
    role: 'Vendas',
    companyName: 'BAHIA ELÉTRICA & AUTOMAÇÃO',
    companyAddress: 'Rua Exemplo, 123 - Centro',
    companyCity: 'Salvador, BA, 40000-000',
    companyPhone: '(71) 99999-9999',
    companyEmail: 'contato@bahiaeletrica.com.br'
  });

  // State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [responsibles, setResponsibles] = useState<string[]>(INITIAL_RESPONSIBLES);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check for existing session first
        const currentUser = await SupabaseService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }

        // Try to seed (non-blocking error)
        try {
          await seedDatabase();
        } catch (seedError) {
          console.warn('Seed failed (non-critical):', seedError);
        }

        // Fetch all data in parallel with individual error handling
        const results = await Promise.allSettled([
          SupabaseService.getProducts(),
          SupabaseService.getServices(),
          SupabaseService.getCustomers(),
          SupabaseService.getUsers(),
          SupabaseService.getBudgets(),
          SupabaseService.getExpenses(),
          SupabaseService.getAppointments(),
          SupabaseService.getProjects(),
          SupabaseService.getKanbanColumns()
        ]);

        // Extract results, using empty arrays for failed requests
        const extractResult = <T,>(result: PromiseSettledResult<T[]>, fallback: T[] = []): T[] => {
          return result.status === 'fulfilled' ? result.value : fallback;
        };

        setProducts(extractResult(results[0] as PromiseSettledResult<any[]>));
        setServices(extractResult(results[1] as PromiseSettledResult<any[]>));
        setCustomers(extractResult(results[2] as PromiseSettledResult<any[]>));
        setUsers(extractResult(results[3] as PromiseSettledResult<any[]>));
        setBudgets(extractResult(results[4] as PromiseSettledResult<any[]>));
        setExpenses(extractResult(results[5] as PromiseSettledResult<any[]>));
        setAppointments(extractResult(results[6] as PromiseSettledResult<any[]>));
        setProjects(extractResult(results[7] as PromiseSettledResult<any[]>));

        const fetchedColumns = extractResult(results[8] as PromiseSettledResult<any[]>);
        if (fetchedColumns.length > 0) {
          setColumns(fetchedColumns);
        } else {
          setColumns(INITIAL_COLUMNS);
        }

      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const currentUser = await SupabaseService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = (userProfile: UserProfile) => {
    setUser(userProfile);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await SupabaseService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleStockUpdate = (productId: string, quantity: number) => {
    setProducts(products.map(p =>
      p.id === productId ? { ...p, stock: p.stock - quantity } : p
    ));
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header
          user={user}
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          currentView={currentView}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onLogout={handleLogout}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <div className="animate-fade-in h-full">
              {currentView === View.DASHBOARD && <Dashboard products={products} services={services} customers={customers} appointments={appointments} expenses={expenses} />}
              {currentView === View.INVENTORY && <Inventory products={products} setProducts={setProducts} />}
              {currentView === View.SERVICES && <ServicesManager services={services} setServices={setServices} />}
              {currentView === View.CUSTOMERS && <CustomersManager customers={customers} setCustomers={setCustomers} products={products} services={services} updateStock={handleStockUpdate} />}
              {currentView === View.BUDGETS && <BudgetsManager budgets={budgets} setBudgets={setBudgets} customers={customers} setCustomers={setCustomers} products={products} services={services} updateStock={handleStockUpdate} userSettings={userSettings} />}
              {currentView === View.AGENDA && <AgendaManager appointments={appointments} setAppointments={setAppointments} customers={customers} responsibles={responsibles} setResponsibles={setResponsibles} />}
              {currentView === View.KANBAN && <KanbanBoard projects={projects} setProjects={setProjects} columns={columns} setColumns={setColumns} />}
              {currentView === View.EXPENSES && <ExpensesManager expenses={expenses} setExpenses={setExpenses} />}
              {currentView === View.SIMULATOR && <PricingSimulator products={products} services={services} />}
              {currentView === View.SETTINGS && <SettingsManager settings={userSettings} onSave={setUserSettings} users={users} setUsers={setUsers} />}
            </div>
          </div>
        </div>
      </main>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}

export default App;
