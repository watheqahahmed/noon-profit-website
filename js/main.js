document.addEventListener('DOMContentLoaded', () => {
    // 1. تبديل قائمة التنقل (للشاشات الصغيرة)
    const menuToggle = document.querySelector('.menu-toggle');
    const primaryNavigation = document.getElementById('primary-navigation');

    if (menuToggle && primaryNavigation) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            primaryNavigation.classList.toggle('active');
            // منع التمرير في الجسم عندما تكون القائمة مفتوحة
            document.body.classList.toggle('no-scroll');
        });

        // إغلاق القائمة عند النقر على رابط (على الأجهزة المحمولة)
        primaryNavigation.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) { // يفترض 768px كنقطة توقف للجوال
                    menuToggle.setAttribute('aria-expanded', 'false');
                    primaryNavigation.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                }
            });
        });
    }

    // 2. تبديل الوضع الليلي/النهاري
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        // التحقق من تفضيل السمة المحفوظة في Local Storage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggleBtn.setAttribute('aria-label', 'تبديل السمة إلى النهاري');
        } else {
            themeToggleBtn.setAttribute('aria-label', 'تبديل السمة إلى الليلي');
        }

        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
            themeToggleBtn.setAttribute('aria-label', `تبديل السمة إلى ${currentTheme === 'dark' ? 'النهاري' : 'الليلي'}`);
        });
    }

    // 3. Intersection Observer لرسوم متحركة التمرير
    const animatedElements = document.querySelectorAll('.fade-in-up, .slide-in-right, .slide-in-left'); // أضف فئات الرسوم المتحركة هنا

    const observerOptions = {
        root: null, // مجال الرؤية (viewport) هو الجذر
        rootMargin: '0px',
        threshold: 0.1 // العنصر يصبح مرئيًا عندما يكون 10% منه داخل مجال الرؤية
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // إيقاف المراقبة بعد التحريك
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));


    // 4. التحقق من صحة نموذج الاتصال (مثال لصفحة اتصل بنا)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // منع الإرسال الافتراضي للنموذج
            let isValid = true;

            const nameInput = this.querySelector('#name');
            const emailInput = this.querySelector('#email');
            const subjectInput = this.querySelector('#subject');
            const messageInput = this.querySelector('#message');

            // وظائف التحقق
            const validateField = (input, errorMessage) => {
                if (input.value.trim() === '') {
                    showValidationError(input, errorMessage);
                    isValid = false;
                } else {
                    hideValidationError(input);
                }
            };

            const validateEmail = (input) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value.trim())) {
                    showValidationError(input, 'الرجاء إدخال عنوان بريد إلكتروني صالح.');
                    isValid = false;
                } else {
                    hideValidationError(input);
                }
            };

            validateField(nameInput, 'الاسم مطلوب.');
            validateEmail(emailInput);
            validateField(subjectInput, 'الموضوع مطلوب.');
            validateField(messageInput, 'الرسالة مطلوبة.');

            if (isValid) {
                alert('شكراً لرسالتك! سنعود إليك قريباً.');
                this.reset(); // مسح النموذج بعد الإرسال الناجح
            }
        });

        function showValidationError(inputElement, message) {
            let errorElement = inputElement.nextElementSibling;
            if (!errorElement || !errorElement.classList.contains('error-message')) {
                errorElement = document.createElement('div');
                errorElement.classList.add('error-message');
                inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
            }
            errorElement.textContent = message;
            inputElement.setAttribute('aria-invalid', 'true');
            inputElement.setAttribute('aria-describedby', inputElement.id + '-error');
            errorElement.id = inputElement.id + '-error';
        }

        function hideValidationError(inputElement) {
            const errorElement = inputElement.nextElementSibling;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.remove();
            }
            inputElement.removeAttribute('aria-invalid');
            inputElement.removeAttribute('aria-describedby');
        }
    }

    // 5. تصفية المشاريع (مثال لصفحة المشاريع)
    const projectFilterButtons = document.querySelectorAll('.project-filter-btn');
    const projectCardsContainer = document.querySelector('.project-grid');

    if (projectFilterButtons.length > 0 && projectCardsContainer) {
        projectFilterButtons.forEach(button => {
            button.addEventListener('click', () => {
                projectFilterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filter = button.dataset.filter;

                projectCardsContainer.querySelectorAll('.project-card').forEach(card => {
                    if (filter === 'all' || card.dataset.category === filter) {
                        card.style.display = 'block'; // أو flex/grid item
                        card.classList.remove('hidden-by-filter'); // لرسوم CSS المتحركة
                    } else {
                        card.style.display = 'none';
                        card.classList.add('hidden-by-filter');
                    }
                });
            });
        });
    }

    // 6. صفحة الأسئلة الشائعة - إجابات قابلة للطي
    const faqItems = document.querySelectorAll('.faq-item h3 button');
    if (faqItems.length > 0) {
        faqItems.forEach(button => {
            const contentId = button.getAttribute('aria-controls');
            const content = document.getElementById(contentId);

            if (content) {
                button.addEventListener('click', () => {
                    const isExpanded = button.getAttribute('aria-expanded') === 'true';
                    button.setAttribute('aria-expanded', !isExpanded);
                    content.hidden = isExpanded; // تبديل سمة hidden
                    content.classList.toggle('active'); // لتطبيق انتقالات CSS (إذا كانت موجودة)
                });
            }
        });
    }

    // 7. دوار الشهادات (Testimonials Carousel)
    const testimonialsContainer = document.querySelector('.testimonials-carousel');
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (testimonialsContainer && prevBtn && nextBtn && dotsContainer) {
        let currentIndex = 0;
        const testimonials = Array.from(testimonialsContainer.children); // تحويل HTMLCollection إلى Array
        const totalTestimonials = testimonials.length;

        // إنشاء النقاط
        for (let i = 0; i < totalTestimonials; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-selected', 'false');
            dot.setAttribute('aria-controls', `testimonial-${i}`);
            dot.setAttribute('tabindex', '-1'); // غير قابل للتركيز افتراضيا
            dot.dataset.index = i;
            dotsContainer.appendChild(dot);

            dot.addEventListener('click', () => {
                showTestimonial(i);
            });
        }

        const dots = Array.from(dotsContainer.children);

        function showTestimonial(index) {
            if (index >= totalTestimonials) {
                currentIndex = 0;
            } else if (index < 0) {
                currentIndex = totalTestimonials - 1;
            } else {
                currentIndex = index;
            }

            testimonialsContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

            // تحديث سمات ARIA والنقاط
            testimonials.forEach((item, i) => {
                item.setAttribute('aria-hidden', i !== currentIndex);
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
                dot.setAttribute('aria-selected', i === currentIndex);
                dot.setAttribute('tabindex', i === currentIndex ? '0' : '-1');
            });
        }

        prevBtn.addEventListener('click', () => {
            showTestimonial(currentIndex + 1); // لليمين في RTL
        });

        nextBtn.addEventListener('click', () => {
            showTestimonial(currentIndex - 1); // لليسار في RTL
        });

        // الانتقال التلقائي (اختياري)
        // setInterval(() => {
        //     showTestimonial(currentIndex + 1);
        // }, 5000);

        showTestimonial(0); // عرض الشهادة الأولى عند التحميل
    }
});