/**
 * TechAffiliate Pro - Main JavaScript
 * Handles affiliate link tracking, form validation, mobile menu, and security features
 * @version 1.0.0
 */

'use strict';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all modules
    initializeMobileMenu();
    initializeAffiliateLinks();
    initializeNewsletterForm();
    initializeSmoothScroll();
    initializeSecurityFeatures();
    initializeAnalytics();
});

/**
 * Mobile Menu Toggle
 */
function initializeMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (!menuToggle || !navList) return;
    
    menuToggle.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        // Toggle menu
        this.setAttribute('aria-expanded', !isExpanded);
        navList.classList.toggle('active');
        
        // Update hamburger animation
        const hamburger = this.querySelector('.hamburger');
        if (hamburger) {
            hamburger.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(90deg)';
        }
        
        // Trap focus when menu is open
        if (!isExpanded) {
            trapFocus(navList);
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.main-nav') && navList.classList.contains('active')) {
            navList.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && navList.classList.contains('active')) {
            navList.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.focus();
        }
    });
}

/**
 * Focus Trap for Accessibility
 */
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button, textarea, input, select'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    firstFocusable.focus();
    
    element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    });
}

/**
 * Affiliate Link Tracking & Security
 */
function initializeAffiliateLinks() {
    const affiliateButtons = document.querySelectorAll('.btn-affiliate');
    
    affiliateButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            
            const productName = this.getAttribute('data-product');
            const category = this.getAttribute('data-category');
            const href = this.getAttribute('href');
            
            // Validate affiliate link
            if (!isValidAffiliateLink(href)) {
                console.error('Invalid affiliate link detected');
                showNotification('Security warning: Invalid link detected', 'error');
                return;
            }
            
            // Track click with analytics
            trackAffiliateClick(productName, category);
            
            // Add security headers to the link
            const secureUrl = sanitizeUrl(href);
            
            // Open in new tab with security features
            const newWindow = window.open(secureUrl, '_blank', 'noopener,noreferrer');
            
            // Security check for opened window
            if (newWindow) {
                newWindow.opener = null;
            }
            
            // Log for debugging (remove in production)
            console.log(`Affiliate click tracked: ${productName} (${category})`);
        });
    });
}

/**
 * Validate affiliate link
 */
function isValidAffiliateLink(url) {
    if (!url || url === '#') return false;
    
    try {
        const urlObj = new URL(url);
        
        // Check for HTTPS
        if (urlObj.protocol !== 'https:') {
            return false;
        }
        
        // Whitelist of allowed domains (add your affiliate domains)
        const allowedDomains = [
            'jasper.ai',
            'surferseo.com',
            'cloudways.com',
            'hostinger.com',
            'namecheap.com',
            'udemy.com',
            'github.com',
            'semrush.com'
        ];
        
        return allowedDomains.some(domain => urlObj.hostname.includes(domain));
        
    } catch (error) {
        return false;
    }
}

/**
 * Sanitize URL to prevent XSS
 */
function sanitizeUrl(url) {
    // Remove any javascript: protocol attempts
    return url.replace(/^javascript:/i, '').replace(/^data:/i, '');
}

/**
 * Track affiliate clicks (example implementation)
 */
function trackAffiliateClick(productName, category) {
    // Google Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'affiliate_click', {
            'event_category': category,
            'event_label': productName,
            'value': 1
        });
    }
    
    // Store in session storage for conversion tracking
    const clicks = JSON.parse(sessionStorage.getItem('affiliate_clicks') || '[]');
    clicks.push({
        product: productName,
        category: category,
        timestamp: new Date().toISOString()
    });
    sessionStorage.setItem('affiliate_clicks', JSON.stringify(clicks));
}

/**
 * Newsletter Form Handling
 */
function initializeNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const emailInput = document.getElementById('email');
        const consentCheckbox = document.getElementById('consent');
        const messageDiv = document.getElementById('form-message');
        
        // Reset message
        messageDiv.className = 'form-message';
        messageDiv.textContent = '';
        
        // Validate email
        if (!isValidEmail(emailInput.value)) {
            showFormMessage('Please enter a valid email address', 'error');
            emailInput.focus();
            return;
        }
        
        // Check consent
        if (!consentCheckbox.checked) {
            showFormMessage('Please agree to receive emails', 'error');
            consentCheckbox.focus();
            return;
        }
        
        // Simulate form submission (replace with actual API call)
        submitNewsletterForm(emailInput.value)
            .then(response => {
                showFormMessage('Thank you! Check your email for confirmation.', 'success');
                form.reset();
                
                // Track conversion
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'newsletter_signup', {
                        'event_category': 'engagement',
                        'event_label': 'newsletter'
                    });
                }
            })
            .catch(error => {
                showFormMessage('An error occurred. Please try again.', 'error');
                console.error('Newsletter submission error:', error);
            });
    });
    
    // Real-time email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const isValid = isValidEmail(this.value);
            this.style.borderColor = this.value ? (isValid ? '#10b981' : '#ef4444') : '';
        });
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

/**
 * Submit newsletter form (mock API call)
 */
async function submitNewsletterForm(email) {
    // Replace with actual API endpoint
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate successful submission
            resolve({ success: true, message: 'Subscribed successfully' });
            
            // To simulate error, use:
            // reject(new Error('Server error'));
        }, 1000);
    });
}

/**
 * Show form message
 */
function showFormMessage(message, type) {
    const messageDiv = document.getElementById('form-message');
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.className = 'form-message';
            messageDiv.textContent = '';
        }, 5000);
    }
}

/**
 * Smooth Scroll Implementation
 */
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(event) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') return;
            
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                event.preventDefault();
                
                // Close mobile menu if open
                const navList = document.querySelector('.nav-list');
                if (navList && navList.classList.contains('active')) {
                    navList.classList.remove('active');
                    const menuToggle = document.querySelector('.mobile-menu-toggle');
                    if (menuToggle) {
                        menuToggle.setAttribute('aria-expanded', 'false');
                    }
                }
                
                // Smooth scroll with offset for sticky header
                const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL hash without jumping
                history.pushState(null, null, href);
                
                // Set focus to target for accessibility
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus({ preventScroll: true });
            }
        });
    });
}

/**
 * Security Features
 */
function initializeSecurityFeatures() {
    // Prevent clickjacking
    if (window.top !== window.self) {
        window.top.location = window.self.location;
    }
    
    // Disable right-click on affiliate links (optional security measure)
    document.addEventListener('contextmenu', function(event) {
        if (event.target.closest('.btn-affiliate')) {
            // Uncomment to prevent right-click on affiliate links
            // event.preventDefault();
        }
    });
    
    // Add rel attributes to all external links
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        if (!link.rel.includes('noopener')) {
            link.rel += ' noopener noreferrer';
        }
    });
    
    // Content Security Policy violation reporting
    document.addEventListener('securitypolicyviolation', function(event) {
        console.warn('CSP Violation:', event.violatedDirective);
        // Send to monitoring service in production
    });
}

/**
 * Analytics Initialization
 */
function initializeAnalytics() {
    // Track page views
    if (typeof gtag !== 'undefined') {
        gtag('config', 'G-XXXXXXXXXX', {
            'page_title': document.title,
            'page_path': window.location.pathname
        });
    }
    
    // Track time on page
    let startTime = Date.now();
    
    window.addEventListener('beforeunload', function() {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'time_on_page', {
                'event_category': 'engagement',
                'event_label': window.location.pathname,
                'value': timeSpent
            });
        }
    });
    
    // Track scroll depth
    let maxScroll = 0;
    let scrollTimeout;
    
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(function() {
            const scrollPercent = Math.round(
                (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                // Track at 25%, 50%, 75%, 100%
                if ([25, 50, 75, 100].includes(maxScroll)) {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'scroll_depth', {
                            'event_category': 'engagement',
                            'event_label': `${maxScroll}%`,
                            'value': maxScroll
                        });
                    }
                }
            }
        }, 250);
    });
}

/**
 * Show notification (optional feature)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    
    // Style notification
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '1000',
        animation: 'slideIn 0.3s ease',
        maxWidth: '300px'
    });
    
    // Set color based on type
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#10b981';
            break;
        case 'error':
            notification.style.backgroundColor = '#ef4444';
            break;
        default:
            notification.style.backgroundColor = '#3b82f6';
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/**
 * Performance Optimization
 */
// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Lazy load images (if any are added)
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}