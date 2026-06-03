"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const db_service_1 = require("./db.service");
class ImageService {
    static async searchImage(query) {
        const settings = db_service_1.dbService.getSettings();
        const cleanQuery = encodeURIComponent(query.trim());
        // 1. Try Unsplash if Key is present
        if (settings.unsplashKey) {
            try {
                const response = await fetch(`https://api.unsplash.com/search/photos?query=${cleanQuery}&per_page=1&orientation=landscape`, {
                    headers: {
                        Authorization: `Client-ID ${settings.unsplashKey}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    const photo = data.results?.[0];
                    if (photo) {
                        return {
                            url: photo.urls.regular,
                            description: photo.alt_description || photo.description || query,
                            photographer: photo.user.name,
                            photographerUrl: photo.user.links.html,
                        };
                    }
                }
            }
            catch (err) {
                console.error('Unsplash Image API error:', err);
            }
        }
        // 2. Try Pexels if Key is present
        if (settings.pexelsKey) {
            try {
                const response = await fetch(`https://api.pexels.com/v1/search?query=${cleanQuery}&per_page=1`, {
                    headers: {
                        Authorization: settings.pexelsKey,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    const photo = data.photos?.[0];
                    if (photo) {
                        return {
                            url: photo.src.large,
                            description: photo.alt || query,
                            photographer: photo.photographer,
                            photographerUrl: photo.photographer_url,
                        };
                    }
                }
            }
            catch (err) {
                console.error('Pexels Image API error:', err);
            }
        }
        // 3. Robust Fallback using public Unsplash Source query
        // We append random parameters to avoid caching if multiple images are requested.
        const randomParam = Math.floor(Math.random() * 1000000);
        const fallbackUrl = `https://images.unsplash.com/featured/800x600/?${cleanQuery}&sig=${randomParam}`;
        return {
            url: fallbackUrl,
            description: `Unsplash stock photo of ${query}`,
            photographer: 'Unsplash Community',
            photographerUrl: 'https://unsplash.com',
        };
    }
}
exports.ImageService = ImageService;
