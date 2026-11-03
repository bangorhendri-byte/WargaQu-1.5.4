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
  BookOpen
} from 'lucide-react';
import { FamilyNode, TrahType, FamilyPost, FamilyPostComment } from '../../types';

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

const INITIAL_FAMILY_DATA: FamilyNode[] = [
  // Level 0: Uyut (Outer Ancestors)
  {
    id: 'uyut_ayah',
    name: 'Kyai Sanusi',
    title: 'Uyut Sepuh',
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
    id: 'uyut_ibu',
    name: 'Nyai Aminah',
    title: 'Uyut Putri',
    level: 0,
    trah: 'TRAH2',
    parentId: null,
    photo: '',
    claimed: false,
    city: 'Kuningan',
    birthYear: '1910',
    isDeceased: true,
    passedYear: '1990',
    bio: 'Pemberi teladan kesabaran dan silaturahmi keturunan Nyai Aminah.'
  },
  {
    id: 'uyut_pasangan_ayah',
    name: 'R. Somawinata',
    title: 'Uyut Pasangan',
    level: 0,
    trah: 'TRAH3',
    parentId: null,
    photo: '',
    claimed: false,
    city: 'Bandung',
    birthYear: '1908',
    isDeceased: true,
    passedYear: '1982',
    bio: 'Pribadi bersahaja trah keluarga dari pihak ayah mertua.'
  },
  {
    id: 'uyut_pasangan_ibu',
    name: 'Hj. Siti Rohmah',
    title: 'Uyut Pasangan',
    level: 0,
    trah: 'TRAH4',
    parentId: null,
    photo: '',
    claimed: false,
    city: 'Sumedang',
    birthYear: '1912',
    isDeceased: true,
    passedYear: '1995',
    bio: 'Tokoh pengajian dan pemersatu keluarga trah ibu mertua.'
  },

  // Level 1: Kakek / Nenek
  {
    id: 'kakek_ayah',
    name: 'H. Baharuddin',
    title: 'Kakek',
    level: 1,
    trah: 'TRAH1',
    parentId: 'uyut_ayah',
    photo: '',
    claimed: false,
    city: 'Jakarta Timur',
    birthYear: '1934',
    isDeceased: true,
    passedYear: '2012',
    bio: 'Pensiunan pegawai negeri, gemar bercocok tanam dan kumpul keluarga.'
  },
  {
    id: 'nenek_ayah',
    name: 'Hj. Maryam',
    title: 'Nenek',
    level: 1,
    trah: 'TRAH1',
    parentId: 'uyut_ayah',
    photo: '',
    claimed: false,
    city: 'Jakarta Timur',
    birthYear: '1938',
    isDeceased: true,
    passedYear: '2018',
    bio: 'Ibu rumah tangga yang penuh kasih sayang kepada anak cucu.'
  },
  {
    id: 'kakek_ibu',
    name: 'H. Syamsul',
    title: 'Kakek',
    level: 1,
    trah: 'TRAH2',
    parentId: 'uyut_ibu',
    photo: '',
    claimed: false,
    city: 'Cirebon',
    birthYear: '1936',
    isDeceased: true,
    passedYear: '2015',
    bio: 'Peternak dan pedagang beras yang ulet di kampung halaman.'
  },
  {
    id: 'kakek_pasangan',
    name: 'Drs. Subagja',
    title: 'Kakek Mertua',
    level: 1,
    trah: 'TRAH3',
    parentId: 'uyut_pasangan_ayah',
    photo: '',
    claimed: false,
    city: 'Bandung',
    birthYear: '1939',
    isDeceased: true,
    passedYear: '2020',
    bio: 'Pendidik dan guru senior di sekolah menengah negeri.'
  },
  {
    id: 'nenek_pasangan',
    name: 'Hj. Ratnasari',
    title: 'Nenek Mertua',
    level: 1,
    trah: 'TRAH4',
    parentId: 'uyut_pasangan_ibu',
    photo: '',
    claimed: false,
    city: 'Sumedang',
    birthYear: '1942',
    isDeceased: false,
    bio: 'Masih sehat dan aktif mengasuh cucu dan cicit di Sumedang.'
  },

  // Level 2: Ayah, Ibu, Paman, Uwa
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
    title: 'Paman Sulung',
    level: 2,
    trah: 'TRAH1',
    parentId: 'kakek_ayah',
    photo: '',
    claimed: false,
    city: 'Bogor',
    phone: '081311223344',
    birthYear: '1959',
    isDeceased: false,
    bio: 'Pengusaha kuliner tradisional dan sesepuh anak cucu H. Baharuddin.'
  },
  {
    id: 'ibu_user',
    name: 'Ibu Nurhayati',
    title: 'Ibu Kandung',
    level: 2,
    trah: 'TRAH2',
    parentId: 'kakek_ibu',
    photo: '',
    claimed: true,
    city: 'Bekasi',
    phone: '081288776655',
    birthYear: '1965',
    isDeceased: false,
    bio: 'Pengurus pengajian kaum ibu di lingkungan RT 03 / RW 05.'
  },
  {
    id: 'ayah_istri',
    name: 'Bpk. Bambang P.',
    title: 'Ayah Mertua',
    level: 2,
    trah: 'TRAH3',
    parentId: 'kakek_pasangan',
    photo: '',
    claimed: false,
    city: 'Bandung',
    phone: '081377889900',
    birthYear: '1963',
    isDeceased: false,
    bio: 'Pegawai teknik sipil di Bandung.'
  },
  {
    id: 'ibu_istri',
    name: 'Ibu Endang W.',
    title: 'Ibu Mertua',
    level: 2,
    trah: 'TRAH4',
    parentId: 'nenek_pasangan',
    photo: '',
    claimed: false,
    city: 'Bandung',
    phone: '081366554433',
    birthYear: '1967',
    isDeceased: false,
    bio: 'Pecinta tanaman hias dan kuliner Sunda.'
  },

  // Level 3: User & Pasangan (Poros Tengah Utama)
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
    id: 'pasangan_user',
    name: 'Dewi Sartika',
    title: 'Istri / Pasangan',
    level: 3,
    trah: 'TRAH3',
    parentId: 'ayah_istri',
    photo: '',
    claimed: true,
    city: 'Bekasi',
    phone: '081233445566',
    birthYear: '1991',
    isDeceased: false,
    bio: 'Pasangan hidup tercinta, pendamping usaha dan keluarga.'
  },
  {
    id: 'saudara_user',
    name: 'Rian Pratama',
    title: 'Adik Kandung',
    level: 3,
    trah: 'TRAH1',
    parentId: 'ayah_user',
    photo: '',
    claimed: false,
    city: 'Jakarta Selatan',
    phone: '081255667788',
    birthYear: '1994',
    isDeceased: false,
    bio: 'Bekerja di bidang desain digital dan multimedia.'
  },

  // Level 4: Anak
  {
    id: 'anak_1',
    name: 'Alif Al-Fatih',
    title: 'Anak Pertama',
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
    title: 'Anak Kedua',
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

  // Level 5: Cucu
  {
    id: 'cucu_1',
    name: 'Kenzho Rayyan',
    title: 'Cucu Laki',
    level: 5,
    trah: 'TRAH1',
    parentId: 'anak_1',
    photo: '',
    claimed: false,
    city: 'Bekasi',
    birthYear: '2024',
    isDeceased: false,
    bio: 'Generasi penerus Gen Z / Alpha.'
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

  // Level 6: Cicit (Compact Gen Alpha)
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
    bio: 'Cicit mungil pelengkap generasi ke-7 keluarga.'
  }
];

const INITIAL_MEDSOS_POSTS: FamilyPost[] = [
  {
    id: 'post_1',
    authorName: 'Hendriana (User)',
    authorTrah: 'TRAH1',
    category: 'Pengumuman',
    targetTrah: 'ALL',
    content: 'Assalamu’alaikum keluarga besar 4 Trah! Silsilah keluarga 7 generasi kini resmi tersimpan rapi di OrbitQu. Mohon kerabat yang lain untuk mengklaim profil masing-masing ya!',
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
    content: 'Rencana Reuni Akbar & Halal Bihalal Trah Ayah (Keluarga Besar Kyai Sanusi & H. Baharuddin) insyaAllah dijadwalkan bulan depan di villa puncak. Silakan konfirmasi kehadiran ya.',
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
    content: 'Syukuran panen padi dan silaturahmi keluarga di Cirebon dan Kuningan minggu ini berjalan lancar. Terima kasih doa semuanya.',
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
    content: 'Kabar gembira dari Bandung, ananda kami Dewi Sartika dan Hendriana berhasil mengembangkan usaha keluarga dengan baik. Mohon terus didoakan rukun selalu.',
    createdAt: '3 hari lalu',
    likes: 19,
    hasLiked: false,
    comments: [
      { id: 'c4', author: 'Hendriana', text: 'Terima kasih banyak doa dan bimbingan Ayah mertua 🙏', time: '3 hari lalu' }
    ]
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

  // Canvas visualizer settings
  const [activeTheme, setActiveTheme] = useState<'cosmic' | 'organic' | 'atom' | 'neural'>('cosmic');
  const [activeTrahFilter, setActiveTrahFilter] = useState<'ALL' | TrahType>('ALL');
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
  const [editNodePhoto, setEditNodePhoto] = useState<string>('');
  const [editNodeCity, setEditNodeCity] = useState<string>('');
  const [editNodePhone, setEditNodePhone] = useState<string>('');
  const [editNodeBirthYear, setEditNodeBirthYear] = useState<string>('');
  const [editNodePassedYear, setEditNodePassedYear] = useState<string>('');
  const [editNodeIsDeceased, setEditNodeIsDeceased] = useState<boolean>(false);
  const [editNodeBio, setEditNodeBio] = useState<string>('');

  // List View states (Search & Filter)
  const [listSearch, setListSearch] = useState<string>('');
  const [listTrahFilter, setListTrahFilter] = useState<'ALL' | TrahType>('ALL');
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

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('orbitqu_family_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFamilyNodes(parsed);
        } else {
          setFamilyNodes(INITIAL_FAMILY_DATA);
        }
      } catch (e) {
        setFamilyNodes(INITIAL_FAMILY_DATA);
      }
    } else {
      setFamilyNodes(INITIAL_FAMILY_DATA);
      localStorage.setItem('orbitqu_family_data', JSON.stringify(INITIAL_FAMILY_DATA));
    }

    // Load Medsos Posts
    const savedPosts = localStorage.getItem('orbitqu_family_posts');
    if (savedPosts) {
      try {
        const parsedPosts = JSON.parse(savedPosts);
        if (Array.isArray(parsedPosts)) {
          setMedsosPosts(parsedPosts);
        } else {
          setMedsosPosts(INITIAL_MEDSOS_POSTS);
        }
      } catch (e) {
        setMedsosPosts(INITIAL_MEDSOS_POSTS);
      }
    } else {
      setMedsosPosts(INITIAL_MEDSOS_POSTS);
      localStorage.setItem('orbitqu_family_posts', JSON.stringify(INITIAL_MEDSOS_POSTS));
    }
  }, []);

  // Save changes to LocalStorage
  const saveFamilyData = (updated: FamilyNode[]) => {
    setFamilyNodes(updated);
    localStorage.setItem('orbitqu_family_data', JSON.stringify(updated));
  };

  const saveMedsosPosts = (updated: FamilyPost[]) => {
    setMedsosPosts(updated);
    localStorage.setItem('orbitqu_family_posts', JSON.stringify(updated));
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

  // Filtered list for Minimalist List View
  const filteredListNodes = useMemo(() => {
    return familyNodes.filter(node => {
      const matchSearch = listSearch.trim() === '' ||
        node.name.toLowerCase().includes(listSearch.toLowerCase()) ||
        (node.title && node.title.toLowerCase().includes(listSearch.toLowerCase())) ||
        (node.city && node.city.toLowerCase().includes(listSearch.toLowerCase()));

      const matchTrah = listTrahFilter === 'ALL' || node.trah === listTrahFilter;
      const matchLevel = listLevelFilter === 'ALL' || node.level.toString() === listLevelFilter;

      return matchSearch && matchTrah && matchLevel;
    }).sort((a, b) => a.level - b.level);
  }, [familyNodes, listSearch, listTrahFilter, listLevelFilter]);

  // Compute horizontal elliptical layout coordinates
  const computeEllipticalLayout = useCallback((nodes: FamilyNode[]) => {
    const filteredNodes = activeTrahFilter === 'ALL'
      ? nodes
      : nodes.filter(n => n.trah === activeTrahFilter || n.level === 3);

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
      TRAH1: { start: -Math.PI, end: -Math.PI / 2 },       // Top-Left: Ayah User
      TRAH2: { start: -Math.PI / 2, end: 0 },              // Top-Right: Ibu User
      TRAH3: { start: Math.PI / 2, end: Math.PI },         // Bottom-Left: Ayah Pasangan
      TRAH4: { start: 0, end: Math.PI / 2 }                // Bottom-Right: Ibu Pasangan
    };

    const computed: (FamilyNode & { x: number; y: number; angle: number; color: string })[] = [];

    for (let lvl = 0; lvl <= 6; lvl++) {
      const lvlNodes = filteredNodes.filter(n => n.level === lvl);

      (['TRAH1', 'TRAH2', 'TRAH3', 'TRAH4'] as TrahType[]).forEach(trahKey => {
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
              color: getTrahColorHex(node.trah)
            });
          });
        }
      });
    }

    return computed;
  }, [activeTrahFilter]);

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

    const calculatedNodes = computeEllipticalLayout(familyNodes);

    // 1. Draw Orbit Ellipse Rings
    if (showOrbitRings) {
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

    // 2. Draw Connectors
    ctx.lineWidth = 1.5;
    calculatedNodes.forEach(node => {
      if (node.parentId) {
        const parent = calculatedNodes.find(n => n.id === node.parentId);
        if (parent) {
          ctx.strokeStyle = getThemeConnectorColor(node.color, isDarkMode);
          ctx.beginPath();
          ctx.moveTo(parent.x, parent.y);
          const controlX = (parent.x + node.x) / 2;
          const controlY = (parent.y + node.y) / 2;
          ctx.quadraticCurveTo(controlX, controlY, node.x, node.y);
          ctx.stroke();
        }
      }
    });

    // 3. Draw Nodes
    calculatedNodes.forEach(node => {
      ctx.save();
      ctx.translate(node.x, node.y);

      if (node.level <= 2) {
        // Large Photo Card (Uyut, Kakek, Ayah/Paman/Uwa)
        const width = 110;
        const height = 44;
        const rx = -width / 2;
        const ry = -height / 2;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = isDarkMode ? '#1f2937' : '#ffffff';
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.roundRect(rx, ry, width, height, 10);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Avatar Circle
        const avatarX = rx + 20;
        const avatarY = 0;
        const avatarRadius = 14;

        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.name.charAt(0).toUpperCase(), avatarX, avatarY);

        // Name & Title
        ctx.textAlign = 'left';
        ctx.fillStyle = isDarkMode ? '#f3f4f6' : '#111827';
        ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
        const truncatedName = node.name.length > 10 ? node.name.substring(0, 9) + '..' : node.name;
        ctx.fillText(truncatedName, rx + 38, ry + 16);

        ctx.fillStyle = isDarkMode ? '#9ca3af' : '#6b7280';
        ctx.font = '9px "Plus Jakarta Sans", sans-serif';
        const titleText = node.title || (node.level === 0 ? 'Uyut' : 'Kakek');
        ctx.fillText(titleText, rx + 38, ry + 30);

        // Claimed Indicator Badge
        if (node.claimed) {
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.arc(rx + width - 8, ry + 8, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      } else if (node.level >= 5) {
        // Compact Single Avatar Bubble Node (Cucu, Cicit)
        const radius = 10;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = isDarkMode ? '#d1d5db' : '#374151';
        ctx.font = '8px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, 0, radius + 10);
      } else {
        // Medium Badge Node (User, Pasangan, Saudara, Anak)
        const radius = 18;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = isDarkMode ? '#111827' : '#ffffff';
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = isDarkMode ? '#f9fafb' : '#111827';
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.name.charAt(0).toUpperCase(), 0, 0);

        // Name Pill
        ctx.fillStyle = isDarkMode ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1;

        const textWidth = ctx.measureText(node.name).width + 10;
        ctx.beginPath();
        ctx.roundRect(-textWidth / 2, radius + 4, textWidth, 14, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isDarkMode ? '#e5e7eb' : '#1f2937';
        ctx.font = '9px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(node.name, 0, radius + 11);
      }

      ctx.restore();
    });

    ctx.restore();
  }, [familyNodes, computeEllipticalLayout, showOrbitRings, isDarkMode, activeTheme, activeTab]);

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
  }, [renderCanvas, activeTheme, activeTrahFilter, showOrbitRings, isDarkMode, familyNodes]);

  // Zoom Controls
  const handleZoom = (factor: number) => {
    scaleRef.current = Math.max(0.3, Math.min(3.0, scaleRef.current * factor));
    renderCanvas();
  };

  const handleResetZoom = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    scaleRef.current = 1;
    panXRef.current = canvas.width / 2;
    panYRef.current = canvas.height / 2;
    renderCanvas();
    showNotification('Posisi orbit disetel ulang ke poros tengah');
  };

  // Mouse & Touch Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - panXRef.current,
      y: e.clientY - panYRef.current
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    panXRef.current = e.clientX - dragStartRef.current.x;
    panYRef.current = e.clientY - dragStartRef.current.y;
    renderCanvas();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    handleZoom(factor);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: e.touches[0].clientX - panXRef.current,
        y: e.touches[0].clientY - panYRef.current
      };
    } else if (e.touches.length === 2) {
      touchStartDistRef.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
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
    isDraggingRef.current = false;
  };

  // Click on Canvas -> Open Node Detail Modal
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - panXRef.current) / scaleRef.current;
    const mouseY = (e.clientY - rect.top - panYRef.current) / scaleRef.current;

    const calculatedNodes = computeEllipticalLayout(familyNodes);

    for (let i = calculatedNodes.length - 1; i >= 0; i--) {
      const node = calculatedNodes[i];
      const clickRadius = node.level <= 2 ? 45 : 20;
      const dist = Math.hypot(mouseX - node.x, mouseY - node.y);

      if (dist <= clickRadius) {
        openNodeDetailModal(node.id);
        break;
      }
    }
  };

  // Profile Detail & Revision Modal Management
  const openNodeDetailModal = (nodeId: string) => {
    const node = familyNodes.find(n => n.id === nodeId);
    if (!node) return;
    setDetailNodeId(nodeId);
    setSelectedNodeId(nodeId);
    setEditNodeName(node.name);
    setEditNodeTitle(node.title || '');
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

  // Batch Input (Format Koma Berantai)
  const handleBatchParentChange = (parentId: string) => {
    setBatchParentId(parentId);
    if (parentId !== 'ROOT') {
      const parent = familyNodes.find(n => n.id === parentId);
      if (parent) {
        setBatchTrah(parent.trah);
      }
    }
  };

  const getTargetGenerationLabel = () => {
    if (batchParentId === 'ROOT') {
      return 'Level 0 (Uyut - Leluhur Core)';
    }
    const parent = familyNodes.find(n => n.id === batchParentId);
    if (!parent) return '-';
    const nextLvl = Math.min(6, parent.level + 1);
    return GENERATION_NAMES[nextLvl];
  };

  const handleSubmitBatch = () => {
    if (!batchNames.trim()) {
      showNotification('Masukkan minimal satu nama (pisahkan dengan koma)');
      return;
    }

    const rawNames = batchNames.split(',').map(n => n.trim()).filter(n => n.length > 0);
    if (rawNames.length === 0) return;

    let targetLevel = 0;
    let chosenTrah = batchTrah;

    if (batchParentId !== 'ROOT') {
      const parent = familyNodes.find(n => n.id === batchParentId);
      if (parent) {
        targetLevel = Math.min(6, parent.level + 1);
        chosenTrah = parent.trah;
      }
    }

    const newNodes: FamilyNode[] = rawNames.map(name => ({
      id: 'node_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name,
      title: targetLevel <= 2 ? 'Prioritas Dikenal' : (targetLevel >= 5 ? 'Single' : 'Anggota'),
      level: targetLevel,
      trah: chosenTrah,
      parentId: batchParentId === 'ROOT' ? null : batchParentId,
      photo: '',
      claimed: false
    }));

    const updated = [...familyNodes, ...newNodes];
    saveFamilyData(updated);
    setBatchNames('');
    setIsBatchDrawerOpen(false);
    showNotification(`Berhasil menambahkan ${newNodes.length} keturunan baru ke silsilah!`);
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
    showNotification('Kabar keluarga berhasil dibagikan ke feed Medsos 4 Trah!');
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
      version: '1.0',
      appName: 'OrbitQu LeluhurQu',
      exportedAt: new Date().toISOString(),
      nodesCount: familyNodes.length,
      familyNodes,
      medsosPosts
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
          showNotification('Paket lengkap SilsilahQu & Medsos berhasil dipulihkan!');
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
    if (window.confirm('Muat ulang data awal contoh (Demo 7 Generasi & 4 Trah)? Data kustom saat ini akan ditimpa.')) {
      saveFamilyData(INITIAL_FAMILY_DATA);
      saveMedsosPosts(INITIAL_MEDSOS_POSTS);
      showNotification('Data telah disetel ulang ke contoh 7 Generasi');
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

  const filteredMedsosPosts = useMemo(() => {
    return medsosPosts.filter(p => {
      if (medsosTrahFilter === 'ALL') return true;
      return p.targetTrah === 'ALL' || p.targetTrah === medsosTrahFilter || p.authorTrah === medsosTrahFilter;
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
              Silsilah 7 Generasi • 4 Trah Keluarga &amp; Medsos
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
                      Rincian 4 Kuadran Trah Keluarga
                    </h3>
                    <span className="text-[10px] text-amber-500 font-semibold">User &amp; Pasangan</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Trah 1: Ayah User */}
                    <div
                      onClick={() => {
                        setListTrahFilter('TRAH1');
                        setSilsilahSubTab('list');
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer active:scale-98 transition group relative overflow-hidden ${
                        isDarkMode ? 'bg-gray-900 border-red-500/30 hover:border-red-500/60' : 'bg-white border-red-200 hover:border-red-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#EF4444] shadow-xs shadow-red-500/50"></span>
                          <h4 className="text-xs font-bold">Trah Ayah User</h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20">
                          {stats.trah1Count} Anggota
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mb-2">
                        Garis keturunan dari <span className="font-semibold text-gray-200 dark:text-gray-300">Kyai Sanusi &amp; Bpk. Hendra S.</span>
                      </p>
                      <div className="flex items-center justify-between text-[10px] pt-2 border-t border-gray-800 dark:border-gray-800">
                        <span className="text-emerald-500 font-semibold">✅ {stats.trah1Claimed} profil diklaim</span>
                        <span className="text-red-400 group-hover:translate-x-0.5 transition flex items-center gap-0.5 font-bold">
                          Buka List <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    {/* Trah 2: Ibu User */}
                    <div
                      onClick={() => {
                        setListTrahFilter('TRAH2');
                        setSilsilahSubTab('list');
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer active:scale-98 transition group relative overflow-hidden ${
                        isDarkMode ? 'bg-gray-900 border-blue-500/30 hover:border-blue-500/60' : 'bg-white border-blue-200 hover:border-blue-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#3B82F6] shadow-xs shadow-blue-500/50"></span>
                          <h4 className="text-xs font-bold">Trah Ibu User</h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/20">
                          {stats.trah2Count} Anggota
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mb-2">
                        Garis keturunan dari <span className="font-semibold text-gray-200 dark:text-gray-300">Nyai Aminah &amp; Ibu Nurhayati</span>
                      </p>
                      <div className="flex items-center justify-between text-[10px] pt-2 border-t border-gray-800 dark:border-gray-800">
                        <span className="text-emerald-500 font-semibold">✅ {stats.trah2Claimed} profil diklaim</span>
                        <span className="text-blue-400 group-hover:translate-x-0.5 transition flex items-center gap-0.5 font-bold">
                          Buka List <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    {/* Trah 3: Ayah Pasangan */}
                    <div
                      onClick={() => {
                        setListTrahFilter('TRAH3');
                        setSilsilahSubTab('list');
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer active:scale-98 transition group relative overflow-hidden ${
                        isDarkMode ? 'bg-gray-900 border-emerald-500/30 hover:border-emerald-500/60' : 'bg-white border-emerald-200 hover:border-emerald-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#10B981] shadow-xs shadow-emerald-500/50"></span>
                          <h4 className="text-xs font-bold">Trah Ayah Pasangan</h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {stats.trah3Count} Anggota
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mb-2">
                        Garis keturunan mertua dari <span className="font-semibold text-gray-200 dark:text-gray-300">R. Somawinata &amp; Bpk. Bambang P.</span>
                      </p>
                      <div className="flex items-center justify-between text-[10px] pt-2 border-t border-gray-800 dark:border-gray-800">
                        <span className="text-emerald-500 font-semibold">✅ {stats.trah3Claimed} profil diklaim</span>
                        <span className="text-emerald-400 group-hover:translate-x-0.5 transition flex items-center gap-0.5 font-bold">
                          Buka List <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    {/* Trah 4: Ibu Pasangan */}
                    <div
                      onClick={() => {
                        setListTrahFilter('TRAH4');
                        setSilsilahSubTab('list');
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer active:scale-98 transition group relative overflow-hidden ${
                        isDarkMode ? 'bg-gray-900 border-amber-500/30 hover:border-amber-500/60' : 'bg-white border-amber-200 hover:border-amber-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#F59E0B] shadow-xs shadow-amber-500/50"></span>
                          <h4 className="text-xs font-bold">Trah Ibu Pasangan</h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">
                          {stats.trah4Count} Anggota
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mb-2">
                        Garis keturunan mertua dari <span className="font-semibold text-gray-200 dark:text-gray-300">Hj. Siti Rohmah &amp; Ibu Endang W.</span>
                      </p>
                      <div className="flex items-center justify-between text-[10px] pt-2 border-t border-gray-800 dark:border-gray-800">
                        <span className="text-emerald-500 font-semibold">✅ {stats.trah4Claimed} profil diklaim</span>
                        <span className="text-amber-400 group-hover:translate-x-0.5 transition flex items-center gap-0.5 font-bold">
                          Buka List <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GENERATION LEVEL BREAKDOWN */}
                <div className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Distribusi 7 Level Generasi
                  </h3>
                  <div className="space-y-2">
                    {stats.levelCounts.map(lvl => {
                      const pct = stats.total > 0 ? (lvl.count / stats.total) * 100 : 0;
                      return (
                        <div key={lvl.level} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-gray-300 dark:text-gray-200">{lvl.name}</span>
                            <span className="font-mono font-bold text-amber-500">{lvl.count} anggota</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-300"
                              style={{ width: `${Math.max(5, pct)}%` }}
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
                {/* Search & Filter Toolbar */}
                <div className={`p-3 border-b space-y-2.5 shrink-0 ${
                  isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'
                }`}>
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={listSearch}
                      onChange={(e) => setListSearch(e.target.value)}
                      placeholder="Cari nama, sapaan, kota asal..."
                      className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs border focus:outline-hidden focus:ring-1 focus:ring-amber-500 ${
                        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    {listSearch && (
                      <button
                        onClick={() => setListSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Trah Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
                    <button
                      onClick={() => setListTrahFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
                        listTrahFilter === 'ALL'
                          ? 'bg-amber-500 text-gray-950 shadow-xs'
                          : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Semua ({familyNodes.length})
                    </button>
                    <button
                      onClick={() => setListTrahFilter('TRAH1')}
                      className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition flex items-center gap-1 ${
                        listTrahFilter === 'TRAH1'
                          ? 'bg-red-500 text-white shadow-xs'
                          : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> Ayah User ({stats.trah1Count})
                    </button>
                    <button
                      onClick={() => setListTrahFilter('TRAH2')}
                      className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition flex items-center gap-1 ${
                        listTrahFilter === 'TRAH2'
                          ? 'bg-blue-500 text-white shadow-xs'
                          : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span> Ibu User ({stats.trah2Count})
                    </button>
                    <button
                      onClick={() => setListTrahFilter('TRAH3')}
                      className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition flex items-center gap-1 ${
                        listTrahFilter === 'TRAH3'
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Ayah Pasangan ({stats.trah3Count})
                    </button>
                    <button
                      onClick={() => setListTrahFilter('TRAH4')}
                      className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition flex items-center gap-1 ${
                        listTrahFilter === 'TRAH4'
                          ? 'bg-amber-500 text-gray-950 shadow-xs'
                          : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span> Ibu Pasangan ({stats.trah4Count})
                    </button>
                  </div>
                </div>

                {/* Minimalist Cards List */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2 pb-20">
                  {filteredListNodes.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-xs">Tidak ada anggota yang cocok dengan filter pencarian.</p>
                      <button
                        onClick={() => { setListSearch(''); setListTrahFilter('ALL'); setListLevelFilter('ALL'); }}
                        className="mt-2 text-xs text-amber-500 font-bold hover:underline"
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
                            ? 'bg-gray-900 hover:bg-gray-800/80 border-gray-800'
                            : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Trah Avatar */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs ${getTrahBgClass(node.trah)}`}>
                            {node.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-xs truncate max-w-[160px] sm:max-w-xs">{node.name}</h4>
                              {node.claimed && (
                                <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/25">
                                  Klaim ✅
                                </span>
                              )}
                              {node.isDeceased && (
                                <span className="bg-gray-500/20 text-gray-400 text-[9px] px-1.5 py-0.2 rounded">
                                  Alm
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              <span className="text-amber-500 font-semibold">{node.title || GENERATION_SHORT_NAMES[node.level]}</span>
                              {node.city && <span> • {node.city}</span>}
                            </p>
                          </div>
                        </div>

                        {/* Right side generation & view */}
                        <div className="flex items-center gap-2 shrink-0 text-right">
                          <div className="hidden sm:block">
                            <span className="text-[10px] text-gray-400 block font-mono">
                              Level {node.level}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-300">
                              {getTrahName(node.trah)}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition" />
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
        {/* SUB-VIEW 2: ORBITQU (7 GENERASI ELLIPTICAL CANVAS)           */}
        {/* ============================================================ */}
        {activeTab === 'orbitqu' && (
          <div className="flex-1 relative flex flex-col overflow-hidden">
            {/* Top Toolbar overlay inside Canvas */}
            <div className={`p-2.5 border-b flex items-center justify-between shrink-0 z-10 ${
              isDarkMode ? 'bg-gray-950/80 border-gray-800 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md'
            }`}>
              <div className="flex items-center gap-1.5">
                {/* Theme Selector */}
                <select
                  value={activeTheme}
                  onChange={(e) => setActiveTheme(e.target.value as any)}
                  className={`text-xs rounded-lg px-2 py-1 border focus:outline-hidden ${
                    isDarkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  <option value="cosmic">🪐 Cosmic</option>
                  <option value="organic">🌿 Organik</option>
                  <option value="atom">⚛️ Atom</option>
                  <option value="neural">🧠 Neural</option>
                </select>

                {/* Trah Filter */}
                <select
                  value={activeTrahFilter}
                  onChange={(e) => setActiveTrahFilter(e.target.value as any)}
                  className={`text-xs rounded-lg px-2 py-1 border focus:outline-hidden ${
                    isDarkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  <option value="ALL">🌐 Semua Trah</option>
                  <option value="TRAH1">🔴 Trah Ayah</option>
                  <option value="TRAH2">🔵 Trah Ibu</option>
                  <option value="TRAH3">🟢 Trah Ayah Pasangan</option>
                  <option value="TRAH4">🟡 Trah Ibu Pasangan</option>
                </select>

                {/* Orbit Toggle */}
                <button
                  onClick={() => setShowOrbitRings(!showOrbitRings)}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                    showOrbitRings
                      ? isDarkMode ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-amber-100 border-amber-300 text-amber-800 font-bold'
                      : isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                  title="Toggle Garis Orbit"
                >
                  <Disc className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Switch to List View */}
              <button
                onClick={() => {
                  setActiveTab('silsilahqu');
                  setSilsilahSubTab('list');
                }}
                className="text-xs text-amber-500 font-bold hover:underline flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Mode List</span>
              </button>
            </div>

            {/* Interactive Canvas */}
            <main
              ref={containerRef}
              className={`w-full flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden canvas-bg-${activeTheme} ${
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
              <div className={`absolute bottom-16 left-3 z-10 backdrop-blur-md p-2.5 rounded-xl border text-xs space-y-1.5 shadow-xl max-w-[220px] sm:max-w-xs transition-opacity ${
                isDarkMode ? 'bg-gray-900/90 border-gray-800 text-gray-300' : 'bg-white/95 border-slate-200 text-slate-700'
              }`}>
                <div className="font-semibold text-[11px] flex items-center justify-between">
                  <span>4 Trah 7 Generasi</span>
                  <span className="text-[9px] text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded font-mono font-bold">
                    {familyNodes.length} Anggota
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EF4444]"></span> Ayah User</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span> Ibu User</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Ayah Pasangan</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> Ibu Pasangan</div>
                </div>
                <div className={`pt-1 border-t text-[9px] ${isDarkMode ? 'border-gray-800 text-gray-400' : 'border-slate-200 text-slate-500'}`}>
                  💡 Klik sembarang node untuk profil &amp; klaim
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
                    Kabar keluarga Ayah, Ibu, dan Mertua
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

              {/* Trah Tab Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-[11px]">
                <button
                  onClick={() => setMedsosTrahFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
                    medsosTrahFilter === 'ALL'
                      ? 'bg-amber-500 text-gray-950 shadow-xs'
                      : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Semua Kabar
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
                  <p className="text-xs">Belum ada kabar di trah ini. Jadilah yang pertama membagikan kabar!</p>
                  <button
                    onClick={() => setIsPostFormOpen(true)}
                    className="mt-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs px-3.5 py-2 rounded-xl"
                  >
                    Tulis Kabar Sekarang
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
                      <div className="mt-3 pt-2.5 border-t border-gray-800/80 space-y-1.5">
                        {post.comments.map(c => (
                          <div key={c.id} className="text-[11px] p-2 rounded-xl bg-black/20 dark:bg-black/30">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="font-bold text-amber-500">{c.author}</span>
                              <span className="text-[9px] text-gray-400">{c.time}</span>
                            </div>
                            <p className="text-gray-300 dark:text-gray-200">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="mt-2.5 flex items-center gap-1.5 pt-2">
                      <input
                        type="text"
                        value={commentInputMap[post.id] || ''}
                        onChange={(e) => setCommentInputMap({ ...commentInputMap, [post.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        placeholder="Kirim doa ucapan silaturahmi..."
                        className={`flex-1 rounded-xl px-3 py-1.5 text-xs border focus:outline-hidden ${
                          isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="bg-amber-500 hover:bg-amber-600 text-gray-950 p-2 rounded-xl active:scale-95 transition"
                        title="Kirim Doa"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUB-VIEW 4: SETTING (BACKUP, RESTORE, RESET DATA)            */}
        {/* ============================================================ */}
        {activeTab === 'setting' && (
          <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 sm:p-4 space-y-4 pb-20">
            {/* Header Title */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                Pengaturan Database &amp; Sinkronisasi
              </h2>
              <p className="text-xs text-gray-400">
                Kelola cadangan JSON, pemulihan data, dan profil poros silsilah
              </p>
            </div>

            {/* SECTION 1: BACKUP DATA */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
                <Download className="w-4 h-4" />
                <span>1. Cadangkan Data (Backup)</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Unduh seluruh pohon silsilah keluarga 7 generasi beserta postingan medsos ke dalam satu berkas `.json` mandiri agar data Anda selalu aman.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleExportJSON}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-98 transition shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup JSON ({familyNodes.length} Anggota)</span>
                </button>
                <button
                  onClick={handleCopyTextSummary}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Salin Ringkasan Teks</span>
                </button>
              </div>
            </div>

            {/* SECTION 2: RESTORE DATA */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center gap-2 text-blue-500 font-bold text-xs">
                <Upload className="w-4 h-4" />
                <span>2. Pulihkan Data (Restore)</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Pilih file cadangan `.json` yang telah Anda simpan sebelumnya untuk memulihkan seluruh struktur silsilah.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition active:scale-98 ${
                  isDarkMode ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Pilih Berkas JSON untuk Dipulihkan</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJSON}
              />
            </div>

            {/* SECTION 3: RESET DATA */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center gap-2 text-red-500 font-bold text-xs">
                <RefreshCw className="w-4 h-4" />
                <span>3. Reset Data (Ulangi Awal)</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Gunakan opsi reset jika ingin mencoba kembali contoh silsilah lengkap atau ingin memulai lembar baru bersih.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleResetToDemo}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-amber-400 hover:bg-gray-700' : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset ke Contoh 7 Generasi</span>
                </button>
                <button
                  onClick={handleResetCleanSlate}
                  className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clean Slate (Mulai Kosong)</span>
                </button>
              </div>
            </div>

            {/* SECTION 4: POROS INTI IDENTITAS USER */}
            <div className={`p-4 rounded-2xl border space-y-2.5 ${
              isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <h4 className="text-xs font-bold text-gray-300">Identitas Poros Utama Terverifikasi:</h4>
              <div className="text-xs space-y-1 text-gray-400">
                <p>👤 <span className="font-semibold text-gray-200 dark:text-gray-300">User Utama:</span> Hendriana (Trah Ayah User - Merah)</p>
                <p>💍 <span className="font-semibold text-gray-200 dark:text-gray-300">Pasangan:</span> Dewi Sartika (Trah Ayah Pasangan - Hijau)</p>
                <p>📍 <span className="font-semibold text-gray-200 dark:text-gray-300">Domisili Warga:</span> RT 03 / RW 05, Blok A No. 12</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* BOTTOM NAVIGATION BAR FOR LELUHURQU                             */}
      {/* ============================================================== */}
      <nav className={`shrink-0 border-t flex justify-around items-center px-2 py-2 z-30 transition-colors ${
        isDarkMode ? 'bg-gray-950/95 border-gray-800 text-gray-400' : 'bg-white/95 border-slate-200 text-slate-500 shadow-md'
      }`}>
        {/* Tab 1: SilsilahQu (Dashboard & List) */}
        <button
          onClick={() => setActiveTab('silsilahqu')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition active:scale-95 ${
            activeTab === 'silsilahqu' ? 'text-amber-500 font-bold' : 'hover:text-gray-200'
          }`}
        >
          <BarChart3 className={`w-5 h-5 ${activeTab === 'silsilahqu' ? 'text-amber-500' : ''}`} />
          <span className="text-[10px]">SilsilahQu</span>
        </button>

        {/* Tab 2: OrbitQu (Kanvas 7 Generasi) */}
        <button
          onClick={() => setActiveTab('orbitqu')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition active:scale-95 ${
            activeTab === 'orbitqu' ? 'text-amber-500 font-bold' : 'hover:text-gray-200'
          }`}
        >
          <Disc className={`w-5 h-5 ${activeTab === 'orbitqu' ? 'text-amber-500' : ''}`} />
          <span className="text-[10px]">OrbitQu 7Gen</span>
        </button>

        {/* Tab 3: Medsos Trah */}
        <button
          onClick={() => setActiveTab('medsos')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition relative active:scale-95 ${
            activeTab === 'medsos' ? 'text-amber-500 font-bold' : 'hover:text-gray-200'
          }`}
        >
          <div className="relative">
            <Users className={`w-5 h-5 ${activeTab === 'medsos' ? 'text-amber-500' : ''}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></span>
          </div>
          <span className="text-[10px]">Medsos 4 Trah</span>
        </button>

        {/* Tab 4: Setting */}
        <button
          onClick={() => setActiveTab('setting')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition active:scale-95 ${
            activeTab === 'setting' ? 'text-amber-500 font-bold' : 'hover:text-gray-200'
          }`}
        >
          <Settings className={`w-5 h-5 ${activeTab === 'setting' ? 'text-amber-500' : ''}`} />
          <span className="text-[10px]">Setting &amp; Backup</span>
        </button>
      </nav>

      {/* ============================================================== */}
      {/* DRAWER: CHAINED BATCH INPUT (FORMAT KOMA)                       */}
      {/* ============================================================== */}
      {isBatchDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsBatchDrawerOpen(false)}
          />
          <div className={`relative w-full max-w-sm h-full flex flex-col shadow-2xl z-10 border-l animate-in slide-in-from-right duration-250 ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <GitFork className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-sm">Batch Input Koma Berantai</h2>
              </div>
              <button
                onClick={() => setIsBatchDrawerOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs no-scrollbar">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 leading-relaxed">
                <p className="font-semibold mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Format Input Cepat:
                </p>
                Gunakan tanda koma (<code>,</code>) untuk memasukkan banyak nama sekaligus secara berantai:
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                  <li>Pilih Orang Tua/Atasan target</li>
                  <li>Ketik daftar anak: <code>Ahmad, Budi, Siti, Dewi</code></li>
                  <li>Sistem otomatis membuat node di ring generasi berikutnya!</li>
                </ul>
              </div>

              {/* Step 1: Parent Selection */}
              <div className="space-y-1.5">
                <label className="block font-semibold">1. Pilih Orang Tua / Induk Node:</label>
                <select
                  value={batchParentId}
                  onChange={(e) => handleBatchParentChange(e.target.value)}
                  className={`w-full rounded-lg p-2 text-xs border focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="ROOT">📍 Tambah Uyut Baru (Level 0 Leluhur Core)</option>
                  {familyNodes.map(node => (
                    <option key={node.id} value={node.id}>
                      [L{node.level}] {node.name} ({node.title || 'Anggota'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400">
                  Target Generasi: <span className="text-amber-500 font-semibold">{getTargetGenerationLabel()}</span>
                </p>
              </div>

              {/* Step 2: Trah Selector */}
              <div className="space-y-1.5">
                <label className="block font-semibold">2. Pilih Kuadran Trah:</label>
                <select
                  value={batchTrah}
                  onChange={(e) => setBatchTrah(e.target.value as TrahType)}
                  disabled={batchParentId !== 'ROOT'}
                  className={`w-full rounded-lg p-2 text-xs border focus:ring-2 focus:ring-amber-500 focus:outline-hidden disabled:opacity-60 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="TRAH1">🔴 Trah Ayah User (Kuadran I)</option>
                  <option value="TRAH2">🔵 Trah Ibu User (Kuadran II)</option>
                  <option value="TRAH3">🟢 Trah Ayah Pasangan (Kuadran III)</option>
                  <option value="TRAH4">🟡 Trah Ibu Pasangan (Kuadran IV)</option>
                </select>
              </div>

              {/* Step 3: Comma Separated Names */}
              <div className="space-y-1.5">
                <label className="block font-semibold">3. Daftar Keturunan (Pisahkan Koma):</label>
                <textarea
                  rows={4}
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
      {/* MODAL: DETAIL PROFIL, KLAIM & REVISI PROFIL SENDIRI            */}
      {/* ============================================================== */}
      {isEditModalOpen && activeDetailNode && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-2xl w-full max-w-md max-h-[90dvh] flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-150 overflow-hidden ${
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs active:scale-95 transition ${
                    activeDetailNode.claimed
                      ? isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-slate-200 text-slate-700'
                      : 'bg-amber-500 hover:bg-amber-600 text-gray-950'
                  }`}
                >
                  {activeDetailNode.claimed ? 'Batal Klaim' : 'Klaim Saya!'}
                </button>
              </div>

              {/* Silsilah Connectivity Info */}
              <div className={`p-3 rounded-xl border space-y-1.5 text-[11px] ${
                isDarkMode ? 'bg-gray-950/60 border-gray-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className="font-bold text-amber-500 text-xs mb-1">Hubungan Silsilah Terhubung:</p>
                <p>
                  <span className="text-gray-400">Orang Tua/Induk:</span>{' '}
                  <span className="font-semibold">{parentNode ? `${parentNode.name} (${parentNode.title || '-'})` : 'Garis Inti Leluhur (Root)'}</span>
                </p>
                <p>
                  <span className="text-gray-400">Keturunan Langsung:</span>{' '}
                  <span className="font-semibold">{childNodes.length > 0 ? childNodes.map(c => c.name).join(', ') : 'Belum tercatat'}</span>
                </p>
                <p>
                  <span className="text-gray-400">Kuadran Trah:</span>{' '}
                  <span className="font-semibold">{getTrahName(activeDetailNode.trah)}</span>
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
                className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 px-3.5 py-2.5 rounded-xl text-xs font-semibold active:scale-98 transition flex items-center gap-1"
                title="Hapus Node Ini"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: FORM POSTING KABAR MEDSOS 4 TRAH                         */}
      {/* ============================================================== */}
      {isPostFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-2xl w-full max-w-sm flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-150 ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className="font-bold text-sm">Bagikan Kabar Keluarga 4 Trah</h3>
              <button onClick={() => setIsPostFormOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-gray-400">Target Trah Penerima Kabar:</label>
                <select
                  value={newPostTargetTrah}
                  onChange={(e) => setNewPostTargetTrah(e.target.value as any)}
                  className={`w-full rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="ALL">🌐 Semua 4 Trah (Keluarga Besar Lengkap)</option>
                  <option value="TRAH1">🔴 Khusus Trah Ayah User</option>
                  <option value="TRAH2">🔵 Khusus Trah Ibu User</option>
                  <option value="TRAH3">🟢 Khusus Trah Ayah Pasangan</option>
                  <option value="TRAH4">🟡 Khusus Trah Ibu Pasangan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-400">Kategori Kabar:</label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value as any)}
                  className={`w-full rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Pengumuman">📢 Pengumuman / Arisan Keluarga</option>
                  <option value="Syukuran">👶 Syukuran / Aqiqah / Pernikahan</option>
                  <option value="Reuni">📸 Nostalgia / Reuni Akbar Trah</option>
                  <option value="Kabar Bahagia">🌟 Prestasi / Kabar Bahagia</option>
                  <option value="Berita Duka">🕊️ Berita Duka / Doa Bersama</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-400">Isi Kabar Silaturahmi:</label>
                <textarea
                  rows={4}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Tuliskan kabar, undangan arisan, doa, atau pengumuman penting keluarga..."
                  className={`w-full rounded-lg p-2.5 text-xs border focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2.5 rounded-xl text-xs shadow-md active:scale-98 transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Publikasikan Kabar Trah</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
