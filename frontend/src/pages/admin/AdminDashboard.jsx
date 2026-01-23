import React, { useState, useEffect, useTransition } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Plus,
  Edit,
  Trash2,
  XCircle,
  Layers,
  Truck,
  RefreshCw,
  Menu as MenuIcon,
  Type,
  ShieldAlert,
  Save,
  ChevronRight,
  ChevronDown,
  Settings,
  Users,
  AlertTriangle,
  ExternalLink,
  Upload,
  Mail,
  Percent,
  CreditCard,
  Palette
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getOrderStatistics, getAllOrders, updateOrderStatus } from '../../api/orderApi';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories as getProdCategories, getSuppliers as getProdSuppliers } from '../../api/productApi';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoryApi';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../api/supplierApi';
import { getAllMenus, createMenu, addMenuItem, updateMenuItem, deleteMenuItem } from '../../api/menuApi';
import { getAllContent, updateContent, deleteContent } from '../../api/contentApi';
import { getAllBlocked, addToBlocklist, removeFromBlocklist } from '../../api/blocklistApi';
import { getNewsletterSubscribers, deleteNewsletterSubscriber, sendProductNewsletter, sendPromotionNewsletter } from '../../api/newsletterApi';
import { getPromotions, createPromotion, deletePromotion } from '../../api/promotionApi';
import { registerAdmin, getRoles, getAdmins } from '../../api/adminApi';
import { listIncompleteOrders, clearIncompleteOrder } from '../../api/incompleteOrderApi';
import { createSteadfastOrder, createSteadfastBulkOrders } from '../../api/courierApi';
import { EditorContent, useEditor } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';

const FontStyle = Extension.create({
  name: 'fontStyle',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, '') || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            }
          },
          fontWeight: {
            default: null,
            parseHTML: element => element.style.fontWeight || null,
            renderHTML: attributes => {
              if (!attributes.fontWeight) return {};
              return { style: `font-weight: ${attributes.fontWeight}` };
            }
          }
        }
      }
    ];
  }
});

const ToolbarButton = ({ active, onClick, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`px-2 py-1 text-sm rounded border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
  >
    {children}
  </button>
);

const RichTextEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] }
      }),
      Underline,
      TextStyle,
      FontStyle,
      Color,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'min-h-[140px] outline-none'
      }
    },
    onUpdate: ({ editor: nextEditor }) => {
      onChange(nextEditor.getHTML());
    }
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || '') !== current) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const applyInlineHeading = (fontSize) => {
    const currentSize = editor.getAttributes('textStyle').fontSize;
    if (currentSize === fontSize) {
      editor.chain().focus().unsetMark('textStyle').run();
      return;
    }
    editor.chain().focus().setMark('textStyle', { fontSize, fontWeight: '700' }).run();
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="flex flex-wrap gap-2 p-2 border-b bg-gray-50">
        <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>I</ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>U</ToolbarButton>
        <ToolbarButton title="Strike" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>S</ToolbarButton>
        <ToolbarButton title="Highlight" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>H</ToolbarButton>
        <div className="h-6 w-px bg-gray-200 mx-1" />
        <ToolbarButton title="Heading 1 (Selected text)" active={editor.getAttributes('textStyle').fontSize === '1.75rem'} onClick={() => applyInlineHeading('1.75rem')}>H1</ToolbarButton>
        <ToolbarButton title="Heading 2 (Selected text)" active={editor.getAttributes('textStyle').fontSize === '1.5rem'} onClick={() => applyInlineHeading('1.5rem')}>H2</ToolbarButton>
        <ToolbarButton title="Heading 3 (Selected text)" active={editor.getAttributes('textStyle').fontSize === '1.25rem'} onClick={() => applyInlineHeading('1.25rem')}>H3</ToolbarButton>
        <ToolbarButton title="Heading 4 (Selected text)" active={editor.getAttributes('textStyle').fontSize === '1.125rem'} onClick={() => applyInlineHeading('1.125rem')}>H4</ToolbarButton>
        <ToolbarButton title="Bullet List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</ToolbarButton>
        <ToolbarButton title="Ordered List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</ToolbarButton>
        <ToolbarButton title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>"</ToolbarButton>
        <div className="h-6 w-px bg-gray-200 mx-1" />
        <ToolbarButton title="Align Left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>L</ToolbarButton>
        <ToolbarButton title="Align Center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>C</ToolbarButton>
        <ToolbarButton title="Align Right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>R</ToolbarButton>
        <div className="h-6 w-px bg-gray-200 mx-1" />
        <ToolbarButton
          title="Add Link"
          active={editor.isActive('link')}
          onClick={() => {
            const url = window.prompt('Enter URL');
            if (!url) return;
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }}
        >
          Link
        </ToolbarButton>
        <ToolbarButton title="Remove Link" active={false} onClick={() => editor.chain().focus().unsetLink().run()}>Unlink</ToolbarButton>
      </div>
      <div
        className="p-3 min-h-[160px] prose max-w-none bg-white cursor-text"
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [counts, setCounts] = useState({ products: 0, orders: 0 });
  const [incompleteCount, setIncompleteCount] = useState(0);
  const [themeSettings, setThemeSettings] = useState({});

  const fetchNotificationCounts = async () => {
    try {
      // 1. Order Badge: Show "New" orders since last view
      const resOrders = await getAllOrders({ page: 1, limit: 1 });
      const ordersPayload = resOrders.data || resOrders;
      const totalOrdersCount = ordersPayload.pagination?.total || 0;

      const lastViewedCount = parseInt(localStorage.getItem('admin_last_viewed_order_count') || '0');
      // If server has more orders than we last saw, show the difference. Otherwise 0.
      const newOrdersCount = Math.max(0, totalOrdersCount - lastViewedCount);

      // 2. Product Badge (Total products for Sidebar)
      const resProducts = await getProducts({ status: 'ALL', limit: 1 });
      const totalProductsCount = resProducts.pagination ? resProducts.pagination.total : (resProducts.data?.products?.length || 0);

      setCounts({
        products: totalProductsCount,
        orders: newOrdersCount
      });
    } catch (e) { console.error("Failed to fetch notification counts", e); }
  };

  useEffect(() => {
    fetchNotificationCounts();
    // Poll every 30s
    const interval = setInterval(fetchNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const handleChange = () => {
      const nextIsMobile = mq.matches;
      setIsMobile(nextIsMobile);
      if (nextIsMobile) {
        setIsSidebarOpen(false);
      }
    };

    handleChange();
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const res = await getAllContent();
        const data = res.data || res;
        setThemeSettings(data && typeof data === 'object' ? data : {});
      } catch (e) {
        setThemeSettings({});
      }
    };
    fetchTheme();
  }, []);

  const adminThemeVars = {
    '--admin-sidebar-bg': themeSettings.admin_sidebar_bg || '#111827',
    '--admin-sidebar-text': themeSettings.admin_sidebar_text || '#d1d5db',
    '--admin-sidebar-hover-bg': themeSettings.admin_sidebar_hover_bg || '#1f2937',
    '--admin-sidebar-active-bg': themeSettings.admin_sidebar_active_bg || '#111827',
    '--admin-sidebar-active-text': themeSettings.admin_sidebar_active_text || '#ffffff',
    '--admin-sidebar-badge-bg': themeSettings.admin_sidebar_badge_bg || '#ef4444',
    '--admin-sidebar-badge-text': themeSettings.admin_sidebar_badge_text || '#ffffff',
  };

  const fetchIncompleteCount = async () => {
    try {
      const res = await listIncompleteOrders();
      const data = res.data || res;
      setIncompleteCount(Array.isArray(data) ? data.length : 0);
    } catch (e) {
      setIncompleteCount(0);
    }
  };

  useEffect(() => {
    fetchIncompleteCount();
    const interval = setInterval(fetchIncompleteCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (tab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
    if (tab === 'orders') {
      // Mark orders as seen
      getAllOrders({ page: 1, limit: 1 }).then(res => {
        const payload = res.data || res;
        const total = payload.pagination?.total || 0;
        localStorage.setItem('admin_last_viewed_order_count', total.toString());
        setCounts(prev => ({ ...prev, orders: 0 }));
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardOverview />;
      case 'products': return <ProductsManager />;
      case 'offers': return <PromotionsManager />;
      case 'orders': return <OrdersManager />;
      case 'incomplete': return <IncompleteOrdersManager setIncompleteCount={setIncompleteCount} />;
      case 'categories': return <CategoriesManager />;
      case 'suppliers': return <SuppliersManager />;
      case 'menus': return <MenusManager />;
      case 'content': return <SiteContentManager />;
      case 'mail': return <MailSettingsManager />;
      case 'newsletter': return <NewsletterManager />;
      case 'blocklist': return <BlocklistManager />;
      case 'settings': return <SettingsManager />;
      case 'admins': return <AdminsManager />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="relative flex min-h-screen bg-gray-50 font-sans text-gray-900 admin-theme" style={adminThemeVars}>
      <style>{`
        .admin-theme .sidebar-shell { background-color: var(--admin-sidebar-bg); }
        .admin-theme .sidebar-item { color: var(--admin-sidebar-text); }
        .admin-theme .sidebar-item:hover { background-color: var(--admin-sidebar-hover-bg); color: var(--admin-sidebar-text); }
        .admin-theme .sidebar-item-active { background-color: var(--admin-sidebar-active-bg); color: var(--admin-sidebar-active-text); }
        @media (max-width: 768px) {
          .admin-theme table {
            display: block;
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .admin-theme table thead,
          .admin-theme table tbody,
          .admin-theme table tr,
          .admin-theme table th,
          .admin-theme table td {
            white-space: nowrap;
          }
        }
      `}</style>
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`sidebar-shell text-white transition-all duration-300 ease-in-out flex flex-col shadow-xl z-20
        ${isMobile ? 'fixed inset-y-0 left-0 w-64' : `${isSidebarOpen ? 'w-64' : 'w-20'} relative`}
        ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          {isSidebarOpen ? <h1 className="text-xl font-bold tracking-wider">ADMIN PANEL</h1> : <span className="font-bold text-xl">AP</span>}
        </div>
        <nav className="flex-1 py-6 space-y-1 px-2 overflow-y-auto">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => handleTabChange('overview')} isOpen={isSidebarOpen} />

          <SidebarItem
            icon={<Package size={20} />}
            label="Products"
            active={activeTab === 'products'}
            onClick={() => handleTabChange('products')}
            isOpen={isSidebarOpen}
          />
          <SidebarItem icon={<Percent size={20} />} label="Offers" active={activeTab === 'offers'} onClick={() => handleTabChange('offers')} isOpen={isSidebarOpen} />

          <SidebarItem
            icon={<ShoppingCart size={20} />}
            label="Orders"
            active={activeTab === 'orders'}
            onClick={() => handleTabChange('orders')}
            isOpen={isSidebarOpen}
            badge={counts.orders > 0 ? counts.orders : null}
            badgeColor=""
            badgeStyle={{ backgroundColor: 'var(--admin-sidebar-badge-bg)', color: 'var(--admin-sidebar-badge-text)' }}
          />
          <SidebarItem
            icon={<AlertTriangle size={20} />}
            label="Incomplete Orders"
            active={activeTab === 'incomplete'}
            onClick={() => handleTabChange('incomplete')}
            isOpen={isSidebarOpen}
            badge={incompleteCount > 0 ? incompleteCount : null}
            badgeColor=""
            badgeStyle={{ backgroundColor: 'var(--admin-sidebar-badge-bg)', color: 'var(--admin-sidebar-badge-text)' }}
          />

          <SidebarItem icon={<Layers size={20} />} label="Categories" active={activeTab === 'categories'} onClick={() => handleTabChange('categories')} isOpen={isSidebarOpen} />
          <SidebarItem icon={<Truck size={20} />} label="Suppliers" active={activeTab === 'suppliers'} onClick={() => handleTabChange('suppliers')} isOpen={isSidebarOpen} />
          <SidebarItem icon={<MenuIcon size={20} />} label="Menus" active={activeTab === 'menus'} onClick={() => handleTabChange('menus')} isOpen={isSidebarOpen} />
          <SidebarItem icon={<Type size={20} />} label="Site Content" active={activeTab === 'content'} onClick={() => handleTabChange('content')} isOpen={isSidebarOpen} />
          <SidebarItem icon={<Mail size={20} />} label="Mail" active={activeTab === 'mail'} onClick={() => handleTabChange('mail')} isOpen={isSidebarOpen} />
          <SidebarItem icon={<Mail size={20} />} label="Newsletter" active={activeTab === 'newsletter'} onClick={() => handleTabChange('newsletter')} isOpen={isSidebarOpen} />
          <SidebarItem icon={<ShieldAlert size={20} />} label="Blocklist" active={activeTab === 'blocklist'} onClick={() => handleTabChange('blocklist')} isOpen={isSidebarOpen} />
          {user?.role === 'SUPER_ADMIN' && (
            <SidebarItem icon={<Users size={20} />} label="Admins" active={activeTab === 'admins'} onClick={() => handleTabChange('admins')} isOpen={isSidebarOpen} />
          )}
          <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => handleTabChange('settings')} isOpen={isSidebarOpen} />
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className={`flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} w-full p-2 rounded-lg hover:bg-red-600 transition-colors text-gray-300 hover:text-white`}>
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 sm:px-6 z-10">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center space-x-4">
            {isPending && (
              <span className="text-xs text-gray-400 hidden sm:inline">Loading...</span>
            )}
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-gray-800">{user?.name || 'Admin'}</div>
              <div className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 sm:p-6">{renderContent()}</div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick, isOpen, badge, badgeColor = 'bg-gray-600', badgeStyle }) => (
  <button
    onClick={onClick}
    className={`sidebar-item relative flex items-center ${isOpen ? 'justify-start' : 'justify-center'} w-full p-3 rounded-lg transition-all duration-200 ${active ? 'sidebar-item-active shadow-md' : ''}`}
  >
    {icon}
    {isOpen && <span className="ml-3 font-medium flex-1 text-left">{label}</span>}
    {badge && isOpen && (
      <span className={`${badgeColor} text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto`} style={badgeStyle}>
        {badge}
      </span>
    )}
    {/* Mini badge for collapsed state */}
    {badge && !isOpen && (
      <span className={`absolute top-2 right-2 ${badgeColor} w-2 h-2 rounded-full border border-gray-900`} style={badgeStyle}></span>
    )}
  </button>
);

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getOrderStatistics(period);
      setStats(data.data || data);
    } catch (error) { console.error("Failed to load stats", error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, [period]);

  const displayStats = stats || { totalOrders: 0, totalRevenue: 0, pendingOrders: 0 };

  const periodLabels = {
    'day': 'Today',
    'week': 'This Week',
    'month': 'This Month',
    'year': 'This Year'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          {['day', 'week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${period === p
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="animate-spin text-blue-500" size={24} />
            <span>Loading statistics...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Orders"
            value={displayStats.totalOrders || 0}
            icon={<ShoppingCart className="text-blue-500" size={24} />}
            trend={periodLabels[period]}
            color="bg-blue-50"
          />
          <StatCard
            title="Total Revenue"
            value={`৳${Number(displayStats.totalRevenue || 0).toLocaleString()}`}
            icon={<span className="text-2xl font-bold text-green-500">৳</span>}
            trend={periodLabels[period]}
            color="bg-green-50"
          />
          <StatCard
            title="Pending Orders"
            value={displayStats.pendingOrders || 0}
            icon={<Package className="text-orange-500" size={24} />}
            trend="Needs Attention"
            color="bg-orange-50"
          />

          <StatCard title="Total Products" value={displayStats.totalProducts || 0} icon={<Package className="text-purple-500" size={24} />} trend="All Time" color="bg-purple-50" />
          <StatCard title="Total Customers" value={displayStats.totalCustomers || 0} icon={<Users className="text-teal-500" size={24} />} trend="All Time" color="bg-teal-50" />
          <StatCard title="Low Stock Items" value={displayStats.lowStockProducts || 0} icon={<AlertTriangle className="text-red-500" size={24} />} trend="Restock Now" color="bg-red-50" />
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">System Status</h3>
          <p className="text-gray-500 text-sm">All services are running normally.</p>
        </div>
        <button onClick={fetchStats} className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-full transition-colors" title="Reload Data">
          <RefreshCw size={20} />
        </button>
      </div>
    </div >
  );
};
const StatCard = ({ title, value, icon, trend, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4"><div className={`${color} p-3 rounded-lg`}>{icon}</div><span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{trend}</span></div>
    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</h3>
    <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
  </div>
);

// --- Content Manager Components ---

const MenusManager = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [newItemData, setNewItemData] = useState({ title: '', link: '', order: 0 });
  const [newMenuName, setNewMenuName] = useState('');

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await getAllMenus();
      setMenus(res.data || res);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { fetchMenus(); }, []);

  const handleCreateMenu = async () => {
    if (!newMenuName) return;
    try {
      await createMenu({ name: newMenuName });
      fetchMenus();
      setIsMenuModalOpen(false);
      setNewMenuName('');
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.message || e.message;
      const friendly = msg && msg.toLowerCase().includes('unique')
        ? 'Menu name already exists. Try a different name.'
        : msg;
      alert("Failed to create menu: " + friendly);
    }
  };

  const handleAddItem = async (menuId) => {
    try {
      await addMenuItem({ ...newItemData, menuId, order: parseInt(newItemData.order) });
      setIsItemModalOpen(false); setNewItemData({ title: '', link: '', order: 0 }); fetchMenus();
    } catch (e) { alert("Failed to add item"); }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("Delete item?")) return;
    try { await deleteMenuItem(itemId); fetchMenus(); } catch (e) { alert("Failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Menus</h2>
        <button onClick={() => setIsMenuModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2"><Plus size={18} /> New Menu</button>
      </div>
      <div className="grid gap-6">
        {menus.map(menu => (
          <div key={menu.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setExpandedMenu(expandedMenu === menu.id ? null : menu.id)}>
              <h3 className="text-lg font-bold capitalize">{menu.name.replace('-', ' ')}</h3>
              {expandedMenu === menu.id ? <ChevronDown /> : <ChevronRight />}
            </div>

            {expandedMenu === menu.id && (
              <div className="pl-4 border-l-2 border-gray-100 space-y-3">
                {/* List Items */}
                {menu.items?.length === 0 && <p className="text-gray-400 text-sm">No items yet.</p>}
                {menu.items?.sort((a, b) => a.order - b.order).map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <div>
                      <span className="font-semibold text-sm">{item.title}</span>
                      <span className="text-xs text-gray-500 ml-2">({item.link})</span>
                    </div>
                    <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                  </div>
                ))}

                {/* Add Item Form */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-bold mb-2">Add Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input placeholder="Title (menu text)" value={newItemData.title} onChange={e => setNewItemData({ ...newItemData, title: e.target.value })} className="border p-1 rounded text-sm" />
                    <input placeholder="Link (/path) e.g. /products" value={newItemData.link} onChange={e => setNewItemData({ ...newItemData, link: e.target.value })} className="border p-1 rounded text-sm" />
                    <input type="number" placeholder="Position (0 = first)" value={newItemData.order} onChange={e => setNewItemData({ ...newItemData, order: e.target.value })} className="border p-1 rounded text-sm" />
                    <button onClick={() => handleAddItem(menu.id)} className="bg-green-600 text-white rounded text-sm hover:bg-green-700">Add</button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Position controls order: 0 shows first, 1 second, 2 third.</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Menu Modal */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold mb-4">Create New Menu</h3>
            <input
              value={newMenuName}
              onChange={(e) => setNewMenuName(e.target.value)}
              placeholder="e.g. footer-menu"
              className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsMenuModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleCreateMenu} className="px-4 py-2 bg-blue-600 text-white rounded font-bold">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { uploadFile } from '../../api/uploadApi';

const SiteContentManager = () => {
  const [editMap, setEditMap] = useState({});
  const [contentKeys, setContentKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [newKey, setNewKey] = useState('');
  const [newKeySelection, setNewKeySelection] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState('TEXT');
  const [newUploadLoading, setNewUploadLoading] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await getAllContent();
      const data = res.data || res;
      const initialMap = {};
      if (Array.isArray(data)) {
        data.forEach(c => { initialMap[c.key] = c.value; });
      } else if (data && typeof data === 'object') {
        Object.entries(data).forEach(([key, value]) => { initialMap[key] = value; });
      }
      setEditMap(initialMap);
      setContentKeys(Object.keys(initialMap).sort());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchContent(); }, []);

  const handleSave = async (key, type) => {
    try {
      await updateContent({ key, value: editMap[key] || '', type });
      alert("Saved " + key);
      fetchContent();
    } catch (e) {
      alert("Failed to save: " + (e.response?.data?.message || e.message));
    }
  };

  const handleFileUpload = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingKey(key);
    try {
      const res = await uploadFile(file);
      const url = res.data.url;
      setEditMap(prev => ({ ...prev, [key]: url }));
    } catch (err) {
      alert("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setUploadingKey(null);
    }
  };

  const renderField = (label, key, type = 'TEXT', placeholder = '', isTextarea = false) => (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        {type === 'TEXT' ? (
          isTextarea || key.includes('description') || key.includes('text') && key.length > 20 ?
            <textarea
              value={editMap[key] || ''}
              onChange={(e) => setEditMap({ ...editMap, [key]: e.target.value })}
              className="w-full sm:flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none min-h-[80px]"
              placeholder={placeholder}
            /> :
            <input
              value={editMap[key] || ''}
              onChange={(e) => setEditMap({ ...editMap, [key]: e.target.value })}
              className="w-full sm:flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder={placeholder}
            />
        ) : (
          <div className="w-full sm:flex-1 flex flex-col sm:flex-row gap-2">
            <input
              value={editMap[key] || ''}
              onChange={(e) => setEditMap({ ...editMap, [key]: e.target.value })}
              className="w-full sm:flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none font-mono text-sm text-blue-600"
              placeholder="https://example.com/image.png"
            />
            <label className={`cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded border flex items-center gap-2 text-xs font-bold whitespace-nowrap justify-center h-10 ${uploadingKey === key ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {uploadingKey === key ? '...' : <Upload size={14} />}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, key)} disabled={uploadingKey === key} />
              Upload
            </label>
          </div>
        )}
        <button
          onClick={() => handleSave(key, type)}
          className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center h-10 w-full sm:w-12"
          title="Save"
        >
          <Save size={18} />
        </button>
      </div>
      {type === 'IMAGE_URL' && editMap[key] && (
        <div className="mt-2 p-2 border rounded bg-gray-50 inline-block relative group">
          <img src={editMap[key]} alt="Preview" className="h-20 object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
      )}
    </div>
  );

  const handleAddContent = async () => {
    const keyToUse = newKeySelection === '__custom__' ? newKey.trim() : newKeySelection;
    if (!keyToUse) {
      alert('Key is required.');
      return;
    }
    try {
      await updateContent({ key: keyToUse, value: newValue || '', type: newType });
      setNewKey('');
      setNewKeySelection('');
      setNewValue('');
      setNewType('TEXT');
      fetchContent();
    } catch (e) {
      alert("Failed to add content: " + (e.response?.data?.message || e.message));
    }
  };

  const handleNewFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewUploadLoading(true);
    try {
      const res = await uploadFile(file);
      const url = res.data.url;
      setNewValue(url);
    } catch (err) {
      alert("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setNewUploadLoading(false);
    }
  };

  const handleDeleteContent = async (key) => {
    if (!window.confirm(`Delete content key "${key}"?`)) return;
    try {
      await deleteContent(key);
      fetchContent();
    } catch (e) {
      alert("Failed to delete content: " + (e.response?.data?.message || e.message));
    }
  };

  const renderToggle = (label, key) => (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="flex items-center gap-3">
        <div
          onClick={() => {
            const newVal = editMap[key] === 'true' ? 'false' : 'true';
            setEditMap({ ...editMap, [key]: newVal });
            // Auto-save on toggle for better UX, or wait for save button.
            // Let's rely on manual save button for consistency with other fields
          }}
          className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${editMap[key] === 'true' ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <div className={`bg-white h-4 w-4 rounded-full shadow-md transform duration-300 ${editMap[key] === 'true' ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
        <button
          onClick={() => handleSave(key, 'TEXT')}
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          title="Save"
        >
          <Save size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Site Content Management</h2>
        <button onClick={fetchContent} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm font-medium">Refresh</button>
      </div>

      {/* Add New Content Key */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="text-lg font-bold border-b pb-2 flex items-center gap-2 text-gray-800">
          <span className="text-green-500">➕</span> Add Content Key
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-gray-700">Key</label>
            <select
              value={newKeySelection}
              onChange={(e) => setNewKeySelection(e.target.value)}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="">Select a key</option>
              <option value="__custom__">Custom...</option>
              {contentKeys.map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
            {newKeySelection === '__custom__' && (
              <input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none font-mono text-sm"
                placeholder="e.g. shipping_policy_body"
              />
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-gray-700">Type</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="TEXT">TEXT</option>
              <option value="IMAGE_URL">IMAGE_URL</option>
            </select>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-gray-700">Value</label>
            {newType === 'IMAGE_URL' ? (
              <div className="flex gap-2">
                <input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none font-mono text-sm"
                  placeholder="https://example.com/image.png"
                />
                <label className={`cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded border flex items-center gap-2 text-xs font-bold ${newUploadLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {newUploadLoading ? '...' : <Upload size={14} />}
                  <input type="file" className="hidden" accept="image/*" onChange={handleNewFileUpload} disabled={newUploadLoading} />
                  Upload
                </label>
              </div>
            ) : (
              <input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="Initial value"
              />
            )}
            {newType === 'IMAGE_URL' && newValue && (
              <div className="mt-2 p-2 border rounded bg-gray-50 inline-block">
                <img src={newValue} alt="Preview" className="h-16 object-contain" onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={handleAddContent} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Add</button>
        </div>
      </div>

      {/* Branding Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h3 className="text-lg font-bold border-b pb-2 flex items-center gap-2 text-gray-800">
          <span className="text-blue-500">🎨</span> Branding & Logos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('Site Logo URL', 'site_logo', 'IMAGE_URL')}
          {renderField('Site Favicon URL', 'site_favicon', 'IMAGE_URL')}
        </div>
      </div>

      {/* Top Navbar Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
            <span className="text-purple-500">📏</span> Top Navbar
          </h3>
        </div>

        <div className="space-y-4">
          {renderToggle('Show Top Navbar', 'show_top_navbar')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField('Announcement Text', 'top_bar_announcement', 'TEXT', 'e.g., Free Shipping on orders over $50!')}
            {renderField('Contact Phone (Header)', 'contact_phone', 'TEXT')}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h3 className="text-lg font-bold border-b pb-2 flex items-center gap-2 text-gray-800">
          <span className="text-orange-500">🦸</span> Hero Section
        </h3>
        <div className="space-y-4">
          {renderField('Hero Headline', 'hero_headline', 'TEXT', 'Elevate Your Shopping Standard')}
          {renderField('Hero Sub-headline', 'hero_subheadline', 'TEXT', 'Experience the perfect blend of quality...')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField('Hero Background/Image URL', 'hero_image', 'IMAGE_URL')}
            {renderField('Hero CTA Text', 'hero_cta_text', 'TEXT', 'Shop Now')}
          </div>
        </div>
      </div>

      {/* Pages Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h3 className="text-lg font-bold border-b pb-2 flex items-center gap-2 text-gray-800">
          <span className="text-blue-500">📄</span> Pages
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('About Us Title', 'about_us_title', 'TEXT')}
          {renderField("Today's Deals Title", 'todays_deals_title', 'TEXT')}
          {renderField('Contact Us Title', 'contact_us_title', 'TEXT')}
        </div>
        <div className="grid grid-cols-1 gap-6">
          {renderField('About Us Body', 'about_us_body', 'TEXT', 'Add about us...', true)}
          {renderField("Today's Deals Body", 'todays_deals_body', 'TEXT', 'Add deals copy...', true)}
          {renderField('Contact Us Body', 'contact_us_body', 'TEXT', 'Add contact intro...', true)}
        </div>
      </div>

      {/* Legal Pages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h3 className="text-lg font-bold border-b pb-2 flex items-center gap-2 text-gray-800">
          <span className="text-indigo-500">📜</span> Legal Pages
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('Shipping Policy Title', 'shipping_policy_title', 'TEXT', '', false)}
          {renderField('Return & Refund Title', 'return_refund_title', 'TEXT', '', false)}
          {renderField('Privacy Policy Title', 'privacy_policy_title', 'TEXT', '', false)}
          {renderField('Terms & Conditions Title', 'terms_conditions_title', 'TEXT', '', false)}
        </div>
        <div className="grid grid-cols-1 gap-6">
          {renderField('Shipping Policy Body', 'shipping_policy_body', 'TEXT', 'Add shipping policy...', true)}
          {renderField('Return & Refund Body', 'return_refund_body', 'TEXT', 'Add return & refund policy...', true)}
          {renderField('Privacy Policy Body', 'privacy_policy_body', 'TEXT', 'Add privacy policy...', true)}
          {renderField('Terms & Conditions Body', 'terms_conditions_body', 'TEXT', 'Add terms & conditions...', true)}
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h3 className="text-lg font-bold border-b pb-2 flex items-center gap-2 text-gray-800">
          <span className="text-emerald-500">✉️</span> Newsletter
        </h3>
        <div className="space-y-4">
          {renderToggle('Show Newsletter Box', 'show_newsletter')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField('Newsletter Title', 'newsletter_title', 'TEXT')}
            {renderField('Newsletter Description', 'newsletter_description', 'TEXT')}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h3 className="text-lg font-bold border-b pb-2 flex items-center gap-2 text-gray-800">
          <span className="text-gray-500">🦶</span> Footer
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('Footer Description', 'footer_description', 'TEXT')}
          {renderField('Copyright Text', 'footer_copyright', 'TEXT')}
          {renderField('Contact Email', 'contact_email', 'TEXT')}
          {renderField('Contact Address', 'contact_address', 'TEXT')}
          {renderField('Social Facebook URL', 'social_facebook', 'TEXT')}
          {renderField('Social Twitter URL', 'social_twitter', 'TEXT')}
          {renderField('Social Instagram URL', 'social_instagram', 'TEXT')}
          {renderField('Social YouTube URL', 'social_youtube', 'TEXT')}
        </div>
      </div>

      {/* Content Keys */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="text-lg font-bold border-b pb-2 flex items-center gap-2 text-gray-800">
          <span className="text-red-500">🗑️</span> Content Keys
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contentKeys.length === 0 && (
            <p className="text-gray-500 text-sm">No content keys found.</p>
          )}
          {contentKeys.map((key) => (
            <div key={key} className="flex items-center justify-between border rounded-lg p-3">
              <span className="font-mono text-xs text-gray-700">{key}</span>
              <button
                onClick={() => handleDeleteContent(key)}
                className="text-red-600 hover:text-red-700 text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NewsletterManager = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await getNewsletterSubscribers();
      setSubscribers(res.data || res);
    } catch (e) {
      console.error('Failed to load subscribers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscribers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return;
    try {
      await deleteNewsletterSubscriber(id);
      fetchSubscribers();
    } catch (e) {
      alert('Failed to delete subscriber');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
        <button onClick={fetchSubscribers} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm font-medium">Refresh</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Subscribed At</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && (
              <tr><td colSpan="3" className="p-6 text-center text-gray-500">Loading...</td></tr>
            )}
            {!loading && subscribers.length === 0 && (
              <tr><td colSpan="3" className="p-6 text-center text-gray-500">No subscribers yet.</td></tr>
            )}
            {!loading && subscribers.map((s) => (
              <tr key={s.id}>
                <td className="p-4 font-mono text-sm">{s.email}</td>
                <td className="p-4 text-sm text-gray-600">{new Date(s.createdAt).toLocaleString()}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-600 hover:text-red-700 px-3 py-1 border rounded hover:border-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MailSettingsManager = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getAllContent();
      const data = res.data || res;
      const initialMap = {};
      if (Array.isArray(data)) {
        data.forEach(c => { initialMap[c.key] = c.value; });
      } else if (data && typeof data === 'object') {
        Object.entries(data).forEach(([key, value]) => { initialMap[key] = value; });
      }
      setSettings(initialMap);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async (key, value) => {
    try {
      await updateContent({ key, value, type: 'TEXT' });
      alert('Saved ' + key);
      fetchSettings();
    } catch (e) {
      alert('Failed to save: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = [
        { key: 'email_host', value: settings.email_host || '', type: 'TEXT' },
        { key: 'email_port', value: settings.email_port || '', type: 'TEXT' },
        { key: 'email_user', value: settings.email_user || '', type: 'TEXT' },
        { key: 'email_pass', value: settings.email_pass || '', type: 'TEXT' },
        { key: 'email_from', value: settings.email_from || '', type: 'TEXT' }
      ];
      await updateContent(payload);
      alert('Mail settings saved');
      fetchSettings();
    } catch (e) {
      alert('Failed to save: ' + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label, key, type = 'text') => (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        value={settings[key] || ''}
        onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
        className="border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none"
        placeholder={label}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mail Settings</h2>
        <button onClick={fetchSettings} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm font-medium">Refresh</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('SMTP Host', 'email_host')}
          {renderField('SMTP Port', 'email_port')}
          {renderField('SMTP User', 'email_user')}
          {renderField('SMTP Password', 'email_pass', 'password')}
          {renderField('From Email', 'email_from')}
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
        <p className="text-xs text-gray-500">Uses these values for newsletter email delivery. If empty, .env values are used.</p>
      </div>
    </div>
  );
};

const BlocklistManager = () => {
  const [blocked, setBlocked] = useState([]);
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');
  const [blockType, setBlockType] = useState('EMAIL');

  const fetchBlocked = async () => {
    try { const res = await getAllBlocked(); setBlocked(res.data || res); } catch (e) { }
  };
  useEffect(() => { fetchBlocked(); }, []);

  const handleBlock = async () => {
    if (!newValue) return;
    try { await addToBlocklist({ type: blockType, value: newValue, reason }); fetchBlocked(); setNewValue(''); setReason(''); }
    catch (e) { alert('Failed to block: ' + (e.response?.data?.message || e.message)); }
  };

  const handleUnblock = async (id) => {
    if (!window.confirm("Unblock user?")) return;
    try { await removeFromBlocklist(id); fetchBlocked(); } catch (e) { }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Blocked Users</h2>

      {/* Block Form */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="w-full">
          <label className="block text-xs font-bold text-red-800 mb-1">Type</label>
          <select value={blockType} onChange={e => setBlockType(e.target.value)} className="w-full border p-2 rounded bg-white">
            <option value="EMAIL">Email</option>
            <option value="PHONE">Phone</option>
            <option value="IP">IP Address</option>
          </select>
        </div>
        <div className="w-full">
          <label className="block text-xs font-bold text-red-800 mb-1">Value</label>
          <input value={newValue} onChange={e => setNewValue(e.target.value)} className="w-full border p-2 rounded" placeholder={blockType === 'IP' ? "192.168.1.1" : blockType === 'PHONE' ? "+88017..." : "email@example.com"} />
        </div>
        <div className="w-full">
          <label className="block text-xs font-bold text-red-800 mb-1">Reason</label>
          <input value={reason} onChange={e => setReason(e.target.value)} className="w-full border p-2 rounded" placeholder="Spamming orders..." />
        </div>
        <button onClick={handleBlock} className="bg-red-600 text-white px-6 py-2 rounded h-10 font-bold hover:bg-red-700 w-full">BLOCK</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b"><tr><th className="p-4">Target</th><th className="p-4">Type</th><th className="p-4">Reason</th><th className="p-4 text-right">Action</th></tr></thead>
          <tbody className="divide-y">
            {blocked.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-500">No blocked users.</td></tr>}
            {blocked.map(b => (
              <tr key={b.id}>
                <td className="p-4 font-mono text-red-600">{b.value}</td>
                <td className="p-4 text-xs uppercase font-bold text-gray-500">{b.type}</td>
                <td className="p-4">{b.reason || '-'}</td>
                <td className="p-4 text-right"><button onClick={() => handleUnblock(b.id)} className="text-gray-400 hover:text-green-600 px-3 py-1 border rounded hover:border-green-600">Unblock</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
const SettingsManager = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await getAllContent();
      const data = res.data || res;
      const initialMap = {};
      if (Array.isArray(data)) {
        data.forEach(c => { initialMap[c.key] = c.value; });
      } else if (data && typeof data === 'object') {
        Object.entries(data).forEach(([key, value]) => { initialMap[key] = value; });
      }
      setSettings(initialMap);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async (key) => {
    try {
      await updateContent({ key, value: settings[key], type: 'TEXT' });
      alert("Saved " + key.replace(/_/g, ' '));
    } catch (e) { alert("Failed to save"); }
  };

  const handleChange = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleSaveBkash = async () => {
    const payload = [
      { key: 'bkash_env', value: settings.bkash_env || 'sandbox', type: 'TEXT' },
      { key: 'bkash_app_key', value: settings.bkash_app_key || '', type: 'TEXT' },
      { key: 'bkash_app_secret', value: settings.bkash_app_secret || '', type: 'TEXT' },
      { key: 'bkash_username', value: settings.bkash_username || '', type: 'TEXT' },
      { key: 'bkash_password', value: settings.bkash_password || '', type: 'TEXT' }
    ];
    try {
      await updateContent(payload);
      alert('bKash settings saved');
    } catch (e) {
      alert('Failed to save bKash settings');
    }
  };

  const handleSaveNagad = async () => {
    const payload = [
      { key: 'nagad_env', value: settings.nagad_env || 'sandbox', type: 'TEXT' },
      { key: 'nagad_merchant_id', value: settings.nagad_merchant_id || '', type: 'TEXT' },
      { key: 'nagad_merchant_number', value: settings.nagad_merchant_number || '', type: 'TEXT' },
      { key: 'nagad_merchant_private_key', value: settings.nagad_merchant_private_key || '', type: 'TEXT' },
      { key: 'nagad_public_key', value: settings.nagad_public_key || '', type: 'TEXT' }
    ];
    try {
      await updateContent(payload);
      alert('Nagad settings saved');
    } catch (e) {
      alert('Failed to save Nagad settings');
    }
  };

  const handleSaveSteadfast = async () => {
    const payload = [
      { key: 'steadfast_api_key', value: settings.steadfast_api_key || '', type: 'TEXT' },
      { key: 'steadfast_secret_key', value: settings.steadfast_secret_key || '', type: 'TEXT' }
    ];
    try {
      await updateContent(payload);
      alert('Steadfast settings saved');
    } catch (e) {
      alert('Failed to save Steadfast settings');
    }
  };

  const handleSaveThemeKey = async (key) => {
    try {
      await updateContent({ key, value: settings[key] || '', type: 'TEXT' });
      alert('Color saved');
    } catch (e) {
      alert('Failed to save color');
    }
  };

  const handleToggleChange = async (key, checked) => {
    const val = checked ? 'true' : 'false';
    setSettings(prev => ({ ...prev, [key]: val }));
    try {
      await updateContent({ key, value: val, type: 'TEXT' });
    } catch (e) {
      alert('Failed to save toggle');
    }
  };

  const renderSelect = (label, key, options, showSaveButton = false) => (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="flex gap-2">
        <select
          value={settings[key] || ''}
          onChange={e => handleChange(key, e.target.value)}
          className="flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {showSaveButton && (
          <button onClick={() => handleSave(key)} className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700">Save</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Settings</h2>

      {/* Courier API Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Truck className="text-blue-600" /> Courier Integration (Steadfast)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Steadfast API Key</label>
            <input
              type="password"
              value={settings['steadfast_api_key'] || ''}
              onChange={e => handleChange('steadfast_api_key', e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="Enter API Key"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Steadfast Secret Key</label>
            <input
              type="password"
              value={settings['steadfast_secret_key'] || ''}
              onChange={e => handleChange('steadfast_secret_key', e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="Enter Secret Key"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={handleSaveSteadfast} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Steadfast Settings</button>
        </div>
        <p className="text-xs text-gray-500 mt-4">Used for calculating shipping charges and pushing orders to Steadfast courier service.</p>
      </div>

      {/* Order Control Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ShieldAlert className="text-red-600" /> Order Control (Fake Order Prevention)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 md:col-span-2">
            <span className="text-sm font-semibold text-gray-700">Show Delivery Success Rate on Checkout</span>
            <input
              type="checkbox"
              checked={settings['show_order_success_rate'] !== 'false'}
              onChange={(e) => handleToggleChange('show_order_success_rate', e.target.checked)}
              className="w-5 h-5"
            />
          </label>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Minimum Delivery Success Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings['min_order_success_rate'] || ''}
              onChange={e => handleChange('min_order_success_rate', e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="e.g. 60"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Customer Support Phone</label>
            <input
              value={settings['support_phone'] || ''}
              onChange={e => handleChange('support_phone', e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={() => handleSave('min_order_success_rate')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Rate</button>
          <button onClick={() => handleSave('support_phone')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Support Phone</button>
        </div>
        <p className="text-xs text-gray-500 mt-4">If a customer&apos;s delivery success rate is below this threshold, new orders are blocked and a support message is shown.</p>
      </div>

      {/* Theme Colors */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Palette className="text-purple-600" /> Theme Colors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: 'menu_text_color', label: 'Menu Text Color', fallback: '#111827' },
            { key: 'menu_hover_color', label: 'Menu Hover Color', fallback: '#2563eb' },
            { key: 'menu_active_color', label: 'Menu Active Color', fallback: '#1d4ed8' },
            { key: 'menu_bg_color', label: 'Menu Background Color', fallback: '#ffffff' },
            { key: 'menu_hover_bg', label: 'Menu Hover Background', fallback: '#eff6ff' },
            { key: 'admin_sidebar_bg', label: 'Admin Sidebar Background', fallback: '#111827' },
            { key: 'admin_sidebar_text', label: 'Admin Sidebar Text', fallback: '#d1d5db' },
            { key: 'admin_sidebar_hover_bg', label: 'Admin Hover Background', fallback: '#1f2937' },
            { key: 'admin_sidebar_active_bg', label: 'Admin Active Background', fallback: '#111827' },
            { key: 'admin_sidebar_active_text', label: 'Admin Active Text', fallback: '#ffffff' },
            { key: 'admin_sidebar_badge_bg', label: 'Admin Badge Background', fallback: '#ef4444' },
            { key: 'admin_sidebar_badge_text', label: 'Admin Badge Text', fallback: '#ffffff' },
          ].map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">{field.label}</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings[field.key] || field.fallback}
                  onChange={e => handleChange(field.key, e.target.value)}
                  className="h-10 w-20 border rounded"
                />
                <button
                  onClick={() => handleSaveThemeKey(field.key)}
                  className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <CreditCard className="text-green-600" /> Payment Methods
        </h3>
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">Show bKash</span>
            <input
              type="checkbox"
              checked={settings['show_bkash'] === 'true'}
              onChange={(e) => handleToggleChange('show_bkash', e.target.checked)}
              className="w-5 h-5"
            />
          </label>
          <label className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">Show Nagad</span>
            <input
              type="checkbox"
              checked={settings['show_nagad'] === 'true'}
              onChange={(e) => handleToggleChange('show_nagad', e.target.checked)}
              className="w-5 h-5"
            />
          </label>
        </div>
      </div>

      {/* bKash Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-pink-600 font-black">bKash</span> Gateway Settings
        </h3>
        {renderSelect('Environment', 'bkash_env', [
          { label: 'Sandbox', value: 'sandbox' },
          { label: 'Production', value: 'production' }
        ])}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">App Key</label>
            <input value={settings['bkash_app_key'] || ''} onChange={e => handleChange('bkash_app_key', e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">App Secret</label>
            <input value={settings['bkash_app_secret'] || ''} onChange={e => handleChange('bkash_app_secret', e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Username</label>
            <input value={settings['bkash_username'] || ''} onChange={e => handleChange('bkash_username', e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input type="password" value={settings['bkash_password'] || ''} onChange={e => handleChange('bkash_password', e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={handleSaveBkash} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save bKash Settings</button>
        </div>
      </div>

      {/* Nagad Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-orange-600 font-black">Nagad</span> Gateway Settings
        </h3>
        {renderSelect('Environment', 'nagad_env', [
          { label: 'Sandbox', value: 'sandbox' },
          { label: 'Production', value: 'production' }
        ])}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Merchant ID</label>
            <input value={settings['nagad_merchant_id'] || ''} onChange={e => handleChange('nagad_merchant_id', e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Merchant Number (Account)</label>
            <input value={settings['nagad_merchant_number'] || ''} onChange={e => handleChange('nagad_merchant_number', e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Merchant Private Key</label>
            <input value={settings['nagad_merchant_private_key'] || ''} onChange={e => handleChange('nagad_merchant_private_key', e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Public Key</label>
            <input value={settings['nagad_public_key'] || ''} onChange={e => handleChange('nagad_public_key', e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={handleSaveNagad} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Nagad Settings</button>
        </div>
      </div>

      {/* General Settings Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-400">General Settings</h3>
        <p className="text-sm text-gray-400">More system configurations can be added here...</p>
      </div>
    </div>
  );
};

// ... (Re-including ProductsManager, CategoriesManager, SuppliersManager, OrdersManager below as they were valid) ...
// For brevity in this large replacement, I will re-paste the condensed versions of existing valid components
// to ensure the file remains complete.

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', short_description: '', regular_price: '', sale_price: '',
    categoryId: '', supplierId: '', inventory: 0, images: [], status: 'DRAFT',
    seoTitle: '', seoDescription: '', seoKeywords: '',
    landingWhatYouGetTitle: '', landingWhatYouGetItem1: '', landingWhatYouGetItem2: '', landingWhatYouGetItem3: '', landingWhatYouGetNote: ''
  });
  const [notifySubscribers, setNotifySubscribers] = useState(false);


  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterCategory, filterSupplier]);

  const fetchData = async () => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const statusParam = filterStatus;

      // Parallel fetch for main data
      const [resProducts, resCats, resSuppliers] = await Promise.all([
        getProducts({
          status: statusParam,
          category: filterCategory || undefined,
          supplier: filterSupplier || undefined,
          page,
          limit
        }),
        getProdCategories(),
        getProdSuppliers()
      ]);

      const productsData = resProducts.data?.products || resProducts.products || [];
      setProducts((prev) => (page === 1 ? productsData : [...prev, ...productsData]));
      const pagination = resProducts.data?.pagination || resProducts.pagination;
      if (pagination) {
        setHasMore(pagination.page < pagination.pages);
      } else {
        setHasMore(productsData.length === limit);
      }
      setCategories(resCats.data || resCats || []);
      setSuppliers(resSuppliers.data || resSuppliers || []);
    } catch (err) { console.error(err); } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterStatus, filterCategory, filterSupplier, page]);

  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const newImages = [...formData.images];
      // Upload each file sequentially (or parallel) and add to list
      for (const file of files) {
        const res = await uploadFile(file);
        newImages.push(res.data.url);
      }
      setFormData(prev => ({ ...prev, images: newImages }));
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Map simple string URLs to object structure expected by backend if needed, 
      // OR backend might handle string array. 
      // Based on previous code: `images: formData.imageUrl ? [{ url: formData.imageUrl }] : []`
      // It seems it expects `{ url: "..." }`.

      const formattedImages = formData.images.map(url => ({ url }));

      const payload = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        supplierId: parseInt(formData.supplierId),
        regular_price: parseFloat(formData.regular_price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        inventory: parseInt(formData.inventory),
        images: formattedImages
      };
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        alert('Updated!');
      } else {
        const res = await createProduct(payload);
        const createdProduct = res.data || res;
        if (notifySubscribers && createdProduct?.id) {
          try {
            await sendProductNewsletter(createdProduct.id);
          } catch (e) {
            alert('Product created, but email failed to send.');
          }
        }
        alert('Created!');
      }
      setIsModalOpen(false); fetchData(); resetForm();
    } catch (err) { alert('Failed: ' + (err.response?.data?.message || err.message)); }
  };

  const handleDelete = async (product) => {
    const isSafeToDelete = product.status === 'DRAFT' || product.status === 'ARCHIVED';

    if (isSafeToDelete) {
      if (!window.confirm(' This will PERMANENTLY remove this product. Are you sure?')) return;
      try {
        await deleteProduct(product.id);
        setProducts(products.filter(p => p.id !== product.id));
        fetchData(); // Refresh counts
      } catch (err) { alert('Failed to delete'); }
    } else {
      if (!window.confirm('Product is live. Move to DRAFT (Soft Delete)?')) return;
      try {
        await updateProduct(product.id, { status: 'DRAFT' }); // Soft delete
        fetchData(); // Refresh to update list/tabs
      } catch (err) { alert('Failed to move to draft'); }
    }
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    // Flatten image objects to simple URL array for state
    const currentImages = p.images ? p.images.map(img => img.url) : [];

    setFormData({
      name: p.name, slug: p.slug, description: p.description, short_description: p.short_description || '',
      regular_price: p.regular_price, sale_price: p.sale_price || '',
      categoryId: p.categoryId || '', supplierId: p.supplierId || '',
      inventory: p.inventory?.quantity || 0,
      images: currentImages,
      status: p.status || 'DRAFT',
      seoTitle: p.seoTitle || '', seoDescription: p.seoDescription || '', seoKeywords: p.seoKeywords || '',
      landingWhatYouGetTitle: p.landingWhatYouGetTitle || '',
      landingWhatYouGetItem1: p.landingWhatYouGetItem1 || '',
      landingWhatYouGetItem2: p.landingWhatYouGetItem2 || '',
      landingWhatYouGetItem3: p.landingWhatYouGetItem3 || '',
      landingWhatYouGetNote: p.landingWhatYouGetNote || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '', slug: '', description: '', short_description: '', regular_price: '', sale_price: '',
      categoryId: categories[0]?.id || '', supplierId: suppliers[0]?.id || '', inventory: 0,
      images: [], status: 'DRAFT',
      seoTitle: '', seoDescription: '', seoKeywords: '',
      landingWhatYouGetTitle: '', landingWhatYouGetItem1: '', landingWhatYouGetItem2: '', landingWhatYouGetItem3: '', landingWhatYouGetNote: ''
    });
    setNotifySubscribers(false);
  };

  return (
    <div className="space-y-6">
      <div className={`flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
        <h2 className="text-2xl font-bold">Products</h2>

        {/* Status Filter Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg gap-1 overflow-x-auto scrollbar-hide w-full xl:w-auto">
          {['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`relative px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap min-w-fit ${filterStatus === status
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Category & Supplier Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full xl:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500 w-full"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>

          <select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500 w-full"
          >
            <option value="">All Suppliers</option>
            {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>

          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2 justify-center w-full"><Plus size={18} /> Add</button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr><th className="p-4">Name</th><th className="p-4">Price</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan="4" className="p-6 text-center text-gray-500">Loading products...</td></tr>}
            {!loading && products.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-500">No products found for this filter.</td></tr>}
            {!loading && products.map(p => (
              <tr key={p.id}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {p.images && p.images[0] ? (
                      <img src={p.images[0].url} alt="" loading="lazy" decoding="async" className="w-10 h-10 rounded object-cover border" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 border flex items-center justify-center text-gray-400"><Package size={16} /></div>
                    )}
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-4">${p.regular_price}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-bold ${p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : p.status === 'ARCHIVED' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-700'}`}>
                    {p.status || 'DRAFT'}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-1">
                  <a href={`/landing/${p.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="View Landing Page">
                    <ExternalLink size={16} />
                  </a>
                  <button onClick={() => openEditModal(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                  <button
                    onClick={() => handleDelete(p)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title={p.status === 'DRAFT' || p.status === 'ARCHIVED' ? "Permanently Delete" : "Move to Draft"}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchOrders(nextPage);
            }}
            disabled={loadingMore}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl text-left max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between mb-4 sticky top-0 bg-white z-10 pb-2 border-b items-center">
              <div className="flex gap-4 items-center">
                <h3 className="text-xl font-bold">{editingProduct ? 'Edit' : 'Add'} Product</h3>
                {editingProduct && (
                  <a href={`/landing/${editingProduct.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 flex items-center gap-1 hover:bg-blue-100">
                    <ExternalLink size={12} /> View Landing Page
                  </a>
                )}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500"><XCircle /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" className="w-full border p-2 rounded" required />
                <input name="slug" value={formData.slug} onChange={handleInputChange} placeholder="Slug" className="w-full border p-2 rounded" required />
              </div>

              <textarea name="short_description" value={formData.short_description} onChange={handleInputChange} placeholder="Short Description (for lists)" className="w-full border p-2 rounded h-16" />
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Description</label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="number" name="regular_price" value={formData.regular_price} onChange={handleInputChange} placeholder="Price" className="border p-2 rounded" required />
                <input type="number" name="inventory" value={formData.inventory} onChange={handleInputChange} placeholder="Inventory" className="border p-2 rounded" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="border p-2 rounded" required>
                  <option value="">Category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select name="supplierId" value={formData.supplierId} onChange={handleInputChange} className="border p-2 rounded" required>
                  <option value="">Supplier</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Status & Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select name="status" value={formData.status} onChange={handleInputChange} className="border p-2 rounded bg-gray-50 border-gray-300">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>

                {/* Enhanced Image Uploader */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Product Images</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.images.map((url, idx) => (
                      <div key={idx} className="relative group w-16 h-16 border rounded overflow-hidden">
                        <img src={url} alt="Prod" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl">
                          <XCircle size={12} />
                        </button>
                      </div>
                    ))}
                    <label className={`w-16 h-16 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors ${uploading ? 'opacity-50' : ''}`}>
                      {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div> : <Plus className="text-gray-400" />}
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400">Add multiple images. First one is cover.</p>
                </div>
              </div>

              {/* SEO Section */}
              <div className="border-t pt-4 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-bold mb-3 text-gray-700 flex items-center gap-2"><span className="text-blue-600">🔍</span> SEO Configuration</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Page Title</label>
                    <input name="seoTitle" value={formData.seoTitle} onChange={handleInputChange} placeholder="e.g. Best Widget 2024 | MyStore" className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Meta Description</label>
                    <textarea name="seoDescription" value={formData.seoDescription} onChange={handleInputChange} placeholder="Summarize page content for search engines..." className="w-full border p-2 rounded text-sm h-16 focus:ring-2 focus:ring-blue-100 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Keywords</label>
                    <input name="seoKeywords" value={formData.seoKeywords} onChange={handleInputChange} placeholder="widget, buy widget, best widget" className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                  </div>
                </div>
              </div>
              {/* Landing Highlights */}
              <div className="border-t pt-4 bg-white p-4 rounded-lg">
                <h4 className="text-sm font-bold mb-3 text-gray-700 flex items-center gap-2"><span className="text-amber-500">📦</span> Landing Highlights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="landingWhatYouGetTitle" value={formData.landingWhatYouGetTitle} onChange={handleInputChange} placeholder="What you get title" className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                  <input name="landingWhatYouGetItem1" value={formData.landingWhatYouGetItem1} onChange={handleInputChange} placeholder="Item 1" className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                  <input name="landingWhatYouGetItem2" value={formData.landingWhatYouGetItem2} onChange={handleInputChange} placeholder="Item 2" className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                  <input name="landingWhatYouGetItem3" value={formData.landingWhatYouGetItem3} onChange={handleInputChange} placeholder="Item 3" className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                </div>
                <textarea name="landingWhatYouGetNote" value={formData.landingWhatYouGetNote} onChange={handleInputChange} placeholder="Note" className="w-full border p-2 rounded text-sm h-16 focus:ring-2 focus:ring-blue-100 outline-none mt-3" />
              </div>
              {!editingProduct && (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={notifySubscribers}
                    onChange={(e) => setNotifySubscribers(e.target.checked)}
                  />
                  Send email to newsletter subscribers
                </label>
              )}
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all transform hover:scale-[1.01]">Save Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PromotionsManager = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifySubscribers, setNotifySubscribers] = useState(false);
  const [promoProducts, setPromoProducts] = useState([]);
  const today = new Date().toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE',
    value: '',
    startDate: today,
    endDate: '',
    usageLimit: '',
    isActive: true,
    productId: ''
  });

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await getPromotions();
      setPromotions(res.data || res || []);
    } catch (e) {
      console.error('Failed to load promotions', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPromoProducts = async () => {
    try {
      const res = await getProducts({ status: 'ALL', limit: 200 });
      setPromoProducts(res.data?.products || res.products || []);
    } catch (e) {
      console.error('Failed to load products for offers', e);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchPromoProducts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        productId: formData.productId || null
      };
      const res = await createPromotion(payload);
      const created = res.data || res;
      if (notifySubscribers && created?.id) {
        try {
          await sendPromotionNewsletter(created.id);
        } catch (e) {
          alert('Offer created, but email failed to send.');
        }
      }
      setFormData({ code: '', description: '', type: 'PERCENTAGE', value: '', startDate: today, endDate: '', usageLimit: '', isActive: true, productId: '' });
      setNotifySubscribers(false);
      fetchPromotions();
    } catch (e) {
      alert('Failed to create offer: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      await deletePromotion(id);
      fetchPromotions();
    } catch (e) {
      alert('Failed to delete offer');
    }
  };

  const handleSend = async (id) => {
    try {
      await sendPromotionNewsletter(id);
      alert('Offer email sent!');
    } catch (e) {
      alert('Failed to send offer email');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Offers</h2>
        <button onClick={fetchPromotions} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm font-medium">Refresh</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h3 className="text-lg font-bold">Create Offer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="CODE"
              className="border p-2 rounded"
              required
            />
            <input
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="Value"
              type="number"
              className="border p-2 rounded"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="">All Products</option>
              {promoProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description"
              className="border p-2 rounded h-24 md:col-span-2"
            />
            <input
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              placeholder="Usage Limit"
              type="number"
              className="border p-2 rounded"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="border p-2 rounded"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={notifySubscribers}
              onChange={(e) => setNotifySubscribers(e.target.checked)}
            />
            Send email to newsletter subscribers
          </label>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">Create Offer</button>
        </form>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b font-semibold">Offers List</div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Product</th>
                <th className="p-4">Value</th>
                <th className="p-4">Active</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr><td colSpan="4" className="p-6 text-center text-gray-500">Loading...</td></tr>
              )}
              {!loading && promotions.length === 0 && (
                <tr><td colSpan="4" className="p-6 text-center text-gray-500">No offers yet.</td></tr>
              )}
              {!loading && promotions.map((p) => (
                <tr key={p.id}>
                  <td className="p-4 font-mono">{p.code}</td>
                  <td className="p-4">{p.product?.name || 'All Products'}</td>
                  <td className="p-4">{p.type === 'PERCENTAGE' ? `${p.value}%` : p.value}</td>
                  <td className="p-4">{p.isActive ? 'Yes' : 'No'}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleSend(p.id)} className="text-blue-600 hover:text-blue-700 px-3 py-1 border rounded">Email</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-700 px-3 py-1 border rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]); const [isModalOpen, setIsModalOpen] = useState(false); const [formData, setFormData] = useState({ name: '', slug: '' }); const [editingId, setEditingId] = useState(null);
  const fetchCats = async () => { const res = await getCategories(); setCategories(res.data || res); }; useEffect(() => { fetchCats(); }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await updateCategory(editingId, formData);
      else await createCategory(formData);
      setIsModalOpen(false);
      fetchCats();
      setFormData({ name: '', slug: '' });
      setEditingId(null);
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Error');
    }
  };
  const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; try { await deleteCategory(id); fetchCats(); } catch (e) { alert('Error'); } };
  return (
    <div className="space-y-6"><div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Categories</h2><button onClick={() => { setEditingId(null); setFormData({ name: '', slug: '' }); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded gap-2 flex"><Plus size={18} /> Add</button></div><div className="bg-white rounded-xl shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-50 border-b"><tr><th className="p-4">Name</th><th className="p-4">Slug</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y">{categories.map(c => (<tr key={c.id}><td className="p-4">{c.name}</td><td className="p-4">{c.slug}</td><td className="p-4 text-right"><button onClick={() => { setEditingId(c.id); setFormData({ name: c.name, slug: c.slug }); setIsModalOpen(true); }} className="p-2 text-blue-600"><Edit size={16} /></button><button onClick={() => handleDelete(c.id)} className="p-2 text-red-600"><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>{isModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"><div className="bg-white rounded-xl p-6 w-full max-w-md"><h3 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Category</h3><form onSubmit={handleSubmit} className="space-y-4"><input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Name" className="w-full border p-2 rounded" required /><input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="Slug" className="w-full border p-2 rounded" required /><div className="flex gap-2 justify-end"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button></div></form></div></div>)}</div>
  );
};
const SuppliersManager = () => {
  const [suppliers, setSuppliers] = useState([]); const [isModalOpen, setIsModalOpen] = useState(false); const [formData, setFormData] = useState({ name: '', location: '', contactEmail: '' }); const [editingId, setEditingId] = useState(null);
  const fetchSups = async () => { const res = await getSuppliers(); setSuppliers(res.data || res); }; useEffect(() => { fetchSups(); }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await updateSupplier(editingId, formData);
      else await createSupplier(formData);
      setIsModalOpen(false);
      fetchSups();
      setFormData({ name: '', location: '', contactEmail: '' });
      setEditingId(null);
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Error');
    }
  };
  const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; try { await deleteSupplier(id); fetchSups(); } catch (e) { alert('Error'); } };
  return (
    <div className="space-y-6"><div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Suppliers</h2><button onClick={() => { setEditingId(null); setFormData({ name: '', location: '', contactEmail: '' }); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded gap-2 flex"><Plus size={18} /> Add</button></div><div className="bg-white rounded-xl shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-50 border-b"><tr><th className="p-4">Name</th><th className="p-4">Location</th><th className="p-4">Email</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y">{suppliers.map(s => (<tr key={s.id}><td className="p-4">{s.name}</td><td className="p-4">{s.location}</td><td className="p-4">{s.contactEmail}</td><td className="p-4 text-right"><button onClick={() => { setEditingId(s.id); setFormData({ name: s.name, location: s.location, contactEmail: s.contactEmail }); setIsModalOpen(true); }} className="p-2 text-blue-600"><Edit size={16} /></button><button onClick={() => handleDelete(s.id)} className="p-2 text-red-600"><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>{isModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"><div className="bg-white rounded-xl p-6 w-full max-w-md"><h3 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Supplier</h3><form onSubmit={handleSubmit} className="space-y-4"><input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Name" className="w-full border p-2 rounded" required /><input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Location" className="w-full border p-2 rounded" required /><input value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} placeholder="Email" className="w-full border p-2 rounded" required /><div className="flex gap-2 justify-end"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button></div></form></div></div>)}</div>
  );
};
const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 25;
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const selectableOrders = orders.filter(o => !o.steadfastTrackingCode);

  const fetchOrders = async (pageOverride) => {
    const currentPage = pageOverride ?? page;
    if (currentPage === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const res = await getAllOrders({
        status: filterStatus || undefined,
        search: searchQuery || undefined,
        page: currentPage,
        limit
      });
      const payload = res.data || res;
      const nextOrders = payload.orders || [];
      setOrders(prev => (currentPage === 1 ? nextOrders : [...prev, ...nextOrders]));
      const pagination = payload.pagination;
      if (pagination) {
        setHasMore(pagination.page < pagination.pages);
      } else {
        setHasMore(nextOrders.length === limit);
      }
      setSelectedOrderIds(prev => prev.filter(id => nextOrders.some(o => o.id === id && !o.steadfastTrackingCode)));
    } catch (err) { console.error(err); } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // minimal debounce for search
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchOrders(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [filterStatus, searchQuery]);

  // No extra effect for page; load more handles it directly.

  const handleStatusChange = async (id, status, e) => {
    // Prevent row click propagation
    e?.stopPropagation();
    try {
      await updateOrderStatus(id, status);
      fetchOrders();
    } catch (e) { alert('Error updating status'); }
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
  };

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedOrderIds(selectableOrders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const toggleSelectOrder = (orderId, checked) => {
    setSelectedOrderIds(prev => {
      if (checked) return prev.includes(orderId) ? prev : [...prev, orderId];
      return prev.filter(id => id !== orderId);
    });
  };

  const handleSendSteadfast = async (orderId) => {
    setSending(true);
    try {
      await createSteadfastOrder(orderId);
      fetchOrders();
      setSelectedOrderIds(prev => prev.filter(id => id !== orderId));
    } catch (e) {
      alert(e?.message || e?.response?.data?.message || 'Failed to send order to Steadfast');
    } finally {
      setSending(false);
    }
  };

  const handleSendSteadfastBulk = async () => {
    if (selectedOrderIds.length === 0) return;
    setSending(true);
    try {
      await createSteadfastBulkOrders(selectedOrderIds);
      fetchOrders();
      setSelectedOrderIds([]);
    } catch (e) {
      alert(e?.message || e?.response?.data?.message || 'Failed to send orders to Steadfast');
    } finally {
      setSending(false);
    }
  };

  const handlePrintInvoice = (order) => {
    const items = order.items || order.orderItems || [];
    const shippingLine1 = order.shippingAddress?.addressLine1 || order.address?.fullAddress || order.fullAddress || '';
    const shippingCity = order.shippingAddress?.city || '';
    const shippingPostal = order.shippingAddress?.postalCode || '';
    const paymentMethod = order.payment?.paymentMethod || order.paymentMethod || 'Cash On Delivery';
    const totalAmount = Number(order.totalAmount || 0).toFixed(2);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order.id}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.5; margin: 0; padding: 0; background-color: #f8fafc; }
          .invoice-container { max-width: 800px; margin: 40px auto; background: white; padding: 48px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-radius: 8px; }
          
          /* Header */
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; border-bottom: 2px solid #e2e8f0; padding-bottom: 24px; }
          .brand h1 { margin: 0; color: #2563eb; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .brand p { margin: 4px 0 0; color: #64748b; font-size: 14px; }
          .invoice-details { text-align: right; }
          .invoice-title { font-size: 36px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1; opacity: 0.1; letter-spacing: 2px; text-transform: uppercase; }
          .invoice-id { font-size: 16px; font-weight: 600; color: #475569; margin-top: 8px; }

          /* Info Grid */
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 48px; margin-bottom: 48px; }
          .info-group h3 { margin: 0 0 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; }
          .info-group p { margin: 0; font-size: 14px; color: #334155; }
          .info-group strong { color: #0f172a; font-weight: 600; }
          
          /* Table */
          table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
          th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
          td { padding: 16px; font-size: 14px; border-bottom: 1px solid #f1f5f9; color: #334155; }
          tr:last-child td { border-bottom: none; }
          .col-right { text-align: right; }
          .item-name { font-weight: 600; color: #0f172a; }

          /* Summary */
          .summary { display: flex; justify-content: flex-end; }
          .summary-box { width: 300px; background: #f8fafc; padding: 24px; border-radius: 8px; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #64748b; }
          .summary-row.total { margin-top: 16px; pt-16px; border-top: 2px solid #e2e8f0; font-weight: 700; color: #0f172a; font-size: 18px; align-items: center; }
          
          /* Footer */
          .footer { margin-top: 64px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 24px; }
          .footer p { font-size: 12px; color: #94a3b8; margin: 4px 0; }
          .heart { color: #ef4444; }

          @media print {
            body { background: white; }
            .invoice-container { margin: 0; padding: 0; box-shadow: none; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="brand">
              <h1>MYSTORE</h1>
              <p>Top Quality Products, Delivered.</p>
            </div>
            <div class="invoice-details">
              <h2 class="invoice-title">INVOICE</h2>
              <p class="invoice-id">#${order.id}</p>
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-group">
              <h3>Billed To</h3>
              <p><strong>${order.customerName}</strong></p>
              <p>${order.customerEmail || 'No Email Provided'}</p>
              <p>${order.customerPhone || 'No Phone Provided'}</p>
              <p>${shippingLine1}</p>
              <p>${shippingCity}${shippingPostal ? `, ${shippingPostal}` : ''}</p>
            </div>
            <div class="info-group">
              <h3>Order Details</h3>
              <p><strong>Date Issued:</strong> ${new Date(order.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Order Status:</strong> <span style="text-transform: capitalize">${order.status.toLowerCase()}</span></p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th width="50%">Item Description</th>
                <th width="15%" class="col-right">Price</th>
                <th width="15%" class="col-right">Qty</th>
                <th width="20%" class="col-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => {
                const name = item.productName || item.product?.name || `Product #${item.productId || ''}`;
                const unitPrice = Number(item.price ?? item.unitPrice ?? 0);
                const qty = Number(item.quantity || 0);
                return `
                <tr>
                  <td><span class="item-name">${name}</span></td>
                  <td class="col-right">৳${unitPrice.toFixed(2)}</td>
                  <td class="col-right">${qty}</td>
                  <td class="col-right"><strong>৳${(unitPrice * qty).toFixed(2)}</strong></td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-box">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>৳${totalAmount}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>৳0.00</span>
              </div>
              <div class="summary-row total">
                <span>Total Due</span>
                <span style="color: #2563eb">৳${totalAmount}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for shopping with us! <span class="heart">♥</span></p>
            <p>For support, email support@mystore.com or call +880-123-456-789</p>
            <p><strong>Terms & Conditions:</strong> Goods once sold cannot be returned after 7 days.</p>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orders Tracking</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSendSteadfastBulk}
            disabled={sending || selectedOrderIds.length === 0}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border ${selectedOrderIds.length === 0 || sending ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700'}`}
          >
            {sending ? 'Sending...' : `Send Selected (${selectedOrderIds.length})`}
          </button>
          <input
            type="text"
            placeholder="Search ID, Name, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Orders</option>
            {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={fetchOrders} className="text-blue-600 hover:underline text-sm font-medium">Refresh</button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={selectableOrders.length > 0 && selectedOrderIds.length === selectableOrders.length}
                  disabled={selectableOrders.length === 0}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
              </th>
              <th className="p-4">ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4 w-40">Tracking Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan="6" className="p-6 text-center text-gray-500">Loading orders...</td></tr>
            )}
            {!loading && orders.length === 0 && (
              <tr><td colSpan="6" className="p-6 text-center text-gray-500">No orders found.</td></tr>
            )}
            {!loading && orders.map(o => (
              <tr
                key={o.id}
                onClick={() => handleRowClick(o)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedOrderIds.includes(o.id)}
                    disabled={!!o.steadfastTrackingCode}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => toggleSelectOrder(o.id, e.target.checked)}
                  />
                </td>
                <td className="p-4">#{o.id}</td>
                <td className="p-4">{o.customerName}<br /><span className="text-xs text-gray-500">{o.customerEmail}</span></td>
                <td className="p-4">৳{o.totalAmount}</td>
                <td className="p-4">
                  <select
                    value={o.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStatusChange(o.id, e.target.value, e)}
                    className={`border rounded p-1 text-sm font-semibold ${o.status === 'DELIVERED' ? 'text-green-700 bg-green-100' : o.status === 'CANCELLED' ? 'text-red-700 bg-red-100' : 'text-blue-700 bg-blue-100'}`}
                  >
                    {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-4 text-right">
                  {o.steadfastTrackingCode ? (
                    <span className="text-xs font-semibold text-green-700">Tracking: {o.steadfastTrackingCode}</span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendSteadfast(o.id);
                      }}
                      disabled={sending}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-orange-600 rounded hover:bg-orange-700 disabled:opacity-60"
                      title="Send to Steadfast"
                    >
                      <Truck size={14} />
                      Send
                    </button>
                  )}
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full ml-2" title="View Details">
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loadingMore}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Order #{selectedOrder.id}</h3>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()} at {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-red-500"><XCircle size={28} /></button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Customer Info */}
              <div className="space-y-4">
                <h4 className="font-bold text-lg border-b pb-2">Customer Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedOrder.customerEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium max-w-[150px] truncate" title={selectedOrder.customerName}>{selectedOrder.customerPhone || selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                  </div>
                  {/* New IP Address Field */}
                  <div>
                    <p className="text-gray-500">IP Address</p>
                    <p className="font-medium font-mono text-xs bg-gray-100 p-1 rounded inline-block">{selectedOrder.ipAddress || 'Not Recorded'}</p>
                  </div>
                </div>

                {(selectedOrder.shippingAddress || selectedOrder.fullAddress || selectedOrder.address?.fullAddress) && (
                  <>
                    <h4 className="font-bold text-lg border-b pb-2 mt-6">Shipping Address</h4>
                    {selectedOrder.shippingAddress ? (
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                        <p>{selectedOrder.shippingAddress.addressLine1}</p>
                        {(selectedOrder.shippingAddress.addressLine2) && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                        <p>{selectedOrder.shippingAddress.country}</p>
                        <p className="text-gray-500 mt-2">Phone: {selectedOrder.shippingAddress.phone}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {selectedOrder.fullAddress || selectedOrder.address?.fullAddress}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h4 className="font-bold text-lg border-b pb-2">Order Summary</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <ul className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border rounded flex items-center justify-center text-xs text-gray-400">
                            {/* If we had item image, we'd show it here. Assuming item structure. */}
                            ITM
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{item.productName || `Product #${item.productId}`}</p>
                            <p className="text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold">৳{(item.price * item.quantity).toFixed(2)}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>৳{selectedOrder.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span>৳0.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-800 border-t border-dashed pt-2">
                    <span>Total</span>
                    <span>৳{selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                onClick={() => handlePrintInvoice(selectedOrder)}
              >
                <ExternalLink size={16} /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const IncompleteOrdersManager = ({ setIncompleteCount }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncomplete = async () => {
    setLoading(true);
    try {
      const res = await listIncompleteOrders();
      const data = res.data || res;
      setOrders(data);
      setIncompleteCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      setOrders([]);
      setIncompleteCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncomplete(); }, []);

  const handleClear = async (order) => {
    if (!window.confirm('Remove this incomplete order?')) return;
    try {
      await clearIncompleteOrder(order.clientId, order.source);
      fetchIncomplete();
    } catch (err) {
      alert(err?.message || err?.response?.data?.message || 'Failed to remove');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Incomplete Orders</h2>
        <button onClick={fetchIncomplete} className="text-blue-600 hover:underline text-sm font-medium">Refresh</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Address</th>
              <th className="p-4">Source</th>
              <th className="p-4">Last Update</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={6}>Loading...</td>
              </tr>
            )}
            {!loading && orders.length === 0 && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={6}>No incomplete orders.</td>
              </tr>
            )}
            {!loading && orders.map(order => (
              <tr key={`${order.clientId}-${order.source}`}>
                <td className="p-4">{order.name}</td>
                <td className="p-4">{order.phone}</td>
                <td className="p-4">{order.address}, {order.city}</td>
                <td className="p-4 capitalize">{order.source}</td>
                <td className="p-4">{new Date(order.updatedAt).toLocaleString()}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleClear(order)} className="text-red-600 hover:underline text-sm">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminsManager = () => {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', roleId: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Roles
      try {
        const resRoles = await getRoles();
        console.log("Raw Roles Response:", resRoles);
        const rolesData = resRoles.data || resRoles;
        if (Array.isArray(rolesData)) {
          setRoles(rolesData);
        } else {
          console.error("Roles data is not an array:", rolesData);
          setRoles([]);
        }
      } catch (roleError) {
        console.error("Failed to fetch roles:", roleError);
      }

      // Fetch Admins
      try {
        const resAdmins = await getAdmins();
        const adminsData = resAdmins.data || resAdmins;
        setAdmins(Array.isArray(adminsData) ? adminsData : []);
      } catch (adminError) {
        console.error("Failed to fetch admins:", adminError);
      }

    } catch (e) {
      console.error("Global fetch error in AdminsManager", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await registerAdmin({
        ...formData,
        roleId: parseInt(formData.roleId)
      });
      alert("Admin Created Successfully!");
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', roleId: '' });
      fetchData();
    } catch (err) {
      alert(err.message || "Failed to create admin");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Users & Access Control</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2 font-bold hover:bg-blue-700">
          <Plus size={18} /> Create New Admin
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan="4" className="p-6 text-center">Loading...</td></tr>}
            {!loading && admins.map(admin => (
              <tr key={admin.id}>
                <td className="p-4 font-medium">{admin.name}</td>
                <td className="p-4 text-gray-500">{admin.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${admin.role.name === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                    {admin.role.name}
                  </span>
                </td>
                <td className="p-4 text-gray-400 text-sm">
                  {admin.role.name === 'SUPER_ADMIN' ? 'Restricted' : <button className="hover:text-red-600">Remove</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-xl font-bold">Create New Admin</h3>
              <button onClick={() => setIsModalOpen(false)}><XCircle className="text-gray-400 hover:text-red-500" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="admin@example.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Assign Role</label>
                <select required value={formData.roleId} onChange={e => setFormData({ ...formData, roleId: e.target.value })} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="">Select Role...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Super Admin has full access. Managers have limited access.</p>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-95">
                Create Admin User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
