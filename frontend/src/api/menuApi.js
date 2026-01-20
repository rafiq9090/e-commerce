import apiClient from './apiConfig';

// Get all menus (Admin)
export const getAllMenus = async () => {
    try {
        const response = await apiClient.get('/menus/admin/all');
        return response.data;
    } catch (error) {
        console.error("Error fetching menus:", error);
        throw error;
    }
};

// Get menu by name (Public)
export const getMenuByName = async (name) => {
    try {
        const response = await apiClient.get(`/menus/${name}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching menu:", error);
        throw error;
    }
};

// Create a new menu
export const createMenu = async (data) => {
    try {
        const response = await apiClient.post('/menus/admin', data);
        return response.data;
    } catch (error) {
        console.error("Error creating menu:", error);
        throw error;
    }
};

// Add item to menu
export const addMenuItem = async (data) => {
    try {
        const response = await apiClient.post('/menus/admin/items', data);
        return response.data;
    } catch (error) {
        console.error("Error adding menu item:", error);
        throw error;
    }
};

// Update menu item
export const updateMenuItem = async (itemId, data) => {
    try {
        const response = await apiClient.put(`/menus/admin/items/${itemId}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating menu item:", error);
        throw error;
    }
};

// Delete menu item
export const deleteMenuItem = async (itemId) => {
    try {
        const response = await apiClient.delete(`/menus/admin/items/${itemId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting menu item:", error);
        throw error;
    }
};
