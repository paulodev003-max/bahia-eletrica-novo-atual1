import { supabase } from './supabaseClient';
import { Product, Service, Customer, Budget, Expense, UserProfile, OrderItem, Order, Appointment, Project, KanbanColumn, UserSettings } from '../types';

export const SupabaseService = {
    // --- Auth ---
    async login(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data.user;
    },

    async signUp(email: string, password: string, name: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });
        if (error) throw error;

        // Also create/update profile
        if (data.user) {
            await this.saveUser({
                id: data.user.id,
                name: name,
                email: email,
                role: 'Usuário'
            });
        }
        return data.user;
    },

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getCurrentUser() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        // Fetch profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profile) return profile;

        // Fallback if no profile exists but auth user does (shouldn't happen with signUp above)
        return {
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email,
            email: session.user.email!,
            role: 'Usuário'
        };
    },

    // --- Products ---
    async getProducts(): Promise<Product[]> {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        return data.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            stock: item.stock || 0,
            minStock: item.min_stock || 0,
            cost: item.cost || 0,
            price: item.price || 0,
            supplier: item.supplier || '',
            entryDate: item.entry_date || new Date().toISOString(),
            lastUpdated: item.last_updated || new Date().toISOString(),
            batch: item.batch || undefined,
            expiryDate: item.expiry_date || undefined,
            image: item.image || undefined,
            observation: item.observation || undefined
        }));
    },

    async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
        const { data, error } = await supabase.from('products').insert({
            name: product.name,
            category: product.category,
            stock: product.stock,
            min_stock: product.minStock,
            cost: product.cost,
            price: product.price,
            supplier: product.supplier || null,
            entry_date: product.entryDate || null,
            batch: product.batch || null,
            expiry_date: product.expiryDate || null,
            image: product.image || null,
            observation: product.observation || null
        }).select().single();
        if (error) throw error;
        return { ...product, id: data.id, lastUpdated: data.last_updated || new Date().toISOString() };
    },

    async updateProduct(product: Product): Promise<void> {
        const { error } = await supabase.from('products').update({
            name: product.name,
            category: product.category,
            stock: product.stock,
            min_stock: product.minStock,
            cost: product.cost,
            price: product.price,
            supplier: product.supplier || null,
            entry_date: product.entryDate || null,
            batch: product.batch || null,
            expiry_date: product.expiryDate || null,
            image: product.image || null,
            observation: product.observation || null,
            last_updated: new Date().toISOString()
        }).eq('id', product.id);
        if (error) throw error;
    },

    async deleteProduct(id: string): Promise<void> {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Services ---
    async getServices(): Promise<Service[]> {
        const { data, error } = await supabase.from('services').select('*');
        if (error) throw error;
        return data.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.price || 0,
            cost: item.cost || 0,
            description: item.description || '',
            estimatedHours: item.estimated_hours || 0,
            active: item.active || true
        }));
    },

    async updateService(service: Service): Promise<void> {
        const { error } = await supabase.from('services').update({
            name: service.name,
            category: service.category,
            price: service.price,
            cost: service.cost || 0,
            description: service.description || null,
            estimated_hours: service.estimatedHours || null,
            active: service.active ?? true
        }).eq('id', service.id);
        if (error) throw error;
    },

    async addService(service: Omit<Service, 'id'>): Promise<Service> {
        const { data, error } = await supabase.from('services').insert({
            name: service.name,
            category: service.category,
            price: service.price,
            cost: service.cost || 0,
            description: service.description || null,
            estimated_hours: service.estimatedHours || null,
            active: service.active ?? true
        }).select().single();
        if (error) throw error;
        return { ...service, id: data.id };
    },

    async deleteService(id: string): Promise<void> {
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Expenses ---
    async getExpenses(): Promise<Expense[]> {
        const { data, error } = await supabase.from('expenses').select('*');
        if (error) throw error;
        return data.map(e => ({
            id: e.id,
            description: e.description,
            amount: e.amount,
            date: e.date,
            category: e.category,
            paymentMethod: e.payment_method || '',
            notes: e.notes || undefined
        }));
    },

    async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
        const { data, error } = await supabase.from('expenses').insert({
            description: expense.description,
            amount: expense.amount,
            date: expense.date,
            category: expense.category,
            payment_method: expense.paymentMethod,
            notes: expense.notes
        }).select().single();
        if (error) throw error;
        return { ...expense, id: data.id };
    },

    async updateExpense(expense: Expense): Promise<void> {
        const { error } = await supabase.from('expenses').update({
            description: expense.description,
            amount: expense.amount,
            date: expense.date,
            category: expense.category,
            payment_method: expense.paymentMethod,
            notes: expense.notes
        }).eq('id', expense.id);
        if (error) throw error;
    },

    async deleteExpense(id: string): Promise<void> {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Kanban / Projects ---
    async getKanbanColumns(): Promise<KanbanColumn[]> {
        const { data, error } = await supabase.from('kanban_columns').select('*').order('order');
        if (error) throw error;
        if (data.length === 0) return []; // Should seed this
        return data.map(c => ({
            id: c.id,
            title: c.title,
            color: c.color
        }));
    },

    async getProjects(): Promise<Project[]> {
        const { data, error } = await supabase.from('projects').select('*');
        if (error) throw error;
        return data.map(p => ({
            id: p.id,
            title: p.title,
            customerName: p.customer_name || '',
            status: p.status, // Column ID
            priority: (p.priority as 'low' | 'medium' | 'high') || 'medium',
            deadline: p.deadline || undefined,
            description: p.description || undefined,
            responsible: p.responsible || undefined
        }));
    },

    // ... (Add save/update methods for projects/columns if needed, likely just local state in Mock but User wants DB)
    // For brevity, assuming read-only/seed for now or basic mutations


    // --- Customers ---
    async getCustomers(): Promise<Customer[]> {
        const { data, error } = await supabase.from('customers').select('*');
        if (error) throw error;
        // In a real app we would load orders too, but for list view we might skip or load separately
        return data.map(item => ({
            id: item.id,
            name: item.name,
            company: item.company || undefined,
            email: item.email || '',
            phone: item.phone || '',
            document: item.document || undefined,
            address: item.address || undefined,
            createdAt: item.created_at || new Date().toISOString(),
            orders: [] // Loaded separately if needed
        }));
    },

    async addCustomer(customer: Omit<Customer, 'id' | 'orders' | 'createdAt'>): Promise<Customer> {
        const { data, error } = await supabase.from('customers').insert({
            name: customer.name,
            company: customer.company,
            email: customer.email,
            phone: customer.phone,
            document: customer.document,
            address: customer.address
        }).select().single();
        if (error) throw error;
        return { ...customer, id: data.id, createdAt: data.created_at || new Date().toISOString(), orders: [] };
    },

    async updateCustomer(customer: Customer): Promise<void> {
        const { error } = await supabase.from('customers').update({
            name: customer.name,
            company: customer.company,
            email: customer.email,
            phone: customer.phone,
            document: customer.document,
            address: customer.address
        }).eq('id', customer.id);
        if (error) throw error;
    },

    async deleteCustomer(id: string): Promise<void> {
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Orders ---
    async getOrdersForCustomer(customerId: string): Promise<Order[]> {
        const { data: orders, error } = await supabase.from('orders')
            .select(`*, items:order_items(*)`)
            .eq('customer_id', customerId)
            .order('date', { ascending: false });
        if (error) throw error;

        return orders.map(o => ({
            id: o.id,
            date: o.date,
            status: o.status as 'completed' | 'pending' | 'cancelled',
            items: o.items.map((i: any) => ({
                itemId: i.item_id || '',
                name: i.name,
                type: i.type as 'product' | 'service',
                quantity: i.quantity,
                unitPrice: i.unit_price,
                total: i.total
            })),
            totalValue: parseFloat(o.total_value) || 0
        }));
    },

    async addOrder(customerId: string, order: Omit<Order, 'id'>, discounts?: { discountValue: number; discountPercent: number; surchargeValue: number; surchargePercent: number }): Promise<Order> {
        const { data: savedOrder, error: orderError } = await supabase.from('orders').insert({
            customer_id: customerId,
            date: order.date,
            status: order.status,
            total_value: order.totalValue,
            discount_value: discounts?.discountValue || 0,
            discount_percent: discounts?.discountPercent || 0,
            surcharge_value: discounts?.surchargeValue || 0,
            surcharge_percent: discounts?.surchargePercent || 0
        }).select().single();

        if (orderError) throw orderError;

        // Insert order items
        const itemsData = order.items.map(item => ({
            order_id: savedOrder.id,
            item_id: item.itemId,
            name: item.name,
            type: item.type,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total: item.total
        }));

        if (itemsData.length > 0) {
            const { error: itemsError } = await supabase.from('order_items').insert(itemsData);
            if (itemsError) throw itemsError;
        }

        return { ...order, id: savedOrder.id };
    },

    async deleteOrder(orderId: string): Promise<void> {
        // Items are deleted automatically via CASCADE
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (error) throw error;
    },

    async getBudgets(): Promise<Budget[]> {
        const { data: budgets, error } = await supabase.from('budgets').select(`
            *,
            items:budget_items(*)
        `);
        if (error) throw error;

        return budgets.map((b: any) => ({
            id: b.id,
            customerId: b.customer_id || undefined,
            customerName: b.customer_name,
            customerEmail: b.customer_email || undefined,
            customerPhone: b.customer_phone || undefined,
            customerAddress: b.customer_address || undefined,
            date: b.date,
            validityDate: b.validity_date || '',
            status: b.status as any,
            totalValue: b.total_value,
            notes: b.notes || undefined,
            warrantyNotes: b.warranty_notes || undefined,
            paymentTerms: b.payment_terms || undefined,
            paymentMethod: b.payment_method || undefined,
            discount: b.discount || 0,
            signature: b.signature || undefined,
            items: (b.items || []).map((i: any) => ({
                itemId: i.item_id || '',
                name: i.name,
                type: i.type as 'product' | 'service',
                quantity: i.quantity,
                unitPrice: i.unit_price,
                total: i.total
            }))
        }));
    },

    async saveBudget(budget: Budget): Promise<Budget> {
        // Upsert Budget
        const budgetData = {
            id: budget.id.length < 10 ? undefined : budget.id,
            customer_id: budget.customerId,
            customer_name: budget.customerName,
            customer_email: budget.customerEmail,
            customer_phone: budget.customerPhone,
            customer_address: budget.customerAddress,
            date: budget.date,
            validity_date: budget.validityDate,
            status: budget.status,
            total_value: budget.totalValue,
            notes: budget.notes,
            warranty_notes: budget.warrantyNotes,
            payment_terms: budget.paymentTerms,
            payment_method: budget.paymentMethod,
            discount: budget.discount,
            signature: budget.signature
        };

        const { data: savedBudget, error: budgetError } = await supabase
            .from('budgets')
            .upsert(budget.id.length < 10 ? { ...budgetData, id: undefined } : budgetData) // Remove ID if it's mock
            .select()
            .single();

        if (budgetError) throw budgetError;

        // Delete existing items
        await supabase.from('budget_items').delete().eq('budget_id', savedBudget.id);

        // Insert new items
        const itemsData = budget.items.map(item => ({
            budget_id: savedBudget.id,
            item_id: item.itemId,
            name: item.name,
            type: item.type,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total: item.total
        }));

        if (itemsData.length > 0) {
            const { error: itemsError } = await supabase.from('budget_items').insert(itemsData);
            if (itemsError) throw itemsError;
        }

        return { ...budget, id: savedBudget.id };
    },

    async addBudget(budget: Budget): Promise<Budget> {
        return this.saveBudget(budget);
    },

    async updateBudget(budget: Budget): Promise<Budget> {
        return this.saveBudget(budget);
    },

    async deleteBudget(id: string): Promise<void> {
        // Delete items first due to foreign key constraint
        await supabase.from('budget_items').delete().eq('budget_id', id);
        const { error } = await supabase.from('budgets').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Users ---
    async getUsers(): Promise<UserProfile[]> {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        return data.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            picture: u.picture || '',
            role: u.role || 'Usuário'
        }));
    },

    async saveUser(user: UserProfile): Promise<void> {
        const { error } = await supabase.from('profiles').upsert({
            id: user.id || crypto.randomUUID(),
            name: user.name,
            email: user.email,
            picture: user.picture,
            role: user.role
        });
        if (error) throw error;
    },

    async deleteUser(id: string): Promise<void> {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Appointments ---
    async getAppointments(): Promise<Appointment[]> {
        const { data, error } = await supabase.from('appointments').select('*').order('date', { ascending: true });
        if (error) throw error;
        return data.map(a => ({
            id: a.id,
            title: a.title,
            customerId: a.customer_id || undefined,
            customerName: a.customer_name || '',
            date: a.date,
            time: a.time || '09:00',
            duration: a.duration || 60,
            status: a.status as any,
            description: a.description || undefined,
            responsible: a.responsible || '',
            location: a.location || undefined
        }));
    },

    async addAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
        const { data, error } = await supabase.from('appointments').insert({
            title: appointment.title,
            customer_id: appointment.customerId,
            customer_name: appointment.customerName,
            date: appointment.date,
            time: appointment.time,
            duration: appointment.duration,
            status: appointment.status,
            description: appointment.description,
            responsible: appointment.responsible,
            location: appointment.location
        }).select().single();
        if (error) throw error;
        return { ...appointment, id: data.id };
    },

    async updateAppointment(appointment: Appointment): Promise<void> {
        const { error } = await supabase.from('appointments').update({
            title: appointment.title,
            customer_id: appointment.customerId,
            customer_name: appointment.customerName,
            date: appointment.date,
            time: appointment.time,
            duration: appointment.duration,
            status: appointment.status,
            description: appointment.description,
            responsible: appointment.responsible,
            location: appointment.location
        }).eq('id', appointment.id);
        if (error) throw error;
    },

    async deleteAppointment(id: string): Promise<void> {
        const { error } = await supabase.from('appointments').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Projects (Kanban) ---
    async addProject(project: Omit<Project, 'id'>): Promise<Project> {
        const { data, error } = await supabase.from('projects').insert({
            title: project.title,
            customer_name: project.customerName,
            status: project.status,
            priority: project.priority,
            deadline: project.deadline,
            description: project.description,
            responsible: project.responsible
        }).select().single();
        if (error) throw error;
        return { ...project, id: data.id };
    },

    async updateProject(project: Project): Promise<void> {
        const { error } = await supabase.from('projects').update({
            title: project.title,
            customer_name: project.customerName,
            status: project.status,
            priority: project.priority,
            deadline: project.deadline,
            description: project.description,
            responsible: project.responsible
        }).eq('id', project.id);
        if (error) throw error;
    },

    async deleteProject(id: string): Promise<void> {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Kanban Columns ---
    async addKanbanColumn(column: Omit<KanbanColumn, 'id'>): Promise<KanbanColumn> {
        const { data, error } = await supabase.from('kanban_columns').insert({
            title: column.title,
            color: column.color
        }).select().single();
        if (error) throw error;
        return { ...column, id: data.id };
    },

    async updateKanbanColumn(column: KanbanColumn): Promise<void> {
        const { error } = await supabase.from('kanban_columns').update({
            title: column.title,
            color: column.color
        }).eq('id', column.id);
        if (error) throw error;
    },

    async deleteKanbanColumn(id: string): Promise<void> {
        const { error } = await supabase.from('kanban_columns').delete().eq('id', id);
        if (error) throw error;
    }
};

