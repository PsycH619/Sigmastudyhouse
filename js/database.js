// Printing services functionality
document.addEventListener('DOMContentLoaded', function() {
    initializePrintingSystem();
});

function initializePrintingSystem() {
    const fileUpload = document.getElementById('fileUpload');
    const fileList = document.getElementById('fileList');
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    let uploadedFiles = [];
    
    // File upload handling
    fileUpload.addEventListener('change', function(e) {
        handleFileUpload(e.target.files);
    });
    
    // Drag and drop functionality
    const uploadArea = document.querySelector('.upload-area');
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.backgroundColor = 'var(--light)';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.style.backgroundColor = '';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.backgroundColor = '';
        handleFileUpload(e.dataTransfer.files);
    });
    
    // Update cost when options change
    document.querySelectorAll('#printType, #paperSize, #printSides, #copies, #binding, #urgency').forEach(element => {
        element.addEventListener('change', updatePrintingCost);
    });
    
    // Add to cart functionality
    addToCartBtn.addEventListener('click', addToCart);
    
    function handleFileUpload(files) {
        if (files.length === 0) return;
        
        for (let file of files) {
            // Check file type
            const validTypes = ['application/pdf', 'application/msword', 
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                              'application/vnd.ms-powerpoint',
                              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                              'image/jpeg', 'image/jpg', 'image/png'];
            
            if (!validTypes.includes(file.type)) {
                showNotification(`File type not supported: ${file.name}`, 'error');
                continue;
            }
            
            // Check file size (50MB limit)
            if (file.size > 50 * 1024 * 1024) {
                showNotification(`File too large: ${file.name} (max 50MB)`, 'error');
                continue;
            }
            
            uploadedFiles.push({
                file: file,
                id: Date.now() + Math.random(),
                name: file.name,
                size: formatFileSize(file.size),
                pages: estimatePages(file) // This would be more accurate with a backend
            });
        }
        
        updateFileList();
        updatePrintingCost();
    }
    
    function updateFileList() {
        fileList.innerHTML = '';
        
        if (uploadedFiles.length === 0) {
            fileList.innerHTML = '<p style="color: var(--text-light); font-style: italic;">No files uploaded</p>';
            addToCartBtn.disabled = true;
            return;
        }
        
        uploadedFiles.forEach((fileData, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item';
            fileElement.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background-color: var(--light);
                border-radius: 5px;
                margin-bottom: 10px;
            `;
            
            fileElement.innerHTML = `
                <div>
                    <strong>${fileData.name}</strong>
                    <div style="font-size: 0.8rem; color: var(--text-light);">
                        ${fileData.size} • ${fileData.pages} pages
                    </div>
                </div>
                <button class="btn-remove" data-index="${index}" style="background: none; border: none; color: var(--accent); cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            fileList.appendChild(fileElement);
        });
        
        // Add remove functionality
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                uploadedFiles.splice(index, 1);
                updateFileList();
                updatePrintingCost();
            });
        });
        
        addToCartBtn.disabled = false;
    }
    
    function estimatePages(file) {
        // Simple estimation - in a real app, this would be more accurate
        const sizeInMB = file.size / (1024 * 1024);
        let estimatedPages = Math.max(1, Math.round(sizeInMB * 2));
        
        // Adjust based on file type
        if (file.type.includes('image')) {
            estimatedPages = 1; // Images are typically 1 page
        } else if (file.type.includes('presentation')) {
            estimatedPages = Math.max(1, Math.round(sizeInMB * 5)); // PPT files have more slides
        }
        
        return estimatedPages;
    }
    
    function updatePrintingCost() {
        if (uploadedFiles.length === 0) {
            document.getElementById('estimatedCost').textContent = '0.00 JOD';
            document.getElementById('pageCount').textContent = '0 pages';
            return;
        }
        
        const printType = document.getElementById('printType').value;
        const paperSize = document.getElementById('paperSize').value;
        const printSides = document.getElementById('printSides').value;
        const copies = parseInt(document.getElementById('copies').value) || 1;
        const binding = document.getElementById('binding').value;
        const urgency = document.getElementById('urgency').value;
        
        let totalPages = uploadedFiles.reduce((sum, file) => sum + file.pages, 0) * copies;
        let cost = 0;
        
        // Base printing cost
        const basePrice = printType === 'bw' ? 0.10 : 0.50;
        cost += totalPages * basePrice;
        
        // Paper size multiplier
        if (paperSize === 'a3') cost *= 2;
        
        // Double-sided discount
        if (printSides === 'double') cost *= 0.8;
        
        // Binding cost
        const bindingCosts = {
            'none': 0,
            'stapled': 1,
            'spiral': 5,
            'hardcover': 15
        };
        cost += bindingCosts[binding];
        
        // Urgency multiplier
        const urgencyMultipliers = {
            'standard': 1,
            'express': 1.5,
            'urgent': 2
        };
        cost *= urgencyMultipliers[urgency];
        
        document.getElementById('estimatedCost').textContent = `${cost.toFixed(2)} JOD`;
        document.getElementById('pageCount').textContent = `${totalPages} pages`;
    }
    
    function addToCart() {
        if (!currentUser) {
            showLoginModal();
            return;
        }
        
        if (uploadedFiles.length === 0) {
            showNotification('Please upload files first', 'error');
            return;
        }
        
        const printType = document.getElementById('printType').value;
        const paperSize = document.getElementById('paperSize').value;
        const printSides = document.getElementById('printSides').value;
        const copies = parseInt(document.getElementById('copies').value) || 1;
        const binding = document.getElementById('binding').value;
        const urgency = document.getElementById('urgency').value;
        
        const totalPages = uploadedFiles.reduce((sum, file) => sum + file.pages, 0) * copies;
        const cost = parseFloat(document.getElementById('estimatedCost').textContent);
        
        // Check if user has enough credit
        if (userCredit < cost) {
            showNotification(`Insufficient credit. You need ${cost.toFixed(2)} JOD but only have ${userCredit.toFixed(2)} JOD. Please add credit to your account.`, 'error');
            return;
        }
        
        // Create printing order
        const order = {
            id: Date.now(),
            files: uploadedFiles.map(f => ({ name: f.name, pages: f.pages })),
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
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage (in real app, send to backend)
        let printingOrders = JSON.parse(localStorage.getItem('printingOrders')) || [];
        printingOrders.push(order);
        localStorage.setItem('printingOrders', JSON.stringify(printingOrders));
        
        // Deduct cost from credit
        userCredit -= cost;
        localStorage.setItem('userCredit', JSON.stringify(userCredit));
        
        // Update UI
        updateAuthUI();
        
        showNotification(`Printing order submitted! ${cost.toFixed(2)} JOD deducted from your account.`, 'success');
        
        // Reset form
        uploadedFiles = [];
        updateFileList();
        document.getElementById('printingOptions').reset();
        updatePrintingCost();
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}