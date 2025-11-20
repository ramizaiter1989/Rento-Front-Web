// LocalStorage utilities for favorites

const FAVORITES_KEY = 'carRentalFavorites';

export const getFavorites = () => {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const addToFavorites = (carId) => {
  try {
    const favorites = getFavorites();
    if (!favorites.includes(carId)) {
      favorites.push(carId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
    return favorites;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return [];
  }
};

export const removeFromFavorites = (carId) => {
  try {
    const favorites = getFavorites();
    const updated = favorites.filter(id => id !== carId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return [];
  }
};

export const isFavorite = (carId) => {
  const favorites = getFavorites();
  return favorites.includes(carId);
};