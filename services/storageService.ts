
import { UserProfile, GeneratedOutfit } from '../types';

const DB_NAME = 'RFLCTN_DB';
const DB_VERSION = 1;
const STORE_PROFILE = 'user_profile';
const STORE_OUTFITS = 'saved_outfits';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
        reject("IndexedDB not supported");
        return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PROFILE)) {
        db.createObjectStore(STORE_PROFILE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_OUTFITS)) {
        db.createObjectStore(STORE_OUTFITS, { keyPath: 'id' });
      }
    };
  });
};

export const StorageService = {
  async saveProfile(profile: UserProfile): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(STORE_PROFILE, 'readwrite');
          const store = transaction.objectStore(STORE_PROFILE);
          const request = store.put({ id: 'current_user', ...profile });
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error("Storage Save Error:", e);
    }
  },

  async getProfile(): Promise<UserProfile | null> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(STORE_PROFILE, 'readonly');
          const store = transaction.objectStore(STORE_PROFILE);
          const request = store.get('current_user');
          request.onsuccess = () => {
             if (request.result) {
                 const { id, ...profile } = request.result;
                 resolve(profile as UserProfile);
             } else {
                 resolve(null);
             }
          };
          request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error("Storage Read Error:", e);
        return null;
    }
  },

  async saveOutfit(outfit: GeneratedOutfit): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(STORE_OUTFITS, 'readwrite');
          const store = transaction.objectStore(STORE_OUTFITS);
          const request = store.put(outfit);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error("Storage Outfit Save Error:", e);
    }
  },

  async getOutfits(): Promise<GeneratedOutfit[]> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(STORE_OUTFITS, 'readonly');
          const store = transaction.objectStore(STORE_OUTFITS);
          const request = store.getAll();
          request.onsuccess = () => {
             // Return newest first
             resolve((request.result || []).reverse());
          };
          request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error("Storage Outfit Read Error:", e);
        return [];
    }
  },

  async deleteOutfit(id: string): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(STORE_OUTFITS, 'readwrite');
          const store = transaction.objectStore(STORE_OUTFITS);
          const request = store.delete(id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error("Storage Delete Error:", e);
    }
  }
};
