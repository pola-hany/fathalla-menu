// تطبيق مطبخ فتح الله ماركت - النسخة النهائية مع التعديلات
const FathallaApp = {
    // البيانات (سيتم تحميلها من JSON)
    data: null,
    cart: [],
    whatsappNumber: null,
    timeInterval: null,
    dataLoaded: false,
    
    // التهيئة
    init() {
        console.log('🚀 بدء تشغيل تطبيق فتح الله ماركت');
        this.loadData();
        this.loadCart();
        this.bindEvents();
        this.updateCartDisplay();
    },
    
    // تحميل البيانات من ملف JSON
    async loadData() {
        try {
            console.log('📦 جاري تحميل البيانات من menu-data.json...');
            
            const response = await fetch('menu-data.json');
            
            if (!response.ok) {
                throw new Error(`خطأ HTTP: ${response.status} ${response.statusText}`);
            }
            
            const text = await response.text();
            
            // التحقق من أن الملف ليس فارغاً
            if (!text.trim()) {
                throw new Error('ملف JSON فارغ');
            }
            
            // تحليل JSON
            this.data = JSON.parse(text);
            
            // التحقق من هيكل البيانات الأساسي
            if (!this.data || typeof this.data !== 'object') {
                throw new Error('بيانات JSON غير صالحة');
            }
            
            // تعيين رقم الواتساب من البيانات
            if (this.data.brand && this.data.brand.phone) {
                this.whatsappNumber = this.data.brand.phone;
                console.log('📞 رقم الواتساب:', this.whatsappNumber);
            } else {
                this.whatsappNumber = "201234567890";
            }
            
            // تهيئة البيانات إذا كانت غير موجودة
            if (!this.data.sections) this.data.sections = [];
            if (!this.data.menu_items) this.data.menu_items = [];
            if (!this.data.offers) this.data.offers = [];
            
            this.dataLoaded = true;
            this.renderApp();
            
            console.log('✅ تم تحميل البيانات بنجاح:', {
                أقسام: this.data.sections.length,
                أصناف: this.data.menu_items.length,
                عروض: this.data.offers.length
            });
            
        } catch (error) {
            console.error("❌ خطأ في تحميل البيانات من JSON:", error);
            this.showMessage("حدث خطأ في تحميل البيانات. جاري استخدام البيانات الافتراضية.", "error");
            this.useDefaultData();
        }
    },
    
    // استخدام بيانات افتراضية عند فشل التحميل
    useDefaultData() {
        console.log('🔄 استخدام البيانات الافتراضية...');
        
        this.data = {
            brand: {
                name: "مطبخ فتح الله ماركت",
                phone: "201234567890",
                description: "نقدم أشهى المأكولات بأجود المكونات وأعلى معايير الجودة",
                colors: {
                    primary: "#FF6B00",
                    secondary: "#000000",
                    accent: "#FFFFFF"
                }
            },
            sections: [
                { id: "grills", name: "المشويات", icon: "fas fa-fire" },
                { id: "meals", name: "الوجبات", icon: "fas fa-utensils" },
                { id: "sandwiches", name: "السندوتشات", icon: "fas fa-bread-slice" },
                { id: "extras", name: "الإضافات", icon: "fas fa-plus-circle" },
                { id: "drinks", name: "المشروبات", icon: "fas fa-glass-whiskey" }
            ],
            menu_items: [
                {
                    id: 1,
                    name: "شيش طاووق",
                    description: "دجاج مشوي مع الخضار والتوابل الخاصة",
                    price: 65.00,
                    offerPrice: 55.00,
                    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop",
                    category: "grills",
                    available: true,
                    badge: "الأكثر طلباً",
                    popular: true
                },
                {
                    id: 2,
                    name: "كفتة مشوية",
                    description: "كفتة لحم ضأن مشوية على الفحم",
                    price: 70.00,
                    offerPrice: 60.00,
                    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
                    category: "grills",
                    available: true,
                    badge: "عرض",
                    popular: false
                }
            ],
            offers: [
                {
                    id: "offer1",
                    title: "عرض العائلة",
                    description: "وجبتين مشويات + إضافتين + مشروبان",
                    originalPrice: 180,
                    offerPrice: 150,
                    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&h=400&fit=crop"
                }
            ]
        };
        
        this.dataLoaded = true;
        this.renderApp();
    },
    
    // تحديث الوقت الحالي
    updateCurrentTime() {
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const timeString = `${hours}:${minutes}`;
            
            const display = document.getElementById('currentTimeDisplay');
            if (display) {
                display.textContent = timeString;
            }
            
            // تحديث حقل الوقت الأدنى
            const timeInput = document.getElementById('pickupTime');
            if (timeInput) {
                // إضافة 30 دقيقة للوقت الحالي كحد أدنى
                const minTime = new Date(now.getTime() + 30 * 60000);
                const minHours = minTime.getHours().toString().padStart(2, '0');
                const minMinutes = minTime.getMinutes().toString().padStart(2, '0');
                timeInput.min = `${minHours}:${minMinutes}`;
                
                // تعيين القيمة التلقائية فقط إذا كانت فارغة
                if (!timeInput.value) {
                    timeInput.value = `${minHours}:${minMinutes}`;
                }
            }
        };
        
        // تحديث الوقت الآن
        updateTime();
        
        // تنظيف أي interval سابق
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
        
        // تعيين interval جديد (كل دقيقة)
        this.timeInterval = setInterval(updateTime, 60000);
    },
    
    // تنظيف الـ intervals
    cleanup() {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
    },
    
    // تحميل السلة من الذاكرة
    loadCart() {
        try {
            const saved = localStorage.getItem("fathallaCart");
            if (saved) {
                this.cart = JSON.parse(saved);
                console.log(`🛒 تم تحميل ${this.cart.length} عنصر من السلة`);
            }
        } catch (e) {
            console.error('❌ خطأ في تحميل السلة:', e);
            this.cart = [];
        }
    },
    
    // حفظ السلة
    saveCart() {
        try {
            localStorage.setItem("fathallaCart", JSON.stringify(this.cart));
        } catch (e) {
            console.error('❌ خطأ في حفظ السلة:', e);
        }
    },
    
    // ربط الأحداث
    bindEvents() {
        console.log('🔗 ربط الأحداث...');
        
        // زر القائمة المتنقلة
        const navToggle = document.getElementById("navToggle");
        const navLinks = document.getElementById("navLinks");
        
        if (navToggle && navLinks) {
            navToggle.addEventListener("click", () => {
                navLinks.classList.toggle("show");
            });
        }
        
        // التنقل الناعم
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener("click", function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute("href"));
                if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                }
            });
        });
        
        // تغيير طريقة الاستلام
        document.querySelectorAll('input[name="addressType"]').forEach(radio => {
            radio.addEventListener("change", (e) => {
                const type = e.target.value;
                document.getElementById("insideAddress").style.display = type === "inside" ? "block" : "none";
                document.getElementById("outsideAddress").style.display = type === "outside" ? "block" : "none";
                document.getElementById("branchAddress").style.display = type === "branch" ? "block" : "none";
                
                // إذا كان استلام من الفرع، تحديث الوقت
                if (type === "branch") {
                    this.updateCurrentTime();
                }
                
                this.validateForm();
                this.updateOrderSummary();
                this.updateMobileCartContent();
            });
        });
        
        // تحقق من النموذج
        ["customerName", "customerPhone"].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener("input", () => {
                    requestAnimationFrame(() => this.validateForm());
                });
            }
        });
        
        // تحقق من وقت الاستلام
        const pickupTimeInput = document.getElementById("pickupTime");
        if (pickupTimeInput) {
            pickupTimeInput.addEventListener("change", () => {
                requestAnimationFrame(() => {
                    this.validatePickupTime();
                    this.validateForm();
                });
            });
        }
        
        // تحقق من الحقول الرقمية داخل الرحاب
        ["group", "building", "apartment"].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener("input", (e) => {
                    this.validateNumericField(e.target);
                    requestAnimationFrame(() => this.validateForm());
                });
                
                // منع إدخال حروف
                element.addEventListener("keypress", (e) => {
                    const charCode = e.which ? e.which : e.keyCode;
                    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                        e.preventDefault();
                        return false;
                    }
                    return true;
                });
            }
        });
        
        // إرسال الطلب
        const orderForm = document.getElementById("orderForm");
        if (orderForm) {
            orderForm.addEventListener("submit", (e) => {
                e.preventDefault();
                requestAnimationFrame(() => this.submitOrder());
            });
        }
        
        // زر الطلب العائم
        const floatingBtn = document.getElementById("floatingOrderBtn");
        if (floatingBtn) {
            floatingBtn.addEventListener("click", () => {
                document.getElementById("order").scrollIntoView({ behavior: "smooth" });
            });
        }
        
        // أحداث فاتورة الجوال
        const mobileCartToggle = document.getElementById("mobileCartToggle");
        const closeCartSummary = document.getElementById("closeCartSummary");
        const cartSummaryMobile = document.getElementById("cartSummaryMobile");
        
        if (mobileCartToggle && cartSummaryMobile) {
            mobileCartToggle.addEventListener("click", () => {
                cartSummaryMobile.classList.add("show");
                document.body.style.overflow = "hidden";
            });
        }
        
        if (closeCartSummary && cartSummaryMobile) {
            closeCartSummary.addEventListener("click", () => {
                cartSummaryMobile.classList.remove("show");
                document.body.style.overflow = "auto";
            });
        }
        
        // إغلاق فاتورة الجوال عند النقر خارجها
        if (cartSummaryMobile) {
            cartSummaryMobile.addEventListener("click", (e) => {
                if (e.target === cartSummaryMobile) {
                    cartSummaryMobile.classList.remove("show");
                    document.body.style.overflow = "auto";
                }
            });
        }
        
        // تنظيف عند الخروج
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    },
    
    // التحقق من الحقول الرقمية
    validateNumericField(field) {
        const value = field.value.trim();
        const errorElement = document.getElementById(field.id + "Error");
        
        if (!value) {
            if (errorElement) errorElement.textContent = "";
            field.classList.remove("error");
            return true;
        }
        
        // التحقق من أن القيمة تحتوي على أرقام فقط
        const numericRegex = /^[0-9]+$/;
        if (!numericRegex.test(value)) {
            if (errorElement) errorElement.textContent = "يجب أن يحتوي على أرقام فقط";
            field.classList.add("error");
            return false;
        }
        
        if (errorElement) errorElement.textContent = "";
        field.classList.remove("error");
        return true;
    },
    
    // التحقق من وقت الاستلام
    validatePickupTime() {
        const pickupTimeInput = document.getElementById("pickupTime");
        if (!pickupTimeInput) return true;
        
        const selectedTime = pickupTimeInput.value;
        if (!selectedTime) return false;
        
        const now = new Date();
        const [hours, minutes] = selectedTime.split(':').map(Number);
        const selectedDate = new Date();
        selectedDate.setHours(hours, minutes, 0, 0);
        
        // إضافة 30 دقيقة للوقت الحالي كحد أدنى
        const minTime = new Date(now.getTime() + 30 * 60000);
        
        if (selectedDate < minTime) {
            this.showMessage('يجب اختيار وقت استلام بعد الوقت الحالي ب30 دقيقة على الأقل', 'error');
            pickupTimeInput.value = pickupTimeInput.min;
            return false;
        }
        
        return true;
    },
    
    // عرض التطبيق
    renderApp() {
        if (!this.dataLoaded) {
            console.log('⏳ جاري تحميل البيانات...');
            const menuGrid = document.getElementById("menuGrid");
            if (menuGrid) {
                menuGrid.innerHTML = '<div class="loading">جاري تحميل القائمة...</div>';
            }
            return;
        }
        
        this.renderFilters();
        this.renderMenu();
        this.renderOffers();
        this.updateOrderSummary();
        this.updateBrandInfo();
    },
    
    // تحديث معلومات العلامة التجارية
    updateBrandInfo() {
        if (!this.data || !this.data.brand) return;
        
        // تحديث عنوان الصفحة
        document.title = this.data.brand.name + " | قائمة الطعام الرسمية";
        
        // تحديث الهيدر
        const brandName = document.querySelector('.brand-name h1');
        if (brandName && this.data.brand.name) {
            brandName.textContent = this.data.brand.name;
        }
        
        // تحديث الفوتر
        const footerBrand = document.querySelector('.footer-logo h3');
        if (footerBrand && this.data.brand.name) {
            footerBrand.textContent = this.data.brand.name;
        }
        
        // تحديث الوصف في الفوتر
        const footerDesc = document.querySelector('.footer-desc');
        if (footerDesc && this.data.brand.description) {
            footerDesc.textContent = this.data.brand.description;
        }
    },
    
    // عرض الفلاتر
    renderFilters() {
        const container = document.getElementById("categoryFilters");
        if (!container) return;
        
        if (!this.data.sections || this.data.sections.length === 0) {
            container.innerHTML = '<button class="category-btn active" data-category="all"><i class="fas fa-th-large"></i><span>كل الأصناف</span></button>';
            return;
        }
        
        let html = `
            <button class="category-btn active" data-category="all">
                <i class="fas fa-th-large"></i>
                <span>كل الأصناف</span>
            </button>
        `;
        
        this.data.sections.forEach(section => {
            html += `
                <button class="category-btn" data-category="${section.id}">
                    <i class="${section.icon || 'fas fa-utensils'}"></i>
                    <span>${section.name}</span>
                </button>
            `;
        });
        
        container.innerHTML = html;
        
        // أحداث الفلاتر
        container.querySelectorAll(".category-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const category = e.currentTarget.dataset.category;
                
                // تحديث الأزرار النشطة
                container.querySelectorAll(".category-btn").forEach(b => {
                    b.classList.remove("active");
                });
                e.currentTarget.classList.add("active");
                
                // تصفية القائمة
                this.filterMenu(category);
            });
        });
    },
    
    // عرض القائمة
    renderMenu() {
        const container = document.getElementById("menuGrid");
        if (!container) return;
        
        if (!this.data.menu_items || this.data.menu_items.length === 0) {
            container.innerHTML = `
                <div class="loading" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-utensils" style="font-size: 3rem; color: #ddd; margin-bottom: 20px;"></i>
                    <p>لا توجد أصناف في القائمة حالياً</p>
                    <small>سيتم إضافة الأصناف قريباً</small>
                </div>
            `;
            return;
        }
        
        let html = "";
        
        this.data.menu_items.forEach(item => {
            // التحقق من وجود البيانات المطلوبة
            if (!item.id || !item.name) {
                console.warn('⚠️ صنف ناقص البيانات:', item);
                return;
            }
            
            const hasOffer = item.offerPrice !== null && item.offerPrice !== undefined && item.offerPrice < item.price;
            const finalPrice = hasOffer ? item.offerPrice : item.price;
            const cartItem = this.cart.find(c => c.id === item.id);
            const quantity = cartItem ? cartItem.quantity : 0;
            const isAvailable = item.available !== false;
            
            html += `
                <div class="menu-item ${!isAvailable ? 'unavailable' : ''}" data-category="${item.category || 'uncategorized'}" data-id="${item.id}">
                    ${item.badge ? `<div class="item-badge ${item.popular ? 'popular' : ''}">${item.badge}</div>` : ""}
                    
                    <button class="item-toggle" title="${isAvailable ? 'إخفاء' : 'إظهار'}" data-id="${item.id}">
                        <i class="fas fa-${isAvailable ? 'eye' : 'eye-slash'}"></i>
                    </button>
                    
                    <div class="item-image">
                        <img src="${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}" 
                             alt="${item.name}" 
                             class="item-img" 
                             loading="lazy"
                             onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'">
                    </div>
                    
                    <div class="item-content">
                        <h3 class="item-title">${item.name}</h3>
                        <p class="item-desc">${item.description || 'وصف غير متوفر'}</p>
                        
                        <div class="item-pricing">
                            <div class="price-wrapper">
                                ${hasOffer ? `<span class="original-price">${item.price?.toFixed(2) || '0.00'} ج.م</span>` : ""}
                                <span class="current-price">${finalPrice?.toFixed(2) || '0.00'} ج.م</span>
                                ${hasOffer ? '<span class="offer-tag">عرض</span>' : ""}
                            </div>
                            
                            <div class="item-controls">
                                <div class="quantity-selector">
                                    <button class="qty-btn minus" data-id="${item.id}" ${!isAvailable ? 'disabled' : ''}>
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <span class="qty-value" data-id="${item.id}">${quantity}</span>
                                    <button class="qty-btn plus" data-id="${item.id}" ${!isAvailable ? 'disabled' : ''}>
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                                
                                <button class="add-btn ${quantity > 0 ? 'added' : ''}" data-id="${item.id}" ${!isAvailable ? 'disabled' : ''}>
                                    <i class="fas fa-${quantity > 0 ? 'check' : 'cart-plus'}"></i>
                                    <span>${quantity > 0 ? 'مضاف' : isAvailable ? 'أضف للسلة' : 'غير متوفر'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // ربط أحداث الأصناف
        this.bindItemEvents();
    },
    
    // عرض العروض
    renderOffers() {
        const container = document.getElementById("offersGrid");
        if (!container) return;
        
        if (!this.data.offers || this.data.offers.length === 0) {
            container.innerHTML = `
                <div class="offer-card" style="text-align: center; padding: 40px 20px; grid-column: 1 / -1;">
                    <i class="fas fa-tags" style="font-size: 3rem; color: #ddd; margin-bottom: 20px;"></i>
                    <p>لا توجد عروض خاصة حالياً</p>
                    <small>تابعونا للعروض القادمة</small>
                </div>
            `;
            return;
        }
        
        let html = "";
        
        this.data.offers.forEach(offer => {
            // التحقق من وجود البيانات المطلوبة
            if (!offer.id || !offer.title) {
                console.warn('⚠️ عرض ناقص البيانات:', offer);
                return;
            }
            
            const hasOffer = offer.offerPrice && offer.offerPrice < offer.originalPrice;
            
            html += `
                <div class="offer-card">
                    <div class="offer-badge">عرض خاص</div>
                    <div class="offer-image">
                        <img src="${offer.image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop'}" 
                             alt="${offer.title}" 
                             class="offer-img" 
                             loading="lazy"
                             onerror="this.src='https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop'">
                    </div>
                    <div class="offer-content">
                        <h3 class="offer-title">${offer.title}</h3>
                        <p class="offer-desc">${offer.description || ''}</p>
                        <div class="offer-price">
                            ${hasOffer ? `<span class="old-price">${offer.originalPrice?.toFixed(2) || '0.00'} ج.م</span>` : ''}
                            <span class="new-price">${offer.offerPrice?.toFixed(2) || offer.originalPrice?.toFixed(2) || '0.00'} ج.م</span>
                        </div>
                        <button class="btn btn-offer" data-offer-id="${offer.id}">
                            <i class="fas fa-shopping-cart"></i>
                            أضف للطلب
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // أحداث العروض
        container.querySelectorAll(".btn-offer").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const offerId = e.currentTarget.dataset.offerId;
                this.addOffer(offerId);
            });
        });
    },
    
    // ربط أحداث الأصناف
    bindItemEvents() {
        // أزرار الكمية
        document.querySelectorAll(".qty-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const itemId = parseInt(e.currentTarget.dataset.id);
                if (!itemId) return;
                
                const isPlus = e.currentTarget.classList.contains("plus");
                this.updateQuantity(itemId, isPlus ? 1 : -1);
            });
        });
        
        // أزرار الإضافة
        document.querySelectorAll(".add-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const itemId = parseInt(e.currentTarget.dataset.id);
                if (!itemId) return;
                
                const currentQty = this.getQuantityInCart(itemId);
                if (currentQty === 0) {
                    this.updateQuantity(itemId, 1);
                }
            });
        });
        
        // إظهار/إخفاء
        document.querySelectorAll(".item-toggle").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const itemId = parseInt(e.currentTarget.dataset.id);
                if (!itemId) return;
                
                this.toggleItem(itemId);
            });
        });
    },
    
    // تصفية القائمة
    filterMenu(category) {
        const items = document.querySelectorAll(".menu-item");
        items.forEach(item => {
            if (category === "all" || item.dataset.category === category) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    },
    
    // تحديث الكمية
    updateQuantity(itemId, change) {
        if (!itemId || typeof change !== 'number') {
            console.error('❌ معلمات غير صالحة لتحديث الكمية');
            return;
        }
        
        const item = this.data?.menu_items?.find(i => i.id === itemId);
        if (!item || item.available === false) {
            console.log('❌ الصنف غير موجود أو غير متوفر');
            return;
        }
        
        const cartIndex = this.cart.findIndex(c => c.id === itemId);
        const price = (item.offerPrice && item.offerPrice < item.price) ? item.offerPrice : item.price;
        
        if (cartIndex > -1) {
            const newQty = this.cart[cartIndex].quantity + change;
            
            if (newQty <= 0) {
                this.cart.splice(cartIndex, 1);
            } else {
                this.cart[cartIndex].quantity = newQty;
                this.cart[cartIndex].total = price * newQty;
            }
        } else if (change > 0) {
            this.cart.push({
                id: itemId,
                name: item.name,
                price: price,
                originalPrice: item.price,
                quantity: 1,
                total: price
            });
        }
        
        requestAnimationFrame(() => {
            this.saveCart();
            this.updateCartDisplay();
            this.updateOrderSummary();
            this.updateItemDisplay(itemId);
            this.validateForm();
        });
    },
    
    // إضافة عرض
    addOffer(offerId) {
        const offer = this.data.offers?.find(o => o.id === offerId);
        if (!offer) return;
        
        this.cart.push({
            id: `offer-${offerId}`,
            name: offer.title,
            price: offer.offerPrice || offer.originalPrice,
            originalPrice: offer.originalPrice,
            quantity: 1,
            total: offer.offerPrice || offer.originalPrice,
            isOffer: true
        });
        
        requestAnimationFrame(() => {
            this.saveCart();
            this.updateCartDisplay();
            this.updateOrderSummary();
            this.updateMobileCartContent();
            this.validateForm();
            this.showMessage(`تم إضافة "${offer.title}" إلى السلة`, "success");
        });
    },
    
    // تبديل حالة الصنف
    toggleItem(itemId) {
        const item = this.data.menu_items?.find(i => i.id === itemId);
        if (!item) return;
        
        // تبديل حالة التوفر
        item.available = item.available === undefined ? false : !item.available;
        
        const btn = document.querySelector(`.item-toggle[data-id="${itemId}"]`);
        const menuItem = document.querySelector(`.menu-item[data-id="${itemId}"]`);
        
        if (btn && menuItem) {
            const isAvailable = item.available !== false;
            btn.innerHTML = `<i class="fas fa-${isAvailable ? 'eye' : 'eye-slash'}"></i>`;
            
            requestAnimationFrame(() => {
                menuItem.classList.toggle("unavailable", !isAvailable);
                
                // تحديث حالة الأزرار
                const qtyButtons = menuItem.querySelectorAll('.qty-btn');
                const addBtn = menuItem.querySelector('.add-btn');
                
                qtyButtons.forEach(btn => btn.disabled = !isAvailable);
                if (addBtn) {
                    addBtn.disabled = !isAvailable;
                    addBtn.querySelector('span').textContent = isAvailable ? 'أضف للسلة' : 'غير متوفر';
                }
            });
            
            // إزالة من السلة إذا أصبح غير متوفر
            if (!isAvailable) {
                const cartIndex = this.cart.findIndex(c => c.id === itemId);
                if (cartIndex > -1) {
                    this.cart.splice(cartIndex, 1);
                    requestAnimationFrame(() => {
                        this.saveCart();
                        this.updateCartDisplay();
                        this.updateOrderSummary();
                        this.updateMobileCartContent();
                        this.updateItemDisplay(itemId);
                    });
                }
            }
        }
    },
    
    // الحصول على الكمية في السلة
    getQuantityInCart(itemId) {
        const item = this.cart.find(c => c.id === itemId);
        return item ? item.quantity : 0;
    },
    
    // تحديث عرض الصنف
    updateItemDisplay(itemId) {
        const quantity = this.getQuantityInCart(itemId);
        const qtyElement = document.querySelector(`.qty-value[data-id="${itemId}"]`);
        const addBtn = document.querySelector(`.add-btn[data-id="${itemId}"]`);
        
        if (qtyElement) {
            qtyElement.textContent = quantity;
        }
        
        if (addBtn) {
            if (quantity > 0) {
                addBtn.innerHTML = '<i class="fas fa-check"></i><span>مضاف</span>';
                addBtn.classList.add("added");
            } else {
                const item = this.data.menu_items?.find(i => i.id === itemId);
                const isAvailable = item?.available !== false;
                addBtn.innerHTML = `<i class="fas fa-cart-plus"></i><span>${isAvailable ? 'أضف للسلة' : 'غير متوفر'}</span>`;
                addBtn.classList.remove("added");
            }
        }
    },
    
    // تحديث عرض السلة
    updateCartDisplay() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.total || 0), 0);
        
        // العداد الأساسي
        const cartCount = document.querySelector(".cart-count");
        const totalPriceElement = document.getElementById("totalPrice");
        
        if (cartCount) cartCount.textContent = totalItems;
        if (totalPriceElement) totalPriceElement.textContent = totalPrice.toFixed(2);
        
        // الزر العائم
        const floatingBtn = document.getElementById("floatingOrderBtn");
        if (floatingBtn) {
            const floatingCount = floatingBtn.querySelector(".floating-count");
            const floatingTotal = floatingBtn.querySelector("#floatingTotal");
            
            if (floatingCount) floatingCount.textContent = totalItems;
            if (floatingTotal) floatingTotal.textContent = totalPrice.toFixed(2);
            
            // إظهار/إخفاء الزر العائم
            floatingBtn.style.display = totalItems > 0 ? "flex" : "none";
        }
        
        // تحديث فاتورة الجوال
        this.updateMobileCart(totalItems, totalPrice);
        
        // تحديث عدد المنتجات في زر الإرسال
        this.updateSubmitButtonCount(totalItems);
    },
    
    // تحديث عدد المنتجات في زر الإرسال
    updateSubmitButtonCount(totalItems) {
        const orderItemCount = document.getElementById("orderItemCount");
        const submitCount = document.querySelector(".submit-count");
        
        if (orderItemCount) {
            orderItemCount.textContent = totalItems;
        }
        
        if (submitCount) {
            if (totalItems > 0) {
                submitCount.style.display = "inline-flex";
            } else {
                submitCount.style.display = "none";
            }
        }
    },
    
    // تحديث فاتورة الجوال
    updateMobileCart(totalItems, totalPrice) {
        const mobileCartToggle = document.getElementById("mobileCartToggle");
        const mobileCartCount = document.querySelector(".mobile-cart-count");
        
        if (mobileCartToggle && mobileCartCount) {
            if (totalItems > 0) {
                mobileCartToggle.style.display = "flex";
                mobileCartCount.textContent = totalItems;
            } else {
                mobileCartToggle.style.display = "none";
            }
        }
        
        // تحديث محتوى فاتورة الجوال
        this.updateMobileCartContent();
    },
    
    // تحديث محتوى فاتورة الجوال
    updateMobileCartContent() {
        const container = document.getElementById("summaryItemsMobile");
        const totalContainer = document.getElementById("summaryTotalMobile");
        
        if (!container || !totalContainer) return;
        
        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart" style="text-align: center; padding: 30px 20px; color: var(--gray);">
                    <i class="fas fa-shopping-basket" style="font-size: 40px; margin-bottom: 15px;"></i>
                    <p>السلة فارغة</p>
                    <small>أضف أصنافاً من القائمة</small>
                </div>
            `;
            
            totalContainer.innerHTML = "";
            return;
        }
        
        // عرض العناصر
        let html = "";
        let subtotal = 0;
        
        this.cart.forEach(item => {
            subtotal += item.total || 0;
            const hasOffer = item.originalPrice && item.price < item.originalPrice;
            
            html += `
                <div class="summary-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee;">
                    <div class="item-info">
                        <h4 style="margin: 0; font-size: 15px;">${item.name}</h4>
                        ${hasOffer ? `<small class="offer-text" style="color: var(--orange); font-size: 11px;">عرض خاص</small>` : ""}
                    </div>
                    <div class="item-total" style="text-align: right;">
                        <span style="display: block; font-size: 13px; color: var(--gray);">
                            ${item.quantity} × ${item.price?.toFixed(2) || '0.00'} ج.م
                        </span>
                        <strong style="display: block; font-size: 16px; color: var(--black);">
                            ${item.total?.toFixed(2) || '0.00'} ج.م
                        </strong>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // حساب التوصيل
        const addressType = document.querySelector('input[name="addressType"]:checked')?.value || "inside";
        let delivery = 0;
        
        if (addressType === "inside") {
            delivery = 30;
        } else if (addressType === "branch") {
            delivery = 0;
        }
        
        const total = addressType === "outside" ? subtotal : subtotal + delivery;
        
        // عرض الإجمالي
        let totalHtml = `
            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
                <div class="total-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>المجموع</span>
                    <span>${subtotal.toFixed(2)} ج.م</span>
                </div>
        `;
        
        if (addressType === "inside") {
            totalHtml += `
                <div class="total-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>رسوم التوصيل</span>
                    <span>${delivery.toFixed(2)} ج.م</span>
                </div>
                <div class="total-row grand-total" style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: var(--orange); margin-top: 15px; padding-top: 15px; border-top: 2px solid var(--orange);">
                    <span>الإجمالي</span>
                    <span>${total.toFixed(2)} ج.م</span>
                </div>
            `;
        } else if (addressType === "outside") {
            totalHtml += `
                <div class="total-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>رسوم التوصيل</span>
                    <span style="color: var(--orange); font-weight: 600;">يتم تحديدها من الكول سنتر</span>
                </div>
                <div class="total-row grand-total" style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: var(--orange); margin-top: 15px; padding-top: 15px; border-top: 2px solid var(--orange);">
                    <span>الإجمالي</span>
                    <span>${subtotal.toFixed(2)} ج.م <small style="font-size: 12px;">(+ رسوم التوصيل)</small></span>
                </div>
            `;
        } else if (addressType === "branch") {
            totalHtml += `
                <div class="total-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>رسوم التوصيل</span>
                    <span style="color: #28A745;">0.00 ج.م</span>
                </div>
                <div class="total-row grand-total" style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: var(--orange); margin-top: 15px; padding-top: 15px; border-top: 2px solid var(--orange);">
                    <span>الإجمالي</span>
                    <span>${subtotal.toFixed(2)} ج.م</span>
                </div>
            `;
        }
        
        totalHtml += `</div>`;
        totalContainer.innerHTML = totalHtml;
    },
    
    // تحديث ملخص الطلب
    updateOrderSummary() {
        const container = document.getElementById("summaryItems");
        const subtotalEl = document.getElementById("subtotal");
        const deliveryEl = document.getElementById("delivery");
        const grandTotalEl = document.getElementById("grandTotal");
        
        if (this.cart.length === 0) {
            if (container) {
                container.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-basket"></i>
                        <p>السلة فارغة</p>
                        <small>أضف أصنافاً من القائمة</small>
                    </div>
                `;
            }
            if (subtotalEl) subtotalEl.textContent = "0.00 ج.م";
            if (deliveryEl) deliveryEl.textContent = "0.00 ج.م";
            if (grandTotalEl) grandTotalEl.textContent = "0.00 ج.م";
            return;
        }
        
        let html = "";
        let subtotal = 0;
        
        this.cart.forEach(item => {
            subtotal += item.total || 0;
            const hasOffer = item.originalPrice && item.price < item.originalPrice;
            
            html += `
                <div class="summary-item">
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        ${hasOffer ? `<small class="offer-text">عرض خاص</small>` : ""}
                    </div>
                    <div class="item-total">
                        <span>${item.quantity} × ${item.price?.toFixed(2) || '0.00'} ج.م</span>
                        <strong>${item.total?.toFixed(2) || '0.00'} ج.م</strong>
                    </div>
                </div>
            `;
        });
        
        if (container) container.innerHTML = html;
        
        // حساب التوصيل حسب نوع العنوان
        const addressType = document.querySelector('input[name="addressType"]:checked')?.value || "inside";
        let delivery = 0;
        let deliveryText = "";
        
        if (addressType === "inside") {
            delivery = 30;
            deliveryText = "30.00 ج.م (ثابتة)";
        } else if (addressType === "outside") {
            deliveryText = "يتم تحديدها من الكول سنتر";
        } else if (addressType === "branch") {
            deliveryText = "0.00 ج.م (بدون توصيل)";
        }
        
        const total = addressType === "outside" ? subtotal : subtotal + delivery;
        
        if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} ج.م`;
        
        if (deliveryEl) {
            if (addressType === "outside") {
                deliveryEl.innerHTML = `<span style="color: var(--orange); font-weight: 600;">${deliveryText}</span>`;
            } else if (addressType === "branch") {
                deliveryEl.innerHTML = `<span style="color: #28A745;">${deliveryText}</span>`;
            } else {
                deliveryEl.textContent = `${delivery.toFixed(2)} ج.م`;
            }
        }
        
        if (grandTotalEl) {
            if (addressType === "outside") {
                grandTotalEl.innerHTML = `<span style="color: var(--orange);">${subtotal.toFixed(2)} ج.م <small>(+ رسوم التوصيل تحدد لاحقاً)</small></span>`;
            } else {
                grandTotalEl.textContent = `${total.toFixed(2)} ج.م`;
            }
        }
    },
    
    // التحقق من النموذج
    validateForm() {
        let isValid = true;
        
        // الاسم
        const name = document.getElementById("customerName");
        const nameError = document.getElementById("nameError");
        if (name && nameError) {
            if (!name.value.trim() || name.value.trim().length < 3) {
                nameError.textContent = "الاسم يجب أن يكون 3 أحرف على الأقل";
                isValid = false;
            } else {
                nameError.textContent = "";
            }
        }
        
        // الهاتف
        const phone = document.getElementById("customerPhone");
        const phoneError = document.getElementById("phoneError");
        if (phone && phoneError) {
            const phoneRegex = /^01[0-9]{9}$/;
            if (!phoneRegex.test(phone.value.trim())) {
                phoneError.textContent = "رقم الهاتف يجب أن يكون 11 رقماً ويبدأ بـ 01";
                isValid = false;
            } else {
                phoneError.textContent = "";
            }
        }
        
        // العنوان
        const addressType = document.querySelector('input[name="addressType"]:checked');
        if (addressType) {
            const type = addressType.value;
            if (type === "inside") {
                const group = document.getElementById("group");
                const building = document.getElementById("building");
                const apartment = document.getElementById("apartment");
                
                // التحقق من أن الحقول تحتوي على أرقام فقط
                if (group && !this.validateNumericField(group)) isValid = false;
                if (building && !this.validateNumericField(building)) isValid = false;
                if (apartment && !this.validateNumericField(apartment)) isValid = false;
                
                // التحقق من وجود القيم
                if ((group && !group.value.trim()) || 
                    (building && !building.value.trim()) || 
                    (apartment && !apartment.value.trim())) {
                    isValid = false;
                }
            } else if (type === "outside") {
                const fullAddress = document.getElementById("fullAddress");
                if (fullAddress && !fullAddress.value.trim()) {
                    isValid = false;
                }
            } else if (type === "branch") {
                const pickupTime = document.getElementById("pickupTime");
                
                if ((pickupTime && !pickupTime.value)) {
                    isValid = false;
                } else if (pickupTime && !this.validatePickupTime()) {
                    isValid = false;
                }
            }
        }
        
        // السلة
        if (this.cart.length === 0) {
            isValid = false;
        }
        
        // زر الإرسال
        const submitBtn = document.getElementById("submitOrder");
        if (submitBtn) {
            submitBtn.disabled = !isValid;
            
            // إضافة/إزالة الأنيميشن إذا كان الزر مفعلاً
            if (isValid && this.cart.length > 0) {
                submitBtn.classList.add("enabled");
                submitBtn.title = "اضغط لإرسال الطلب عبر واتساب";
            } else {
                submitBtn.classList.remove("enabled");
                submitBtn.title = "أكمل البيانات المطلوبة";
            }
        }
        
        return isValid;
    },
    
    // إرسال الطلب
    submitOrder() {
        if (!this.validateForm()) {
            this.showMessage("يرجى استكمال جميع البيانات المطلوبة", "error");
            return;
        }
        
        if (!this.whatsappNumber) {
            this.showMessage("خطأ في إعدادات التطبيق", "error");
            return;
        }
        
        // جمع البيانات
        const name = document.getElementById("customerName").value.trim();
        const phone = document.getElementById("customerPhone").value.trim();
        
        let address = "";
        const addressType = document.querySelector('input[name="addressType"]:checked').value;
        
        if (addressType === "inside") {
            const group = document.getElementById("group").value.trim();
            const building = document.getElementById("building").value.trim();
            const apartment = document.getElementById("apartment").value.trim();
            const notes = document.getElementById("notes").value.trim();
            
            address = `📍 *توصيل داخل الرحاب*\n`;
            address += `📦 *العنوان:* المجموعة ${group} - العمارة ${building} - الشقة ${apartment}`;
            if (notes) address += `\n📝 *ملاحظات:* ${notes}`;
        } else if (addressType === "outside") {
            const fullAddress = document.getElementById("fullAddress").value.trim();
            const outsideNotes = document.getElementById("outsideNotes").value.trim();
            
            address = `📍 *توصيل خارج الرحاب*\n`;
            address += `📦 *العنوان:* ${fullAddress}`;
            if (outsideNotes) address += `\n📝 *ملاحظات:* ${outsideNotes}`;
        } else if (addressType === "branch") {
            const pickupTime = document.getElementById("pickupTime").value;
            const branchNotes = document.getElementById("branchNotes").value.trim();
            
            address = `🏪 *استلام من الفرع*\n`;
            address += `🏬 *الفرع:* الفرع الرئيسي - الرحاب\n`;
            address += `📍 *العنوان:* الرحاب، أمام مسجد الرحاب\n`;
            address += `🕒 *وقت الاستلام:* ${pickupTime}`;
            if (branchNotes) address += `\n📝 *ملاحظات:* ${branchNotes}`;
        }
        
        // إنشاء الرسالة
        let message = `*طلب جديد - ${this.data?.brand?.name || 'مطبخ فتح الله ماركت'}*\n\n`;
        message += `*👤 العميل:* ${name}\n`;
        message += `*📞 الهاتف:* ${phone}\n\n`;
        message += `*${address}*\n\n`;
        message += `*🛒 تفاصيل الطلب:*\n`;
        
        this.cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name} × ${item.quantity} = ${(item.total || 0).toFixed(2)} ج.م\n`;
        });
        
        const subtotal = this.cart.reduce((sum, item) => sum + (item.total || 0), 0);
        let delivery = 0;
        let deliveryNote = "";
        
        if (addressType === "inside") {
            delivery = 30;
            deliveryNote = "30 ج.م (ثابتة)";
        } else if (addressType === "outside") {
            deliveryNote = "يتم تحديدها من الكول سنتر بناءً على العنوان";
        } else if (addressType === "branch") {
            deliveryNote = "بدون رسوم توصيل (استلام من الفرع)";
        }
        
        const total = addressType === "outside" ? subtotal : subtotal + delivery;
        
        message += `\n*💰 المجموع:* ${subtotal.toFixed(2)} ج.م\n`;
        
        if (addressType === "inside") {
            message += `*🚚 التوصيل:* ${delivery.toFixed(2)} ج.م (ثابتة)\n`;
            message += `*💵 الإجمالي:* ${total.toFixed(2)} ج.م\n`;
        } else if (addressType === "outside") {
            message += `*🚚 التوصيل:* ${deliveryNote}\n`;
            message += `*💵 الإجمالي:* ${subtotal.toFixed(2)} ج.م + رسوم التوصيل\n`;
        } else if (addressType === "branch") {
            message += `*🚚 التوصيل:* ${deliveryNote}\n`;
            message += `*💵 الإجمالي:* ${subtotal.toFixed(2)} ج.م\n`;
        }
        
        message += `\n*🚀 شكراً لطلبك!*`;
        
        // إرسال عبر واتساب
        const encoded = encodeURIComponent(message);
        const url = `https://wa.me/${this.whatsappNumber}?text=${encoded}`;
        
        window.open(url, "_blank");
        
        // رسالة تأكيد
        this.showMessage("تم فتح واتساب لإرسال طلبك", "success");
        
        // تفريغ السلة بعد ثانيتين
        setTimeout(() => {
            this.cart = [];
            this.saveCart();
            this.updateCartDisplay();
            this.updateOrderSummary();
            this.updateMobileCartContent();
            
            // تحديث الكميات
            if (this.data && this.data.menu_items) {
                this.data.menu_items.forEach(item => {
                    this.updateItemDisplay(item.id);
                });
            }
            
            // إعادة تعيين النموذج
            const orderForm = document.getElementById("orderForm");
            if (orderForm) {
                orderForm.reset();
                document.getElementById("insideAddress").style.display = "block";
                document.getElementById("outsideAddress").style.display = "none";
                document.getElementById("branchAddress").style.display = "none";
                
                // إعادة اختيار التوصيل داخل الرحاب
                const insideRadio = document.querySelector('input[name="addressType"][value="inside"]');
                if (insideRadio) insideRadio.checked = true;
                
                // تحديث الوقت
                this.updateCurrentTime();
            }
        }, 2000);
    },
    
    // عرض رسالة
    showMessage(text, type = "info") {
        // إزالة الرسائل القديمة
        const oldMsg = document.querySelector(".alert-message");
        if (oldMsg) oldMsg.remove();
        
        // إنشاء الرسالة
        const msg = document.createElement("div");
        msg.className = `alert-message ${type}`;
        msg.innerHTML = `
            <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
            <span>${text}</span>
            <button class="close-btn"><i class="fas fa-times"></i></button>
        `;
        
        // التنسيق
        msg.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === "success" ? "#28A745" : type === "error" ? "#DC3545" : "#17A2B8"};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 2000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(msg);
        
        // زر الإغلاق
        msg.querySelector(".close-btn").addEventListener("click", () => {
            msg.remove();
        });
        
        // الإزالة التلقائية
        setTimeout(() => {
            if (msg.parentNode) {
                msg.style.animation = "slideOut 0.3s ease";
                setTimeout(() => msg.remove(), 300);
            }
        }, 5000);
    }
};

// تشغيل التطبيق
document.addEventListener("DOMContentLoaded", () => {
    console.log('📄 تم تحميل الصفحة');
    setTimeout(() => {
        FathallaApp.init();
    }, 100);
});

// تنظيف عند إغلاق النافذة
window.addEventListener('unload', () => {
    FathallaApp.cleanup();
});