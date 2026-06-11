export interface OpenFoodFactsProduct {
  id: string; // usually barcode
  name: string;
  brands: string;
  image_url?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}
class OpenFoodFactsApiService {
  async searchProducts(query: string, pageSize: number = 10): Promise<OpenFoodFactsProduct[]> {
    if (!navigator.onLine) {
      throw new Error('Немає з\'єднання з інтернетом');
    }

    try {
      // Fetch directly from Open Food Facts because our backend proxy is hosted on a cloud VM
      // which is permanently blocked by Cloudflare's anti-bot protection.
      // The user's home IP is much less likely to be blocked.
      const url = `https://ua.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${pageSize}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        // Just log a warning instead of throwing to prevent scary red errors in the console
        console.warn(`Open Food Facts returned ${response.status}. This is usually a temporary rate limit.`);
        return [];
      }

      // Check if response is HTML instead of JSON (happens on rate limits/Cloudflare blocks)
      const text = await response.text();
      if (text.startsWith('<')) {
        console.warn("Open Food Facts returned HTML instead of JSON. Rate limit or Cloudflare block.");
        return [];
      }

      const data = JSON.parse(text);

      if (!data.products || !Array.isArray(data.products)) {
        return [];
      }

      return data.products.map((p: any) => {
        // Fallback for names
        const name = p.product_name || p.product_name_uk || p.product_name_en || p.generic_name || 'Невідомий продукт';
        
        // Nutrients
        const nutriments = p.nutriments || {};
        
        return {
          id: p.code || Math.random().toString(36).substr(2, 9),
          name: name,
          brands: p.brands ? p.brands.split(',')[0] : '', // Take first brand
          image_url: p.image_front_small_url || p.image_url,
          calories: nutriments['energy-kcal_100g'] ? Number(nutriments['energy-kcal_100g']) : 0,
          protein: nutriments.proteins_100g ? Number(nutriments.proteins_100g) : 0,
          fat: nutriments.fat_100g ? Number(nutriments.fat_100g) : 0,
          carbs: nutriments.carbohydrates_100g ? Number(nutriments.carbohydrates_100g) : 0
        };
      });
    } catch (error) {
      console.warn('Open Food Facts fetch failed (likely a temporary rate-limit block from Cloudflare):', error);
      return [];
    }
  }
}

export const openFoodFactsApiService = new OpenFoodFactsApiService();
