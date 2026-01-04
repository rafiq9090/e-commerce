import React, { useState, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getOrderStatistics, getAllOrders, updateOrderStatus } from '../api/orderApi';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories as getProdCategories, getSuppliers as getProdSuppliers } from '../api/productApi';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categoryApi';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/supplierApi';
import { getAllMenus, createMenu, addMenuItem, updateMenuItem, deleteMenuItem } from '../api/menuApi';
import { getAllContent, updateContent } from '../api/contentApi';
import { getAllBlocked, addToBlocklist, removeFromBlocklist } from '../api/blocklistApi';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [counts, setCounts] = useState({ products: 0, orders: 0 });

  const fetchNotificationCounts = async () => {
    try {
      // 1. Order Badge: Show "New" orders since last view
      const resOrders = await getAllOrders();
      const allOrders = resOrders.data || resOrders;
      const totalOrdersCount = allOrders.length;

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'orders') {
      // Mark orders as seen
      getAllOrders().then(res => {
        const total = (res.data || res).length;
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
      case 'orders': return <OrdersManager />;
      case 'categories': return <CategoriesManager />;
      case 'suppliers': return <SuppliersManager />;
      case 'menus': return <MenusManager />;
      case 'content': return <SiteContentManager />;
      case 'blocklist': return <BlocklistManager />;
      case 'settings': return <SettingsManager />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col shadow-xl z-20`}>
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
            badge={counts.products > 0 ? counts.products : null}
            badgeColor="bg-blue-600"
          />

          <SidebarItem
            icon={<ShoppingCart size={20} />}
            label="Orders"
            active={activeTab === 'orders'}
            onClick={() => handleTabChange('orders')}
            isOpen={isSidebarOpen}
            badge={counts.orders > 0 ? counts.orders : null}
            badgeColor="bg-red-500"
          />

          <SidebarItem icon={<Layers size={20} />} label="Categories" active={activeTab === 'categories'} onClick={() => handleTabChange('categories')} isOpen={isSidebarOpen} />
          <SidebarItem icon={<Truck size={20} />} label="Suppliers" active={activeTab === 'suppliers'} onClick={() => handleTabChange('suppliers')} isOpen={isSidebarOpen} />
          <SidebarItem icon={<MenuIcon size={20} />} label="Menus" active={activeTab === 'menus'} onClick={() => handleTabChange('menus')} isOpen={isSidebarOpen} />
          <SidebarItem icon={<Type size={20} />} label="Site Content" active={activeTab === 'content'} onClick={() => handleTabChange('content')} isOpen={isSidebarOpen} />
          <SidebarItem icon={<ShieldAlert size={20} />} label="Blocklist" active={activeTab === 'blocklist'} onClick={() => handleTabChange('blocklist')} isOpen={isSidebarOpen} />
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
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-gray-800">{user?.name || 'Admin'}</div>
              <div className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">{renderContent()}</div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick, isOpen, badge, badgeColor = 'bg-gray-600' }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center ${isOpen ? 'justify-start' : 'justify-center'} w-full p-3 rounded-lg transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
  >
    {icon}
    {isOpen && <span className="ml-3 font-medium flex-1 text-left">{label}</span>}
    {badge && isOpen && (
      <span className={`${badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto`}>
        {badge}
      </span>
    )}
    {/* Mini badge for collapsed state */}
    {badge && !isOpen && (
      <span className={`absolute top-2 right-2 ${badgeColor} w-2 h-2 rounded-full border border-gray-900`}></span>
    )}
  </button>
);

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getOrderStatistics('month');
      setStats(data.data || data);
    } catch (error) { console.error("Failed to load stats", error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);
  const displayStats = stats || { totalOrders: 0, totalRevenue: 0, pendingOrders: 0 };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <button onClick={fetchStats} className="text-blue-600 font-medium text-sm flex items-center gap-2 hover:bg-blue-50 px-3 py-2 rounded-lg transition">
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">Loading statistics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Orders" value={displayStats.totalOrders || 0} icon={<ShoppingCart className="text-blue-500" size={24} />} trend="This Month" color="bg-blue-50" />
          <StatCard title="Total Revenue" value={`৳${Number(displayStats.totalRevenue || 0).toLocaleString()}`} icon={<span className="text-2xl font-bold text-green-500">৳</span>} trend="This Month" color="bg-green-50" />
          <StatCard title="Pending Orders" value={displayStats.pendingOrders || 0} icon={<Package className="text-orange-500" size={24} />} trend="Needs Attention" color="bg-orange-50" />

          <StatCard title="Total Products" value={displayStats.totalProducts || 0} icon={<Package className="text-purple-500" size={24} />} trend="All Time" color="bg-purple-50" />
          <StatCard title="Total Customers" value={displayStats.totalCustomers || 0} icon={<Users className="text-teal-500" size={24} />} trend="All Time" color="bg-teal-50" />
          <StatCard title="Low Stock Items" value={displayStats.lowStockProducts || 0} icon={<AlertTriangle className="text-red-500" size={24} />} trend="Restock Now" color="bg-red-50" />
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
        <p className="text-gray-500">System is running smooth.</p>
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemData, setNewItemData] = useState({ title: '', link: '', order: 0 });
  // Currently only supporting adding to menu, not creating new menus in this simplified view
  // Ideally would have Create Menu feature too.

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await getAllMenus();
      setMenus(res.data || res);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { fetchMenus(); }, []);

  const handleCreateMenu = async () => {
    const name = prompt("Enter menu name (e.g., 'main-menu', 'footer-menu'):");
    if (!name) return;
    try { await createMenu({ name, items: [] }); fetchMenus(); } catch (e) { alert("Failed to create"); }
  };

  const handleAddItem = async (menuId) => {
    try {
      await addMenuItem({ ...newItemData, menuId, order: parseInt(newItemData.order) });
      setIsModalOpen(false); setNewItemData({ title: '', link: '', order: 0 }); fetchMenus();
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
        <button onClick={handleCreateMenu} className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2"><Plus size={18} /> New Menu</button>
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
                    <input placeholder="Title" value={newItemData.title} onChange={e => setNewItemData({ ...newItemData, title: e.target.value })} className="border p-1 rounded text-sm" />
                    <input placeholder="Link (/path)" value={newItemData.link} onChange={e => setNewItemData({ ...newItemData, link: e.target.value })} className="border p-1 rounded text-sm" />
                    <input type="number" placeholder="Order" value={newItemData.order} onChange={e => setNewItemData({ ...newItemData, order: e.target.value })} className="border p-1 rounded text-sm" />
                    <button onClick={() => handleAddItem(menu.id)} className="bg-green-600 text-white rounded text-sm hover:bg-green-700">Add</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const SiteContentManager = () => {
  const [content, setContent] = useState([]);
  const [editMap, setEditMap] = useState({});

  const fetchContent = async () => {
    try {
      const res = await getAllContent();
      const data = res.data || res;
      setContent(data);
      // Initialize edit map
      const initialMap = {};
      data.forEach(c => initialMap[c.key] = c.value);
      setEditMap(initialMap);
    } catch (e) { console.error(e); }
  };
  useEffect(() => { fetchContent(); }, []);

  const handleSave = async (key, type) => {
    try {
      await updateContent({ key, value: editMap[key], type });
      alert("Saved!");
    } catch (e) { alert("Failed to save"); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Site Content</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <p className="text-gray-500 mb-4">Manage header texts, footer descriptions, social links, etc.</p>

        {/* Helper to show consistent UI for different keys */}
        {['header_title', 'footer_description', 'contact_email', 'contact_phone'].map(key => (
          <div key={key} className="flex flex-col space-y-1">
            <label className="text-sm font-semibold text-gray-700 capitalize">{key.replace('_', ' ')}</label>
            <div className="flex gap-2">
              <input
                value={editMap[key] || ''}
                onChange={(e) => setEditMap({ ...editMap, [key]: e.target.value })}
                className="flex-1 border p-2 rounded"
              />
              <button onClick={() => handleSave(key, 'TEXT')} className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700"><Save size={16} /></button>
            </div>
          </div>
        ))}

        {/* Example for Image/Logo */}
        <div className="flex flex-col space-y-1 pt-4 border-t">
          <label className="text-sm font-semibold text-gray-700">Logo URL</label>
          <div className="flex gap-2">
            <input
              value={editMap['site_logo'] || ''}
              onChange={(e) => setEditMap({ ...editMap, ['site_logo']: e.target.value })}
              className="flex-1 border p-2 rounded"
              placeholder="https://..."
            />
            <button onClick={() => handleSave('site_logo', 'IMAGE_URL')} className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700"><Save size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BlocklistManager = () => {
  const [blocked, setBlocked] = useState([]);
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');

  const fetchBlocked = async () => {
    try { const res = await getAllBlocked(); setBlocked(res.data || res); } catch (e) { }
  };
  useEffect(() => { fetchBlocked(); }, []);

  const handleBlock = async () => {
    if (!newValue) return;
    try { await addToBlocklist({ type: 'email', value: newValue, reason }); fetchBlocked(); setNewValue(''); setReason(''); }
    catch (e) { alert('Failed to block'); }
  };

  const handleUnblock = async (id) => {
    if (!window.confirm("Unblock user?")) return;
    try { await removeFromBlocklist(id); fetchBlocked(); } catch (e) { }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Blocked Users</h2>

      {/* Block Form */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold text-red-800 mb-1">Email / IP to Block</label>
          <input value={newValue} onChange={e => setNewValue(e.target.value)} className="w-full border p-2 rounded" placeholder="spam@example.com" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-red-800 mb-1">Reason</label>
          <input value={reason} onChange={e => setReason(e.target.value)} className="w-full border p-2 rounded" placeholder="Spamming orders..." />
        </div>
        <button onClick={handleBlock} className="bg-red-600 text-white px-6 py-2 rounded h-10 font-bold hover:bg-red-700">BLOCK</button>
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
      // Filter for settings-related keys or just load all and pick
      const initialMap = {};
      data.forEach(c => initialMap[c.key] = c.value);
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
            <div className="flex gap-2">
              <input
                type="password"
                value={settings['steadfast_api_key'] || ''}
                onChange={e => handleChange('steadfast_api_key', e.target.value)}
                className="flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="Enter API Key"
              />
              <button onClick={() => handleSave('steadfast_api_key')} className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700">Save</button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Steadfast Secret Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={settings['steadfast_secret_key'] || ''}
                onChange={e => handleChange('steadfast_secret_key', e.target.value)}
                className="flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="Enter Secret Key"
              />
              <button onClick={() => handleSave('steadfast_secret_key')} className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">Used for calculating shipping charges and pushing orders to Steadfast courier service.</p>
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
  const [productCounts, setProductCounts] = useState({ ALL: 0, PUBLISHED: 0, DRAFT: 0, ARCHIVED: 0 });
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', short_description: '', regular_price: '', sale_price: '',
    categoryId: '', supplierId: '', inventory: 0, imageUrl: '', status: 'DRAFT',
    seoTitle: '', seoDescription: '', seoKeywords: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const statusParam = filterStatus;

      // Parallel fetch for main data and counts
      const [resProducts, resCats, resSuppliers] = await Promise.all([
        getProducts({
          status: statusParam,
          category: filterCategory || undefined,
          supplier: filterSupplier || undefined
        }),
        getProdCategories(),
        getProdSuppliers()
      ]);

      // Concurrent count fetching
      const commonFilters = {
        category: filterCategory || undefined,
        supplier: filterSupplier || undefined
      };

      const [allC, pubC, dftC, arcC] = await Promise.all([
        getProducts({ status: 'ALL', limit: 1, ...commonFilters }),
        getProducts({ status: 'PUBLISHED', limit: 1, ...commonFilters }),
        getProducts({ status: 'DRAFT', limit: 1, ...commonFilters }),
        getProducts({ status: 'ARCHIVED', limit: 1, ...commonFilters })
      ]);

      setProducts(resProducts.data?.products || resProducts.products || []);
      setCategories(resCats.data || resCats || []);
      setSuppliers(resSuppliers.data || resSuppliers || []);

      setProductCounts({
        ALL: allC.pagination?.total || 0,
        PUBLISHED: pubC.pagination?.total || 0,
        DRAFT: dftC.pagination?.total || 0,
        ARCHIVED: arcC.pagination?.total || 0
      });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filterStatus, filterCategory, filterSupplier]);

  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        supplierId: parseInt(formData.supplierId),
        regular_price: parseFloat(formData.regular_price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        inventory: parseInt(formData.inventory),
        images: formData.imageUrl ? [{ url: formData.imageUrl }] : []
      };
      if (editingProduct) { await updateProduct(editingProduct.id, payload); alert('Updated!'); } else { await createProduct(payload); alert('Created!'); }
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
    setFormData({
      name: p.name, slug: p.slug, description: p.description, short_description: p.short_description || '',
      regular_price: p.regular_price, sale_price: p.sale_price || '',
      categoryId: p.categoryId || '', supplierId: p.supplierId || '',
      inventory: p.inventory?.quantity || 0, imageUrl: p.images?.[0]?.url || '', status: p.status || 'DRAFT',
      seoTitle: p.seoTitle || '', seoDescription: p.seoDescription || '', seoKeywords: p.seoKeywords || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '', slug: '', description: '', short_description: '', regular_price: '', sale_price: '',
      categoryId: categories[0]?.id || '', supplierId: suppliers[0]?.id || '', inventory: 0,
      imageUrl: '', status: 'DRAFT',
      seoTitle: '', seoDescription: '', seoKeywords: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>

        {/* Status Filter Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
          {['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`relative px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${filterStatus === status
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === status ? 'bg-gray-100 text-gray-800' : 'bg-gray-200 text-gray-600'}`}>
                {productCounts[status] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Category & Supplier Filters */}
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>

          <select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Suppliers</option>
            {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>

        <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2"><Plus size={18} /> Add</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr><th className="p-4">Name</th><th className="p-4">Price</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {products.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-500">No products found for this filter.</td></tr>}
            {products.map(p => (
              <tr key={p.id}>
                <td className="p-4">{p.name}</td>
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
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Full Description" className="w-full border p-2 rounded h-24" required />

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
                <input name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="Image URL" className="w-full border p-2 rounded" />
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
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all transform hover:scale-[1.01]">Save Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]); const [isModalOpen, setIsModalOpen] = useState(false); const [formData, setFormData] = useState({ name: '', slug: '' }); const [editingId, setEditingId] = useState(null);
  const fetchCats = async () => { const res = await getCategories(); setCategories(res.data || res); }; useEffect(() => { fetchCats(); }, []);
  const handleSubmit = async (e) => { e.preventDefault(); try { if (editingId) await updateCategory(editingId, formData); else await createCategory(formData); setIsModalOpen(false); fetchCats(); setFormData({ name: '', slug: '' }); setEditingId(null); } catch (e) { alert('Error'); } };
  const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; try { await deleteCategory(id); fetchCats(); } catch (e) { alert('Error'); } };
  return (
    <div className="space-y-6"><div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Categories</h2><button onClick={() => { setEditingId(null); setFormData({ name: '', slug: '' }); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded gap-2 flex"><Plus size={18} /> Add</button></div><div className="bg-white rounded-xl shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-50 border-b"><tr><th className="p-4">Name</th><th className="p-4">Slug</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y">{categories.map(c => (<tr key={c.id}><td className="p-4">{c.name}</td><td className="p-4">{c.slug}</td><td className="p-4 text-right"><button onClick={() => { setEditingId(c.id); setFormData({ name: c.name, slug: c.slug }); setIsModalOpen(true); }} className="p-2 text-blue-600"><Edit size={16} /></button><button onClick={() => handleDelete(c.id)} className="p-2 text-red-600"><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>{isModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"><div className="bg-white rounded-xl p-6 w-full max-w-md"><h3 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Category</h3><form onSubmit={handleSubmit} className="space-y-4"><input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Name" className="w-full border p-2 rounded" required /><input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="Slug" className="w-full border p-2 rounded" required /><div className="flex gap-2 justify-end"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button></div></form></div></div>)}</div>
  );
};
const SuppliersManager = () => {
  const [suppliers, setSuppliers] = useState([]); const [isModalOpen, setIsModalOpen] = useState(false); const [formData, setFormData] = useState({ name: '', location: '', contactEmail: '' }); const [editingId, setEditingId] = useState(null);
  const fetchSups = async () => { const res = await getSuppliers(); setSuppliers(res.data || res); }; useEffect(() => { fetchSups(); }, []);
  const handleSubmit = async (e) => { e.preventDefault(); try { if (editingId) await updateSupplier(editingId, formData); else await createSupplier(formData); setIsModalOpen(false); fetchSups(); setFormData({ name: '', location: '', contactEmail: '' }); setEditingId(null); } catch (e) { alert('Error'); } };
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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders({
        status: filterStatus || undefined,
        search: searchQuery || undefined
      });
      setOrders(res.data || res);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    // minimal debounce for search
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [filterStatus, searchQuery]);
  const handleStatusChange = async (id, status) => { try { await updateOrderStatus(id, status); fetchOrders(); } catch (e) { alert('Error updating status'); } };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orders Tracking</h2>
        <div className="flex gap-2">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-50 border-b border-gray-100"><tr><th className="p-4">ID</th><th className="p-4">Customer</th><th className="p-4">Total</th><th className="p-4 w-40">Tracking Status</th></tr></thead><tbody className="divide-y divide-gray-100">{orders.map(o => (<tr key={o.id}><td className="p-4">#{o.id}</td><td className="p-4">{o.customerName}<br /><span className="text-xs text-gray-500">{o.customerEmail}</span></td><td className="p-4">${o.totalAmount}</td><td className="p-4"><select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)} className={`border rounded p-1 text-sm font-semibold ${o.status === 'DELIVERED' ? 'text-green-700 bg-green-100' : o.status === 'CANCELLED' ? 'text-red-700 bg-red-100' : 'text-blue-700 bg-blue-100'}`}>{['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}</select></td></tr>))}</tbody></table></div></div>
  );
};

export default AdminDashboard;
