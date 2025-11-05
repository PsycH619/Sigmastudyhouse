// Database abstraction layer
// Supports both Firebase (production) and localStorage (fallback/development)

class DatabaseManager {
    constructor() {
        this.useFirebase = this.checkFirebaseAvailability();
        this.collections = {
            users: 'users',
            bookings: 'bookings',
            printingOrders: 'printingOrders',
            courseEnrollments: 'courseEnrollments',
            cafeteriaOrders: 'cafeteriaOrders',
            paymentHistory: 'paymentHistory',
            settings: 'settings'
        };

        this.init();
    }

    init() {
        if (this.useFirebase) {
            console.log('📊 Using Firebase database');
            this.setupFirebaseListeners();
        } else {
            console.log('💾 Using localStorage (fallback mode)');
            console.warn('⚠️ Data will be lost on browser clear. Set up Firebase for production.');
        }
    }

    checkFirebaseAvailability() {
        return typeof window.firebaseDB !== 'undefined' &&
               window.firebaseDB !== null &&
               typeof window.firebaseAuth !== 'undefined';
    }

    // ==================== CREATE ====================

    async create(collection, data) {
        try {
            if (this.useFirebase) {
                const docRef = await window.firebaseDB.collection(collection).add({
                    ...data,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return { id: docRef.id, ...data };
            } else {
                // localStorage fallback
                const items = this.getLocalStorageArray(collection);
                const newItem = {
                    id: data.id || Date.now() + Math.random(),
                    ...data,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                items.push(newItem);
                localStorage.setItem(collection, JSON.stringify(items));
                return newItem;
            }
        } catch (error) {
            console.error(`Error creating document in ${collection}:`, error);
            throw error;
        }
    }

    // ==================== READ ====================

    async get(collection, id) {
        try {
            if (this.useFirebase) {
                const doc = await window.firebaseDB.collection(collection).doc(id).get();
                if (doc.exists) {
                    return { id: doc.id, ...doc.data() };
                }
                return null;
            } else {
                const items = this.getLocalStorageArray(collection);
                return items.find(item => item.id === id) || null;
            }
        } catch (error) {
            console.error(`Error getting document ${id} from ${collection}:`, error);
            return null;
        }
    }

    async getAll(collection, filters = {}) {
        try {
            if (this.useFirebase) {
                let query = window.firebaseDB.collection(collection);

                // Apply filters
                Object.keys(filters).forEach(key => {
                    if (filters[key] !== undefined) {
                        query = query.where(key, '==', filters[key]);
                    }
                });

                const snapshot = await query.get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                let items = this.getLocalStorageArray(collection);

                // Apply filters
                Object.keys(filters).forEach(key => {
                    if (filters[key] !== undefined) {
                        items = items.filter(item => item[key] === filters[key]);
                    }
                });

                return items;
            }
        } catch (error) {
            console.error(`Error getting all documents from ${collection}:`, error);
            return [];
        }
    }

    async query(collection, conditions) {
        try {
            if (this.useFirebase) {
                let query = window.firebaseDB.collection(collection);

                conditions.forEach(condition => {
                    const [field, operator, value] = condition;
                    query = query.where(field, operator, value);
                });

                const snapshot = await query.get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                let items = this.getLocalStorageArray(collection);

                conditions.forEach(condition => {
                    const [field, operator, value] = condition;
                    items = items.filter(item => {
                        switch (operator) {
                            case '==': return item[field] === value;
                            case '!=': return item[field] !== value;
                            case '>': return item[field] > value;
                            case '>=': return item[field] >= value;
                            case '<': return item[field] < value;
                            case '<=': return item[field] <= value;
                            case 'in': return value.includes(item[field]);
                            case 'array-contains': return item[field] && item[field].includes(value);
                            default: return true;
                        }
                    });
                });

                return items;
            }
        } catch (error) {
            console.error(`Error querying ${collection}:`, error);
            return [];
        }
    }

    // ==================== UPDATE ====================

    async update(collection, id, data) {
        try {
            if (this.useFirebase) {
                // Use set with merge to create if doesn't exist, update if exists
                await window.firebaseDB.collection(collection).doc(id).set({
                    ...data,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                return true;
            } else {
                const items = this.getLocalStorageArray(collection);
                const index = items.findIndex(item => item.id === id);
                if (index !== -1) {
                    items[index] = {
                        ...items[index],
                        ...data,
                        updatedAt: new Date().toISOString()
                    };
                    localStorage.setItem(collection, JSON.stringify(items));
                    return true;
                }
                return false;
            }
        } catch (error) {
            console.error(`Error updating document ${id} in ${collection}:`, error);
            return false;
        }
    }

    // ==================== DELETE ====================

    async delete(collection, id) {
        try {
            if (this.useFirebase) {
                await window.firebaseDB.collection(collection).doc(id).delete();
                return true;
            } else {
                const items = this.getLocalStorageArray(collection);
                const filtered = items.filter(item => item.id !== id);
                localStorage.setItem(collection, JSON.stringify(filtered));
                return true;
            }
        } catch (error) {
            console.error(`Error deleting document ${id} from ${collection}:`, error);
            return false;
        }
    }

    // ==================== STORAGE (File Upload) ====================

    async uploadFile(path, file, metadata = {}) {
        try {
            if (this.useFirebase && window.firebaseStorage) {
                const storageRef = window.firebaseStorage.ref();
                const fileRef = storageRef.child(path);

                const uploadTask = await fileRef.put(file, metadata);
                const downloadURL = await uploadTask.ref.getDownloadURL();

                return {
                    url: downloadURL,
                    path: path,
                    name: file.name,
                    size: file.size,
                    type: file.type
                };
            } else {
                // For localStorage fallback, we'll store file info only (not actual file)
                console.warn('File upload requires Firebase Storage. Storing metadata only.');
                return {
                    url: URL.createObjectURL(file),
                    path: path,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    localOnly: true
                };
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    async deleteFile(path) {
        try {
            if (this.useFirebase && window.firebaseStorage) {
                const storageRef = window.firebaseStorage.ref();
                const fileRef = storageRef.child(path);
                await fileRef.delete();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }

    // ==================== REALTIME LISTENERS ====================

    onSnapshot(collection, callback, filters = {}) {
        if (this.useFirebase) {
            let query = window.firebaseDB.collection(collection);

            // Apply filters
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined) {
                    query = query.where(key, '==', filters[key]);
                }
            });

            return query.onSnapshot(snapshot => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(data);
            });
        } else {
            // For localStorage, we'll poll for changes (not ideal but works)
            const intervalId = setInterval(() => {
                let items = this.getLocalStorageArray(collection);

                // Apply filters
                Object.keys(filters).forEach(key => {
                    if (filters[key] !== undefined) {
                        items = items.filter(item => item[key] === filters[key]);
                    }
                });

                callback(items);
            }, 1000);

            // Return unsubscribe function
            return () => clearInterval(intervalId);
        }
    }

    // ==================== HELPERS ====================

    getLocalStorageArray(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return [];
        }
    }

    setupFirebaseListeners() {
        // Set up authentication state listener
        if (window.firebaseAuth) {
            window.firebaseAuth.onAuthStateChanged(user => {
                if (user) {
                    console.log('🔐 User authenticated:', user.email);
                } else {
                    console.log('🔓 User signed out');
                }
            });
        }
    }

    // ==================== BATCH OPERATIONS ====================

    async batchWrite(operations) {
        if (this.useFirebase) {
            const batch = window.firebaseDB.batch();

            operations.forEach(op => {
                const ref = window.firebaseDB.collection(op.collection).doc(op.id);

                switch (op.type) {
                    case 'create':
                    case 'set':
                        batch.set(ref, op.data);
                        break;
                    case 'update':
                        batch.update(ref, op.data);
                        break;
                    case 'delete':
                        batch.delete(ref);
                        break;
                }
            });

            await batch.commit();
            return true;
        } else {
            // Execute operations sequentially for localStorage
            for (const op of operations) {
                switch (op.type) {
                    case 'create':
                    case 'set':
                        await this.create(op.collection, { ...op.data, id: op.id });
                        break;
                    case 'update':
                        await this.update(op.collection, op.id, op.data);
                        break;
                    case 'delete':
                        await this.delete(op.collection, op.id);
                        break;
                }
            }
            return true;
        }
    }

    // ==================== UTILITY METHODS ====================

    async clearCollection(collection) {
        try {
            if (this.useFirebase) {
                const snapshot = await window.firebaseDB.collection(collection).get();
                const batch = window.firebaseDB.batch();
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
                return true;
            } else {
                localStorage.removeItem(collection);
                return true;
            }
        } catch (error) {
            console.error(`Error clearing collection ${collection}:`, error);
            return false;
        }
    }

    async getStats(collection) {
        const items = await this.getAll(collection);
        return {
            total: items.length,
            collection: collection,
            backend: this.useFirebase ? 'Firebase' : 'localStorage'
        };
    }
}

// Initialize database manager
document.addEventListener('DOMContentLoaded', function() {
    window.db = new DatabaseManager();
});
