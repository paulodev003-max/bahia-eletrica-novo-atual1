import { SupabaseService } from './SupabaseService';
import { INITIAL_PRODUCTS, INITIAL_SERVICES, INITIAL_CUSTOMERS, INITIAL_USERS } from '../data/mockData';

export const seedDatabase = async () => {
    console.log('Starting seed...');

    // Check if data exists
    const products = await SupabaseService.getProducts();
    if (products.length === 0) {
        console.log('Seeding Products...');
        for (const p of INITIAL_PRODUCTS) {
            await SupabaseService.addProduct(p);
        }
    }

    const services = await SupabaseService.getServices();
    if (services.length === 0) {
        console.log('Seeding Services...');
        for (const s of INITIAL_SERVICES) {
            // Strip ID for new insert
            const { id, ...serviceData } = s;
            await SupabaseService.addService(serviceData);
        }
    }

    const customers = await SupabaseService.getCustomers();
    if (customers.length === 0) {
        console.log('Seeding Customers...');
        for (const c of INITIAL_CUSTOMERS) {
            await SupabaseService.addCustomer(c);
        }
    }

    const users = await SupabaseService.getUsers();
    if (users.length === 0) {
        console.log('Seeding Users...');
        for (const u of INITIAL_USERS) {
            await SupabaseService.saveUser(u);
        }
    }

    console.log('Seed complete.');
};
