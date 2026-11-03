import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Info
} from 'lucide-react';
import { FamilyNode, TrahType } from '../../types';

interface LeluhurQuViewProps {
  onBackToMain: () => void;
  showNotification: (msg: string) => void;
}

const GENERATION_NAMES = [
  'Level 0: Uyut (Leluhur Core)',
  'Level 1: Kakek / Nenek',
  'Level 2: Ayah / Ibu / Paman / Bibi / Uwa',
  'Level 3: User / Pasangan & Saudara (Poros Utama)',
  'Level 4: Anak',
  'Level 5: Cucu (Compact Gen Z)',
  'Level 6: Cicit (Compact Gen Alpha)'
];

const INITIAL_FAMILY_DATA: FamilyNode[] = [
  // Level 0: Uyut (Outer Ancestors)
  { id: 'uyut_ayah', name: 'Kyai Sanusi', title: 'Uyut Sepuh', level: 0, trah: 'TRAH1', parentId: null, photo: '', claimed: false },
  { id: 'uyut_ibu', name: 'Nyai Aminah', title: 'Uyut Putri', level: 0, trah: 'TRAH2', parentId: null, photo: '', claimed: false },
  { id: 'uyut_pasangan_ayah', name: 'R. Somawinata', title: 'Uyut Pasangan', level: 0, trah: 'TRAH3', parentId: null, photo: '', claimed: false },
  { id: 'uyut_pasangan_ibu', name: 'Hj. Siti Rohmah', title: 'Uyut Pasangan', level: 0, trah: 'TRAH4', parentId: null, photo: '', claimed: false },

  // Level 1: Kakek / Nenek
  { id: 'kakek_ayah', name: 'H. Baharuddin', title: 'Kakek', level: 1, trah: 'TRAH1', parentId: 'uyut_ayah', photo: '', claimed: false },
  { id: 'nenek_ayah', name: 'Hj. Maryam', title: 'Nenek', level: 1, trah: 'TRAH1', parentId: 'uyut_ayah', photo: '', claimed: false },
  { id: 'kakek_ibu', name: 'H. Syamsul', title: 'Kakek', level: 1, trah: 'TRAH2', parentId: 'uyut_ibu', photo: '', claimed: false },
  { id: 'kakek_pasangan', name: 'Drs. Subagja', title: 'Kakek Mertua', level: 1, trah: 'TRAH3', parentId: 'uyut_pasangan_ayah', photo: '', claimed: false },
  { id: 'nenek_pasangan', name: 'Hj. Ratnasari', title: 'Nenek Mertua', level: 1, trah: 'TRAH4', parentId: 'uyut_pasangan_ibu', photo: '', claimed: false },

  // Level 2: Ayah, Ibu, Paman, Uwa
  { id: 'ayah_user', name: 'Bpk. Hendra S.', title: 'Ayah Kandung', level: 2, trah: 'TRAH1', parentId: 'kakek_ayah', photo: '', claimed: true },
  { id: 'paman_user', name: 'Uwa Hamdan', title: 'Paman Sulung', level: 2, trah: 'TRAH1', parentId: 'kakek_ayah', photo: '', claimed: false },
  { id: 'ibu_user', name: 'Ibu Nurhayati', title: 'Ibu Kandung', level: 2, trah: 'TRAH2', parentId: 'kakek_ibu', photo: '', claimed: true },
  { id: 'ayah_istri', name: 'Bpk. Bambang P.', title: 'Ayah Mertua', level: 2, trah: 'TRAH3', parentId: 'kakek_pasangan', photo: '', claimed: false },
  { id: 'ibu_istri', name: 'Ibu Endang W.', title: 'Ibu Mertua', level: 2, trah: 'TRAH4', parentId: 'nenek_pasangan', photo: '', claimed: false },

  // Level 3: User & Pasangan (Poros Tengah Utama)
  { id: 'root_user', name: 'Hendriana', title: 'Poros Inti (User)', level: 3, trah: 'TRAH1', parentId: 'ayah_user', photo: '', claimed: true },
  { id: 'pasangan_user', name: 'Dewi Sartika', title: 'Istri / Pasangan', level: 3, trah: 'TRAH3', parentId: 'ayah_istri', photo: '', claimed: true },
  { id: 'saudara_user', name: 'Rian Pratama', title: 'Adik Kandung', level: 3, trah: 'TRAH1', parentId: 'ayah_user', photo: '', claimed: false },

  // Level 4: Anak
  { id: 'anak_1', name: 'Alif Al-Fatih', title: 'Anak Pertama', level: 4, trah: 'TRAH1', parentId: 'root_user', photo: '', claimed: true },
  { id: 'anak_2', name: 'Zahra Humaira', title: 'Anak Kedua', level: 4, trah: 'TRAH1', parentId: 'root_user', photo: '', claimed: true },

  // Level 5: Cucu
  { id: 'cucu_1', name: 'Kenzho Rayyan', title: 'Cucu Laki', level: 5, trah: 'TRAH1', parentId: 'anak_1', photo: '', claimed: false },
  { id: 'cucu_2', name: 'Ayudia Inara', title: 'Cucu Perempuan', level: 5, trah: 'TRAH1', parentId: 'anak_1', photo: '', claimed: false },

  // Level 6: Cicit (Compact Gen Alpha)
  { id: 'cicit_1', name: 'Baby Arshaka', title: 'Cicit Terkecil', level: 6, trah: 'TRAH1', parentId: 'cucu_1', photo: '', claimed: false },
];

export const LeluhurQuView: React.FC<LeluhurQuViewProps> = ({
  onBackToMain,
  showNotification
}) => {
  // Family state
  const [familyNodes, setFamilyNodes] = useState<FamilyNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // App & Theme states
  const [activeTheme, setActiveTheme] = useState<'cosmic' | 'organic' | 'atom' | 'neural'>('cosmic');
  const [activeTrahFilter, setActiveTrahFilter] = useState<'ALL' | TrahType>('ALL');
  const [showOrbitRings, setShowOrbitRings] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Drawers & Modals
  const [isBatchDrawerOpen, setIsBatchDrawerOpen] = useState<boolean>(false);
  const [batchParentId, setBatchParentId] = useState<string>('ROOT');
  const [batchTrah, setBatchTrah] = useState<TrahType>('TRAH1');
  const [batchNames, setBatchNames] = useState<string>('');

  // Node Edit Modal Form state
  const [editNodeName, setEditNodeName] = useState<string>('');
  const [editNodeTitle, setEditNodeTitle] = useState<string>('');
  const [editNodePhoto, setEditNodePhoto] = useState<string>('');

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
          return;
        }
      } catch (e) {
        console.error('Failed parsing saved silsilah data', e);
      }
    }
    // Default seed
    setFamilyNodes(INITIAL_FAMILY_DATA);
    localStorage.setItem('orbitqu_family_data', JSON.stringify(INITIAL_FAMILY_DATA));
  }, []);

  // Save changes to LocalStorage
  const saveFamilyData = (updated: FamilyNode[]) => {
    setFamilyNodes(updated);
    localStorage.setItem('orbitqu_family_data', JSON.stringify(updated));
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

  const getThemeConnectorColor = (baseHex: string, dark: boolean): string => {
    if (activeTheme === 'neural') return baseHex;
    if (activeTheme === 'organic') return '#d97706';
    if (activeTheme === 'atom') return dark ? '#38bdf8' : '#0284c7';
    return dark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)';
  };

  // Compute horizontal elliptical layout coordinates
  const computeEllipticalLayout = useCallback((nodes: FamilyNode[]) => {
    const filteredNodes = activeTrahFilter === 'ALL'
      ? nodes
      : nodes.filter(n => n.trah === activeTrahFilter || n.level === 3);

    // Ellipse Radii (Rx > Ry) for 7 concentric generations
    const levelRadii = [
      { rx: 520, ry: 380 }, // Level 0: Uyut Outer Core
      { rx: 430, ry: 310 }, // Level 1: Kakek / Nenek
      { rx: 340, ry: 240 }, // Level 2: Ayah / Ibu / Paman / Bibi / Uwa
      { rx: 250, ry: 170 }, // Level 3: User / Pasangan & Saudara (Poros Tengah)
      { rx: 170, ry: 110 }, // Level 4: Anak
      { rx: 110, ry: 75 },  // Level 5: Cucu
      { rx: 55,  ry: 38 }   // Level 6: Cicit Inner Core
    ];

    // Trah quadrant angles (in radians)
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear frame
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
        // Large Photo Card (Prioritas Dikenal: Uyut, Kakek, Ayah/Paman/Uwa)
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
  }, [familyNodes, computeEllipticalLayout, showOrbitRings, isDarkMode, activeTheme]);

  // Handle Resize and Initial Pan
  const resizeCanvas = useCallback(() => {
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
  }, [renderCanvas]);

  useEffect(() => {
    resizeCanvas();
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

  // Click on Canvas -> Open Node Modal
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
        openNodeModal(node.id);
        break;
      }
    }
  };

  // Node Modal Management
  const openNodeModal = (nodeId: string) => {
    const node = familyNodes.find(n => n.id === nodeId);
    if (!node) return;
    setSelectedNodeId(nodeId);
    setEditNodeName(node.name);
    setEditNodeTitle(node.title || '');
    setEditNodePhoto(node.photo || '');
  };

  const closeNodeModal = () => {
    setSelectedNodeId(null);
  };

  const handleSaveNode = () => {
    if (!selectedNodeId) return;
    const updated = familyNodes.map(node => {
      if (node.id === selectedNodeId) {
        return {
          ...node,
          name: editNodeName.trim() || node.name,
          title: editNodeTitle.trim(),
          photo: editNodePhoto.trim()
        };
      }
      return node;
    });
    saveFamilyData(updated);
    closeNodeModal();
    showNotification('Data anggota keluarga berhasil diperbarui');
  };

  const handleToggleClaim = () => {
    if (!selectedNodeId) return;
    const updated = familyNodes.map(node => {
      if (node.id === selectedNodeId) {
        const nextClaimed = !node.claimed;
        showNotification(nextClaimed ? 'Profil berhasil diklaim!' : 'Klaim profil dibatalkan');
        return { ...node, claimed: nextClaimed };
      }
      return node;
    });
    saveFamilyData(updated);
  };

  const handleDeleteNode = () => {
    if (!selectedNodeId) return;
    const target = familyNodes.find(n => n.id === selectedNodeId);
    if (!target) return;

    if (window.confirm(`Hapus "${target.name}" beserta garis keturunan langsungnya?`)) {
      const updated = familyNodes.filter(n => n.id !== selectedNodeId && n.parentId !== selectedNodeId);
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

  // JSON Export / Import / Reset
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(familyNodes, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `WargaQu_LeluhurQu_${Date.now()}.json`);
    dlAnchorElem.click();
    showNotification('Cadangan data SilsilahQu berhasil diunduh');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported) && imported.length > 0) {
          saveFamilyData(imported);
          showNotification('Data Silsilah keluarga berhasil diimpor!');
        } else {
          showNotification('Format data JSON silsilah tidak valid');
        }
      } catch (err) {
        showNotification('Gagal membaca file JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm('Reset seluruh data silsilah ke lembar awal (Clean Slate)?')) {
      const cleanRoot: FamilyNode[] = [
        { id: 'root_user', name: 'User Utama', title: 'Poros Inti', level: 3, trah: 'TRAH1', parentId: null, photo: '', claimed: true }
      ];
      saveFamilyData(cleanRoot);
      setIsBatchDrawerOpen(false);
      showNotification('Data telah dibersihkan kembali ke Poros Inti');
    }
  };

  const selectedNode = familyNodes.find(n => n.id === selectedNodeId);

  return (
    <div className={`w-full h-full relative select-none flex flex-col overflow-hidden font-sans ${isDarkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* Top Header Bar */}
      <header className={`z-20 flex flex-wrap items-center justify-between p-2.5 sm:p-3.5 backdrop-blur-md border-b transition-colors ${
        isDarkMode ? 'bg-gray-950/85 border-gray-800 text-gray-100' : 'bg-white/90 border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="flex items-center gap-2">
          {/* Back to Warga Dashboard button */}
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
              Silsilah 7 Generasi Ellips Konsentris • Anti Cross-Lines
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Theme Presets Dropdown */}
          <select
            value={activeTheme}
            onChange={(e) => setActiveTheme(e.target.value as any)}
            className={`text-xs rounded-lg px-2 py-1.5 border focus:outline-hidden focus:ring-1 focus:ring-amber-500 ${
              isDarkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-white text-slate-800 border-slate-300'
            }`}
            title="Pilih Tema Visual Orbit"
          >
            <option value="cosmic">🪐 Cosmic</option>
            <option value="organic">🌿 Akar Organik</option>
            <option value="atom">⚛️ Atom</option>
            <option value="neural">🧠 Neural Glow</option>
          </select>

          {/* Trah Filter */}
          <select
            value={activeTrahFilter}
            onChange={(e) => setActiveTrahFilter(e.target.value as any)}
            className={`text-xs rounded-lg px-2 py-1.5 border focus:outline-hidden focus:ring-1 focus:ring-amber-500 max-w-[110px] sm:max-w-none ${
              isDarkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-white text-slate-800 border-slate-300'
            }`}
            title="Filter Trah"
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
                ? isDarkMode ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-amber-100 border-amber-300 text-amber-800 font-semibold'
                : isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
            title="Toggle Garis Orbit"
          >
            <Disc className="w-3.5 h-3.5" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => {
              setIsDarkMode(!isDarkMode);
              showNotification(isDarkMode ? 'Mode Terang (Light Mode) aktif' : 'Mode Gelap (Dark Mode) aktif');
            }}
            className={`p-1.5 rounded-lg border text-xs transition active:scale-95 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-amber-400' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-600'
            }`}
            title="Ganti Tema Terang/Gelap"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Batch Input Drawer Button */}
          <button
            onClick={() => setIsBatchDrawerOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition"
            title="Input Batch Koma Berantai"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Input Batch</span>
          </button>
        </div>
      </header>

      {/* Interactive Canvas Area */}
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
        <div className={`absolute bottom-3 left-3 z-10 backdrop-blur-md p-2.5 rounded-xl border text-xs space-y-1.5 shadow-xl max-w-[240px] sm:max-w-xs transition-opacity ${
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
            💡 Klik sembarang node untuk edit & klaim profil
          </div>
        </div>

        {/* Zoom Controls (Bottom Right) */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1.5">
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

      {/* Drawer: Chained Batch Input (Format Koma) */}
      {isBatchDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsBatchDrawerOpen(false)}
          />

          <div className={`relative w-full max-w-sm h-full flex flex-col shadow-2xl z-10 border-l animate-in slide-in-from-right duration-250 ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Drawer Header */}
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

            {/* Drawer Form Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs no-scrollbar">
              {/* Instructions Box */}
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
                {batchParentId !== 'ROOT' && (
                  <p className="text-[10px] text-gray-400 italic">*Trah otomatis mengikuti induk node yang dipilih</p>
                )}
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

              {/* Data Storage Management */}
              <div className={`pt-4 border-t space-y-2.5 ${isDarkMode ? 'border-gray-800' : 'border-slate-200'}`}>
                <h3 className="font-semibold text-gray-400 text-xs">Manajemen Database Cadangan:</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportJSON}
                    className={`flex-1 p-2 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-medium ${
                      isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" /> Export JSON
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 p-2 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-medium ${
                      isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Import JSON
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportJSON}
                  />
                </div>
                <button
                  onClick={handleResetData}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 p-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Reset Semua Data (Clean Slate)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Node Details & Claim Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-sm p-4 sm:p-5 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-150 ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={closeNodeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Avatar Header */}
            <div className={`flex items-center gap-3 border-b pb-3 ${isDarkMode ? 'border-gray-800' : 'border-slate-200'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md ${getTrahBgClass(selectedNode.trah)}`}>
                <span>{selectedNode.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">{selectedNode.name}</h3>
                <p className="text-xs text-amber-500 font-semibold">{GENERATION_NAMES[selectedNode.level]}</p>
              </div>
            </div>

            {/* Edit Form */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1 text-gray-400">Nama Lengkap / Panggilan:</label>
                <input
                  type="text"
                  value={editNodeName}
                  onChange={(e) => setEditNodeName(e.target.value)}
                  className={`w-full rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-400">
                  Gelar Sapaan / Peran (Paman, Bibi, Uwa, Pasangan):
                </label>
                <input
                  type="text"
                  value={editNodeTitle}
                  onChange={(e) => setEditNodeTitle(e.target.value)}
                  placeholder="Contoh: Uwa Haji / Paman Bungsu"
                  className={`w-full rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-400">
                  URL Foto Profil Avatar (Opsional):
                </label>
                <input
                  type="text"
                  value={editNodePhoto}
                  onChange={(e) => setEditNodePhoto(e.target.value)}
                  placeholder="https://..."
                  className={`w-full rounded-lg p-2 border focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Claim Status Card */}
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-slate-100 border-slate-200'
              }`}>
                <div>
                  <p className="font-semibold text-xs">Status Klaim Profil:</p>
                  <p className={`text-[11px] font-medium ${selectedNode.claimed ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {selectedNode.claimed ? '✅ Telah Diklaim oleh Pemilik' : '⚠️ Belum Diklaim'}
                  </p>
                </div>
                <button
                  onClick={handleToggleClaim}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs active:scale-95 transition ${
                    selectedNode.claimed
                      ? isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-slate-200 text-slate-700'
                      : 'bg-amber-500 hover:bg-amber-600 text-gray-950'
                  }`}
                >
                  {selectedNode.claimed ? 'Batal Klaim' : 'Klaim Saya!'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveNode}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2 rounded-xl text-xs shadow-md active:scale-98 transition"
              >
                Simpan Perubahan
              </button>
              <button
                onClick={handleDeleteNode}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 px-3 py-2 rounded-xl text-xs font-semibold active:scale-98 transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
