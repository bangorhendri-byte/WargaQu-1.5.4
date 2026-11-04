export type TableStatus = 'kosong' | 'terisi' | 'menunggu_bayar';

export interface TableItem {
  id: string;
  name: string;
  number: number;
  status: TableStatus;
  orderId?: string;
  customerName?: string;
  pax?: number;
  totalAmount?: number;
  itemsCount?: number;
  openedAt?: string;
  positionIndex: number;
}

export type MenuCategory = 'bakso_kuah' | 'pelengkap' | 'minuman' | 'paket';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
}

export interface OrderItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export type OrderType = 'meja' | 'bungkus';

export type PaymentMethod = 'tunai' | 'qris';

export interface Order {
  id: string;
  receiptNumber: string;
  type: OrderType;
  tableId?: string;
  tableName?: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'draft' | 'saved' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  cashAmount?: number;
  changeAmount?: number;
}

export interface Ingredient {
  id: string;
  name: string;
  initialQty: number;
  unit: 'kg' | 'gr' | 'pcs' | 'liter' | 'ikat' | 'pack';
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  updatedAt: string;
}

export interface RestaurantProfile {
  name: string;
  slogan: string;
  address: string;
  phone: string;
  receiptHeader: string;
  receiptFooter: string;
  currency: string;
}

export interface PrinterConfig {
  paperSize: '58mm' | '80mm';
  autoPrintKitchen: boolean;
  autoPrintReceipt: boolean;
  connectedDeviceName?: string;
  isSimulator: boolean;
}

// ==========================================
// MODULARQU (USAHAQU POS MODULAR) TYPES
// ==========================================
export interface ModularProduct {
  id: string;
  name: string;
  category: string;
  cost: number;
  price: number;
  stock: number;
}

export interface ModularCartItem {
  id: string;
  name: string;
  price: number;
  cost: number;
  qty: number;
}

export interface ModularExpense {
  id: string;
  desc: string;
  amount: number;
  category: 'Bahan Baku' | 'Operasional' | 'Gaji & Perawatan' | 'Lainnya' | string;
  date: string;
}

export interface ModularTransaction {
  id: string;
  date: string;
  items: ModularCartItem[];
  total: number;
  totalCost: number;
  payAmount: number;
  change: number;
  payMethod: 'Tunai' | 'QRIS / Transfer' | 'Tempo / Utang' | string;
  note: string;
}

export interface ModularProfile {
  bizName: string;
  bizType: string;
  address: string;
  phone: string;
  footer: string;
}

// ==========================================
// PUSAT BANTUAN & SMART CARE TICKET TYPES
// ==========================================
export interface SupportTicket {
  id: string;
  time: string;
  complaint: string;
  device: string;
  severity: 'High Severity' | 'Medium' | 'Low' | 'Auto Analyzed';
  status: 'open' | 'resolved';
  module: string;
  detectedError: string;
  prompt: string;
}

// ==========================================
// LELUHURQU / SILSILAHQU (ORBITQU 7 GENERASI)
// ==========================================
export type TrahType = 'TRAH1' | 'TRAH2' | 'TRAH3' | 'TRAH4';

export interface FamilyNode {
  id: string;
  name: string;
  title?: string;
  level: number; // 0 (Uyut) to 6 (Cicit)
  trah: TrahType;
  parentId: string | null;
  photo?: string;
  claimed?: boolean;
  phone?: string;
  city?: string;
  birthYear?: string;
  passedYear?: string;
  isDeceased?: boolean;
  bio?: string;
  manualX?: number;
  manualY?: number;
  customColor?: string;
}

export type CanvasPaperSize = 'FIT' | 'A0' | 'A1' | 'A2' | 'A3' | 'A4';
export type FrameScaleSize = 'A4' | 'A5' | 'A6' | 'A7';
export type LayoutMode = 'organic_flow' | 'auto_orbit' | 'auto_tree' | 'manual';

export interface GenerationColors {
  level0: string; // Uyut (Leluhur Core)
  level1: string; // Kakek / Nenek
  level2: string; // Ayah / Ibu / Paman
  level3: string; // User & Pasangan (Poros)
  level4: string; // Anak
  level5: string; // Cucu
  level6: string; // Cicit
}


export interface FamilyPostComment {
  id: string;
  author: string;
  text: string;
  time: string;
}

export interface FamilyPost {
  id: string;
  authorName: string;
  authorTrah: TrahType;
  category: 'Pengumuman' | 'Syukuran' | 'Berita Duka' | 'Reuni' | 'Kabar Bahagia';
  targetTrah: 'ALL' | TrahType;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  hasLiked?: boolean;
  comments: FamilyPostComment[];
}


