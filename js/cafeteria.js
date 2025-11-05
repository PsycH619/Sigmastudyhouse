// Cafeteria functionality
class CafeteriaManager {
    constructor() {
        this.cart = [];
        this.menu = this.getMenuItems();
        this.currentCategory = 'all';
        this.init();
    }

    init() {
        this.renderMenu();
        this.initializeCart();
        this.initializeFilters();
        this.loadSavedCart();
    }

    getMenuItems() {
        return [
            // Hot Drinks
            {
                id: 'hd1',
                name: 'Espresso',
                nameAr: 'إسبريسو',
                category: 'hot-drinks',
                price: 1.50,
                description: 'Rich and bold espresso shot',
                descriptionAr: 'جرعة إسبريسو غنية وقوية',
                icon: 'fa-mug-hot',
                popular: true
            },
            {
                id: 'hd2',
                name: 'Cappuccino',
                nameAr: 'كابتشينو',
                category: 'hot-drinks',
                price: 2.00,
                description: 'Classic cappuccino with foam',
                descriptionAr: 'كابتشينو كلاسيكي مع رغوة',
                icon: 'fa-coffee',
                popular: true
            },
            {
                id: 'hd3',
                name: 'Latte',
                nameAr: 'لاتيه',
                category: 'hot-drinks',
                price: 2.50,
                description: 'Smooth latte with steamed milk',
                descriptionAr: 'لاتيه ناعم مع حليب مبخر',
                icon: 'fa-mug-hot'
            },
            {
                id: 'hd4',
                name: 'Turkish Coffee',
                nameAr: 'قهوة تركية',
                category: 'hot-drinks',
                price: 1.75,
                description: 'Traditional Turkish coffee',
                descriptionAr: 'قهوة تركية تقليدية',
                icon: 'fa-coffee',
                popular: true
            },
            {
                id: 'hd5',
                name: 'Hot Chocolate',
                nameAr: 'شوكولاتة ساخنة',
                category: 'hot-drinks',
                price: 2.25,
                description: 'Rich hot chocolate',
                descriptionAr: 'شوكولاتة ساخنة غنية',
                icon: 'fa-mug-hot'
            },
            {
                id: 'hd6',
                name: 'Green Tea',
                nameAr: 'شاي أخضر',
                category: 'hot-drinks',
                price: 1.25,
                description: 'Fresh green tea',
                descriptionAr: 'شاي أخضر طازج',
                icon: 'fa-leaf'
            },

            // Cold Drinks
            {
                id: 'cd1',
                name: 'Iced Latte',
                nameAr: 'لاتيه مثلج',
                category: 'cold-drinks',
                price: 2.75,
                description: 'Refreshing iced latte',
                descriptionAr: 'لاتيه مثلج منعش',
                icon: 'fa-glass-whiskey',
                popular: true
            },
            {
                id: 'cd2',
                name: 'Iced Americano',
                nameAr: 'أمريكانو مثلج',
                category: 'cold-drinks',
                price: 2.25,
                description: 'Cold americano coffee',
                descriptionAr: 'قهوة أمريكانو باردة',
                icon: 'fa-glass-whiskey'
            },
            {
                id: 'cd3',
                name: 'Fresh Orange Juice',
                nameAr: 'عصير برتقال طازج',
                category: 'cold-drinks',
                price: 3.00,
                description: 'Freshly squeezed orange juice',
                descriptionAr: 'عصير برتقال طازج',
                icon: 'fa-lemon',
                popular: true
            },
            {
                id: 'cd4',
                name: 'Smoothie',
                nameAr: 'سموذي',
                category: 'cold-drinks',
                price: 3.50,
                description: 'Mixed fruit smoothie',
                descriptionAr: 'سموذي فواكه مشكلة',
                icon: 'fa-blender'
            },
            {
                id: 'cd5',
                name: 'Soft Drink',
                nameAr: 'مشروبات غازية',
                category: 'cold-drinks',
                price: 1.00,
                description: 'Assorted soft drinks',
                descriptionAr: 'مشروبات غازية متنوعة',
                icon: 'fa-wine-bottle'
            },
            {
                id: 'cd6',
                name: 'Bottled Water',
                nameAr: 'ماء معبأ',
                category: 'cold-drinks',
                price: 0.50,
                description: 'Fresh bottled water',
                descriptionAr: 'ماء معبأ طازج',
                icon: 'fa-tint'
            },

            // Snacks
            {
                id: 'sn1',
                name: 'Croissant',
                nameAr: 'كرواسون',
                category: 'snacks',
                price: 1.50,
                description: 'Buttery croissant',
                descriptionAr: 'كرواسون بالزبدة',
                icon: 'fa-bread-slice',
                popular: true
            },
            {
                id: 'sn2',
                name: 'Chocolate Chip Cookie',
                nameAr: 'كوكيز برقائق الشوكولاتة',
                category: 'snacks',
                price: 1.00,
                description: 'Homemade cookie',
                descriptionAr: 'كوكيز منزلي',
                icon: 'fa-cookie-bite'
            },
            {
                id: 'sn3',
                name: 'Brownie',
                nameAr: 'براوني',
                category: 'snacks',
                price: 2.00,
                description: 'Rich chocolate brownie',
                descriptionAr: 'براوني شوكولاتة غني',
                icon: 'fa-square'
            },
            {
                id: 'sn4',
                name: 'Muffin',
                nameAr: 'مافن',
                category: 'snacks',
                price: 1.75,
                description: 'Blueberry or chocolate muffin',
                descriptionAr: 'مافن بالتوت أو الشوكولاتة',
                icon: 'fa-drumstick-bite'
            },
            {
                id: 'sn5',
                name: 'Chips',
                nameAr: 'رقائق',
                category: 'snacks',
                price: 0.75,
                description: 'Assorted chips',
                descriptionAr: 'رقائق متنوعة',
                icon: 'fa-certificate'
            },
            {
                id: 'sn6',
                name: 'Energy Bar',
                nameAr: 'لوح طاقة',
                category: 'snacks',
                price: 2.00,
                description: 'Nutritious energy bar',
                descriptionAr: 'لوح طاقة مغذي',
                icon: 'fa-bars'
            },

            // Meals
            {
                id: 'm1',
                name: 'Club Sandwich',
                nameAr: 'ساندويتش كلوب',
                category: 'meals',
                price: 4.50,
                description: 'Triple-decker sandwich with fries',
                descriptionAr: 'ساندويتش ثلاثي الطبقات مع بطاطس',
                icon: 'fa-hamburger',
                popular: true
            },
            {
                id: 'm2',
                name: 'Caesar Salad',
                nameAr: 'سلطة سيزر',
                category: 'meals',
                price: 3.75,
                description: 'Fresh Caesar salad with chicken',
                descriptionAr: 'سلطة سيزر طازجة مع دجاج',
                icon: 'fa-salad'
            },
            {
                id: 'm3',
                name: 'Pasta',
                nameAr: 'باستا',
                category: 'meals',
                price: 5.00,
                description: 'Creamy pasta with choice of sauce',
                descriptionAr: 'باستا كريمية مع اختيار الصلصة',
                icon: 'fa-utensils',
                popular: true
            },
            {
                id: 'm4',
                name: 'Pizza Slice',
                nameAr: 'شريحة بيتزا',
                category: 'meals',
                price: 2.50,
                description: 'Fresh pizza slice',
                descriptionAr: 'شريحة بيتزا طازجة',
                icon: 'fa-pizza-slice'
            },
            {
                id: 'm5',
                name: 'Burger',
                nameAr: 'برغر',
                category: 'meals',
                price: 5.50,
                description: 'Beef burger with fries',
                descriptionAr: 'برغر لحم مع بطاطس',
                icon: 'fa-hamburger'
            },
            {
                id: 'm6',
                name: 'Wrap',
                nameAr: 'راب',
                category: 'meals',
                price: 4.00,
                description: 'Chicken or vegetable wrap',
                descriptionAr: 'راب دجاج أو خضار',
                icon: 'fa-scroll'
            }
        ];
    }

    renderMenu(category = 'all') {
        const menuGrid = document.getElementById('menuGrid');
        if (!menuGrid) return;

        const filteredMenu = category === 'all'
            ? this.menu
            : this.menu.filter(item => item.category === category);

        menuGrid.innerHTML = filteredMenu.map(item => `
            <div class="service-card hover-glow" data-item-id="${item.id}">
                <div class="service-image" style="background: linear-gradient(135deg, ${this.getCategoryColor(item.category)});">
                    <i class="fas ${item.icon} floating-element" style="font-size: 3rem;"></i>
                    ${item.popular ? '<div style="position: absolute; top: 10px; right: 10px; background: var(--primary); color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.7rem;">POPULAR</div>' : ''}
                </div>
                <div class="service-content">
                    <h3>${item.name}</h3>
                    <p style="color: var(--text-light); margin-bottom: 15px;">${item.description}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                        <span style="font-size: 1.5rem; font-weight: bold; color: var(--primary);">${item.price.toFixed(2)} JOD</span>
                        <button class="btn btn-primary add-to-cart-btn" data-item-id="${item.id}">
                            <i class="fas fa-cart-plus"></i>
                            <span>Add</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to "Add to Cart" buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.getAttribute('data-item-id');
                this.addToCart(itemId);
            });
        });
    }

    getCategoryColor(category) {
        const colors = {
            'hot-drinks': '#8B4513, #654321',
            'cold-drinks': '#3498db, #2980b9',
            'snacks': '#f39c12, #e67e22',
            'meals': '#e74c3c, #c0392b'
        };
        return colors[category] || '#95a5a6, #7f8c8d';
    }

    initializeFilters() {
        const filters = document.querySelectorAll('.category-filter');
        filters.forEach(filter => {
            filter.addEventListener('click', () => {
                filters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                const category = filter.getAttribute('data-category');
                this.currentCategory = category;
                this.renderMenu(category);
            });
        });
    }

    initializeCart() {
        // Cart toggle
        const cartToggle = document.getElementById('cartToggle');
        const cartSidebar = document.getElementById('cartSidebar');
        const cartClose = document.getElementById('cartClose');
        const cartOverlay = document.getElementById('cartOverlay');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (cartToggle) {
            cartToggle.style.display = 'block';
            cartToggle.addEventListener('click', () => this.toggleCart());
        }

        if (cartClose) {
            cartClose.addEventListener('click', () => this.toggleCart());
        }

        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => this.toggleCart());
        }

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');

        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.toggle('active');
            cartOverlay.classList.toggle('active');
        }
    }

    addToCart(itemId) {
        const item = this.menu.find(i => i.id === itemId);
        if (!item) return;

        // Check if item already in cart
        const existingItem = this.cart.find(i => i.id === itemId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.push({ ...item, quantity: 1 });
        }

        this.updateCartUI();
        this.saveCart();
        showNotification(`${item.name} added to cart!`, 'success');
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.updateCartUI();
        this.saveCart();
    }

    updateQuantity(itemId, change) {
        const item = this.cart.find(i => i.id === itemId);
        if (!item) return;

        item.quantity += change;

        if (item.quantity <= 0) {
            this.removeFromCart(itemId);
        } else {
            this.updateCartUI();
            this.saveCart();
        }
    }

    updateCartUI() {
        const cartItems = document.getElementById('cartItems');
        const cartBadge = document.getElementById('cartBadge');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (!cartItems) return;

        // Update badge
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartBadge) {
            cartBadge.textContent = totalItems;
        }

        // Update cart items
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-light);">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3;"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item" style="display: flex; gap: 15px; padding: 15px; background: var(--light); border-radius: 10px; margin-bottom: 10px;">
                    <div class="cart-item-icon" style="width: 50px; height: 50px; background: linear-gradient(135deg, ${this.getCategoryColor(item.category)}); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas ${item.icon}" style="color: white; font-size: 1.5rem;"></i>
                    </div>
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 5px 0; font-size: 1rem;">${item.name}</h4>
                        <p style="margin: 0; font-size: 0.9rem; color: var(--text-light);">${item.price.toFixed(2)} JOD each</p>
                        <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
                            <button class="qty-btn" data-item-id="${item.id}" data-change="-1" style="width: 25px; height: 25px; border: 1px solid var(--primary); background: white; color: var(--primary); border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-minus" style="font-size: 0.7rem;"></i>
                            </button>
                            <span style="min-width: 30px; text-align: center; font-weight: bold;">${item.quantity}</span>
                            <button class="qty-btn" data-item-id="${item.id}" data-change="1" style="width: 25px; height: 25px; border: 1px solid var(--primary); background: var(--primary); color: white; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-plus" style="font-size: 0.7rem;"></i>
                            </button>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: var(--primary);">${(item.price * item.quantity).toFixed(2)} JOD</p>
                        <button class="remove-btn" data-item-id="${item.id}" style="background: none; border: none; color: var(--danger); cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            // Add event listeners
            document.querySelectorAll('.qty-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemId = e.currentTarget.getAttribute('data-item-id');
                    const change = parseInt(e.currentTarget.getAttribute('data-change'));
                    this.updateQuantity(itemId, change);
                });
            });

            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemId = e.currentTarget.getAttribute('data-item-id');
                    this.removeFromCart(itemId);
                });
            });

            if (checkoutBtn) checkoutBtn.disabled = false;
        }

        // Update total
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotal) {
            cartTotal.textContent = `${total.toFixed(2)} JOD`;
        }
    }

    async checkout() {
        if (!window.authManager || !window.authManager.currentUser) {
            showNotification('Please sign in to place an order', 'error');
            window.authManager?.showLoginModal();
            this.toggleCart();
            return;
        }

        if (this.cart.length === 0) {
            showNotification('Your cart is empty', 'error');
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Check credit
        if (window.authManager.userCredit < total) {
            showNotification(
                `Insufficient credit. You need ${total.toFixed(2)} JOD but only have ${window.authManager.userCredit.toFixed(2)} JOD`,
                'error'
            );
            return;
        }

        // Create order
        const order = {
            id: Date.now(),
            userId: window.authManager.currentUser.id,
            items: this.cart.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity
            })),
            total: total,
            status: 'pending',
            createdAt: new Date().toISOString(),
            orderNumber: 'CF' + Date.now().toString().slice(-6)
        };

        // Save order
        await this.saveOrder(order);

        // Add to payment history
        if (window.db) {
            await window.db.create('paymentHistory', {
                userId: window.authManager.currentUser.id,
                date: new Date().toISOString(),
                description: `Cafeteria Order #${order.orderNumber}`,
                amount: total,
                type: 'cafeteria'
            });
        } else {
            // Fallback to localStorage
            const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
            paymentHistory.push({
                userId: window.authManager.currentUser.id,
                date: new Date().toISOString(),
                description: `Cafeteria Order #${order.orderNumber}`,
                amount: total,
                type: 'cafeteria'
            });
            localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));
        }

        // Deduct from credit
        const newCreditAmount = window.authManager.userCredit - total;
        await window.authManager.updateCredit(newCreditAmount);
        window.authManager.updateAuthUI();

        // Clear cart
        this.cart = [];
        this.updateCartUI();
        this.saveCart();
        this.toggleCart();

        showNotification(
            `Order placed successfully! ${total.toFixed(2)} JOD deducted. Order #${order.orderNumber}`,
            'success'
        );
    }

    async saveOrder(order) {
        if (window.db) {
            await window.db.create('cafeteriaOrders', order);
        } else {
            // Fallback to localStorage
            let cafeteriaOrders = JSON.parse(localStorage.getItem('cafeteriaOrders') || '[]');
            cafeteriaOrders.push(order);
            localStorage.setItem('cafeteriaOrders', JSON.stringify(cafeteriaOrders));
        }
    }

    saveCart() {
        localStorage.setItem('cafeteriaCart', JSON.stringify(this.cart));
    }

    loadSavedCart() {
        try {
            const savedCart = localStorage.getItem('cafeteriaCart');
            if (savedCart) {
                this.cart = JSON.parse(savedCart);
                this.updateCartUI();
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }
}

// Initialize cafeteria manager
document.addEventListener('DOMContentLoaded', function() {
    window.cafeteriaManager = new CafeteriaManager();
});
