import React, { useState } from 'react';
import { Customer, Order, OrderItem, Product, Service } from '../types';
import CustomerList from './Customers/CustomerList';
import CustomerForm from './Customers/CustomerForm';
import OrderManager from './Customers/OrderManager';
import CustomerDetails from './Customers/CustomerDetails';
import { SupabaseService } from '../services/SupabaseService';

interface CustomersManagerProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  products: Product[];
  services: Service[];
  updateStock: (productId: string, quantity: number) => void;
}

const CustomersManager: React.FC<CustomersManagerProps> = ({ customers, setCustomers, products, services, updateStock }) => {
  const [viewState, setViewState] = useState<'list' | 'form' | 'order' | 'details'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State (Customer)
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({
    name: '', company: '', email: '', phone: '', document: '', address: ''
  });

  // Form State (Order)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);

  // Item Selection State
  const [selectedItemType, setSelectedItemType] = useState<'product' | 'service'>('product');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  // Discount and Surcharge State
  const [discountValue, setDiscountValue] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [surchargeValue, setSurchargeValue] = useState(0);
  const [surchargePercent, setSurchargePercent] = useState(0);

  // --- Customer CRUD ---

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewState('details');
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerForm(customer);
    setViewState('form');
  };

  const handleNewCustomer = () => {
    setSelectedCustomer(null);
    setCustomerForm({ name: '', company: '', email: '', phone: '', document: '', address: '' });
    setViewState('form');
  };

  const saveCustomer = async () => {
    if (!customerForm.name) return;

    setIsSaving(true);
    try {
      if (selectedCustomer) {
        const updatedCustomer = { ...selectedCustomer, ...customerForm } as Customer;
        await SupabaseService.updateCustomer(updatedCustomer);
        setCustomers(customers.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
      } else {
        const newCustomer = await SupabaseService.addCustomer(customerForm as Omit<Customer, 'id' | 'orders' | 'createdAt'>);
        setCustomers([...customers, newCustomer]);
      }
      setViewState('list');
    } catch (error: any) {
      console.error('Error saving customer:', error);
      alert('Erro ao salvar cliente: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!window.confirm('Excluir este cliente e todo seu histórico?')) return;

    try {
      await SupabaseService.deleteCustomer(id);
      setCustomers(customers.filter(c => c.id !== id));
      if (viewState === 'details') setViewState('list');
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      alert('Erro ao excluir cliente: ' + error.message);
    }
  };

  // --- Order Logic ---

  const handleOpenOrder = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOrderItems([]);
    setOrderDate(new Date().toISOString().split('T')[0]);
    setDiscountValue(0);
    setDiscountPercent(0);
    setSurchargeValue(0);
    setSurchargePercent(0);
    setViewState('order');
  };

  const addItemToOrder = () => {
    if (!selectedItemId) return;

    let item: Product | Service | undefined;
    let price = 0;
    let name = '';

    if (selectedItemType === 'product') {
      item = products.find(p => p.id === selectedItemId);
      if (item) {
        // --- STOCK VALIDATION ---
        const currentInCart = orderItems
          .filter(i => i.itemId === item!.id)
          .reduce((acc, curr) => acc + curr.quantity, 0);

        const productItem = item as Product;
        if ((itemQuantity + currentInCart) > productItem.stock) {
          alert(`Estoque insuficiente! Disponível: ${productItem.stock}. \nNo carrinho: ${currentInCart}.\nTentativa de adicionar: ${itemQuantity}.`);
          return;
        }
        // ------------------------

        price = item.price;
        name = item.name;
      }
    } else {
      item = services.find(s => s.id === selectedItemId);
      if (item) {
        price = item.price;
        name = item.name;
      }
    }

    if (!item) return;

    const newItem: OrderItem = {
      itemId: selectedItemId,
      name,
      type: selectedItemType,
      quantity: itemQuantity,
      unitPrice: price,
      total: price * itemQuantity
    };

    setOrderItems([...orderItems, newItem]);
    setItemQuantity(1);
    setSelectedItemId('');
  };

  const removeOrderItem = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const saveOrder = async () => {
    if (!selectedCustomer || orderItems.length === 0) return;

    setIsSaving(true);
    try {
      const newOrder: Omit<Order, 'id'> = {
        date: orderDate,
        status: 'completed',
        items: orderItems,
        totalValue: orderTotal // Use calculated total with discounts/surcharges
      };

      // Save order to Supabase
      const savedOrder = await SupabaseService.addOrder(
        selectedCustomer.id,
        newOrder,
        { discountValue, discountPercent, surchargeValue, surchargePercent }
      );

      // Update Stock for products (Deduction Logic)
      orderItems.forEach(item => {
        if (item.type === 'product') {
          updateStock(item.itemId, item.quantity);
        }
      });

      // Update Customer with new order in local state
      const updatedCustomer = {
        ...selectedCustomer,
        orders: [savedOrder, ...selectedCustomer.orders]
      };

      setCustomers(customers.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
      setSelectedCustomer(updatedCustomer);
      setViewState('details');
    } catch (error: any) {
      console.error('Error saving order:', error);
      alert('Erro ao salvar pedido: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate order total with discounts and surcharges
  const subtotal = orderItems.reduce((acc, item) => acc + item.total, 0);
  const discountTotal = discountValue + (subtotal * discountPercent / 100);
  const surchargeTotal = surchargeValue + (subtotal * surchargePercent / 100);
  const orderTotal = subtotal - discountTotal + surchargeTotal;

  // --- RENDER ---

  if (viewState === 'details' && selectedCustomer) {
    return (
      <CustomerDetails
        customer={selectedCustomer}
        onBack={() => setViewState('list')}
        onEdit={() => handleEditCustomer(selectedCustomer)}
        onNewOrder={() => handleOpenOrder(selectedCustomer)}
      />
    );
  }

  if (viewState === 'form') {
    return (
      <CustomerForm
        customerForm={customerForm}
        setCustomerForm={setCustomerForm}
        saveCustomer={saveCustomer}
        onCancel={() => setViewState('list')}
        isEditing={!!selectedCustomer}
      />
    );
  }

  if (viewState === 'order') {
    return (
      <OrderManager
        selectedCustomer={selectedCustomer}
        orderItems={orderItems}
        orderDate={orderDate}
        setOrderDate={setOrderDate}
        selectedItemType={selectedItemType}
        setSelectedItemType={setSelectedItemType}
        selectedItemId={selectedItemId}
        setSelectedItemId={setSelectedItemId}
        itemQuantity={itemQuantity}
        setItemQuantity={setItemQuantity}
        products={products}
        services={services}
        addItemToOrder={addItemToOrder}
        removeOrderItem={removeOrderItem}
        saveOrder={saveOrder}
        onCancel={() => setViewState(selectedCustomer && viewState === 'order' ? 'details' : 'list')}
        subtotal={subtotal}
        orderTotal={orderTotal}
        discountValue={discountValue}
        setDiscountValue={setDiscountValue}
        discountPercent={discountPercent}
        setDiscountPercent={setDiscountPercent}
        surchargeValue={surchargeValue}
        setSurchargeValue={setSurchargeValue}
        surchargePercent={surchargePercent}
        setSurchargePercent={setSurchargePercent}
      />
    );
  }

  // --- LIST VIEW ---
  return (
    <CustomerList
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      filteredCustomers={filteredCustomers}
      handleNewCustomer={handleNewCustomer}
      handleViewDetails={handleViewDetails}
      handleEditCustomer={handleEditCustomer}
      deleteCustomer={deleteCustomer}
      handleOpenOrder={handleOpenOrder}
    />
  );
};

export default CustomersManager;
