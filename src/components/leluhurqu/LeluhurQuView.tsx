import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Disc,
  Sun,
  Moon,
  PlusCircle,
  ZoomIn,
  ZoomOut,
  Crosshair,
  GitFork,
  X,
  Sparkles,
  Save,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  Layers,
  Info,
  BarChart3,
  Search,
  UserCheck,
  Heart,
  MessageCircle,
  Send,
  MapPin,
  Phone,
  Edit3,
  ShieldCheck,
  RefreshCw,
  FileText,
  UserPlus,
  Users,
  Settings,
  SlidersHorizontal,
  Clock,
  ChevronRight,
  BookOpen,
  Filter,
  Printer,
  Move,
  Palette,
  Maximize2,
  FileCode
} from 'lucide-react';
import { generateTreeOfLifeSVG } from './TreeOfLifeSVG';
import {
  FamilyNode,
  TrahType,
  FamilyPost,
  FamilyPostComment,
  CanvasPaperSize,
  FrameScaleSize,
  LayoutMode,
  GenerationColors
} from '../../types';

interface LeluhurQuViewProps {
  onBackToMain: () => void;
  showNotification: (msg: string) => void;
}

type LeluhurTab = 'silsilahqu' | 'orbitqu' | 'medsos' | 'setting';
type SilsilahSubTab = 'dashboard' | 'list';

const GENERATION_NAMES = [
  'Level 0: Uyut (Leluhur Core)',
  'Level 1: Kakek / Nenek',
  'Level 2: Ayah / Ibu / Paman / Bibi / Uwa',
  'Level 3: User / Pasangan & Saudara (Poros Utama)',
  'Level 4: Anak',
  'Level 5: Cucu (Compact Gen Z)',
  'Level 6: Cicit (Compact Gen Alpha)'
];

const GENERATION_SHORT_NAMES = [
  'Level 0: Uyut',
  'Level 1: Kakek/Nenek',
  'Level 2: Orang Tua/Paman',
  'Level 3: User/Pasangan',
  'Level 4: Anak',
  'Level 5: Cucu',
  'Level 6: Cicit'
];

// Paper Size Configurations (in millimeters and standard print dimensions)
const PAPER_CONFIG: Record<CanvasPaperSize, { name: string; widthMm: number; heightMm: number; desc: string }> = {
  FIT: { name: 'Layar Penuh (Responsif)', widthMm: 0, heightMm: 0, desc: 'Kanvas fleksibel tanpa batas kertas' },
  A0: { name: 'A0 (841 × 1189 mm)', widthMm: 841, heightMm: 1189, desc: 'Bagan besar pameran / reuni akbar' },
  A1: { name: 'A1 (594 × 841 mm)', widthMm: 594, heightMm: 841, desc: 'Poster dinding format besar' },
  A2: { name: 'A2 (420 × 594 mm)', widthMm: 420, heightMm: 594, desc: 'Bagan silsilah keluarga sedang' },
  A3: { name: 'A3 (297 × 420 mm)', widthMm: 297, heightMm: 420, desc: 'Standar dokumen cetak keluarga' },
  A4: { name: 'A4 (210 × 297 mm)', widthMm: 210, heightMm: 297, desc: 'Lembar portabel dokumen resmi' }
};

// Photo Frame Scale Size Configurations (A4 to A7)
const FRAME_SCALE_CONFIG: Record<FrameScaleSize, { label: string; scale: number; desc: string }> = {
  A4: { label: 'Frame A4', scale: 1.55, desc: 'Ekstra Besar (High Detail Poster)' },
  A5: { label: 'Frame A5', scale: 1.25, desc: 'Besar (Proporsional Jelas)' },
  A6: { label: 'Frame A6', scale: 1.0, desc: 'Standar (Seimbang & Rapi)' },
  A7: { label: 'Frame A7', scale: 0.78, desc: 'Kompak (Hemat Ruang Banyak Simpul)' }
};

// Default Generation Colors (Uyut, Kakek, Ayah, User, Anak, Cucu, Cicit)
const DEFAULT_GENERATION_COLORS: GenerationColors = {
  level0: '#D97706', // Uyut: Emas Sesepuh
  level1: '#8B5CF6', // Kakek / Nenek: Ungu Ningrat Wibawa
  level2: '#2563EB', // Ayah / Ibu / Paman: Biru Royalti
  level3: '#EC4899', // User & Pasangan: Ruby Pink Poros Inti
  level4: '#10B981', // Anak: Zamrud Hijau Generasi Penerus
  level5: '#06B6D4', // Cucu: Cyan Cerah
  level6: '#F59E0B'  // Cicit: Kuning Hangat
};

/**
 * 4 Complete, Unmixed, and Balanced Trah Branches:
 * TRAH1: Garis Ayah User (Kuadran I - Merah)
 * TRAH2: Garis Ibu User (Kuadran II - Biru)
 * TRAH3: Garis Ayah Pasangan (Kuadran III - Hijau)
 * TRAH4: Garis Ibu Pasangan (Kuadran IV - Kuning)
 */
const INITIAL_FAMILY_DATA: FamilyNode[] = [
  // TRAH 1: GARIS AYAH USER
  {
    id: 'uyut_ayah',
    name: 'Kyai Sanusi',
    title: 'Uyut Sepuh Ayah',
    level: 0,
    trah: 'TRAH1',
    parentId: null,
    photo: '',
    claimed: false,
    city: 'Cirebon',
    birthYear: '1905',
    isDeceased: true,
    passedYear: '1984',
    bio: 'Tokoh sesepuh keluarga asal Cirebon, perintis silsilah trah Sanusi.'
  },
  {
    id: 'kakek_ayah',
    name: 'H. Baharuddin',
    title: 'Kakek dari Ayah',
    level: 1,
    trah: 'TRAH1',
    parentId: 'uyut_ayah',
    photo: '',
    claimed: false,
    city: 'Jakarta Timur',
    birthYear: '1934',
    isDeceased: true,
    passedYear: '2012',
    bio: 'Pensiunan pegawai negeri, gemar kumpul keluarga.'
  },
  {
    id: 'nenek_ayah',
    name: 'Hj. Maryam',
    title: 'Nenek dari Ayah',
    level: 1,
    trah: 'TRAH1',
    parentId: 'uyut_ayah',
    photo: '',
    claimed: false,
    city: 'Jakarta Timur',
    birthYear: '1938',
    isDeceased: true,
    passedYear: '2018',
    bio: 'Penuh kasih sayang kepada anak cucu.'
  },
  {
    id: 'ayah_user',
    name: 'Bpk. Hendra S.',
    title: 'Ayah Kandung',
    level: 2,
    trah: 'TRAH1',
    parentId: 'kakek_ayah',
    photo: '',
    claimed: true,
    city: 'Bekasi',
    phone: '081298765432',
    birthYear: '1962',
    isDeceased: false,
    bio: 'Pensiunan swasta, penggerak ronda malam dan paguyuban warga RT 03.'
  },
  {
    id: 'paman_user',
    name: 'Uwa Hamdan',
    title: 'Paman Sulung Ayah',
    level: 2,
    trah: 'TRAH1',
    parentId: 'kakek_ayah',
    photo: '',
    claimed: false,
    city: 'Bogor',
    phone: '081311223344',
    birthYear: '1959',
    isDeceased: false,
    bio: 'Pengusaha kuliner tradisional.'
  },
  {
    id: 'root_user',
    name: 'Hendriana',
    title: 'Poros Inti (User)',
    level: 3,
    trah: 'TRAH1',
    parentId: 'ayah_user',
    photo: '',
    claimed: true,
    city: 'Bekasi (RT 03 / RW 05)',
    phone: '081234567890',
    birthYear: '1988',
    isDeceased: false,
    bio: 'Pemilik akun WargaQu & pengelola silsilah keluarga besar OrbitQu.'
  },
  {
    id: 'saudara_user',
    name: 'Rian Pratama',
    title: 'Adik Kandung User',
    level: 3,
    trah: 'TRAH1',
    parentId: 'ayah_user',
    photo: '',
    claimed: false,
    city: 'Jakarta Selatan',
    phone: '081255667788',
    birthYear: '1994',
    isDeceased: false,
    bio: 'Bekerja di bidang desain digital.'
  },
  {
    id: 'anak_1',
    name: 'Alif Al-Fatih',
    title: 'Anak Pertama User',
    level: 4,
    trah: 'TRAH1',
    parentId: 'root_user',
    photo: '',
    claimed: true,
    city: 'Bekasi',
    birthYear: '2016',
    isDeceased: false,
    bio: 'Gemari membaca buku dan robotik.'
  },
  {
    id: 'anak_2',
    name: 'Zahra Humaira',
    title: 'Anak Kedua User',
    level: 4,
    trah: 'TRAH1',
    parentId: 'root_user',
    photo: '',
    claimed: true,
    city: 'Bekasi',
    birthYear: '2019',
    isDeceased: false,
    bio: 'Suka menggambar dan ceria.'
  },
  {
    id: 'cucu_1',
    name: 'Kenzho Rayyan',
    title: 'Cucu Laki-Laki',
    level: 5,
    trah: 'TRAH1',
    parentId: 'anak_1',
    photo: '',
    claimed: false,
    city: 'Bekasi',
    birthYear: '2024',
    isDeceased: false,
    bio: 'Generasi penerus cilik.'
  },
  {
    id: 'cucu_2',
    name: 'Ayudia Inara',
    title: 'Cucu Perempuan',
    level: 5,
    trah: 'TRAH1',
    parentId: 'anak_1',
    photo: '',
    claimed: false,
    city: 'Bekasi',
    birthYear: '2025',
    isDeceased: false,
    bio: 'Cucu kedua keluarga besar.'
  },
  {
    id: 'cicit_1',
    name: 'Baby Arshaka',
    title: 'Cicit Terkecil',
    level: 6,
    trah: 'TRAH1',
    parentId: 'cucu_1',
    photo: '',
    claimed: false,
    city: 'Bekasi',
    birthYear: '2026',
    isDeceased: false,
    bio: 'Generasi ke-7 garis keturunan Kyai Sanusi.'
  },

  // TRAH 2: GARIS IBU USER (Kuadran II - Biru)
  {
    id: 'uyut_ibu',
    name: 'Nyai Hj. Aminah',
    title: 'Uyut Sepuh Ibu',
    level: 0,
    trah: 'TRAH2',
    parentId: null,
    photo: '',
    claimed: false,
    city: 'Kuningan',
    birthYear: '1910',
    isDeceased: true,
    passedYear: '1990',
    bio: 'Sesepuh keluarga besar di Kuningan, Jawa Barat.'
  },
  {
    id: 'kakek_ibu',
    name: 'H. Syamsul Maarif',
    title: 'Kakek dari Ibu',
    level: 1,
    trah: 'TRAH2',
    parentId: 'uyut_ibu',
    photo: '',
    claimed: false,
    city: 'Bandung',
    birthYear: '1936',
    isDeceased: true,
    passedYear: '2015',
    bio: 'Pendidik dan guru mengaji teladan di Bandung.'
  },
  {
    id: 'nenek_ibu',
    name: 'Hj. Fatimah',
    title: 'Nenek dari Ibu',
    level: 1,
    trah: 'TRAH2',
    parentId: 'uyut_ibu',
    photo: '',
    claimed: false,
    city: 'Bandung',
    birthYear: '1940',
    isDeceased: false,
    bio: 'Nenek tercinta, pandai memasak resep Sunda legendaris.'
  },
  {
    id: 'ibu_user',
    name: 'Ibu Nurhayati',
    title: 'Ibu Kandung User',
    level: 2,
    trah: 'TRAH2',
    parentId: 'kakek_ibu',
    photo: '',
    claimed: true,
    city: 'Bekasi',
    phone: '081288990011',
    birthYear: '1965',
    isDeceased: false,
    bio: 'Ibu tercinta, aktif di pengajian majelis taklim.'
  },
  {
    id: 'bibi_ibu',
    name: 'Bibi Mardiah',
    title: 'Bibi dari Ibu',
    level: 2,
    trah: 'TRAH2',
    parentId: 'kakek_ibu',
    photo: '',
    claimed: false,
    city: 'Bandung',
    phone: '081377889900',
    birthYear: '1968',
    isDeceased: false,
    bio: 'Tinggal di Bandung, pengrajin rajut busana muslim.'
  },
  {
    id: 'sepupu_ibu',
    name: 'Fikri Haikal',
    title: 'Sepupu User (Trah Ibu)',
    level: 3,
    trah: 'TRAH2',
    parentId: 'bibi_ibu',
    photo: '',
    claimed: false,
    city: 'Bandung',
    phone: '081233445566',
    birthYear: '1992',
    isDeceased: false,
    bio: 'Arsitek muda di Kota Bandung.'
  },
  {
    id: 'keponakan_ibu',
    name: 'Salma Haura',
    title: 'Keponakan Trah Ibu',
    level: 4,
    trah: 'TRAH2',
    parentId: 'sepupu_ibu',
    photo: '',
    claimed: false,
    city: 'Bandung',
    birthYear: '2021',
    isDeceased: false,
    bio: 'Anak perempuan lucu keturunan Nyai Aminah.'
  },

  // TRAH 3: GARIS AYAH PASANGAN (Kuadran III - Hijau)
  {
    id: 'uyut_mertua_ayah',
    name: 'R. Somawinata',
    title: 'Uyut Ayah Pasangan',
    level: 0,
    trah: 'TRAH3',
    parentId: null,
    photo: '',
    claimed: false,
    city: 'Cianjur',
    birthYear: '1908',
    isDeceased: true,
    passedYear: '1987',
    bio: 'Sesepuh Cianjur keturunan bangsawan Priangan.'
  },
  {
    id: 'kakek_pasangan',
    name: 'Drs. H. Subagja',
    title: 'Kakek dari Pasangan',
    level: 1,
    trah: 'TRAH3',
    parentId: 'uyut_mertua_ayah',
    photo: '',
    claimed: false,
    city: 'Sukabumi',
    birthYear: '1937',
    isDeceased: true,
    passedYear: '2017',
    bio: 'Pensiunan dinas pendidikan, gemar membaca buku sejarah.'
  },
  {
    id: 'ayah_pasangan',
    name: 'Bpk. Bambang P.',
    title: 'Ayah Mertua (Ayah Pasangan)',
    level: 2,
    trah: 'TRAH3',
    parentId: 'kakek_pasangan',
    photo: '',
    claimed: true,
    city: 'Jakarta Selatan',
    phone: '081122334455',
    birthYear: '1963',
    isDeceased: false,
    bio: 'Konsultan manajemen dan penasihat keluarga besar.'
  },
  {
    id: 'paman_pasangan',
    name: 'Om Irwan',
    title: 'Paman dari Pasangan',
    level: 2,
    trah: 'TRAH3',
    parentId: 'kakek_pasangan',
    photo: '',
    claimed: false,
    city: 'Bogor',
    phone: '081244556677',
    birthYear: '1966',
    isDeceased: false,
    bio: 'Pengusaha agribisnis dan pecinta tanaman.'
  },
  {
    id: 'pasangan_user',
    name: 'Dewi Sartika',
    title: 'Istri / Pasangan User (Poros)',
    level: 3,
    trah: 'TRAH3',
    parentId: 'ayah_pasangan',
    photo: '',
    claimed: true,
    city: 'Bekasi',
    phone: '081299887766',
    birthYear: '1990',
    isDeceased: false,
    bio: 'Ibu rumah tangga berdaya, mitra setia dalam keluarga dan usaha.'
  },
  {
    id: 'ipar_user',
    name: 'Dimas Arya',
    title: 'Adik Pasangan (Ipar)',
    level: 3,
    trah: 'TRAH3',
    parentId: 'ayah_pasangan',
    photo: '',
    claimed: false,
    city: 'Jakarta Selatan',
    phone: '081388991122',
    birthYear: '1996',
    isDeceased: false,
    bio: 'Bekerja di perbankan syariah.'
  },

  // TRAH 4: GARIS IBU PASANGAN (Kuadran IV - Kuning)
  {
    id: 'uyut_mertua_ibu',
    name: 'Hj. Siti Rohmah',
    title: 'Uyut Ibu Pasangan',
    level: 0,
    trah: 'TRAH4',
    parentId: null,
    photo: '',
    claimed: false,
    city: 'Sumedang',
    birthYear: '1912',
    isDeceased: true,
    passedYear: '1992',
    bio: 'Pemberi nasihat bijak di tanah Sumedang Larang.'
  },
  {
    id: 'nenek_pasangan',
    name: 'Hj. Ratnasari',
    title: 'Nenek dari Ibu Pasangan',
    level: 1,
    trah: 'TRAH4',
    parentId: 'uyut_mertua_ibu',
    photo: '',
    claimed: false,
    city: 'Sumedang',
    birthYear: '1941',
    isDeceased: true,
    passedYear: '2020',
    bio: 'Penyayang anak cucu, perajin batik motif Kasumedangan.'
  },
  {
    id: 'ibu_pasangan',
    name: 'Ibu Endang W.',
    title: 'Ibu Mertua (Ibu Pasangan)',
    level: 2,
    trah: 'TRAH4',
    parentId: 'nenek_pasangan',
    photo: '',
    claimed: true,
    city: 'Jakarta Selatan',
    phone: '081266778899',
    birthYear: '1967',
    isDeceased: false,
    bio: 'Pecinta tanaman hias dan kuliner Sunda.'
  },
  {
    id: 'tante_istri',
    name: 'Bibi Lilis',
    title: 'Bibi dari Ibu Pasangan',
    level: 2,
    trah: 'TRAH4',
    parentId: 'nenek_pasangan',
    photo: '',
    claimed: false,
    city: 'Sumedang',
    phone: '081355443322',
    birthYear: '1970',
    isDeceased: false,
    bio: 'Pengelola usaha oleh-oleh tahu Sumedang.'
  },
  {
    id: 'sepupu_istri',
    name: 'Nadia Safitri',
    title: 'Sepupu Istri (Trah Ibu)',
    level: 3,
    trah: 'TRAH4',
    parentId: 'tante_istri',
    photo: '',
    claimed: false,
    city: 'Sumedang',
    phone: '081322334455',
    birthYear: '1997',
    isDeceased: false,
    bio: 'Apoteker farmasi di Sumedang.'
  },
  {
    id: 'anak_sepupu_istri',
    name: 'Fauzan Hafizh',
    title: 'Keturunan Trah Ibu Pasangan',
    level: 4,
    trah: 'TRAH4',
    parentId: 'sepupu_istri',
    photo: '',
    claimed: false,
    city: 'Sumedang',
    birthYear: '2024',
    isDeceased: false,
    bio: 'Keturunan cilik generasi ke-4 Hj. Siti Rohmah.'
  }
];

const INITIAL_MEDSOS_POSTS: FamilyPost[] = [
  {
    id: 'post_1',
    authorName: 'Hendriana (User)',
    authorTrah: 'TRAH1',
    category: 'Pengumuman',
    targetTrah: 'ALL',
    content: 'Assalamu’alaikum keluarga besar 4 Trah! Silsilah keluarga 7 generasi kini resmi tersimpan rapi di OrbitQu. Dilengkapi fitur kanvas A0-A4, frame foto A4-A7, serta pewarnaan frame per generasi.',
    createdAt: 'Hari ini • 09:30',
    likes: 12,
    hasLiked: true,
    comments: [
      { id: 'c1', author: 'Bpk. Hendra S.', text: 'Alhamdulillah barakallah, inisiatif yang sangat bagus buat anak cucu.', time: '09:45' },
      { id: 'c2', author: 'Dewi Sartika', text: 'Semoga trah pasangan juga lengkap terdata semua aamiin ❤️', time: '10:05' }
    ]
  },
  {
    id: 'post_2',
    authorName: 'Uwa Hamdan',
    authorTrah: 'TRAH1',
    category: 'Reuni',
    targetTrah: 'TRAH1',
    content: 'Rencana Reuni Akbar Trah Ayah User (Keluarga Besar Kyai Sanusi & H. Baharuddin) insyaAllah dijadwalkan bulan depan di villa puncak. Silakan konfirmasi kehadiran ya keluarga trah ayah.',
    createdAt: 'Kemarin • 16:15',
    likes: 8,
    hasLiked: false,
    comments: [
      { id: 'c3', author: 'Rian Pratama', text: 'Siap uwa, saya bantu dokumentasi dan transportasinya nanti.', time: '17:00' }
    ]
  },
  {
    id: 'post_3',
    authorName: 'Ibu Nurhayati',
    authorTrah: 'TRAH2',
    category: 'Syukuran',
    targetTrah: 'TRAH2',
    content: 'Kabar dari Trah Ibu User: Syukuran panen padi dan silaturahmi keluarga keturunan Nyai Aminah di Cirebon dan Kuningan minggu ini berjalan lancar. Terima kasih doa semuanya.',
    createdAt: '2 hari lalu',
    likes: 15,
    hasLiked: true,
    comments: []
  },
  {
    id: 'post_4',
    authorName: 'Bpk. Bambang P.',
    authorTrah: 'TRAH3',
    category: 'Kabar Bahagia',
    targetTrah: 'TRAH3',
    content: 'Kabar dari Trah Ayah Pasangan: Alhamdulillah ananda kami Dewi Sartika dan Hendriana berhasil mengembangkan usaha keluarga dengan baik. Mohon terus didoakan rukun selalu oleh keluarga trah Somawinata.',
    createdAt: '3 hari lalu',
    likes: 19,
    hasLiked: false,
    comments: [
      { id: 'c4', author: 'Hendriana', text: 'Terima kasih banyak doa dan bimbingan Ayah mertua 🙏', time: '3 hari lalu' }
    ]
  },
  {
    id: 'post_5',
    authorName: 'Bibi Lilis',
    authorTrah: 'TRAH4',
    category: 'Pengumuman',
    targetTrah: 'TRAH4',
    content: 'Kabar dari Trah Ibu Pasangan: Undangan arisan dan silaturahmi keturunan Hj. Siti Rohmah & Hj. Ratnasari di Sumedang hari Ahad depan jam 10 pagi. Ditunggu kehadirannya ya!',
    createdAt: '4 hari lalu',
    likes: 11,
    hasLiked: false,
    comments: []
  }
];

export const LeluhurQuView: React.FC<LeluhurQuViewProps> = ({
  onBackToMain,
  showNotification
}) => {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<LeluhurTab>('silsilahqu');
  const [silsilahSubTab, setSilsilahSubTab] = useState<SilsilahSubTab>('dashboard');

  // Family data state
  const [familyNodes, setFamilyNodes] = useState<FamilyNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // UNIFIED TRAH FILTER (Strict, no cross-mixing between quadrants)
  const [activeTrahFilter, setActiveTrahFilter] = useState<'ALL' | TrahType>('ALL');

  // ==========================================================
  // FITUR BARU: UKURAN KANVAS A0-A4, FRAME A4-A7, LAYOUT & WARNA
  // ==========================================================
  const [canvasPaperSize, setCanvasPaperSize] = useState<CanvasPaperSize>(() => {
    return (localStorage.getItem('orbitqu_paper_size') as CanvasPaperSize) || 'FIT';
  });
  const [paperOrientation, setPaperOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [frameScaleSize, setFrameScaleSize] = useState<FrameScaleSize>(() => {
    return (localStorage.getItem('orbitqu_frame_size') as FrameScaleSize) || 'A6';
  });
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    return (localStorage.getItem('orbitqu_layout_mode') as LayoutMode) || 'organic_flow';
  });
  const [showConnectors, setShowConnectors] = useState<boolean>(() => {
    return localStorage.getItem('orbitqu_show_connectors') !== 'false';
  });
  const [connectorStyle, setConnectorStyle] = useState<'curved' | 'straight' | 'dashed'>('curved');

  // Generation Frame Colors (Uyut, Kakek, Ayah, User, Anak, Cucu, Cicit)
  const [generationColors, setGenerationColors] = useState<GenerationColors>(() => {
    const saved = localStorage.getItem('orbitqu_gen_colors');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.level0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_GENERATION_COLORS;
  });

  const [frameColorMode, setFrameColorMode] = useState<'hybrid' | 'generation' | 'trah'>('hybrid');
  const [isColorModalOpen, setIsColorModalOpen] = useState<boolean>(false);

  // Canvas visualizer settings
  const [activeTheme, setActiveTheme] = useState<'cosmic' | 'organic' | 'atom' | 'neural'>('cosmic');
  const [showOrbitRings, setShowOrbitRings] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('orbitqu_dark_mode') !== 'false';
  });

  // Batch Input drawer
  const [isBatchDrawerOpen, setIsBatchDrawerOpen] = useState<boolean>(false);
  const [batchParentId, setBatchParentId] = useState<string>('ROOT');
  const [batchTrah, setBatchTrah] = useState<TrahType>('TRAH1');
  const [batchNames, setBatchNames] = useState<string>('');

  // Node Edit / Revision Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [editNodeName, setEditNodeName] = useState<string>('');
  const [editNodeTitle, setEditNodeTitle] = useState<string>('');
  const [editNodeTrah, setEditNodeTrah] = useState<TrahType>('TRAH1');
  const [editNodePhoto, setEditNodePhoto] = useState<string>('');
  const [editNodeCity, setEditNodeCity] = useState<string>('');
  const [editNodePhone, setEditNodePhone] = useState<string>('');
  const [editNodeBirthYear, setEditNodeBirthYear] = useState<string>('');
  const [editNodePassedYear, setEditNodePassedYear] = useState<string>('');
  const [editNodeIsDeceased, setEditNodeIsDeceased] = useState<boolean>(false);
  const [editNodeBio, setEditNodeBio] = useState<string>('');

  // List View states (Search & Level Filter)
  const [listSearch, setListSearch] = useState<string>('');
  const [listLevelFilter, setListLevelFilter] = useState<string>('ALL');

  // Medsos State
  const [medsosPosts, setMedsosPosts] = useState<FamilyPost[]>([]);
  const [medsosTrahFilter, setMedsosTrahFilter] = useState<'ALL' | TrahType>('ALL');
  const [isPostFormOpen, setIsPostFormOpen] = useState<boolean>(false);
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostCategory, setNewPostCategory] = useState<FamilyPost['category']>('Pengumuman');
  const [newPostTargetTrah, setNewPostTargetTrah] = useState<'ALL' | TrahType>('ALL');
  const [newPostAuthor, setNewPostAuthor] = useState<string>('Hendriana (User)');
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});

  // Canvas Refs & Viewport Transform state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const scaleRef = useRef<number>(1);
  const panXRef = useRef<number>(0);
  const panYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number>(0);

  // Manual Dragging Node state
  const draggingNodeIdRef = useRef<string | null>(null);
  const nodeDragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedNodeRef = useRef<boolean>(false);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('orbitqu_family_data_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 25) {
          setFamilyNodes(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed parsing saved data v3', e);
      }
    }

    // Default clean 4-trah dataset
    setFamilyNodes(INITIAL_FAMILY_DATA);
    localStorage.setItem('orbitqu_family_data_v3', JSON.stringify(INITIAL_FAMILY_DATA));
    localStorage.setItem('orbitqu_family_data', JSON.stringify(INITIAL_FAMILY_DATA));

    // Load Medsos Posts
    const savedPosts = localStorage.getItem('orbitqu_family_posts_v3');
    if (savedPosts) {
      try {
        const parsedPosts = JSON.parse(savedPosts);
        if (Array.isArray(parsedPosts)) {
          setMedsosPosts(parsedPosts);
          return;
        }
      } catch (e) {
        console.error('Failed parsing posts v3', e);
      }
    }
    setMedsosPosts(INITIAL_MEDSOS_POSTS);
    localStorage.setItem('orbitqu_family_posts_v3', JSON.stringify(INITIAL_MEDSOS_POSTS));
  }, []);

  // Save changes to LocalStorage
  const saveFamilyData = (updated: FamilyNode[]) => {
    setFamilyNodes(updated);
    localStorage.setItem('orbitqu_family_data_v3', JSON.stringify(updated));
    localStorage.setItem('orbitqu_family_data', JSON.stringify(updated));
  };

  const saveMedsosPosts = (updated: FamilyPost[]) => {
    setMedsosPosts(updated);
    localStorage.setItem('orbitqu_family_posts_v3', JSON.stringify(updated));
  };

  const saveGenerationColors = (updated: GenerationColors) => {
    setGenerationColors(updated);
    localStorage.setItem('orbitqu_gen_colors', JSON.stringify(updated));
  };

  const getTrahColorHex = (trah: TrahType): string => {
    switch (trah) {
      case 'TRAH1': return '#EF4444'; // Merah - Trah Ayah User
      case 'TRAH2': return '#3B82F6'; // Biru - Trah Ibu User
      case 'TRAH3': return '#10B981'; // Hijau - Trah Ayah Pasangan
      case 'TRAH4': return '#F59E0B'; // Kuning - Trah Ibu Pasangan
      default: return '#6B7280';
    }
  };

  const getTrahBgClass = (trah: TrahType): string => {
    switch (trah) {
      case 'TRAH1': return 'bg-red-500';
      case 'TRAH2': return 'bg-blue-500';
      case 'TRAH3': return 'bg-emerald-500';
      case 'TRAH4': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrahName = (trah: TrahType): string => {
    switch (trah) {
      case 'TRAH1': return 'Trah Ayah User';
      case 'TRAH2': return 'Trah Ibu User';
      case 'TRAH3': return 'Trah Ayah Pasangan';
      case 'TRAH4': return 'Trah Ibu Pasangan';
      default: return 'Trah Keluarga';
    }
  };

  const getThemeConnectorColor = (baseHex: string, dark: boolean): string => {
    if (activeTheme === 'neural') return baseHex;
    if (activeTheme === 'organic') return '#d97706';
    if (activeTheme === 'atom') return dark ? '#38bdf8' : '#0284c7';
    return dark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)';
  };

  // Get frame color for a specific node based on generation colors or trah
  const getNodeFrameColor = useCallback((node: FamilyNode): string => {
    if (frameColorMode === 'trah') {
      return getTrahColorHex(node.trah);
    }
    // Generation Colors
    switch (node.level) {
      case 0: return generationColors.level0;
      case 1: return generationColors.level1;
      case 2: return generationColors.level2;
      case 3: return generationColors.level3;
      case 4: return generationColors.level4;
      case 5: return generationColors.level5;
      case 6: return generationColors.level6;
      default: return '#6B7280';
    }
  }, [frameColorMode, generationColors]);

  // Compute Statistics for Dashboard
  const stats = useMemo(() => {
    const total = familyNodes.length;
    const trah1 = familyNodes.filter(n => n.trah === 'TRAH1');
    const trah2 = familyNodes.filter(n => n.trah === 'TRAH2');
    const trah3 = familyNodes.filter(n => n.trah === 'TRAH3');
    const trah4 = familyNodes.filter(n => n.trah === 'TRAH4');
    const claimed = familyNodes.filter(n => n.claimed);
    const living = familyNodes.filter(n => !n.isDeceased);
    const deceased = familyNodes.filter(n => n.isDeceased);

    const levelCounts = [0, 1, 2, 3, 4, 5, 6].map(lvl => ({
      level: lvl,
      name: GENERATION_SHORT_NAMES[lvl],
      count: familyNodes.filter(n => n.level === lvl).length
    }));

    return {
      total,
      trah1Count: trah1.length,
      trah2Count: trah2.length,
      trah3Count: trah3.length,
      trah4Count: trah4.length,
      trah1Claimed: trah1.filter(n => n.claimed).length,
      trah2Claimed: trah2.filter(n => n.claimed).length,
      trah3Claimed: trah3.filter(n => n.claimed).length,
      trah4Claimed: trah4.filter(n => n.claimed).length,
      claimedCount: claimed.length,
      unclaimedCount: total - claimed.length,
      livingCount: living.length,
      deceasedCount: deceased.length,
      levelCounts
    };
  }, [familyNodes]);

  // Filtered list for Minimalist List View (STRICT TRAH MATCHING)
  const filteredListNodes = useMemo(() => {
    return familyNodes.filter(node => {
      const matchSearch = listSearch.trim() === '' ||
        node.name.toLowerCase().includes(listSearch.toLowerCase()) ||
        (node.title && node.title.toLowerCase().includes(listSearch.toLowerCase())) ||
        (node.city && node.city.toLowerCase().includes(listSearch.toLowerCase()));

      const matchTrah = activeTrahFilter === 'ALL' || node.trah === activeTrahFilter;
      const matchLevel = listLevelFilter === 'ALL' || node.level.toString() === listLevelFilter;

      return matchSearch && matchTrah && matchLevel;
    }).sort((a, b) => a.level - b.level);
  }, [familyNodes, listSearch, activeTrahFilter, listLevelFilter]);

  // Get paper pixel dimensions for canvas drawing
  const getPaperPixelDimensions = useCallback(() => {
    if (canvasPaperSize === 'FIT') return null;
    const info = PAPER_CONFIG[canvasPaperSize];
    if (!info || info.widthMm === 0) return null;

    // Scale factor: 1 mm ≈ 2.8346 px
    const scale = 2.8346;
    let w = info.widthMm * scale;
    let h = info.heightMm * scale;

    if (paperOrientation === 'landscape' && w < h) {
      const tmp = w; w = h; h = tmp;
    } else if (paperOrientation === 'portrait' && w > h) {
      const tmp = w; w = h; h = tmp;
    }

    return {
      width: Math.round(w),
      height: Math.round(h),
      widthMm: paperOrientation === 'landscape' ? Math.max(info.widthMm, info.heightMm) : Math.min(info.widthMm, info.heightMm),
      heightMm: paperOrientation === 'landscape' ? Math.min(info.widthMm, info.heightMm) : Math.max(info.widthMm, info.heightMm)
    };
  }, [canvasPaperSize, paperOrientation]);

  // Layout 1: Horizontal Elliptical Orbit Layout (Default)
  const computeEllipticalLayout = useCallback((nodes: FamilyNode[]) => {
    const filteredNodes = activeTrahFilter === 'ALL'
      ? nodes
      : nodes.filter(n => n.trah === activeTrahFilter);

    const levelRadii = [
      { rx: 520, ry: 380 }, // Level 0: Uyut Outer Core
      { rx: 430, ry: 310 }, // Level 1: Kakek / Nenek
      { rx: 340, ry: 240 }, // Level 2: Ayah / Ibu / Paman / Bibi / Uwa
      { rx: 250, ry: 170 }, // Level 3: User / Pasangan & Saudara (Poros Tengah)
      { rx: 170, ry: 110 }, // Level 4: Anak
      { rx: 110, ry: 75 },  // Level 5: Cucu
      { rx: 55,  ry: 38 }   // Level 6: Cicit Inner Core
    ];

    const trahAngles: Record<TrahType, { start: number; end: number }> = {
      TRAH1: { start: -Math.PI, end: -Math.PI / 2 },       // Top-Left: Ayah User (Kuadran I)
      TRAH2: { start: -Math.PI / 2, end: 0 },              // Top-Right: Ibu User (Kuadran II)
      TRAH3: { start: Math.PI / 2, end: Math.PI },         // Bottom-Left: Ayah Pasangan (Kuadran III)
      TRAH4: { start: 0, end: Math.PI / 2 }                // Bottom-Right: Ibu Pasangan (Kuadran IV)
    };

    const computed: (FamilyNode & { x: number; y: number; angle: number; color: string; trahColor: string; frameScale: number })[] = [];
    const frameScale = FRAME_SCALE_CONFIG[frameScaleSize]?.scale || 1.0;

    const trahsToProcess: TrahType[] = activeTrahFilter === 'ALL'
      ? ['TRAH1', 'TRAH2', 'TRAH3', 'TRAH4']
      : [activeTrahFilter];

    for (let lvl = 0; lvl <= 6; lvl++) {
      const lvlNodes = filteredNodes.filter(n => n.level === lvl);

      trahsToProcess.forEach(trahKey => {
        const trahLvlNodes = lvlNodes.filter(n => n.trah === trahKey);
        const sector = trahAngles[trahKey];

        if (trahLvlNodes.length > 0) {
          const angleStep = (sector.end - sector.start) / (trahLvlNodes.length + 1);

          trahLvlNodes.forEach((node, index) => {
            const angle = sector.start + angleStep * (index + 1);
            const radii = levelRadii[node.level];

            const x = radii.rx * Math.cos(angle);
            const y = radii.ry * Math.sin(angle);

            computed.push({
              ...node,
              x,
              y,
              angle,
              color: getNodeFrameColor(node),
              trahColor: getTrahColorHex(node.trah),
              frameScale
            });
          });
        }
      });
    }

    return computed;
  }, [activeTrahFilter, frameScaleSize, getNodeFrameColor]);

  // Layout 2: Hierarchical Tree Layout (Uyut top, Kakek, Ayah, User, Anak, Cucu, Cicit)
  const computeTreeLayout = useCallback((nodes: FamilyNode[]) => {
    const filteredNodes = activeTrahFilter === 'ALL'
      ? nodes
      : nodes.filter(n => n.trah === activeTrahFilter);

    const computed: (FamilyNode & { x: number; y: number; angle: number; color: string; trahColor: string; frameScale: number })[] = [];
    const frameScale = FRAME_SCALE_CONFIG[frameScaleSize]?.scale || 1.0;

    const yLevels = [-320, -210, -100, 20, 140, 260, 370];
    const trahOrder: TrahType[] = ['TRAH1', 'TRAH2', 'TRAH3', 'TRAH4'];
    const trahsToProcess = activeTrahFilter === 'ALL' ? trahOrder : [activeTrahFilter];

    const trahCenterX: Record<TrahType, number> = {
      TRAH1: -480,
      TRAH2: -160,
      TRAH3: 160,
      TRAH4: 480
    };

    for (let lvl = 0; lvl <= 6; lvl++) {
      const lvlNodes = filteredNodes.filter(n => n.level === lvl);

      trahsToProcess.forEach(trahKey => {
        const trahLvlNodes = lvlNodes.filter(n => n.trah === trahKey);
        if (trahLvlNodes.length === 0) return;

        const centerX = activeTrahFilter === 'ALL' ? trahCenterX[trahKey] : 0;
        const nodeSpacing = lvl <= 3 ? Math.max(130, 140 * frameScale) : Math.max(65, 75 * frameScale);
        const totalWidth = (trahLvlNodes.length - 1) * nodeSpacing;
        const startX = centerX - totalWidth / 2;

        trahLvlNodes.forEach((node, idx) => {
          computed.push({
            ...node,
            x: startX + idx * nodeSpacing,
            y: yLevels[lvl],
            angle: 0,
            color: getNodeFrameColor(node),
            trahColor: getTrahColorHex(node.trah),
            frameScale
          });
        });
      });
    }

    return computed;
  }, [activeTrahFilter, frameScaleSize, getNodeFrameColor]);

  // Layout 3: Organic Flow & Double Tracks Engine (Recursive Tree Algorithm)
  const computeOrganicFlowLayout = useCallback((nodes: FamilyNode[]) => {
    const filteredNodes = activeTrahFilter === 'ALL'
      ? nodes
      : nodes.filter(n => n.trah === activeTrahFilter);

    const frameScale = FRAME_SCALE_CONFIG[frameScaleSize]?.scale || 1.0;

    // Y levels: Roots (Level 0 Uyut) at base (+360), branching upward toward canopy (-380)
    const yLevels = [
      360,  // Level 0: Uyut (Ancestral Roots)
      240,  // Level 1: Kakek / Nenek (Lower Trunk)
      115,  // Level 2: Ayah / Ibu / Paman (Mid Boughs)
      -10,  // Level 3: User & Pasangan (Heartwood Rosette)
      -145, // Level 4: Anak (Upper Branches - Modul Buah/Daun)
      -265, // Level 5: Cucu (Canopy Twigs & Berries)
      -375  // Level 6: Cicit (Terminal Blooms)
    ];

    const trahOrder: TrahType[] = ['TRAH1', 'TRAH2', 'TRAH3', 'TRAH4'];
    const trahsToProcess = activeTrahFilter === 'ALL' ? trahOrder : [activeTrahFilter];

    const trahBaseCenterX: Record<TrahType, number> = {
      TRAH1: -490,
      TRAH2: -160,
      TRAH3: 160,
      TRAH4: 490
    };

    const computed: (FamilyNode & { x: number; y: number; angle: number; color: string; trahColor: string; frameScale: number; isLeafFruit?: boolean })[] = [];

    // Map children by parentId
    const childrenMap: Record<string, FamilyNode[]> = {};
    filteredNodes.forEach(node => {
      const pId = node.parentId || 'ROOT_' + node.trah;
      if (!childrenMap[pId]) childrenMap[pId] = [];
      childrenMap[pId].push(node);
    });

    // Recursive calculation of subtree width
    const memoWidth: Record<string, number> = {};
    const getSubtreeWidth = (node: FamilyNode): number => {
      if (memoWidth[node.id]) return memoWidth[node.id];
      const children = childrenMap[node.id] || [];
      const nodeWidth = node.level <= 3 ? Math.max(130, 142 * frameScale) : Math.max(76, 86 * frameScale);
      if (children.length === 0) {
        memoWidth[node.id] = nodeWidth;
        return nodeWidth;
      }
      const childrenWidth = children.reduce((sum, c) => sum + getSubtreeWidth(c), 0) + (children.length - 1) * (26 * frameScale);
      const total = Math.max(nodeWidth, childrenWidth);
      memoWidth[node.id] = total;
      return total;
    };

    // Recursive assignment of organic positions
    const assignSubtreePositions = (node: FamilyNode, centerX: number, depth: number) => {
      const children = childrenMap[node.id] || [];
      const isTerminal = children.length === 0 || node.level >= 4;

      computed.push({
        ...node,
        x: Math.round(centerX),
        y: yLevels[node.level],
        angle: 0,
        color: getNodeFrameColor(node),
        trahColor: getTrahColorHex(node.trah),
        frameScale,
        isLeafFruit: isTerminal && node.level >= 4
      });

      if (children.length > 0) {
        const totalChildrenWidth = children.reduce((sum, c) => sum + getSubtreeWidth(c), 0) + (children.length - 1) * (26 * frameScale);
        let curX = centerX - totalChildrenWidth / 2;

        children.forEach(child => {
          const w = getSubtreeWidth(child);
          const childCenter = curX + w / 2;
          assignSubtreePositions(child, childCenter, depth + 1);
          curX += w + (26 * frameScale);
        });
      }
    };

    // Process each Trah tree
    trahsToProcess.forEach(trahKey => {
      const trahNodes = filteredNodes.filter(n => n.trah === trahKey);
      if (trahNodes.length === 0) return;

      const baseX = activeTrahFilter === 'ALL' ? trahBaseCenterX[trahKey] : 0;
      const rootCandidates = trahNodes.filter(n => n.level === 0 || !n.parentId || !trahNodes.some(p => p.id === n.parentId));

      if (rootCandidates.length > 0) {
        const totalRootsWidth = rootCandidates.reduce((sum, r) => sum + getSubtreeWidth(r), 0) + (rootCandidates.length - 1) * (50 * frameScale);
        let startX = baseX - totalRootsWidth / 2;

        rootCandidates.forEach(root => {
          const w = getSubtreeWidth(root);
          const rootX = startX + w / 2;
          assignSubtreePositions(root, rootX, 0);
          startX += w + (50 * frameScale);
        });
      }
    });

    return computed;
  }, [activeTrahFilter, frameScaleSize, getNodeFrameColor]);

  // Render Double Tracks Flow (Garis Pembungkus Ganda Berkelok Organik)
  const drawOrganicDoubleTracks = (
    ctx: CanvasRenderingContext2D,
    nodes: (FamilyNode & { x: number; y: number; color: string; trahColor: string; frameScale: number })[],
    frameScale: number,
    isDark: boolean
  ) => {
    // Branch widths tapering upward: Level 0 (Roots) thickest -> Level 6 thinnest
    const branchWidthByLevel = [
      32 * frameScale, // Level 0 (Uyut)
      24 * frameScale, // Level 1 (Kakek)
      18 * frameScale, // Level 2 (Ayah)
      13 * frameScale, // Level 3 (User)
      9 * frameScale,  // Level 4 (Anak)
      6 * frameScale,  // Level 5 (Cucu)
      3.5 * frameScale // Level 6 (Cicit)
    ];

    nodes.forEach(node => {
      if (!node.parentId) return;
      const parent = nodes.find(n => n.id === node.parentId);
      if (!parent) return;
      if (activeTrahFilter !== 'ALL' && parent.trah !== activeTrahFilter) return;

      const p1 = { x: parent.x, y: parent.y };
      const p2 = { x: node.x, y: node.y };

      const w1 = branchWidthByLevel[parent.level] || (14 * frameScale);
      const w2 = branchWidthByLevel[node.level] || (6 * frameScale);

      const dy = p2.y - p1.y;
      const dx = p2.x - p1.x;

      // Natural organic bezier control points
      const cp1 = { x: p1.x + dx * 0.12, y: p1.y + dy * 0.5 };
      const cp2 = { x: p2.x - dx * 0.12, y: p1.y + dy * 0.5 };

      // Normal offset vectors at start (horizontal)
      const p1L = { x: p1.x - w1 / 2, y: p1.y };
      const p1R = { x: p1.x + w1 / 2, y: p1.y };

      // Normal offset vectors at end
      const ndx = p2.x - cp2.x;
      const ndy = p2.y - cp2.y;
      const nlen = Math.hypot(ndx, ndy) || 1;
      const nx = -ndy / nlen;
      const ny = ndx / nlen;

      const p2L = { x: p2.x - nx * (w2 / 2), y: p2.y - ny * (w2 / 2) };
      const p2R = { x: p2.x + nx * (w2 / 2), y: p2.y + ny * (w2 / 2) };

      const cp1L = { x: cp1.x - w1 * 0.42, y: cp1.y };
      const cp1R = { x: cp1.x + w1 * 0.42, y: cp1.y };
      const cp2L = { x: cp2.x - w2 * 0.42, y: cp2.y };
      const cp2R = { x: cp2.x + w2 * 0.42, y: cp2.y };

      // 1. Organic Ribbon Fill with Gradient
      const trunkGrad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      const startColor = parent.level === 0 ? (isDark ? '#b45309' : '#d97706') : parent.color;
      const endColor = node.color;

      trunkGrad.addColorStop(0, startColor);
      trunkGrad.addColorStop(1, endColor);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p1L.x, p1L.y);
      ctx.bezierCurveTo(cp1L.x, cp1L.y, cp2L.x, cp2L.y, p2L.x, p2L.y);
      ctx.lineTo(p2R.x, p2R.y);
      ctx.bezierCurveTo(cp2R.x, cp2R.y, cp1R.x, cp1R.y, p1R.x, p1R.y);
      ctx.closePath();

      ctx.fillStyle = trunkGrad;
      ctx.globalAlpha = isDark ? 0.32 : 0.42;
      ctx.fill();
      ctx.restore();

      // 2. Parallel Double Tracks (Garis Pembungkus Ganda)
      const strokeGrad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      strokeGrad.addColorStop(0, startColor);
      strokeGrad.addColorStop(1, endColor);

      ctx.save();
      ctx.strokeStyle = strokeGrad;
      ctx.lineWidth = Math.max(1.8, 2.2 * frameScale);
      ctx.globalAlpha = isDark ? 0.95 : 0.88;

      // Left Track
      ctx.beginPath();
      ctx.moveTo(p1L.x, p1L.y);
      ctx.bezierCurveTo(cp1L.x, cp1L.y, cp2L.x, cp2L.y, p2L.x, p2L.y);
      ctx.stroke();

      // Right Track
      ctx.beginPath();
      ctx.moveTo(p1R.x, p1R.y);
      ctx.bezierCurveTo(cp1R.x, cp1R.y, cp2R.x, cp2R.y, p2R.x, p2R.y);
      ctx.stroke();

      // Center glowing sap/marrow line
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
      ctx.lineWidth = 1;
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.75)';
      ctx.setLineDash([4, 6]);
      ctx.stroke();

      // 3. Subtle Vector-Based Wood Grain Paths (Serat Kayu) inside Trunk
      // Grain 1: Left inner grain line
      const g1_p1 = { x: p1.x - w1 * 0.22, y: p1.y };
      const g1_p2 = { x: p2.x - nx * (w2 * 0.22), y: p2.y - ny * (w2 * 0.22) };
      const g1_cp1 = { x: cp1.x - w1 * 0.18, y: cp1.y };
      const g1_cp2 = { x: cp2.x - w2 * 0.18, y: cp2.y };

      ctx.beginPath();
      ctx.moveTo(g1_p1.x, g1_p1.y);
      ctx.bezierCurveTo(g1_cp1.x, g1_cp1.y, g1_cp2.x, g1_cp2.y, g1_p2.x, g1_p2.y);
      ctx.strokeStyle = isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(120, 53, 15, 0.26)';
      ctx.lineWidth = 1.1;
      ctx.setLineDash([10, 4, 18, 5]);
      ctx.stroke();

      // Grain 2: Right inner grain line
      const g3_p1 = { x: p1.x + w1 * 0.22, y: p1.y };
      const g3_p2 = { x: p2.x + nx * (w2 * 0.22), y: p2.y + ny * (w2 * 0.22) };
      const g3_cp1 = { x: cp1.x + w1 * 0.18, y: cp1.y };
      const g3_cp2 = { x: cp2.x + w2 * 0.18, y: cp2.y };

      ctx.beginPath();
      ctx.moveTo(g3_p1.x, g3_p1.y);
      ctx.bezierCurveTo(g3_cp1.x, g3_cp1.y, g3_cp2.x, g3_cp2.y, g3_p2.x, g3_p2.y);
      ctx.strokeStyle = isDark ? 'rgba(0, 0, 0, 0.30)' : 'rgba(120, 53, 15, 0.20)';
      ctx.lineWidth = 1.0;
      ctx.setLineDash([14, 6, 8, 4]);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.restore();
    });

    // Draw Root Tendrils beneath Level 0 (Uyut)
    nodes.filter(n => n.level === 0).forEach(root => {
      ctx.save();
      ctx.strokeStyle = isDark ? 'rgba(217, 119, 6, 0.65)' : 'rgba(180, 83, 9, 0.75)';
      ctx.lineWidth = 2.5 * frameScale;
      [-25 * frameScale, 0, 25 * frameScale].forEach((offset, idx) => {
        ctx.beginPath();
        ctx.moveTo(root.x + offset, root.y + 24 * frameScale);
        ctx.bezierCurveTo(
          root.x + offset * 1.5, root.y + 55 * frameScale,
          root.x + offset * 2.2, root.y + 75 * frameScale,
          root.x + offset * (2.8 + idx * 0.2), root.y + 95 * frameScale
        );
        ctx.stroke();
      });
      ctx.restore();
    });
  };

  // Helper: Draw organic leaves & fruit accents behind/around terminal photo nodes
  const drawOrganicLeavesAndFruit = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scaleMult: number,
    isDark: boolean
  ) => {
    ctx.save();
    const leafGrad = ctx.createLinearGradient(x - 20, y - 20, x + 20, y + 20);
    leafGrad.addColorStop(0, '#4ade80'); // Emerald muda
    leafGrad.addColorStop(1, '#15803d'); // Hijau daun lebat

    // Left Leaf
    ctx.save();
    ctx.translate(x - 14 * scaleMult, y - 12 * scaleMult);
    ctx.rotate(-0.52);
    ctx.beginPath();
    ctx.ellipse(0, 0, 14 * scaleMult, 6 * scaleMult, 0, 0, 2 * Math.PI);
    ctx.fillStyle = leafGrad;
    ctx.fill();
    ctx.strokeStyle = isDark ? '#14532d' : '#166534';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Leaf vein
    ctx.beginPath();
    ctx.moveTo(-11 * scaleMult, 0);
    ctx.lineTo(11 * scaleMult, 0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.stroke();
    ctx.restore();

    // Right Leaf
    ctx.save();
    ctx.translate(x + 14 * scaleMult, y - 12 * scaleMult);
    ctx.rotate(0.52);
    ctx.beginPath();
    ctx.ellipse(0, 0, 14 * scaleMult, 6 * scaleMult, 0, 0, 2 * Math.PI);
    ctx.fillStyle = leafGrad;
    ctx.fill();
    ctx.strokeStyle = isDark ? '#14532d' : '#166534';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Leaf vein
    ctx.beginPath();
    ctx.moveTo(-11 * scaleMult, 0);
    ctx.lineTo(11 * scaleMult, 0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.stroke();
    ctx.restore();

    // Blooming Ripe Fruit Accent
    ctx.save();
    ctx.translate(x + 14 * scaleMult, y + 8 * scaleMult);
    const fruitGrad = ctx.createRadialGradient(-1.5 * scaleMult, -1.5 * scaleMult, 1, 0, 0, 7 * scaleMult);
    fruitGrad.addColorStop(0, '#fda4af');
    fruitGrad.addColorStop(0.35, '#f43f5e');
    fruitGrad.addColorStop(1, '#9f1239');
    ctx.beginPath();
    ctx.arc(0, 0, 5 * scaleMult, 0, 2 * Math.PI);
    ctx.fillStyle = fruitGrad;
    ctx.fill();
    ctx.strokeStyle = '#881337';
    ctx.lineWidth = 0.75;
    ctx.stroke();
    // Specular highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-1.5 * scaleMult, -1.5 * scaleMult, 1.2 * scaleMult, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  };

  // Unified Layout Router (Organic Flow, Auto Orbit, Auto Tree, or Manual Drag)
  const computeActiveLayout = useCallback((nodes: FamilyNode[]) => {
    const frameScale = FRAME_SCALE_CONFIG[frameScaleSize]?.scale || 1.0;

    if (layoutMode === 'manual') {
      const fallbackNodes = computeOrganicFlowLayout(nodes);
      const filteredNodes = activeTrahFilter === 'ALL'
        ? nodes
        : nodes.filter(n => n.trah === activeTrahFilter);

      return filteredNodes.map(node => {
        const fallback = fallbackNodes.find(f => f.id === node.id);
        const x = typeof node.manualX === 'number' ? node.manualX : (fallback?.x ?? 0);
        const y = typeof node.manualY === 'number' ? node.manualY : (fallback?.y ?? 0);

        return {
          ...node,
          x,
          y,
          angle: 0,
          color: getNodeFrameColor(node),
          trahColor: getTrahColorHex(node.trah),
          frameScale
        };
      });
    }

    if (layoutMode === 'organic_flow') {
      return computeOrganicFlowLayout(nodes);
    }

    if (layoutMode === 'auto_tree') {
      return computeTreeLayout(nodes);
    }

    return computeEllipticalLayout(nodes);
  }, [layoutMode, frameScaleSize, computeOrganicFlowLayout, computeTreeLayout, computeEllipticalLayout, getNodeFrameColor, activeTrahFilter]);

  // Main Canvas Render
  const renderCanvas = useCallback(() => {
    if (activeTab !== 'orbitqu') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.translate(panXRef.current, panYRef.current);
    ctx.scale(scaleRef.current, scaleRef.current);

    const calculatedNodes = computeActiveLayout(familyNodes);
    const frameScale = FRAME_SCALE_CONFIG[frameScaleSize]?.scale || 1.0;

    // 0. Draw Paper Sheet (A0 to A4) if not FIT
    const paperDim = getPaperPixelDimensions();
    if (paperDim) {
      const pw = paperDim.width;
      const ph = paperDim.height;
      const px = -pw / 2;
      const py = -ph / 2;

      // Paper drop shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = isDarkMode ? '#0f172a' : '#ffffff';
      ctx.fillRect(px, py, pw, ph);
      ctx.restore();

      // Outer trim boundary
      ctx.strokeStyle = isDarkMode ? '#334155' : '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py, pw, ph);

      // Inner ornamental border
      ctx.strokeStyle = isDarkMode ? 'rgba(245, 158, 11, 0.35)' : 'rgba(217, 119, 6, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 18, py + 18, pw - 36, ph - 36);

      // Corner crop / registration marks (+)
      const markLen = 14;
      ctx.strokeStyle = isDarkMode ? '#64748b' : '#94a3b8';
      ctx.lineWidth = 1.5;
      [
        { x: px + 14, y: py + 14 },
        { x: px + pw - 14, y: py + 14 },
        { x: px + 14, y: py + ph - 14 },
        { x: px + pw - 14, y: py + ph - 14 }
      ].forEach(pt => {
        ctx.beginPath();
        ctx.moveTo(pt.x - markLen, pt.y);
        ctx.lineTo(pt.x + markLen, pt.y);
        ctx.moveTo(pt.x, pt.y - markLen);
        ctx.lineTo(pt.x, pt.y + markLen);
        ctx.stroke();
      });

      // Sheet Header Title
      ctx.fillStyle = isDarkMode ? '#f8fafc' : '#0f172a';
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BAGAN SILSILAH KELUARGA BESAR 7 GENERASI', 0, py + 45);

      ctx.fillStyle = isDarkMode ? '#94a3b8' : '#64748b';
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Format Cetak: ${canvasPaperSize} (${paperDim.widthMm} × ${paperDim.heightMm} mm) • Skala Frame: ${frameScaleSize} • Engine: ${layoutMode === 'organic_flow' ? 'Organic Flow & Double Tracks' : layoutMode} • OrbitQu LeluhurQu`, 0, py + 62);
    }

    // 1. Draw Orbit Ellipse Rings (if Auto Orbit mode & toggle active)
    if (showOrbitRings && layoutMode === 'auto_orbit') {
      const levelRadii = [
        { rx: 520, ry: 380 },
        { rx: 430, ry: 310 },
        { rx: 340, ry: 240 },
        { rx: 250, ry: 170 },
        { rx: 170, ry: 110 },
        { rx: 110, ry: 75 },
        { rx: 55,  ry: 38 }
      ];

      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);

      levelRadii.forEach((r, idx) => {
        ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.12)';
        if (idx === 3) {
          ctx.strokeStyle = isDarkMode ? 'rgba(245, 158, 11, 0.35)' : 'rgba(217, 119, 6, 0.45)';
        }

        ctx.beginPath();
        ctx.ellipse(0, 0, r.rx, r.ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      });

      ctx.setLineDash([]);
    }

    // 2. Lineage Connections: Double Tracks (in Organic Flow) or Standard Connectors
    if (showConnectors) {
      if (layoutMode === 'organic_flow') {
        drawOrganicDoubleTracks(ctx, calculatedNodes, frameScale, isDarkMode);
      } else {
        ctx.lineWidth = Math.max(1.2, 1.5 * frameScale);
        calculatedNodes.forEach(node => {
          if (node.parentId) {
            const parent = calculatedNodes.find(n => n.id === node.parentId);
            if (parent && (activeTrahFilter === 'ALL' || parent.trah === activeTrahFilter)) {
              ctx.strokeStyle = getThemeConnectorColor(node.color, isDarkMode);

              if (connectorStyle === 'dashed') {
                ctx.setLineDash([5, 5]);
              } else {
                ctx.setLineDash([]);
              }

              ctx.beginPath();
              ctx.moveTo(parent.x, parent.y);

              if (connectorStyle === 'straight') {
                ctx.lineTo(node.x, node.y);
              } else {
                const controlX = (parent.x + node.x) / 2;
                const controlY = (parent.y + node.y) / 2;
                ctx.quadraticCurveTo(controlX, controlY, node.x, node.y);
              }
              ctx.stroke();
            }
          }
        });
        ctx.setLineDash([]);
      }
    }

    // 3. Draw Nodes (with dynamic Frame Scale A4-A7, Leaves & Fruits Photo Nodes)
    calculatedNodes.forEach(node => {
      ctx.save();
      ctx.translate(node.x, node.y);

      const scaleMult = node.frameScale || 1.0;

      // In Organic Flow mode, draw leaves & fruit accents on terminal / younger generations
      if (layoutMode === 'organic_flow' && node.level >= 4) {
        drawOrganicLeavesAndFruit(ctx, 0, 0, scaleMult, isDarkMode);
      }

      if (node.level <= 3) {
        // Large Photo Card Frame (Uyut, Kakek, Ayah/Ibu/Paman, User & Pasangan)
        const width = Math.round(116 * scaleMult);
        const height = Math.round(48 * scaleMult);
        const rx = -width / 2;
        const ry = -height / 2;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = Math.round(10 * scaleMult);
        ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff';
        ctx.strokeStyle = node.color;
        ctx.lineWidth = Math.max(2, Math.round(2.5 * scaleMult));

        ctx.beginPath();
        ctx.roundRect(rx, ry, width, height, Math.round(10 * scaleMult));
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Laurel wreath accent for User & Pasangan (Level 3) in Organic Flow mode
        if (layoutMode === 'organic_flow' && node.level === 3) {
          ctx.save();
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(rx - 4, 0, 10 * scaleMult, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(rx + width + 4, 0, 10 * scaleMult, Math.PI / 2, (3 * Math.PI) / 2);
          ctx.stroke();
          ctx.restore();
        }

        // Avatar Circle
        const avatarRadius = Math.round(15 * scaleMult);
        const avatarX = rx + avatarRadius + Math.round(7 * scaleMult);
        const avatarY = 0;

        // In hybrid mode: circle is Trah color, border is Generation color
        ctx.fillStyle = frameColorMode === 'generation' ? node.color : node.trahColor;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, 2 * Math.PI);
        ctx.fill();

        // Avatar Initial
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(11 * scaleMult)}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.name.charAt(0).toUpperCase(), avatarX, avatarY);

        // Name
        ctx.textAlign = 'left';
        ctx.fillStyle = isDarkMode ? '#f8fafc' : '#0f172a';
        ctx.font = `bold ${Math.round(10 * scaleMult)}px "Plus Jakarta Sans", sans-serif`;
        const maxLen = scaleMult >= 1.4 ? 14 : (scaleMult <= 0.85 ? 8 : 10);
        const truncatedName = node.name.length > maxLen ? node.name.substring(0, maxLen - 1) + '..' : node.name;
        ctx.fillText(truncatedName, avatarX + avatarRadius + Math.round(6 * scaleMult), ry + Math.round(18 * scaleMult));

        // Subtitle / Title
        ctx.fillStyle = isDarkMode ? '#94a3b8' : '#64748b';
        ctx.font = `${Math.round(8.5 * scaleMult)}px "Plus Jakarta Sans", sans-serif`;
        const titleText = node.title || GENERATION_SHORT_NAMES[node.level];
        const truncatedTitle = titleText.length > maxLen + 3 ? titleText.substring(0, maxLen + 2) + '..' : titleText;
        ctx.fillText(truncatedTitle, avatarX + avatarRadius + Math.round(6 * scaleMult), ry + Math.round(33 * scaleMult));

        // Claimed Indicator Badge
        if (node.claimed) {
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.arc(rx + width - Math.round(8 * scaleMult), ry + Math.round(8 * scaleMult), Math.round(4 * scaleMult), 0, 2 * Math.PI);
          ctx.fill();
        }

        // Generation Tag Pill (Top Center)
        ctx.fillStyle = node.color;
        const genLabel = GENERATION_SHORT_NAMES[node.level].split(':')[1]?.trim() || '';
        ctx.font = `bold ${Math.round(7.5 * scaleMult)}px "Plus Jakarta Sans", sans-serif`;
        const genWidth = ctx.measureText(genLabel).width + 8;
        ctx.beginPath();
        ctx.roundRect(-genWidth / 2, ry - Math.round(6 * scaleMult), genWidth, Math.round(11 * scaleMult), 3);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(genLabel, 0, ry - Math.round(1 * scaleMult));
      } else if (node.level === 4) {
        // Anak Node (Level 4): Modul Buah/Daun Photo Frame
        const radius = Math.round(18 * scaleMult);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = Math.round(8 * scaleMult);
        ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff';
        ctx.strokeStyle = node.color;
        ctx.lineWidth = Math.max(2, Math.round(2.5 * scaleMult));

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Trah Accent Circle inside
        ctx.fillStyle = frameColorMode === 'generation' ? node.color : node.trahColor;
        ctx.beginPath();
        ctx.arc(0, 0, Math.round(radius * 0.72), 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(11 * scaleMult)}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.name.charAt(0).toUpperCase(), 0, 0);

        // Name Banner Pill underneath (Modul Daun / Buah)
        ctx.fillStyle = isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1;
        ctx.font = `bold ${Math.round(9 * scaleMult)}px "Plus Jakarta Sans", sans-serif`;
        const textWidth = ctx.measureText(node.name).width + Math.round(12 * scaleMult);
        ctx.beginPath();
        ctx.roundRect(-textWidth / 2, radius + Math.round(4 * scaleMult), textWidth, Math.round(16 * scaleMult), 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isDarkMode ? '#f8fafc' : '#0f172a';
        ctx.fillText(node.name, 0, radius + Math.round(12 * scaleMult));
      } else {
        // Cucu & Cicit (Level 5 & 6 - Buah Ripe Berries & Blooms)
        const radius = Math.round((node.level === 5 ? 13 : 10) * scaleMult);
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Trah Center Core
        ctx.fillStyle = frameColorMode === 'generation' ? '#ffffff' : node.trahColor;
        ctx.beginPath();
        ctx.arc(0, 0, Math.round(radius * 0.45), 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = isDarkMode ? '#e2e8f0' : '#1e293b';
        ctx.font = `bold ${Math.round(8 * scaleMult)}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(node.name, 0, radius + Math.round(10 * scaleMult));
      }

      ctx.restore();
    });

    ctx.restore();
  }, [
    familyNodes,
    computeActiveLayout,
    showOrbitRings,
    showConnectors,
    connectorStyle,
    isDarkMode,
    activeTheme,
    activeTab,
    activeTrahFilter,
    canvasPaperSize,
    frameScaleSize,
    layoutMode,
    getPaperPixelDimensions,
    frameColorMode
  ]);

  // Handle Resize and Initial Pan
  const resizeCanvas = useCallback(() => {
    if (activeTab !== 'orbitqu') return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    if (panXRef.current === 0 && panYRef.current === 0) {
      panXRef.current = canvas.width / 2;
      panYRef.current = canvas.height / 2;
    }

    renderCanvas();
  }, [renderCanvas, activeTab]);

  useEffect(() => {
    if (activeTab === 'orbitqu') {
      setTimeout(() => {
        resizeCanvas();
      }, 50);
    }
  }, [activeTab, resizeCanvas]);

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [
    renderCanvas,
    activeTheme,
    activeTrahFilter,
    showOrbitRings,
    showConnectors,
    connectorStyle,
    canvasPaperSize,
    paperOrientation,
    frameScaleSize,
    layoutMode,
    generationColors,
    frameColorMode,
    isDarkMode,
    familyNodes
  ]);

  // Zoom Controls
  const handleZoom = (factor: number) => {
    scaleRef.current = Math.max(0.25, Math.min(3.5, scaleRef.current * factor));
    renderCanvas();
  };

  const handleResetZoom = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    scaleRef.current = 1;
    panXRef.current = canvas.width / 2;
    panYRef.current = canvas.height / 2;
    renderCanvas();
    showNotification('Posisi kanvas disetel ulang ke poros tengah');
  };

  // Reset manual positions back to auto
  const handleResetManualPositions = () => {
    if (window.confirm('Setel ulang seluruh posisi simpul manual kembali ke tata letak otomatis?')) {
      const reset = familyNodes.map(n => ({
        ...n,
        manualX: undefined,
        manualY: undefined
      }));
      saveFamilyData(reset);
      showNotification('Seluruh simpul dikembalikan ke tata letak otomatis');
    }
  };

  // Mouse & Touch Handlers (with Manual Drag support)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - panXRef.current) / scaleRef.current;
    const mouseY = (e.clientY - rect.top - panYRef.current) / scaleRef.current;

    const currentLayout = computeActiveLayout(familyNodes);

    if (layoutMode === 'manual') {
      for (let i = currentLayout.length - 1; i >= 0; i--) {
        const node = currentLayout[i];
        const hitRadius = node.level <= 3 ? 60 * (node.frameScale || 1) : 25 * (node.frameScale || 1);
        const dist = Math.hypot(mouseX - node.x, mouseY - node.y);

        if (dist <= hitRadius) {
          draggingNodeIdRef.current = node.id;
          nodeDragOffsetRef.current = { x: mouseX - node.x, y: mouseY - node.y };
          hasMovedNodeRef.current = false;
          return;
        }
      }
    }

    // Default Pan
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - panXRef.current,
      y: e.clientY - panYRef.current
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (draggingNodeIdRef.current) {
      hasMovedNodeRef.current = true;
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - panXRef.current) / scaleRef.current;
      const mouseY = (e.clientY - rect.top - panYRef.current) / scaleRef.current;

      const targetX = Math.round(mouseX - nodeDragOffsetRef.current.x);
      const targetY = Math.round(mouseY - nodeDragOffsetRef.current.y);

      setFamilyNodes(prev => prev.map(n => {
        if (n.id === draggingNodeIdRef.current) {
          return { ...n, manualX: targetX, manualY: targetY };
        }
        return n;
      }));
      return;
    }

    if (!isDraggingRef.current) return;
    panXRef.current = e.clientX - dragStartRef.current.x;
    panYRef.current = e.clientY - dragStartRef.current.y;
    renderCanvas();
  };

  const handleMouseUp = () => {
    if (draggingNodeIdRef.current) {
      if (hasMovedNodeRef.current) {
        saveFamilyData(familyNodes);
      } else {
        openNodeDetailModal(draggingNodeIdRef.current);
      }
      draggingNodeIdRef.current = null;
      hasMovedNodeRef.current = false;
      return;
    }
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    handleZoom(factor);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const touchX = (touch.clientX - rect.left - panXRef.current) / scaleRef.current;
      const touchY = (touch.clientY - rect.top - panYRef.current) / scaleRef.current;

      if (layoutMode === 'manual') {
        const currentLayout = computeActiveLayout(familyNodes);
        for (let i = currentLayout.length - 1; i >= 0; i--) {
          const node = currentLayout[i];
          const hitRadius = node.level <= 3 ? 60 * (node.frameScale || 1) : 25 * (node.frameScale || 1);
          const dist = Math.hypot(touchX - node.x, touchY - node.y);

          if (dist <= hitRadius) {
            draggingNodeIdRef.current = node.id;
            nodeDragOffsetRef.current = { x: touchX - node.x, y: touchY - node.y };
            hasMovedNodeRef.current = false;
            return;
          }
        }
      }

      isDraggingRef.current = true;
      dragStartRef.current = {
        x: touch.clientX - panXRef.current,
        y: touch.clientY - panYRef.current
      };
    } else if (e.touches.length === 2) {
      touchStartDistRef.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (draggingNodeIdRef.current && e.touches.length === 1) {
      hasMovedNodeRef.current = true;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const touchX = (touch.clientX - rect.left - panXRef.current) / scaleRef.current;
      const touchY = (touch.clientY - rect.top - panYRef.current) / scaleRef.current;

      const targetX = Math.round(touchX - nodeDragOffsetRef.current.x);
      const targetY = Math.round(touchY - nodeDragOffsetRef.current.y);

      setFamilyNodes(prev => prev.map(n => {
        if (n.id === draggingNodeIdRef.current) {
          return { ...n, manualX: targetX, manualY: targetY };
        }
        return n;
      }));
      return;
    }

    if (isDraggingRef.current && e.touches.length === 1) {
      panXRef.current = e.touches[0].clientX - dragStartRef.current.x;
      panYRef.current = e.touches[0].clientY - dragStartRef.current.y;
      renderCanvas();
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartDistRef.current;
      handleZoom(factor > 1 ? 1.02 : 0.98);
      touchStartDistRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    if (draggingNodeIdRef.current) {
      if (hasMovedNodeRef.current) {
        saveFamilyData(familyNodes);
      } else {
        openNodeDetailModal(draggingNodeIdRef.current);
      }
      draggingNodeIdRef.current = null;
      hasMovedNodeRef.current = false;
      return;
    }
    isDraggingRef.current = false;
  };

  // Click on Canvas -> Open Node Detail Modal (in Auto mode)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (layoutMode === 'manual') return; // Handled by mouse up
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - panXRef.current) / scaleRef.current;
    const mouseY = (e.clientY - rect.top - panYRef.current) / scaleRef.current;

    const calculatedNodes = computeActiveLayout(familyNodes);

    for (let i = calculatedNodes.length - 1; i >= 0; i--) {
      const node = calculatedNodes[i];
      const clickRadius = node.level <= 3 ? 55 * (node.frameScale || 1) : 25 * (node.frameScale || 1);
      const dist = Math.hypot(mouseX - node.x, mouseY - node.y);

      if (dist <= clickRadius) {
        openNodeDetailModal(node.id);
        break;
      }
    }
  };

  // Export High-Res Canvas Image for Print (PNG)
  const handleExportPrintPNG = () => {
    const paperDim = getPaperPixelDimensions();
    const exportWidth = paperDim ? paperDim.width : 2400;
    const exportHeight = paperDim ? paperDim.height : 1600;

    const offscreen = document.createElement('canvas');
    offscreen.width = exportWidth;
    offscreen.height = exportHeight;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = isDarkMode ? '#0b0f19' : '#ffffff';
    ctx.fillRect(0, 0, exportWidth, exportHeight);

    ctx.save();
    ctx.translate(exportWidth / 2, exportHeight / 2);

    // Frame scale & nodes
    const calculatedNodes = computeActiveLayout(familyNodes);
    const frameScale = FRAME_SCALE_CONFIG[frameScaleSize]?.scale || 1.0;

    // Lineage connectors: Double Tracks in Organic Flow or quadratic curves
    if (showConnectors) {
      if (layoutMode === 'organic_flow') {
        drawOrganicDoubleTracks(ctx, calculatedNodes, frameScale, isDarkMode);
      } else {
        ctx.lineWidth = 2 * frameScale;
        calculatedNodes.forEach(node => {
          if (node.parentId) {
            const parent = calculatedNodes.find(n => n.id === node.parentId);
            if (parent && (activeTrahFilter === 'ALL' || parent.trah === activeTrahFilter)) {
              ctx.strokeStyle = node.color;
              ctx.beginPath();
              ctx.moveTo(parent.x, parent.y);
              const cx = (parent.x + node.x) / 2;
              const cy = (parent.y + node.y) / 2;
              ctx.quadraticCurveTo(cx, cy, node.x, node.y);
              ctx.stroke();
            }
          }
        });
      }
    }

    // Nodes (including Leaves & Fruits for terminal generations in Organic Flow)
    calculatedNodes.forEach(node => {
      ctx.save();
      ctx.translate(node.x, node.y);
      const scaleMult = node.frameScale || 1.0;

      if (layoutMode === 'organic_flow' && node.level >= 4) {
        drawOrganicLeavesAndFruit(ctx, 0, 0, scaleMult, isDarkMode);
      }

      if (node.level <= 3) {
        const width = Math.round(120 * scaleMult);
        const height = Math.round(50 * scaleMult);
        ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff';
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-width / 2, -height / 2, width, height, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
        ctx.font = `bold ${Math.round(11 * scaleMult)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(node.name, 0, -2);

        ctx.fillStyle = node.color;
        ctx.font = `${Math.round(9 * scaleMult)}px sans-serif`;
        ctx.fillText(node.title || GENERATION_SHORT_NAMES[node.level], 0, 14);
      } else {
        const radius = Math.round(16 * scaleMult);
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(10 * scaleMult)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.name.charAt(0).toUpperCase(), 0, 0);

        ctx.fillStyle = isDarkMode ? '#f8fafc' : '#0f172a';
        ctx.font = `bold ${Math.round(9 * scaleMult)}px sans-serif`;
        ctx.fillText(node.name, 0, radius + 12);
      }
      ctx.restore();
    });

    // Decorative print border & title
    ctx.restore();

    ctx.strokeStyle = isDarkMode ? 'rgba(245, 158, 11, 0.6)' : 'rgba(217, 119, 6, 0.7)';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, exportWidth - 60, exportHeight - 60);

    ctx.fillStyle = isDarkMode ? '#f8fafc' : '#0f172a';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BAGAN SILSILAH KELUARGA BESAR 7 GENERASI', exportWidth / 2, 70);

    ctx.fillStyle = isDarkMode ? '#94a3b8' : '#64748b';
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    const layoutLabel = layoutMode === 'organic_flow' ? 'Organic Flow & Double Tracks' : (layoutMode === 'auto_tree' ? 'Pohon Silsilah' : (layoutMode === 'manual' ? 'Manual Geser' : 'Orbit Elips'));
    ctx.fillText(`Format: ${canvasPaperSize} • Ukuran Frame: ${frameScaleSize} • Tata Letak: ${layoutLabel} • OrbitQu LeluhurQu`, exportWidth / 2, 94);

    const link = document.createElement('a');
    link.download = `Silsilah_Keluarga_${canvasPaperSize}_${Date.now()}.png`;
    link.href = offscreen.toDataURL('image/png');
    link.click();
    showNotification(`Bagan silsilah format ${canvasPaperSize} berhasil diunduh sebagai gambar cetak HD!`);
  };

  // Dedicated High-Res Print Export Pipeline (Vector SVG Mode for A4 to A0)
  const handleExportTreeSVG = () => {
    const paperDim = getPaperPixelDimensions() || { width: 2400, height: 1600, widthMm: 841, heightMm: 594 };
    const calculatedNodes = computeActiveLayout(familyNodes);
    const frameScale = FRAME_SCALE_CONFIG[frameScaleSize]?.scale || 1.0;

    const svgContent = generateTreeOfLifeSVG(calculatedNodes as any, {
      paperSize: canvasPaperSize,
      paperDimensions: paperDim,
      frameScaleSize,
      frameScale,
      isDarkMode,
      showConnectors,
      activeTrahFilter,
      frameColorMode,
      trahName: activeTrahFilter === 'ALL' ? 'Semua 4 Trah Lengkap' : getTrahName(activeTrahFilter)
    });

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `Silsilah_TreeOfLife_${canvasPaperSize}_${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    showNotification(`🌿 File Vektor SVG Tree of Life (${canvasPaperSize}) berhasil diunduh! Siap cetak kanvas A0-A4 resolusi tajam.`);
  };

  // Profile Detail & Revision Modal Management
  const openNodeDetailModal = (nodeId: string) => {
    const node = familyNodes.find(n => n.id === nodeId);
    if (!node) return;
    setDetailNodeId(nodeId);
    setSelectedNodeId(nodeId);
    setEditNodeName(node.name);
    setEditNodeTitle(node.title || '');
    setEditNodeTrah(node.trah || 'TRAH1');
    setEditNodePhoto(node.photo || '');
    setEditNodeCity(node.city || '');
    setEditNodePhone(node.phone || '');
    setEditNodeBirthYear(node.birthYear || '');
    setEditNodePassedYear(node.passedYear || '');
    setEditNodeIsDeceased(!!node.isDeceased);
    setEditNodeBio(node.bio || '');
    setIsEditModalOpen(true);
  };

  const closeNodeModal = () => {
    setIsEditModalOpen(false);
    setDetailNodeId(null);
  };

  const handleSaveNodeRevision = () => {
    if (!detailNodeId) return;
    const updated = familyNodes.map(node => {
      if (node.id === detailNodeId) {
        return {
          ...node,
          name: editNodeName.trim() || node.name,
          title: editNodeTitle.trim(),
          trah: editNodeTrah,
          photo: editNodePhoto.trim(),
          city: editNodeCity.trim(),
          phone: editNodePhone.trim(),
          birthYear: editNodeBirthYear.trim(),
          passedYear: editNodePassedYear.trim(),
          isDeceased: editNodeIsDeceased,
          bio: editNodeBio.trim()
        };
      }
      return node;
    });
    saveFamilyData(updated);
    closeNodeModal();
    showNotification('Profil anggota silsilah berhasil diperbarui');
  };

  const handleToggleClaim = (nodeId: string) => {
    const targetNode = familyNodes.find(n => n.id === nodeId);
    if (!targetNode) return;
    const nextClaimed = !targetNode.claimed;

    const updated = familyNodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, claimed: nextClaimed };
      }
      return node;
    });
    saveFamilyData(updated);
    showNotification(nextClaimed ? `Profil "${targetNode.name}" berhasil Anda klaim!` : `Klaim profil "${targetNode.name}" dibatalkan`);
  };

  const handleDeleteNode = (nodeId: string) => {
    const target = familyNodes.find(n => n.id === nodeId);
    if (!target) return;

    if (window.confirm(`Hapus "${target.name}" beserta garis keturunan langsungnya?`)) {
      const updated = familyNodes.filter(n => n.id !== nodeId && n.parentId !== nodeId);
      saveFamilyData(updated);
      closeNodeModal();
      showNotification('Anggota silsilah telah dihapus');
    }
  };

  // Batch Input Integration
  const handleBatchParentChange = (parentId: string) => {
    setBatchParentId(parentId);
    if (parentId !== 'ROOT') {
      const parent = familyNodes.find(n => n.id === parentId);
      if (parent) {
        setBatchTrah(parent.trah);
      }
    }
  };

  const getTargetGenerationLevel = (): number => {
    if (batchParentId === 'ROOT') return 0;
    const parent = familyNodes.find(n => n.id === batchParentId);
    if (!parent) return 0;
    return Math.min(6, parent.level + 1);
  };

  const getTargetGenerationLabel = () => {
    return GENERATION_NAMES[getTargetGenerationLevel()];
  };

  const handleSubmitBatch = () => {
    if (!batchNames.trim()) {
      showNotification('Masukkan minimal satu nama (pisahkan dengan koma)');
      return;
    }

    const rawNames = batchNames.split(',').map(n => n.trim()).filter(n => n.length > 0);
    if (rawNames.length === 0) return;

    const targetLevel = getTargetGenerationLevel();
    let chosenTrah = batchTrah;
    let parentX = 0;
    let parentY = 0;

    if (batchParentId !== 'ROOT') {
      const parent = familyNodes.find(n => n.id === batchParentId);
      if (parent) {
        chosenTrah = parent.trah;
        if (typeof parent.manualX === 'number' && typeof parent.manualY === 'number') {
          parentX = parent.manualX;
          parentY = parent.manualY;
        }
      }
    }

    const frameScale = FRAME_SCALE_CONFIG[frameScaleSize]?.scale || 1.0;
    const spacing = 130 * frameScale;

    const newNodes: FamilyNode[] = rawNames.map((name, idx) => {
      const manualX = layoutMode === 'manual'
        ? Math.round(parentX + (idx - (rawNames.length - 1) / 2) * spacing)
        : undefined;
      const manualY = layoutMode === 'manual'
        ? Math.round(parentY + (110 * frameScale))
        : undefined;

      return {
        id: 'node_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        name,
        title: targetLevel <= 2 ? 'Prioritas Dikenal' : (targetLevel >= 5 ? 'Keluarga Inti' : 'Anggota'),
        level: targetLevel,
        trah: chosenTrah,
        parentId: batchParentId === 'ROOT' ? null : batchParentId,
        photo: '',
        claimed: false,
        manualX,
        manualY
      };
    });

    const updated = [...familyNodes, ...newNodes];
    saveFamilyData(updated);
    setBatchNames('');
    setIsBatchDrawerOpen(false);
    showNotification(`Berhasil menambahkan ${newNodes.length} keturunan baru ke ${getTrahName(chosenTrah)} dengan warna frame level ${targetLevel}!`);
  };

  // Medsos Post & Interaction Handlers
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      showNotification('Tuliskan kabar atau pesan keluarga terlebih dahulu');
      return;
    }

    const authorNode = familyNodes.find(n => n.id === 'root_user');
    const newPost: FamilyPost = {
      id: 'post_' + Date.now(),
      authorName: newPostAuthor,
      authorTrah: authorNode?.trah || 'TRAH1',
      category: newPostCategory,
      targetTrah: newPostTargetTrah,
      content: newPostContent.trim(),
      createdAt: 'Baru saja',
      likes: 1,
      hasLiked: true,
      comments: []
    };

    const updated = [newPost, ...medsosPosts];
    saveMedsosPosts(updated);
    setNewPostContent('');
    setIsPostFormOpen(false);
    showNotification('Kabar keluarga berhasil dibagikan ke feed Medsos!');
  };

  const handleToggleLikePost = (postId: string) => {
    const updated = medsosPosts.map(post => {
      if (post.id === postId) {
        const nextLiked = !post.hasLiked;
        return {
          ...post,
          hasLiked: nextLiked,
          likes: nextLiked ? post.likes + 1 : Math.max(0, post.likes - 1)
        };
      }
      return post;
    });
    saveMedsosPosts(updated);
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputMap[postId]?.trim();
    if (!text) return;

    const newComment: FamilyPostComment = {
      id: 'c_' + Date.now(),
      author: 'Hendriana (User)',
      text,
      time: 'Baru saja'
    };

    const updated = medsosPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    });
    saveMedsosPosts(updated);
    setCommentInputMap(prev => ({ ...prev, [postId]: '' }));
    showNotification('Doa/komentar berhasil dikirim');
  };

  // JSON Export / Import / Reset
  const handleExportJSON = () => {
    const exportBundle = {
      version: '2.0',
      appName: 'OrbitQu LeluhurQu',
      exportedAt: new Date().toISOString(),
      nodesCount: familyNodes.length,
      familyNodes,
      medsosPosts,
      generationColors,
      canvasPaperSize,
      frameScaleSize,
      layoutMode
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `OrbitQu_LeluhurQu_Backup_${Date.now()}.json`);
    dlAnchorElem.click();
    showNotification('Cadangan data SilsilahQu (.JSON) berhasil diunduh');
  };

  const handleCopyTextSummary = () => {
    const summaryText = `=== POHON SILSILAH KELUARGA ORBITQU (7 GENERASI) ===\nTotal Anggota: ${familyNodes.length}\n` +
      `Trah Ayah User: ${stats.trah1Count} anggota\n` +
      `Trah Ibu User: ${stats.trah2Count} anggota\n` +
      `Trah Ayah Pasangan: ${stats.trah3Count} anggota\n` +
      `Trah Ibu Pasangan: ${stats.trah4Count} anggota\n\n` +
      familyNodes.map(n => `[Level ${n.level}] ${n.name} (${n.title || '-'}) • ${getTrahName(n.trah)}`).join('\n');

    navigator.clipboard.writeText(summaryText);
    showNotification('Rangkuman teks silsilah berhasil disalin ke clipboard');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          saveFamilyData(imported);
          showNotification('Data Silsilah keluarga berhasil diimpor!');
        } else if (imported && Array.isArray(imported.familyNodes)) {
          saveFamilyData(imported.familyNodes);
          if (Array.isArray(imported.medsosPosts)) {
            saveMedsosPosts(imported.medsosPosts);
          }
          if (imported.generationColors) {
            saveGenerationColors(imported.generationColors);
          }
          showNotification('Paket lengkap SilsilahQu, Medsos & Warna berhasil dipulihkan!');
        } else {
          showNotification('Format data JSON silsilah tidak valid');
        }
      } catch (err) {
        showNotification('Gagal membaca file JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDemo = () => {
    if (window.confirm('Muat ulang data awal contoh (Demo 4 Trah Lengkap)? Data kustom saat ini akan ditimpa.')) {
      saveFamilyData(INITIAL_FAMILY_DATA);
      saveMedsosPosts(INITIAL_MEDSOS_POSTS);
      saveGenerationColors(DEFAULT_GENERATION_COLORS);
      showNotification('Data telah disetel ulang ke contoh 4 Trah lengkap');
    }
  };

  const handleResetCleanSlate = () => {
    if (window.confirm('Reset seluruh data silsilah ke lembar bersih (Clean Slate)? Hanya menyisakan Poros Inti User.')) {
      const cleanRoot: FamilyNode[] = [
        { id: 'root_user', name: 'User Utama', title: 'Poros Inti', level: 3, trah: 'TRAH1', parentId: null, photo: '', claimed: true }
      ];
      saveFamilyData(cleanRoot);
      showNotification('Database dibersihkan kembali ke Poros Inti');
    }
  };

  const activeDetailNode = familyNodes.find(n => n.id === detailNodeId);
  const parentNode = activeDetailNode?.parentId ? familyNodes.find(n => n.id === activeDetailNode.parentId) : null;
  const childNodes = activeDetailNode ? familyNodes.filter(n => n.parentId === activeDetailNode.id) : [];

  // STRICT Medsos Filtering (No cross-mixing between trahs)
  const filteredMedsosPosts = useMemo(() => {
    return medsosPosts.filter(p => {
      if (medsosTrahFilter === 'ALL') return true;
      return p.targetTrah === medsosTrahFilter;
    });
  }, [medsosPosts, medsosTrahFilter]);

  return (
    <div className={`w-full h-full relative select-none flex flex-col overflow-hidden font-sans transition-colors duration-250 ${
      isDarkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* ============================================================== */}
      {/* TOP HEADER BAR                                                 */}
      {/* ============================================================== */}
      <header className={`z-20 flex items-center justify-between p-2.5 sm:p-3.5 backdrop-blur-md border-b shrink-0 transition-colors ${
        isDarkMode ? 'bg-gray-950/85 border-gray-800 text-gray-100' : 'bg-white/90 border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="flex items-center gap-2">
          {/* Back button */}
          <button
            onClick={onBackToMain}
            className={`p-2 rounded-xl transition active:scale-95 flex items-center justify-center ${
              isDarkMode ? 'bg-gray-800/80 hover:bg-gray-700 text-gray-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Kembali ke Beranda WargaQu"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Logo Badge */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center font-black text-sm text-white shadow-md shadow-amber-500/20">
            OQ
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base leading-tight tracking-wide flex items-center gap-1.5">
              <span>OrbitQu</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25">
                LeluhurQu
              </span>
            </h1>
            <p className="text-[10px] text-gray-400 hidden sm:block">
              Kanvas A0-A4 • Frame A4-A7 • Tata Letak Auto/Manual &amp; 4 Trah
            </p>
          </div>
        </div>

        {/* Right Header Quick Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Dark / Light Toggle */}
          <button
            onClick={() => {
              const nextDark = !isDarkMode;
              setIsDarkMode(nextDark);
              localStorage.setItem('orbitqu_dark_mode', String(nextDark));
              showNotification(nextDark ? 'Mode Gelap (Dark Mode) aktif' : 'Mode Terang (Light Mode) aktif');
            }}
            className={`p-2 rounded-xl border text-xs transition active:scale-95 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-amber-400' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-600'
            }`}
            title="Ganti Tema Terang/Gelap"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Batch Input Button */}
          <button
            onClick={() => setIsBatchDrawerOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 font-bold text-xs px-2.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition"
            title="Tambah Keturunan Berantai (Format Koma)"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Input Batch</span>
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN VIEW CONTENT CONTAINER                                    */}
      {/* ============================================================== */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {/* ============================================================ */}
        {/* SUB-VIEW 1: SILSILAHQU (DASHBOARD TOTAL 4 TRAH & LIST VIEW)   */}
        {/* ============================================================ */}
        {activeTab === 'silsilahqu' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* SilsilahQu Segment Switcher Header */}
            <div className={`p-3 border-b flex items-center justify-between shrink-0 ${
              isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-1 bg-black/10 dark:bg-black/30 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setSilsilahSubTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${
                    silsilahSubTab === 'dashboard'
                      ? 'bg-amber-500 text-gray-950 shadow-xs'
                      : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Dashboard 4 Trah</span>
                </button>
                <button
                  onClick={() => setSilsilahSubTab('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${
                    silsilahSubTab === 'list'
                      ? 'bg-amber-500 text-gray-950 shadow-xs'
                      : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>List View Minimalis</span>
                </button>
              </div>

              {/* Quick switch to Orbit Canvas */}
              <button
                onClick={() => setActiveTab('orbitqu')}
                className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition ${
                  isDarkMode ? 'bg-gray-800 border-gray-700 text-amber-400 hover:bg-gray-700' : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                }`}
                title="Buka Visualizer Kanvas Orbit"
              >
                <Disc className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanvas Orbit</span>
              </button>
            </div>

            {/* Sub-tab 1A: DASHBOARD TOTAL 4 TRAH */}
            {silsilahSubTab === 'dashboard' && (
              <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 sm:p-4 space-y-4 pb-20">
                {/* Global Summary Metric Banner */}
                <div className={`p-4 rounded-2xl border relative overflow-hidden shadow-sm ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-amber-950/40 border-amber-500/25'
                    : 'bg-gradient-to-br from-amber-50 via-white to-orange-50 border-amber-200/80'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                        <GitFork className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-xs uppercase tracking-wider font-extrabold text-amber-500">
                          Total Silsilah Terdata
                        </h2>
                        <p className={`text-2xl font-black font-mono leading-none mt-0.5 ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {stats.total} <span className="text-xs font-semibold text-gray-400 font-sans">Anggota Keluarga</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        {stats.claimedCount} Diklaim
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {stats.unclaimedCount} Belum Diklaim
                      </p>
                    </div>
                  </div>

                  {/* Quick stats mini pills */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 dark:border-gray-800 text-center">
                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-gray-800/60' : 'bg-white/80 border border-amber-100'}`}>
                      <p className="text-[10px] text-gray-400">Generasi Aktif</p>
                      <p className="text-sm font-bold text-amber-500">7 Level</p>
                    </div>
                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-gray-800/60' : 'bg-white/80 border border-amber-100'}`}>
                      <p className="text-[10px] text-gray-400">Masih Hidup</p>
                      <p className="text-sm font-bold text-emerald-500">{stats.livingCount} Jiwa</p>
                    </div>
                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-gray-800/60' : 'bg-white/80 border border-amber-100'}`}>
                      <p className="text-[10px] text-gray-400">Telah Wafat</p>
                      <p className="text-sm font-bold text-gray-400">{stats.deceasedCount} Jiwa</p>
                    </div>
                  </div>
                </div>

                {/* 4 TRAH DETAILED CARDS */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Rincian 4 Kuadran Trah Terpisah
                    </h3>
                    <span className="text-[10px] text-amber-500 font-semibold">Klik kartu untuk filter murni</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Trah 1: Ayah User */}
                    <div
                      onClick={() => {
                        setActiveTrahFilter('TRAH1');
                        setSilsilahSubTab('list');
                        showNotification('Filter aktif: Trah Ayah User (Merah)');
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer active:scale-98 transition group relative overflow-hidden ${
                        isDarkMode ? 'bg-gray-900 border-red-500/30 hover:border-red-500/60' : 'bg-white border-red-200 hover:border-red-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#EF4444] shadow-xs shadow-red-500/50"></span>
                          <h4 className="text-xs font-bold">Trah Ayah User</h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20">
                          {stats.trah1Count} Anggota
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-1">Garis Kyai Sanusi &amp; H. Baharuddin</p>
                      <div className="mt-2.5 pt-2 border-t border-gray-800 dark:border-gray-800 flex items-center justify-between text-[10px]">
                        <span className="text-gray-400">Kuadran I (Top-Left)</span>
                        <span className="text-emerald-500 font-semibold">{stats.trah1Claimed} Terklaim</span>
                      </div>
                    </div>

                    {/* Trah 2: Ibu User */}
                    <div
                      onClick={() => {
                        setActiveTrahFilter('TRAH2');
                        setSilsilahSubTab('list');
                        showNotification('Filter aktif: Trah Ibu User (Biru)');
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer active:scale-98 transition group relative overflow-hidden ${
                        isDarkMode ? 'bg-gray-900 border-blue-500/30 hover:border-blue-500/60' : 'bg-white border-blue-200 hover:border-blue-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#3B82F6] shadow-xs shadow-blue-500/50"></span>
                          <h4 className="text-xs font-bold">Trah Ibu User</h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/20">
                          {stats.trah2Count} Anggota
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-1">Garis Nyai Hj. Aminah &amp; H. Syamsul Maarif</p>
                      <div className="mt-2.5 pt-2 border-t border-gray-800 dark:border-gray-800 flex items-center justify-between text-[10px]">
                        <span className="text-gray-400">Kuadran II (Top-Right)</span>
                        <span className="text-emerald-500 font-semibold">{stats.trah2Claimed} Terklaim</span>
                      </div>
                    </div>

                    {/* Trah 3: Ayah Pasangan */}
                    <div
                      onClick={() => {
                        setActiveTrahFilter('TRAH3');
                        setSilsilahSubTab('list');
                        showNotification('Filter aktif: Trah Ayah Pasangan (Hijau)');
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer active:scale-98 transition group relative overflow-hidden ${
                        isDarkMode ? 'bg-gray-900 border-emerald-500/30 hover:border-emerald-500/60' : 'bg-white border-emerald-200 hover:border-emerald-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#10B981] shadow-xs shadow-emerald-500/50"></span>
                          <h4 className="text-xs font-bold">Trah Ayah Pasangan</h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {stats.trah3Count} Anggota
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-1">Garis R. Somawinata &amp; Drs. H. Subagja</p>
                      <div className="mt-2.5 pt-2 border-t border-gray-800 dark:border-gray-800 flex items-center justify-between text-[10px]">
                        <span className="text-gray-400">Kuadran III (Bottom-Left)</span>
                        <span className="text-emerald-500 font-semibold">{stats.trah3Claimed} Terklaim</span>
                      </div>
                    </div>

                    {/* Trah 4: Ibu Pasangan */}
                    <div
                      onClick={() => {
                        setActiveTrahFilter('TRAH4');
                        setSilsilahSubTab('list');
                        showNotification('Filter aktif: Trah Ibu Pasangan (Kuning)');
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer active:scale-98 transition group relative overflow-hidden ${
                        isDarkMode ? 'bg-gray-900 border-amber-500/30 hover:border-amber-500/60' : 'bg-white border-amber-200 hover:border-amber-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#F59E0B] shadow-xs shadow-amber-500/50"></span>
                          <h4 className="text-xs font-bold">Trah Ibu Pasangan</h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">
                          {stats.trah4Count} Anggota
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-1">Garis Hj. Siti Rohmah &amp; Hj. Ratnasari</p>
                      <div className="mt-2.5 pt-2 border-t border-gray-800 dark:border-gray-800 flex items-center justify-between text-[10px]">
                        <span className="text-gray-400">Kuadran IV (Bottom-Right)</span>
                        <span className="text-emerald-500 font-semibold">{stats.trah4Claimed} Terklaim</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level Generation Breakdown */}
                <div className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200 shadow-xs'
                }`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-between">
                    <span>Sebaran Generasi (Level 0 - 6)</span>
                    <span className="text-[10px] text-amber-500 font-semibold">Tersinkron Kanvas</span>
                  </h3>
                  <div className="space-y-2">
                    {stats.levelCounts.map(lvl => {
                      const pct = stats.total > 0 ? Math.round((lvl.count / stats.total) * 100) : 0;
                      const genColor = generationColors[`level${lvl.level}` as keyof GenerationColors] || '#f59e0b';
                      return (
                        <div key={lvl.level} className="text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: genColor }}></span>
                              {lvl.name}
                            </span>
                            <span className="font-mono text-gray-400">{lvl.count} orang ({pct}%)</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${pct}%`, backgroundColor: genColor }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 1B: LIST VIEW MINIMALIS */}
            {silsilahSubTab === 'list' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search & Trah/Level Filter Controls */}
                <div className={`p-3 border-b space-y-2 shrink-0 ${
                  isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama anggota, gelar, atau kota domisili..."
                      value={listSearch}
                      onChange={(e) => setListSearch(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                        isDarkMode ? 'bg-gray-800/80 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                    {listSearch && (
                      <button
                        onClick={() => setListSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-[11px]">
                    {/* STRICT Trah Filter Buttons */}
                    <button
                      onClick={() => setActiveTrahFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
                        activeTrahFilter === 'ALL'
                          ? 'bg-amber-500 text-gray-950 shadow-xs'
                          : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Semua 4 Trah ({familyNodes.length})
                    </button>
                    <button
                      onClick={() => setActiveTrahFilter('TRAH1')}
                      className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition flex items-center gap-1 ${
                        activeTrahFilter === 'TRAH1'
                          ? 'bg-red-500 text-white shadow-xs'
                          : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> Ayah User ({stats.trah1Count})
                    </button>
                    <button
                      onClick={() => setActiveTrahFilter('TRAH2')}
                      className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition flex items-center gap-1 ${
                        activeTrahFilter === 'TRAH2'
                          ? 'bg-blue-500 text-white shadow-xs'
                          : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span> Ibu User ({stats.trah2Count})
                    </button>
                    <button
                      onClick={() => setActiveTrahFilter('TRAH3')}
                      className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition flex items-center gap-1 ${
                        activeTrahFilter === 'TRAH3'
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Ayah Pasangan ({stats.trah3Count})
                    </button>
                    <button
                      onClick={() => setActiveTrahFilter('TRAH4')}
                      className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition flex items-center gap-1 ${
                        activeTrahFilter === 'TRAH4'
                          ? 'bg-amber-500 text-gray-950 shadow-xs'
                          : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span> Ibu Pasangan ({stats.trah4Count})
                    </button>
                  </div>
                </div>

                {/* Members List */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2 pb-20">
                  {filteredListNodes.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-xs">Tidak ada anggota keluarga yang cocok dengan kriteria pencarian.</p>
                      <button
                        onClick={() => { setListSearch(''); setActiveTrahFilter('ALL'); setListLevelFilter('ALL'); }}
                        className="mt-3 text-amber-500 text-xs font-bold underline"
                      >
                        Reset Filter
                      </button>
                    </div>
                  ) : (
                    filteredListNodes.map(node => (
                      <div
                        key={node.id}
                        onClick={() => openNodeDetailModal(node.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer active:scale-99 transition group ${
                          isDarkMode
                            ? 'bg-gray-900 border-gray-800 hover:border-gray-700'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${getTrahBgClass(node.trah)}`}>
                            {node.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs leading-tight">{node.name}</h4>
                              {node.claimed && (
                                <span className="text-[10px] text-emerald-500 flex items-center gap-0.5">
                                  <CheckCircle className="w-3 h-3" />
                                </span>
                              )}
                              {node.isDeceased && (
                                <span className="text-[10px] text-gray-400 font-mono">(Alm)</span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                              <span className="font-semibold text-amber-500">{GENERATION_SHORT_NAMES[node.level]}</span>
                              <span>•</span>
                              <span>{getTrahName(node.trah)}</span>
                              {node.city && <span>• {node.city}</span>}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openNodeDetailModal(node.id);
                            }}
                            className={`p-1.5 rounded-lg border text-xs transition ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                            }`}
                            title="Detail &amp; Revisi Profil"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* SUB-VIEW 2: ORBITQU (CANVAS DENGAN A0-A4, FRAME A4-A7, DLL)  */}
        {/* ============================================================ */}
        {activeTab === 'orbitqu' && (
          <div className="flex-1 relative flex flex-col overflow-hidden">
            {/* Top Toolbar overlay inside Canvas (Row 1: Kontrol Kanvas Utama) */}
            <div className={`p-2 border-b flex items-center justify-between shrink-0 z-10 gap-2 flex-wrap ${
              isDarkMode ? 'bg-gray-950/85 border-gray-800 backdrop-blur-md' : 'bg-white/95 border-slate-200 backdrop-blur-md'
            }`}>
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* 1. UKURAN KANVAS (A0 - A4 & FIT) */}
                <div className="flex items-center gap-1">
                  <select
                    value={canvasPaperSize}
                    onChange={(e) => {
                      const newSize = e.target.value as CanvasPaperSize;
                      setCanvasPaperSize(newSize);
                      localStorage.setItem('orbitqu_paper_size', newSize);
                      showNotification(`Ukuran Kanvas diubah ke: ${PAPER_CONFIG[newSize].name}`);
                    }}
                    className={`text-xs rounded-lg px-2 py-1 border font-bold focus:outline-hidden ${
                      canvasPaperSize !== 'FIT'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                        : isDarkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                    title="Pilih Ukuran Kanvas Kertas Cetak A0-A4"
                  >
                    <option value="FIT">📐 Kanvas Layar Penuh</option>
                    <option value="A0">📄 Kanvas A0 (841×1189mm)</option>
                    <option value="A1">📄 Kanvas A1 (594×841mm)</option>
                    <option value="A2">📄 Kanvas A2 (420×594mm)</option>
                    <option value="A3">📄 Kanvas A3 (297×420mm)</option>
                    <option value="A4">📄 Kanvas A4 (210×297mm)</option>
                  </select>

                  {/* Orientation Toggle (Landscape / Portrait) */}
                  {canvasPaperSize !== 'FIT' && (
                    <button
                      onClick={() => setPaperOrientation(prev => prev === 'landscape' ? 'portrait' : 'landscape')}
                      className={`text-[10px] font-bold px-1.5 py-1 rounded-lg border transition ${
                        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                      }`}
                      title="Ganti Orientasi Kertas (Lanskap / Potret)"
                    >
                      {paperOrientation === 'landscape' ? '🔄 Lanskap' : '🔄 Potret'}
                    </button>
                  )}
                </div>

                {/* 2. UKURAN FRAME FOTO (A4 - A7) */}
                <select
                  value={frameScaleSize}
                  onChange={(e) => {
                    const newFrame = e.target.value as FrameScaleSize;
                    setFrameScaleSize(newFrame);
                    localStorage.setItem('orbitqu_frame_size', newFrame);
                    showNotification(`Ukuran Frame Foto diubah ke: ${FRAME_SCALE_CONFIG[newFrame].label}`);
                  }}
                  className={`text-xs rounded-lg px-2 py-1 border font-semibold focus:outline-hidden ${
                    isDarkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                  title="Ukuran Frame Foto Simpul (A4 s/d A7)"
                >
                  <option value="A4">🖼️ Frame A4 (Ekstra Besar)</option>
                  <option value="A5">🖼️ Frame A5 (Besar)</option>
                  <option value="A6">🖼️ Frame A6 (Standar)</option>
                  <option value="A7">🖼️ Frame A7 (Kompak/Mini)</option>
                </select>

                {/* 3. TATA LETAK / LAYOUT (ORGANIC FLOW / AUTO ORBIT / AUTO TREE / MANUAL) */}
                <select
                  value={layoutMode}
                  onChange={(e) => {
                    const newMode = e.target.value as LayoutMode;
                    setLayoutMode(newMode);
                    localStorage.setItem('orbitqu_layout_mode', newMode);
                    if (newMode === 'organic_flow') {
                      showNotification('🌿 Engine Tata Letak Aktif: Organic Flow (Double Tracks & Modul Buah/Daun)');
                    } else if (newMode === 'manual') {
                      showNotification('🖐️ Mode Manual Aktif: Seret (drag) simpul untuk mengatur posisi secara bebas');
                    } else if (newMode === 'auto_tree') {
                      showNotification('🌳 Tata letak diubah ke: Pohon Silsilah Hierarki Vertikal');
                    } else {
                      showNotification('🪐 Tata letak diubah ke: Orbit Elips Konsentris');
                    }
                  }}
                  className={`text-xs rounded-lg px-2 py-1 border font-bold focus:outline-hidden ${
                    layoutMode === 'organic_flow'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                      : layoutMode === 'manual'
                      ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                      : isDarkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                  title="Pilih Tata Letak (Organic Flow, Auto Orbit, Pohon Silsilah, atau Manual Drag)"
                >
                  <option value="organic_flow">🌿 Organic Flow (Double Tracks)</option>
                  <option value="auto_orbit">🪐 Auto: Orbit Elips</option>
                  <option value="auto_tree">🌳 Auto: Pohon Silsilah</option>
                  <option value="manual">🖐️ Manual: Bebas Geser</option>
                </select>

                {/* 4. OPSI GARIS KETURUNAN (PAKAI / TIDAK) */}
                <button
                  onClick={() => {
                    const next = !showConnectors;
                    setShowConnectors(next);
                    localStorage.setItem('orbitqu_show_connectors', String(next));
                    showNotification(next ? 'Garis keturunan diaktifkan' : 'Garis keturunan disembunyikan (Foto Bersih)');
                  }}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-bold transition ${
                    showConnectors
                      ? isDarkMode ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      : isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                  title="Pakai / Tidak Garis Keturunan"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{showConnectors ? 'Garis ON' : 'Garis OFF'}</span>
                </button>

                {/* 5. WARNA FRAME GENERASI MODAL BUTTON */}
                <button
                  onClick={() => setIsColorModalOpen(true)}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-bold transition ${
                    isDarkMode ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30' : 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
                  }`}
                  title="Atur Warna Frame Per Generasi (Uyut, Kakek, Ayah, Anak, Cucu)"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Warna Frame</span>
                </button>

                {/* STRICT Trah Filter Dropdown */}
                <select
                  value={activeTrahFilter}
                  onChange={(e) => {
                    const chosen = e.target.value as any;
                    setActiveTrahFilter(chosen);
                    if (chosen !== 'ALL') {
                      showNotification(`Kanvas difilter ke ${getTrahName(chosen)}`);
                    } else {
                      showNotification('Menampilkan seluruh 4 Trah');
                    }
                  }}
                  className={`text-xs rounded-lg px-2 py-1 border focus:outline-hidden font-semibold ${
                    activeTrahFilter !== 'ALL'
                      ? 'bg-amber-500 text-gray-950 border-amber-400'
                      : isDarkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  <option value="ALL">🌐 Semua 4 Trah</option>
                  <option value="TRAH1">🔴 Trah Ayah User (Kuadran I)</option>
                  <option value="TRAH2">🔵 Trah Ibu User (Kuadran II)</option>
                  <option value="TRAH3">🟢 Trah Ayah Pasangan (Kuadran III)</option>
                  <option value="TRAH4">🟡 Trah Ibu Pasangan (Kuadran IV)</option>
                </select>
              </div>

              {/* Right Toolbar Actions */}
              <div className="flex items-center gap-1.5">
                {/* Dedicated High-Res Vector SVG Print Export (A0 to A4) */}
                <button
                  onClick={handleExportTreeSVG}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-bold transition shadow-xs ${
                    isDarkMode
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                  }`}
                  title="Unduh Bagan Vektor SVG murni resolusi tanpa batas untuk cetak kanvas fisik A0-A4 / CorelDraw / Illustrator"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Vektor SVG</span>
                </button>

                {/* Print / Export High-Res PNG Button */}
                <button
                  onClick={handleExportPrintPNG}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-bold transition shadow-xs ${
                    isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500' : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700'
                  }`}
                  title="Cetak &amp; Unduh Gambar Resolusi Tinggi (PNG)"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Cetak HD</span>
                </button>

                {/* Switch to List View */}
                <button
                  onClick={() => {
                    setActiveTab('silsilahqu');
                    setSilsilahSubTab('list');
                  }}
                  className="text-xs text-amber-500 font-bold hover:underline flex items-center gap-1 ml-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mode List</span>
                </button>
              </div>
            </div>

            {/* Floating Banner (Manual Mode Indicator or Trah Filter) */}
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none">
              {layoutMode === 'manual' && (
                <div className="pointer-events-auto bg-purple-600/95 text-white font-bold text-[11px] px-3.5 py-1 rounded-full shadow-lg flex items-center gap-2 border border-purple-400 backdrop-blur-xs">
                  <Move className="w-3 h-3 animate-pulse" />
                  <span>Mode Manual: Seret simpul dengan mouse/jari</span>
                  <button
                    onClick={handleResetManualPositions}
                    className="bg-black/30 hover:bg-black/50 text-[10px] px-2 py-0.5 rounded-full transition ml-1"
                    title="Kembali ke susunan otomatis"
                  >
                    Reset ke Auto
                  </button>
                </div>
              )}

              {activeTrahFilter !== 'ALL' && (
                <div className="pointer-events-auto bg-amber-500 text-gray-950 font-bold text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-2 border border-amber-400 animate-in fade-in slide-in-from-top-2">
                  <span>Filter Murni: {getTrahName(activeTrahFilter)}</span>
                  <button
                    onClick={() => setActiveTrahFilter('ALL')}
                    className="bg-black/20 hover:bg-black/40 rounded-full p-0.5 transition"
                    title="Tampilkan Semua 4 Trah"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Interactive Canvas */}
            <main
              ref={containerRef}
              className={`w-full flex-1 relative ${
                layoutMode === 'manual' ? 'cursor-move' : 'cursor-grab active:cursor-grabbing'
              } overflow-hidden canvas-bg-${activeTheme} ${
                !isDarkMode ? 'light-canvas' : ''
              }`}
            >
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                onClick={handleCanvasClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="w-full h-full block"
              />

              {/* Legend Overlay (Bottom Left) */}
              <div className={`absolute bottom-16 left-3 z-10 backdrop-blur-md p-2.5 rounded-xl border text-xs space-y-1.5 shadow-xl max-w-[240px] sm:max-w-xs transition-opacity ${
                isDarkMode ? 'bg-gray-900/90 border-gray-800 text-gray-300' : 'bg-white/95 border-slate-200 text-slate-700'
              }`}>
                <div className="font-semibold text-[11px] flex items-center justify-between">
                  <span>Generasi &amp; Warna Frame</span>
                  <span className="text-[9px] text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded font-mono font-bold">
                    {frameScaleSize} • {canvasPaperSize}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: generationColors.level0 }}></span> Uyut
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: generationColors.level1 }}></span> Kakek/Nenek
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: generationColors.level2 }}></span> Ayah/Ibu
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: generationColors.level3 }}></span> User/Pasangan
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: generationColors.level4 }}></span> Anak
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: generationColors.level5 }}></span> Cucu (Inti)
                  </div>
                </div>
                <div className={`pt-1 border-t text-[9px] flex items-center justify-between ${isDarkMode ? 'border-gray-800 text-gray-400' : 'border-slate-200 text-slate-500'}`}>
                  <span>Dot Tengah = Kuadran Trah</span>
                  <button
                    onClick={() => setIsColorModalOpen(true)}
                    className="text-amber-500 font-bold underline"
                  >
                    Ubah Warna
                  </button>
                </div>
              </div>

              {/* Zoom Controls (Bottom Right) */}
              <div className="absolute bottom-16 right-3 z-10 flex flex-col gap-1.5">
                <button
                  onClick={() => handleZoom(1.15)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg active:scale-95 transition ${
                    isDarkMode ? 'bg-gray-900/90 hover:bg-gray-800 text-gray-200 border border-gray-800' : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                  title="Perbesar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleZoom(0.85)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg active:scale-95 transition ${
                    isDarkMode ? 'bg-gray-900/90 hover:bg-gray-800 text-gray-200 border border-gray-800' : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                  title="Perkecil"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg active:scale-95 transition text-amber-500 ${
                    isDarkMode ? 'bg-gray-900/90 hover:bg-gray-800 border border-gray-800' : 'bg-white hover:bg-slate-100 border border-slate-200'
                  }`}
                  title="Reset Pandangan ke Poros"
                >
                  <Crosshair className="w-4 h-4" />
                </button>
              </div>
            </main>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUB-VIEW 3: MEDSOS (FEED SILATURAHMI 4 TRAH)                 */}
        {/* ============================================================ */}
        {activeTab === 'medsos' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Medsos Header Filter */}
            <div className={`p-3 border-b space-y-2 shrink-0 ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                    Medsos Silaturahmi 4 Trah
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Kabar keluarga Ayah, Ibu, dan Mertua (Filter murni)
                  </p>
                </div>
                <button
                  onClick={() => setIsPostFormOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 active:scale-95 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Kirim Kabar</span>
                </button>
              </div>

              {/* STRICT Trah Tab Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-[11px]">
                <button
                  onClick={() => setMedsosTrahFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
                    medsosTrahFilter === 'ALL'
                      ? 'bg-amber-500 text-gray-950 shadow-xs'
                      : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Semua Kabar ({medsosPosts.length})
                </button>
                <button
                  onClick={() => setMedsosTrahFilter('TRAH1')}
                  className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition flex items-center gap-1 ${
                    medsosTrahFilter === 'TRAH1'
                      ? 'bg-red-500 text-white shadow-xs'
                      : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Ayah User
                </button>
                <button
                  onClick={() => setMedsosTrahFilter('TRAH2')}
                  className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition flex items-center gap-1 ${
                    medsosTrahFilter === 'TRAH2'
                      ? 'bg-blue-500 text-white shadow-xs'
                      : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Ibu User
                </button>
                <button
                  onClick={() => setMedsosTrahFilter('TRAH3')}
                  className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition flex items-center gap-1 ${
                    medsosTrahFilter === 'TRAH3'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Ayah Pasangan
                </button>
                <button
                  onClick={() => setMedsosTrahFilter('TRAH4')}
                  className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition flex items-center gap-1 ${
                    medsosTrahFilter === 'TRAH4'
                      ? 'bg-amber-500 text-gray-950 shadow-xs'
                      : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Ibu Pasangan
                </button>
              </div>
            </div>

            {/* Medsos Posts Feed */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-3.5 pb-20">
              {filteredMedsosPosts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-xs">Belum ada kabar khusus di trah ini.</p>
                  <button
                    onClick={() => setIsPostFormOpen(true)}
                    className="mt-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs px-3.5 py-2 rounded-xl"
                  >
                    Tulis Kabar Pertama Untuk Trah Ini
                  </button>
                </div>
              ) : (
                filteredMedsosPosts.map(post => (
                  <div
                    key={post.id}
                    className={`p-4 rounded-2xl border transition shadow-sm ${
                      isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Author & Trah Badge Header */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs ${getTrahBgClass(post.authorTrah)}`}>
                          {post.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs leading-tight">{post.authorName}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                            <span className="font-semibold text-amber-500">{getTrahName(post.authorTrah)}</span>
                            <span>•</span>
                            <span>{post.createdAt}</span>
                          </div>
                        </div>
                      </div>
                      <span className="bg-amber-500/10 text-amber-500 border border-amber-500/25 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {post.category}
                      </span>
                    </div>

                    {/* Post Content */}
                    <p className="text-xs leading-relaxed text-gray-200 dark:text-gray-300 whitespace-pre-line mb-3">
                      {post.content}
                    </p>

                    {/* Target Trah Pill */}
                    <div className="mb-2">
                      <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-black/20 dark:bg-black/40 text-gray-400">
                        Penerima: {post.targetTrah === 'ALL' ? '🌐 Semua 4 Trah' : getTrahName(post.targetTrah)}
                      </span>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-gray-800 dark:border-gray-800 text-xs">
                      <button
                        onClick={() => handleToggleLikePost(post.id)}
                        className={`flex items-center gap-1.5 transition font-semibold ${
                          post.hasLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-current' : ''}`} />
                        <span>{post.likes} Aamiin / Suka</span>
                      </button>

                      <div className="text-gray-400 text-xs flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments.length} Doa / Komentar</span>
                      </div>
                    </div>

                    {/* Comments List */}
                    {post.comments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-800/60 dark:border-gray-800/60 space-y-2">
                        {post.comments.map(c => (
                          <div key={c.id} className="text-[11px] bg-black/10 dark:bg-black/30 p-2 rounded-lg">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-bold text-amber-400">{c.author}</span>
                              <span className="text-[9px] text-gray-500">{c.time}</span>
                            </div>
                            <p className="text-gray-300">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    <div className="mt-2.5 flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Tulis ucapan doa atau sapaan..."
                        value={commentInputMap[post.id] || ''}
                        onChange={(e) => setCommentInputMap(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        className={`flex-1 text-xs px-3 py-1.5 rounded-xl border focus:outline-hidden ${
                          isDarkMode ? 'bg-gray-800/80 border-gray-700 text-gray-200' : 'bg-slate-100 border-slate-300 text-slate-800'
                        }`}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="p-1.5 rounded-xl bg-amber-500 text-gray-950 font-bold active:scale-95 transition"
                        title="Kirim Komentar"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUB-VIEW 4: SETTING & BACKUP/RESTORE                         */}
        {/* ============================================================ */}
        {activeTab === 'setting' && (
          <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 sm:p-5 space-y-4 pb-20">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 mb-1">
                Pengaturan SilsilahQu &amp; Backup
              </h2>
              <p className="text-xs text-gray-400">
                Penyimpanan cadangan aman (JSON), cetak kanvas, dan pemulihan data 4 Trah.
              </p>
            </div>

            {/* Print & Canvas Quick Config Box */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-500" />
                <span>Format Cetak &amp; Frame Kanvas</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Ukuran Kertas Kanvas:</label>
                  <select
                    value={canvasPaperSize}
                    onChange={(e) => {
                      const val = e.target.value as CanvasPaperSize;
                      setCanvasPaperSize(val);
                      localStorage.setItem('orbitqu_paper_size', val);
                      showNotification(`Ukuran Kanvas disetel ke ${PAPER_CONFIG[val].name}`);
                    }}
                    className={`w-full p-2 rounded-xl border font-bold ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  >
                    <option value="FIT">Layar Penuh (Responsif)</option>
                    <option value="A0">A0 (841 × 1189 mm) - Rekomendasi Pameran</option>
                    <option value="A1">A1 (594 × 841 mm) - Poster Besar</option>
                    <option value="A2">A2 (420 × 594 mm) - Bagan Sedang</option>
                    <option value="A3">A3 (297 × 420 mm) - Dokumen Standar</option>
                    <option value="A4">A4 (210 × 297 mm) - Lembar Portabel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Ukuran Frame Foto Simpul:</label>
                  <select
                    value={frameScaleSize}
                    onChange={(e) => {
                      const val = e.target.value as FrameScaleSize;
                      setFrameScaleSize(val);
                      localStorage.setItem('orbitqu_frame_size', val);
                      showNotification(`Skala Frame disetel ke ${FRAME_SCALE_CONFIG[val].label}`);
                    }}
                    className={`w-full p-2 rounded-xl border font-bold ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  >
                    <option value="A4">Frame A4 (Ekstra Besar - 155%)</option>
                    <option value="A5">Frame A5 (Besar - 125%)</option>
                    <option value="A6">Frame A6 (Standar Seimbang - 100%)</option>
                    <option value="A7">Frame A7 (Kompak/Mini - 78%)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setIsColorModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95"
                >
                  <Palette className="w-4 h-4" />
                  <span>Kustomisasi Warna Frame Generasi</span>
                </button>
                <button
                  onClick={handleExportPrintPNG}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Gambar Cetak (PNG)</span>
                </button>
              </div>
            </div>

            {/* Backup & Restore Action Box */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Backup &amp; Pemulihan Data (JSON)</span>
              </h3>
              <p className="text-xs text-gray-400">
                Ekspor seluruh data silsilah keluarga, koordinat manual, dan kabar medsos ke file .JSON agar tidak hilang saat ganti perangkat.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={handleExportJSON}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Cadangan Lengkap (.JSON)</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`border font-bold p-3 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95 ${
                    isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-100' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Pulihkan / Impor Cadangan</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCopyTextSummary}
                  className={`w-full border font-semibold p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95 ${
                    isDarkMode ? 'bg-gray-800/60 border-gray-700 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Salin Rangkuman Teks Pohon Silsilah</span>
                </button>
              </div>
            </div>

            {/* Reset Data Section */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-red-950/20 border-red-500/25' : 'bg-red-50/50 border-red-200'
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Zona Reset &amp; Muat Ulang Demo</span>
              </h3>
              <p className="text-xs text-gray-400">
                Pilih opsi di bawah untuk mengembalikan contoh demo atau menghapus riwayat kustom.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={handleResetToDemo}
                  className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/40 font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Muat Ulang Demo 4 Trah Lengkap</span>
                </button>
                <button
                  onClick={handleResetCleanSlate}
                  className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Bersihkan ke Lembar Baru (Clean Slate)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* BOTTOM NAV BAR UNTUK MODUL LELUHURQU                           */}
      {/* ============================================================== */}
      <nav className={`z-20 border-t flex items-center justify-around p-2 shrink-0 backdrop-blur-md transition-colors ${
        isDarkMode ? 'bg-gray-950/90 border-gray-800 text-gray-400' : 'bg-white/95 border-slate-200 text-slate-500 shadow-md'
      }`}>
        <button
          onClick={() => setActiveTab('silsilahqu')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition active:scale-95 ${
            activeTab === 'silsilahqu' ? 'text-amber-500' : 'hover:text-gray-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>SilsilahQu</span>
        </button>

        <button
          onClick={() => setActiveTab('orbitqu')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition active:scale-95 ${
            activeTab === 'orbitqu' ? 'text-amber-500' : 'hover:text-gray-200'
          }`}
        >
          <Disc className="w-4 h-4" />
          <span>Kanvas Orbit</span>
        </button>

        <button
          onClick={() => setActiveTab('medsos')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition active:scale-95 ${
            activeTab === 'medsos' ? 'text-amber-500' : 'hover:text-gray-200'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Medsos 4 Trah</span>
        </button>

        <button
          onClick={() => setActiveTab('setting')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition active:scale-95 ${
            activeTab === 'setting' ? 'text-amber-500' : 'hover:text-gray-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan</span>
        </button>
      </nav>

      {/* ============================================================== */}
      {/* DRAWER: BATCH INPUT KETURUNAN (INTEGRASI FRAME & WARNA GENERASI)*/}
      {/* ============================================================== */}
      {isBatchDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-t-3xl sm:rounded-2xl border shadow-2xl flex flex-col max-h-[85dvh] overflow-hidden ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
              isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Input Keturunan Berantai (Batch)</h3>
                  <p className="text-[11px] text-gray-400">Tambahkan banyak nama anak/cucu sekaligus</p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchDrawerOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto no-scrollbar space-y-3.5 text-xs">
              {/* Step 1: Parent Selector */}
              <div className="space-y-1.5">
                <label className="block font-semibold">1. Pilih Orang Tua / Induk Node:</label>
                <select
                  value={batchParentId}
                  onChange={(e) => handleBatchParentChange(e.target.value)}
                  className={`w-full rounded-lg p-2 text-xs border focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-medium ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="ROOT">🌟 Titik Awal / Leluhur Teratas (Uyut)</option>
                  {familyNodes.map(node => (
                    <option key={node.id} value={node.id}>
                      [{getTrahName(node.trah)} | L{node.level}] {node.name}
                    </option>
                  ))}
                </select>
                <div className="p-2 rounded-xl border flex items-center justify-between mt-1 text-[11px] bg-black/10 dark:bg-black/30">
                  <span className="text-gray-400">Target Generasi Keturunan:</span>
                  <span className="font-bold flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: generationColors[`level${getTargetGenerationLevel()}` as keyof GenerationColors] }}
                    />
                    <span className="text-amber-500">{getTargetGenerationLabel()}</span>
                  </span>
                </div>
              </div>

              {/* Step 2: Trah Selector */}
              <div className="space-y-1.5">
                <label className="block font-semibold">2. Pilih Kuadran Trah Keturunan:</label>
                <select
                  value={batchTrah}
                  onChange={(e) => setBatchTrah(e.target.value as TrahType)}
                  disabled={batchParentId !== 'ROOT'}
                  className={`w-full rounded-lg p-2 text-xs border focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-semibold disabled:opacity-70 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="TRAH1">🔴 Trah Ayah User (Kuadran I)</option>
                  <option value="TRAH2">🔵 Trah Ibu User (Kuadran II)</option>
                  <option value="TRAH3">🟢 Trah Ayah Pasangan (Kuadran III)</option>
                  <option value="TRAH4">🟡 Trah Ibu Pasangan (Kuadran IV)</option>
                </select>
                {batchParentId !== 'ROOT' && (
                  <p className="text-[10px] text-gray-400 italic">*Trah otomatis terkunci mengikuti induk node agar tidak tercampur</p>
                )}
              </div>

              {/* Step 3: Frame Scale & Color Preview */}
              <div className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between ${
                isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-amber-50/60 border-amber-200'
              }`}>
                <div>
                  <p className="font-semibold text-gray-400">Format Visual Otomatis:</p>
                  <p className="font-bold text-amber-500">{FRAME_SCALE_CONFIG[frameScaleSize].label} ({FRAME_SCALE_CONFIG[frameScaleSize].desc})</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-400">Tata Letak Aktif:</p>
                  <p className={`font-bold ${layoutMode === 'organic_flow' ? 'text-emerald-400' : layoutMode === 'manual' ? 'text-purple-400' : 'text-blue-400'}`}>
                    {layoutMode === 'organic_flow'
                      ? '🌿 Organic Flow (Double Tracks)'
                      : layoutMode === 'manual'
                      ? '🖐️ Manual Geser'
                      : (layoutMode === 'auto_tree' ? '🌳 Pohon Silsilah' : '🪐 Orbit Elips')}
                  </p>
                </div>
              </div>

              {/* Step 4: Comma Separated Names */}
              <div className="space-y-1.5">
                <label className="block font-semibold">4. Daftar Keturunan (Pisahkan Koma):</label>
                <textarea
                  rows={3}
                  value={batchNames}
                  onChange={(e) => setBatchNames(e.target.value)}
                  placeholder="Contoh: Sanusi, Baharuddin, Maryam, Nurhayati"
                  className={`w-full rounded-lg p-2.5 text-xs font-mono border focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitBatch}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs active:scale-98 transition"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Keturunan Berantai</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: KUSTOMISASI WARNA FRAME GENERASI (UYUT, KAKEK, AYAH, DLL)*/}
      {/* ============================================================== */}
      {isColorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in zoom-in-95 duration-150">
          <div className={`border rounded-2xl w-full max-w-md max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
              isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-sm">Warna Frame Tiap Generasi</h3>
                  <p className="text-[11px] text-gray-400">Uyut, Kakek, Ayah, User, Anak &amp; Cucu (Keluarga Inti)</p>
                </div>
              </div>
              <button
                onClick={() => setIsColorModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto no-scrollbar space-y-4 text-xs">
              {/* Mode Pewarnaan Frame */}
              <div className="space-y-1.5">
                <label className="block font-semibold">Gaya Pewarnaan Simpul:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setFrameColorMode('hybrid')}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition ${
                      frameColorMode === 'hybrid'
                        ? 'bg-amber-500 text-gray-950 border-amber-400 shadow-xs'
                        : isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    🌟 Hibrida (Rekomendasi)
                  </button>
                  <button
                    onClick={() => setFrameColorMode('generation')}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition ${
                      frameColorMode === 'generation'
                        ? 'bg-amber-500 text-gray-950 border-amber-400 shadow-xs'
                        : isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    👑 Murni Generasi
                  </button>
                  <button
                    onClick={() => setFrameColorMode('trah')}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition ${
                      frameColorMode === 'trah'
                        ? 'bg-amber-500 text-gray-950 border-amber-400 shadow-xs'
                        : isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    🌐 Murni 4 Trah
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 italic">
                  *Mode Hibrida menampilkan bingkai warna generasi dan dot inti warna 4 trah sekaligus.
                </p>
              </div>

              {/* Color Pickers per Generation */}
              <div className="space-y-2.5 pt-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">
                  Pilihan Warna Frame per Level
                </h4>

                {/* Level 0: Uyut */}
                <div className="flex items-center justify-between p-2 rounded-xl border border-gray-800 bg-black/10 dark:bg-black/30">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: generationColors.level0 }} />
                    <span className="font-bold text-xs">Level 0: Uyut (Leluhur Core)</span>
                  </div>
                  <input
                    type="color"
                    value={generationColors.level0}
                    onChange={(e) => saveGenerationColors({ ...generationColors, level0: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                {/* Level 1: Kakek / Nenek */}
                <div className="flex items-center justify-between p-2 rounded-xl border border-gray-800 bg-black/10 dark:bg-black/30">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: generationColors.level1 }} />
                    <span className="font-bold text-xs">Level 1: Kakek / Nenek</span>
                  </div>
                  <input
                    type="color"
                    value={generationColors.level1}
                    onChange={(e) => saveGenerationColors({ ...generationColors, level1: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                {/* Level 2: Ayah / Ibu / Paman */}
                <div className="flex items-center justify-between p-2 rounded-xl border border-gray-800 bg-black/10 dark:bg-black/30">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: generationColors.level2 }} />
                    <span className="font-bold text-xs">Level 2: Ayah / Ibu / Paman</span>
                  </div>
                  <input
                    type="color"
                    value={generationColors.level2}
                    onChange={(e) => saveGenerationColors({ ...generationColors, level2: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                {/* Level 3: User & Pasangan */}
                <div className="flex items-center justify-between p-2 rounded-xl border border-gray-800 bg-black/10 dark:bg-black/30">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: generationColors.level3 }} />
                    <span className="font-bold text-xs">Level 3: User &amp; Pasangan (Poros)</span>
                  </div>
                  <input
                    type="color"
                    value={generationColors.level3}
                    onChange={(e) => saveGenerationColors({ ...generationColors, level3: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                {/* Level 4: Anak */}
                <div className="flex items-center justify-between p-2 rounded-xl border border-gray-800 bg-black/10 dark:bg-black/30">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: generationColors.level4 }} />
                    <span className="font-bold text-xs">Level 4: Anak</span>
                  </div>
                  <input
                    type="color"
                    value={generationColors.level4}
                    onChange={(e) => saveGenerationColors({ ...generationColors, level4: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                {/* Level 5: Cucu (Keluarga Inti Anak + Cucu) */}
                <div className="flex items-center justify-between p-2 rounded-xl border border-gray-800 bg-black/10 dark:bg-black/30">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: generationColors.level5 }} />
                    <span className="font-bold text-xs">Level 5: Cucu (Keluarga Inti)</span>
                  </div>
                  <input
                    type="color"
                    value={generationColors.level5}
                    onChange={(e) => saveGenerationColors({ ...generationColors, level5: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                {/* Level 6: Cicit */}
                <div className="flex items-center justify-between p-2 rounded-xl border border-gray-800 bg-black/10 dark:bg-black/30">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: generationColors.level6 }} />
                    <span className="font-bold text-xs">Level 6: Cicit (Gen Alpha)</span>
                  </div>
                  <input
                    type="color"
                    value={generationColors.level6}
                    onChange={(e) => saveGenerationColors({ ...generationColors, level6: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>

              {/* Preset Palettes */}
              <div className="space-y-1.5 pt-2">
                <label className="block font-semibold">Palet Cepat Siap Pakai:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => saveGenerationColors(DEFAULT_GENERATION_COLORS)}
                    className="p-2 rounded-xl border text-[11px] font-semibold text-center hover:bg-amber-500/10 transition"
                  >
                    👑 Kerajaan &amp; Emas
                  </button>
                  <button
                    onClick={() => saveGenerationColors({
                      level0: '#78350F',
                      level1: '#047857',
                      level2: '#0284C7',
                      level3: '#B45309',
                      level4: '#15803D',
                      level5: '#0D9488',
                      level6: '#854D0E'
                    })}
                    className="p-2 rounded-xl border text-[11px] font-semibold text-center hover:bg-emerald-500/10 transition"
                  >
                    🌿 Alam &amp; Bumi
                  </button>
                </div>
              </div>
            </div>

            <div className={`p-3 border-t shrink-0 flex justify-end ${
              isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <button
                onClick={() => {
                  setIsColorModalOpen(false);
                  showNotification('Warna frame generasi berhasil disimpan');
                }}
                className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition"
              >
                Selesai &amp; Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DETAIL PROFIL, KLAIM & REVISI PROFIL SENDIRI            */}
      {/* ============================================================== */}
      {isEditModalOpen && activeDetailNode && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in zoom-in-95 duration-150">
          <div className={`border rounded-2xl w-full max-w-md max-h-[90dvh] flex flex-col shadow-2xl relative overflow-hidden ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
              isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold shadow-md ${getTrahBgClass(activeDetailNode.trah)}`}>
                  {activeDetailNode.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">{activeDetailNode.name}</h3>
                  <p className="text-xs text-amber-500 font-semibold">{GENERATION_NAMES[activeDetailNode.level]}</p>
                </div>
              </div>
              <button
                onClick={closeNodeModal}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 overflow-y-auto no-scrollbar space-y-4 text-xs">
              {/* Claim Action Box */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-slate-100 border-slate-200'
              }`}>
                <div>
                  <p className="font-semibold text-xs">Status Kepemilikan Profil:</p>
                  <p className={`text-[11px] font-medium ${activeDetailNode.claimed ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {activeDetailNode.claimed ? '✅ Telah Diklaim oleh Pemilik' : '⚠️ Belum Diklaim'}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleClaim(activeDetailNode.id)}
                  className={`font-bold text-xs px-3 py-1.5 rounded-xl border transition active:scale-95 ${
                    activeDetailNode.claimed
                      ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-xs'
                  }`}
                >
                  {activeDetailNode.claimed ? 'Batal Klaim' : 'Klaim Profil Saya'}
                </button>
              </div>

              {/* Silsilah Family Relational Context */}
              <div className={`p-3 rounded-xl border space-y-1 text-[11px] ${
                isDarkMode ? 'bg-gray-950/60 border-gray-800' : 'bg-amber-50/50 border-amber-200/60'
              }`}>
                <p>
                  <span className="text-gray-400">Orang Tua / Induk Silsilah:</span>{' '}
                  <span className="font-semibold">{parentNode ? `${parentNode.name} (${parentNode.title || '-'})` : 'Leluhur Utama (Puncak Garis)'}</span>
                </p>
                <p>
                  <span className="text-gray-400">Keturunan Langsung:</span>{' '}
                  <span className="font-semibold">{childNodes.length > 0 ? childNodes.map(c => c.name).join(', ') : 'Belum tercatat'}</span>
                </p>
                <p>
                  <span className="text-gray-400">Kuadran Trah:</span>{' '}
                  <span className="font-semibold text-amber-400">{getTrahName(activeDetailNode.trah)}</span>
                </p>
              </div>

              {/* Form Revisi Profil Sendiri */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Form Revisi &amp; Detail Profil</span>
                </h4>

                <div>
                  <label className="block font-medium mb-1 text-gray-400">Nama Lengkap / Resmi:</label>
                  <input
                    type="text"
                    value={editNodeName}
                    onChange={(e) => setEditNodeName(e.target.value)}
                    className={`w-full rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                {/* TRAH SELECTION IN EDIT FORM */}
                <div>
                  <label className="block font-medium mb-1 text-gray-400">Kuadran Trah Anggota:</label>
                  <select
                    value={editNodeTrah}
                    onChange={(e) => setEditNodeTrah(e.target.value as TrahType)}
                    className={`w-full rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-semibold ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="TRAH1">🔴 Trah Ayah User (Kuadran I)</option>
                    <option value="TRAH2">🔵 Trah Ibu User (Kuadran II)</option>
                    <option value="TRAH3">🟢 Trah Ayah Pasangan (Kuadran III)</option>
                    <option value="TRAH4">🟡 Trah Ibu Pasangan (Kuadran IV)</option>
                  </select>
                  <p className="text-[10px] text-gray-400 mt-0.5">Ubah jika anggota ini berada di cabang trah lain agar filter tidak tercampur</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium mb-1 text-gray-400">Gelar Sapaan / Peran:</label>
                    <input
                      type="text"
                      value={editNodeTitle}
                      onChange={(e) => setEditNodeTitle(e.target.value)}
                      placeholder="Paman, Bibi, Uwa, dll"
                      className={`w-full rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-gray-400">Kota Domisili:</label>
                    <input
                      type="text"
                      value={editNodeCity}
                      onChange={(e) => setEditNodeCity(e.target.value)}
                      placeholder="Bekasi, Bandung, dll"
                      className={`w-full rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium mb-1 text-gray-400">Nomor WhatsApp / HP:</label>
                    <input
                      type="tel"
                      value={editNodePhone}
                      onChange={(e) => setEditNodePhone(e.target.value)}
                      placeholder="0812..."
                      className={`w-full rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-gray-400">Tahun Lahir:</label>
                    <input
                      type="text"
                      value={editNodeBirthYear}
                      onChange={(e) => setEditNodeBirthYear(e.target.value)}
                      placeholder="1988"
                      className={`w-full rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Status Hidup / Wafat */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-slate-100 border-slate-200'
                }`}>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={editNodeIsDeceased}
                      onChange={(e) => setEditNodeIsDeceased(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span>Telah Berpulang / Almarhum(ah)</span>
                  </label>
                  {editNodeIsDeceased && (
                    <input
                      type="text"
                      value={editNodePassedYear}
                      onChange={(e) => setEditNodePassedYear(e.target.value)}
                      placeholder="Tahun Wafat"
                      className={`w-28 rounded-lg p-1.5 border text-xs text-center ${
                        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  )}
                </div>

                <div>
                  <label className="block font-medium mb-1 text-gray-400">Catatan Kisah / Biografi Singkat:</label>
                  <textarea
                    rows={2}
                    value={editNodeBio}
                    onChange={(e) => setEditNodeBio(e.target.value)}
                    placeholder="Riwayat, kisah keteladanan, atau pekerjaan..."
                    className={`w-full rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className={`p-3.5 border-t flex gap-2 shrink-0 ${
              isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <button
                onClick={handleSaveNodeRevision}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2.5 rounded-xl text-xs shadow-md active:scale-98 transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Revisi Profil</span>
              </button>
              <button
                onClick={() => handleDeleteNode(activeDetailNode.id)}
                className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 transition active:scale-95"
                title="Hapus Anggota Ini"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: POST KABAR BARU KE FEED MEDSOS 4 TRAH                   */}
      {/* ============================================================== */}
      {isPostFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in zoom-in-95 duration-150">
          <div className={`border rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
              isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm">Bagikan Kabar Keluarga</h3>
              </div>
              <button
                onClick={() => setIsPostFormOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-gray-400">Nama Pengirim:</label>
                <input
                  type="text"
                  value={newPostAuthor}
                  onChange={(e) => setNewPostAuthor(e.target.value)}
                  className={`w-full p-2 rounded-lg border ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-gray-400">Kategori Kabar:</label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value as any)}
                    className={`w-full p-2 rounded-lg border font-semibold ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Pengumuman">📢 Pengumuman</option>
                    <option value="Kabar Bahagia">🎉 Kabar Bahagia</option>
                    <option value="Syukuran">🙏 Syukuran</option>
                    <option value="Reuni">🤝 Undangan Reuni</option>
                    <option value="Berita Duka">🕊️ Berita Duka</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-400">Tujuan Target Trah:</label>
                  <select
                    value={newPostTargetTrah}
                    onChange={(e) => setNewPostTargetTrah(e.target.value as any)}
                    className={`w-full p-2 rounded-lg border font-semibold ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="ALL">🌐 Semua 4 Trah</option>
                    <option value="TRAH1">🔴 Trah Ayah User</option>
                    <option value="TRAH2">🔵 Trah Ibu User</option>
                    <option value="TRAH3">🟢 Trah Ayah Pasangan</option>
                    <option value="TRAH4">🟡 Trah Ibu Pasangan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-400">Isi Kabar atau Undangan Silaturahmi:</label>
                <textarea
                  rows={4}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Tuliskan kabar gembira, undangan syukuran, atau doa bersama keluarga..."
                  className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2.5 rounded-xl shadow-md transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim ke Feed Medsos</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
