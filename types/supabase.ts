export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
            appointments: {
                Row: {
                    customer_id: string | null
                    customer_name: string
                    date: string
                    description: string | null
                    duration: number | null
                    id: string
                    location: string | null
                    responsible: string | null
                    status: string
                    time: string
                    title: string
                }
                Insert: {
                    customer_id?: string | null
                    customer_name: string
                    date: string
                    description?: string | null
                    duration?: number | null
                    id?: string
                    location?: string | null
                    responsible?: string | null
                    status: string
                    time: string
                    title: string
                }
                Update: {
                    customer_id?: string | null
                    customer_name?: string
                    date?: string
                    description?: string | null
                    duration?: number | null
                    id?: string
                    location?: string | null
                    responsible?: string | null
                    status?: string
                    time?: string
                    title?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "appointments_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            atualizar: {
                Row: {
                    created_at: string
                    id: number
                    numero: number | null
                }
                Insert: {
                    created_at?: string
                    id?: number
                    numero?: number | null
                }
                Update: {
                    created_at?: string
                    id?: number
                    numero?: number | null
                }
                Relationships: []
            }
            blog_posts: {
                Row: {
                    category: string | null
                    content: string
                    created_at: string | null
                    id: string
                    image_url: string | null
                    published_at: string | null
                    status: string
                    title: string
                    updated_at: string | null
                }
                Insert: {
                    category?: string | null
                    content: string
                    created_at?: string | null
                    id?: string
                    image_url?: string | null
                    published_at?: string | null
                    status?: string
                    title: string
                    updated_at?: string | null
                }
                Update: {
                    category?: string | null
                    content?: string
                    created_at?: string | null
                    id?: string
                    image_url?: string | null
                    published_at?: string | null
                    status?: string
                    title?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            budget_items: {
                Row: {
                    budget_id: string | null
                    id: string
                    item_id: string | null
                    name: string
                    quantity: number
                    total: number
                    type: string | null
                    unit_price: number
                }
                Insert: {
                    budget_id?: string | null
                    id?: string
                    item_id?: string | null
                    name: string
                    quantity: number
                    total: number
                    type?: string | null
                    unit_price: number
                }
                Update: {
                    budget_id?: string | null
                    id?: string
                    item_id?: string | null
                    name?: string
                    quantity?: number
                    total?: number
                    type?: string | null
                    unit_price?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "budget_items_budget_id_fkey"
                        columns: ["budget_id"]
                        isOneToOne: false
                        referencedRelation: "budgets"
                        referencedColumns: ["id"]
                    },
                ]
            }
            budgets: {
                Row: {
                    customer_id: string | null
                    customer_name: string
                    date: string
                    discount: number | null
                    id: string
                    notes: string | null
                    payment_method: string | null
                    payment_terms: string | null
                    signature: string | null
                    status: string
                    total_value: number
                    validity_date: string | null
                }
                Insert: {
                    customer_id?: string | null
                    customer_name: string
                    date: string
                    discount?: number | null
                    id?: string
                    notes?: string | null
                    payment_method?: string | null
                    payment_terms?: string | null
                    signature?: string | null
                    status: string
                    total_value: number
                    validity_date?: string | null
                }
                Update: {
                    customer_id?: string | null
                    customer_name?: string
                    date?: string
                    discount?: number | null
                    id?: string
                    notes?: string | null
                    payment_method?: string | null
                    payment_terms?: string | null
                    signature?: string | null
                    status?: string
                    total_value?: number
                    validity_date?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "budgets_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            client_logos: {
                Row: {
                    created_at: string | null
                    display_order: number | null
                    id: string
                    logo_url: string
                    name: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    display_order?: number | null
                    id?: string
                    logo_url: string
                    name: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    display_order?: number | null
                    id?: string
                    logo_url?: string
                    name?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            customers: {
                Row: {
                    address: string | null
                    company: string | null
                    created_at: string | null
                    document: string | null
                    email: string | null
                    id: string
                    name: string
                    phone: string | null
                }
                Insert: {
                    address?: string | null
                    company?: string | null
                    created_at?: string | null
                    document?: string | null
                    email?: string | null
                    id?: string
                    name: string
                    phone?: string | null
                }
                Update: {
                    address?: string | null
                    company?: string | null
                    created_at?: string | null
                    document?: string | null
                    email?: string | null
                    id?: string
                    name?: string
                    phone?: string | null
                }
                Relationships: []
            }
            documents: {
                Row: {
                    created_at: string | null
                    file_path: string | null
                    file_size: number | null
                    file_url: string
                    id: string
                    name: string
                    type: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    file_path?: string | null
                    file_size?: number | null
                    file_url: string
                    id?: string
                    name: string
                    type: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    file_path?: string | null
                    file_size?: number | null
                    file_url?: string
                    id?: string
                    name?: string
                    type?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            expenses: {
                Row: {
                    amount: number
                    category: string
                    date: string
                    description: string
                    id: string
                    notes: string | null
                    payment_method: string | null
                }
                Insert: {
                    amount: number
                    category: string
                    date: string
                    description: string
                    id?: string
                    notes?: string | null
                    payment_method?: string | null
                }
                Update: {
                    amount?: number
                    category?: string
                    date?: string
                    description?: string
                    id?: string
                    notes?: string | null
                    payment_method?: string | null
                }
                Relationships: []
            }
            integrations: {
                Row: {
                    api_key: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    is_enabled: boolean
                    name: string
                    tags: string[] | null
                    updated_at: string | null
                }
                Insert: {
                    api_key?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_enabled?: boolean
                    name: string
                    tags?: string[] | null
                    updated_at?: string | null
                }
                Update: {
                    api_key?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_enabled?: boolean
                    name?: string
                    tags?: string[] | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            kanban_columns: {
                Row: {
                    color: string
                    id: string
                    order: number | null
                    title: string
                }
                Insert: {
                    color: string
                    id?: string
                    order?: number | null
                    title: string
                }
                Update: {
                    color?: string
                    id?: string
                    order?: number | null
                    title?: string
                }
                Relationships: []
            }
            products: {
                Row: {
                    batch: string | null
                    category: string
                    cost: number | null
                    entry_date: string | null
                    expiry_date: string | null
                    id: string
                    image: string | null
                    last_updated: string | null
                    min_stock: number | null
                    name: string
                    observation: string | null
                    price: number | null
                    stock: number | null
                    supplier: string | null
                }
                Insert: {
                    batch?: string | null
                    category: string
                    cost?: number | null
                    entry_date?: string | null
                    expiry_date?: string | null
                    id?: string
                    image?: string | null
                    last_updated?: string | null
                    min_stock?: number | null
                    name: string
                    observation?: string | null
                    price?: number | null
                    stock?: number | null
                    supplier?: string | null
                }
                Update: {
                    batch?: string | null
                    category?: string
                    cost?: number | null
                    entry_date?: string | null
                    expiry_date?: string | null
                    id?: string
                    image?: string | null
                    last_updated?: string | null
                    min_stock?: number | null
                    name?: string
                    observation?: string | null
                    price?: number | null
                    stock?: number | null
                    supplier?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    email: string
                    id: string
                    name: string
                    picture: string | null
                    role: string | null
                }
                Insert: {
                    email: string
                    id: string
                    name: string
                    picture?: string | null
                    role?: string | null
                }
                Update: {
                    email?: string
                    id?: string
                    name?: string
                    picture?: string | null
                    role?: string | null
                }
                Relationships: []
            }
            projects: {
                Row: {
                    customer_name: string | null
                    deadline: string | null
                    description: string | null
                    id: string
                    priority: string | null
                    responsible: string | null
                    status: string
                    title: string
                }
                Insert: {
                    customer_name?: string | null
                    deadline?: string | null
                    description?: string | null
                    id?: string
                    priority?: string | null
                    responsible?: string | null
                    status: string
                    title: string
                }
                Update: {
                    customer_name?: string | null
                    deadline?: string | null
                    description?: string | null
                    id?: string
                    priority?: string | null
                    responsible?: string | null
                    status?: string
                    title?: string
                }
                Relationships: []
            }
            services: {
                Row: {
                    active: boolean | null
                    category: string
                    cost: number | null
                    description: string | null
                    estimated_hours: number | null
                    id: string
                    name: string
                    price: number | null
                }
                Insert: {
                    active?: boolean | null
                    category: string
                    cost?: number | null
                    description?: string | null
                    estimated_hours?: number | null
                    id?: string
                    name: string
                    price?: number | null
                }
                Update: {
                    active?: boolean | null
                    category?: string
                    cost?: number | null
                    description?: string | null
                    estimated_hours?: number | null
                    id?: string
                    name?: string
                    price?: number | null
                }
                Relationships: []
            }
            site_content: {
                Row: {
                    content_value: string | null
                    section_key: string
                }
                Insert: {
                    content_value?: string | null
                    section_key: string
                }
                Update: {
                    content_value?: string | null
                    section_key?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
