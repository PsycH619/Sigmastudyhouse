// Printing services functionality
class PrintingManager {
    constructor() {
        this.uploadedFiles = [];
        this.printingPrices = {
            'bw': { a4: 0.10, a3: 0.20 },
            'color': { a4: 0.50, a3: 1.00 }
        };
        
        this.bindingPrices = {
            'none': 0,
            'stapled': 1,
            'spiral': 5,
            'hardcover': 15
        };
        
        this.init();
    }

    init() {
        this.initializeFileUpload();
        this.initializePrintingOptions();
        this.initializeCartFunctionality();
    }

    initializeFileUpload() {
        const fileUpload = document.getElementById('fileUpload');
        const fileList = document.getElementById('fileList');
        const uploadArea = document.querySelector('.upload-area');

        if (!fileUpload || !fileList || !uploadArea) return;

        // File input change event
        fileUpload.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Drag and drop functionality
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = 'var(--light)';
            uploadArea.style.borderColor = 'var(--primary)';
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = '';
            uploadArea.style.borderColor = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = '';
            uploadArea.style.borderColor = '';
            this.handleFileUpload(e.dataTransfer.files);
        });
    }

    initializePrintingOptions() {
        // Update cost when options change
        const optionElements = ['printType', 'paperSize', 'printSides', 'copies', 'binding', 'urgency'];
        
        optionElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.updatePrintingCost());
            }
        });

        // Copies input
        const copiesInput = document.getElementById('copies');
        if (copiesInput) {
            copiesInput.addEventListener('input', () => this.updatePrintingCost());
        }
    }

    initializeCartFunctionality() {
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.addToCart());
        }
    }

    handleFileUpload(files) {
        if (files.length === 0) return;

        for (let file of files) {
            // Check file type
            const validTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'image/jpeg',
                'image/jpg',
                'image/png'
            ];

            if (!validTypes.includes(file.type)) {
                showNotification(`File type not supported: ${file.name}`, 'error');
                continue;
            }

            // Check file size (50MB limit)
            if (file.size > 50 * 1024 * 1024) {
                showNotification(`File too large: ${file.name} (max 50MB)`, 'error');
                continue;
            }

            // Add to uploaded files
            this.uploadedFiles.push({
                file: file,
                id: Date.now() + Math.random(),
                name: file.name,
                size: this.formatFileSize(file.size),
                pages: this.estimatePages(file),
                type: file.type
            });
        }

        this.updateFileList();
        this.updatePrintingCost();
    }

    updateFileList() {
        const fileList = document.getElementById('fileList');
        const addToCartBtn = document.getElementById('addToCartBtn');

        if (!fileList) return;

        fileList.innerHTML = '';

        if (this.uploadedFiles.length === 0) {
            fileList.innerHTML = '<p style="color: var(--text-light); font-style: italic; text-align: center; padding: 20px;">No files uploaded</p>';
            if (addToCartBtn) addToCartBtn.disabled = true;
            return;
        }

        this.uploadedFiles.forEach((fileData, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item';
            fileElement.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: var(--light);
                border-radius: 10px;
                margin-bottom: 10px;
                border: 1px solid rgba(255,107,53,0.1);
                transition: var(--transition);
            `;

            fileElement.innerHTML = `
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <i class="${this.getFileIcon(fileData.type)}" style="color: var(--primary);"></i>
                        <strong style="color: var(--text);">${fileData.name}</strong>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-light);">
                        ${fileData.size} • ${fileData.pages} pages
                    </div>
                </div>
                <button class="btn-remove" data-index="${index}" 
                        style="background: none; border: none; color: var(--danger); cursor: pointer; padding: 8px; border-radius: 5px; transition: var(--transition);">
                    <i class="fas fa-times"></i>
                </button>
            `;

            fileList.appendChild(fileElement);
        });

        // Add remove functionality
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                this.uploadedFiles.splice(index, 1);
                this.updateFileList();
                this.updatePrintingCost();
            });
        });

        if (addToCartBtn) addToCartBtn.disabled = false;
    }

    getFileIcon(fileType) {
        const icons = {
            'pdf': 'fas fa-file-pdf',
            'word': 'fas fa-file-word',
            'powerpoint': 'fas fa-file-powerpoint',
            'image': 'fas fa-file-image'
        };

        if (fileType.includes('pdf')) return icons.pdf;
        if (fileType.includes('word')) return icons.word;
        if (fileType.includes('powerpoint')) return icons.powerpoint;
        if (fileType.includes('image')) return icons.image;
        
        return 'fas fa-file';
    }

    estimatePages(file) {
        // Simple estimation - in a real app, this would be more accurate
        const sizeInMB = file.size / (1024 * 1024);
        let estimatedPages = Math.max(1, Math.round(sizeInMB * 2));

        // Adjust based on file type
        if (file.type.includes('image')) {
            estimatedPages = 1;
        } else if (file.type.includes('presentation')) {
            estimatedPages = Math.max(1, Math.round(sizeInMB * 5));
        }

        return estimatedPages;
    }

    updatePrintingCost() {
        if (this.uploadedFiles.length === 0) {
            this.updateCostDisplay(0, 0);
            return;
        }

        const printType = document.getElementById('printType')?.value || 'bw';
        const paperSize = document.getElementById('paperSize')?.value || 'a4';
        const printSides = document.getElementById('printSides')?.value || 'single';
        const copies = parseInt(document.getElementById('copies')?.value) || 1;
        const binding = document.getElementById('binding')?.value || 'none';
        const urgency = document.getElementById('urgency')?.value || 'standard';

        let totalPages = this.uploadedFiles.reduce((sum, file) => sum + file.pages, 0) * copies;
        let cost = 0;

        // Base printing cost
        const basePrice = this.printingPrices[printType]?.[paperSize] || 0.10;
        cost += totalPages * basePrice;

        // Double-sided discount
        if (printSides === 'double') {
            cost *= 0.8; // 20% discount for double-sided
        }

        // Binding cost
        cost += this.bindingPrices[binding] || 0;

        // Urgency multiplier
        const urgencyMultipliers = {
            'standard': 1,
            'express': 1.5,
            'urgent': 2
        };
        cost *= urgencyMultipliers[urgency] || 1;

        this.updateCostDisplay(cost, totalPages);
    }

    updateCostDisplay(cost, totalPages) {
        const estimatedCost = document.getElementById('estimatedCost');
        const pageCount = document.getElementById('pageCount');

        if (estimatedCost) {
            estimatedCost.textContent = `${cost.toFixed(2)} JOD`;
        }

        if (pageCount) {
            pageCount.textContent = `${totalPages} pages`;
        }
    }

    async addToCart() {
        if (!window.authManager?.currentUser) {
            showNotification('Please sign in to add printing to cart', 'error');
            window.authManager?.showLoginModal();
            return;
        }

        if (this.uploadedFiles.length === 0) {
            showNotification('Please upload files first', 'error');
            return;
        }

        const printType = document.getElementById('printType')?.value || 'bw';
        const paperSize = document.getElementById('paperSize')?.value || 'a4';
        const printSides = document.getElementById('printSides')?.value || 'single';
        const copies = parseInt(document.getElementById('copies')?.value) || 1;
        const binding = document.getElementById('binding')?.value || 'none';
        const urgency = document.getElementById('urgency')?.value || 'standard';

        const totalPages = this.uploadedFiles.reduce((sum, file) => sum + file.pages, 0) * copies;
        const cost = parseFloat(document.getElementById('estimatedCost')?.textContent) || 0;

        // Check if user has enough credit
        if (window.authManager.userCredit < cost) {
            showNotification(
                `Insufficient credit. You need ${cost.toFixed(2)} JOD but only have ${window.authManager.userCredit.toFixed(2)} JOD. Please add credit to your account.`,
                'error'
            );
            return;
        }

        // Create printing order
        const order = {
            id: Date.now(),
            userId: window.authManager.currentUser.id,
            files: this.uploadedFiles.map(f => ({ 
                name: f.name, 
                pages: f.pages,
                size: f.size
            })),
            options: {
                printType,
                paperSize,
                printSides,
                copies,
                binding,
                urgency
            },
            totalPages,
            cost,
            status: 'pending',
            createdAt: new Date().toISOString(),
            orderNumber: 'PO' + Date.now().toString().slice(-6)
        };

        // Save order
        await this.savePrintingOrder(order);

        // Deduct cost from credit
        window.authManager.userCredit -= cost;
        await window.authManager.saveToDatabase('userCredit', window.authManager.userCredit);

        // Update UI
        window.authManager.updateAuthUI();

        showNotification(
            `Printing order submitted! ${cost.toFixed(2)} JOD deducted from your account. Order #${order.orderNumber}`,
            'success'
        );

        // Reset form
        this.resetPrintingForm();
    }

    async savePrintingOrder(order) {
        let printingOrders = await window.authManager.loadFromDatabase('printingOrders') || [];
        printingOrders.push(order);
        await window.authManager.saveToDatabase('printingOrders', printingOrders);
    }

    resetPrintingForm() {
        this.uploadedFiles = [];
        this.updateFileList();
        this.updatePrintingCost();

        // Reset form inputs to defaults
        const form = document.querySelector('.printing-options');
        if (form) {
            const inputs = form.querySelectorAll('select, input');
            inputs.forEach(input => {
                if (input.type === 'number') {
                    input.value = input.min || 1;
                } else if (input.tagName === 'SELECT') {
                    input.selectedIndex = 0;
                }
            });
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize printing manager
document.addEventListener('DOMContentLoaded', function() {
    window.printingManager = new PrintingManager();
});