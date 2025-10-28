import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.less';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [bannerSlide, setBannerSlide] = React.useState(0);
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);

  const bannerImages = [
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  ];

  const bannerContent = [
    { title: 'Discover', subtitle: 'Amazing Black Friday Deals' },
    { title: 'Premium', subtitle: 'Quality Tech Products' },
    { title: 'Stay', subtitle: 'Connected with Smart Gear' },
    { title: 'Power', subtitle: 'Up Your Tech Game' },
  ];

  const carouselImages = [
    'https://images.unsplash.com/photo-1491933382434-500287f9a7f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
  ];

  const carouselCaptions = [
    {
      title: 'Discover Innovation',
      subtitle: 'Explore cutting-edge tech solutions',
    },
    { title: 'Premium Quality', subtitle: 'Only the best tech gear for you' },
    { title: 'Stay Connected', subtitle: 'Next-gen gadgets for modern life' },
    {
      title: 'Power Your Productivity',
      subtitle: 'Tools designed for performance',
    },
  ];

  const faqs = [
    {
      question: 'What is the warranty period for your products?',
      answer:
        'All our products come with a minimum 1-year warranty, with select items offering extended coverage. Please check individual product pages for details.',
    },
    {
      question: 'Do you offer free shipping?',
      answer:
        'Yes, we offer free shipping on orders over $50. For orders below this amount, a flat shipping fee applies.',
    },
    {
      question: 'Can I return or exchange a product?',
      answer:
        'We have a 30-day return and exchange policy. Products must be unused and in their original packaging. Visit our return policy page for more information.',
    },
    {
      question: 'How can I track my order?',
      answer:
        'Once your order is shipped, you will receive a tracking link via email. You can also track your order through your account dashboard.',
    },
    {
      question: 'Do you provide technical support for your products?',
      answer:
        'Yes, our customer support team is available 24/7 to assist with any technical issues. Contact us via email or live chat for assistance.',
    },
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setBannerSlide((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + carouselImages.length) % carouselImages.length
    );
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="home-page">
      {/* Black Friday Banner */}
      <div className="black-friday-banner fade-in">
        <div className="banner-container">
          {bannerImages.map((img, index) => (
            <div
              key={index}
              className={`banner-slide ${
                bannerSlide === index ? 'active' : ''
              }`}
            >
              <div className="banner-content">
                <h2 className="slide-in-left">{bannerContent[index].title}</h2>
                <p className="slide-in-right">
                  {bannerContent[index].subtitle}
                </p>
              </div>
              <img
                src={img}
                alt={`Banner ${index + 1}`}
                className="banner-img"
              />
            </div>
          ))}
        </div>
        <div className="banner-indicators">
          {bannerImages.map((_, index) => (
            <span
              key={index}
              className={`indicator ${bannerSlide === index ? 'active' : ''}`}
              onClick={() => setBannerSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Main Carousel */}
      <div className="carousel-container fade-in">
        <div
          className="carousel"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {carouselImages.map((img, index) => (
            <div key={index} className="carousel-slide">
              <img
                src={img}
                alt={`Slide ${index + 1}`}
                className="carousel-img"
              />
              <div className="carousel-caption">
                <h2 className="slide-in-left">
                  {carouselCaptions[index].title}
                </h2>
                <p className="slide-in-right">
                  {carouselCaptions[index].subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-btn prev" onClick={prevSlide}>
          ❮
        </button>
        <button className="carousel-btn next" onClick={nextSlide}>
          ❯
        </button>
      </div>

      {/* Welcome Section */}
      <section className="welcome-section section-fade-in">
        <div className="d-flex justify-content-center pt-4">
          <h1>Welcome to NextTech</h1>
        </div>
      </section>

      {/* Grid Images Section */}
      <div className="container marketing section-fade-in">
        <div className="grid-images-container">
          <div className="main-image">
            <img
              src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="laptop"
              className="grid-img"
            />
            <button className="image-label" onClick={() => navigate('/store')}>
              Laptop
            </button>
          </div>
          <div className="sub-images">
            <div className="sub-image">
              <img
                src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="keyboard"
                className="grid-img"
              />
              <button
                className="image-label"
                onClick={() => navigate('/store')}
              >
                Keyboard
              </button>
            </div>
            <div className="sub-image">
              <img
                src="https://images.unsplash.com/photo-1527814050087-3793815479db?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="mouse"
                className="grid-img"
              />
              <button
                className="image-label"
                onClick={() => navigate('/store')}
              >
                Mouse
              </button>
            </div>
            <div className="sub-image">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="headphone"
                className="grid-img"
              />
              <button
                className="image-label"
                onClick={() => navigate('/store')}
              >
                Headphone
              </button>
            </div>
            <div className="sub-image">
              <img
                src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="earphone"
                className="grid-img"
              />
              <button
                className="image-label"
                onClick={() => navigate('/store')}
              >
                Earphone
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Product Container 1 */}
      <div className="feature-product-container section-fade-in">
        <div className="fd-image-container">
          <img
            src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            alt="Advanced Tech Gadgets"
            className="fd-img"
          />
          <img
            src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            alt="High-Performance Accessories"
            className="fd-img"
          />
        </div>
        <div className="fd-text">
          <p className="text-header">Premium Tech Gadgets</p>
          <p className="text-title">Empower Your Productivity</p>
          <p className="text-content">
            Discover cutting-edge gadgets and accessories tailored for work and
            play.
            <br />
            From ergonomic keyboards to precision gaming mice,
            <br />
            our products ensure top-notch quality and unmatched comfort.
            <br />
            Elevate your setup today with gear designed to perform!
          </p>
        </div>
      </div>

      {/* Feature Product Container 2 */}
      <div className="feature-product-container section-fade-in">
        <div className="fd-text">
          <p className="text-header">Next-Gen Accessories</p>
          <p className="text-title">Redefine Your Workspace</p>
          <p className="text-content">
            Browse through our collection of innovative tech accessories.
            <br />
            Perfect for professionals and gamers alike,
            <br />
            our selection combines style, durability, and performance.
            <br />
            Upgrade your gear now and stay ahead of the curve!
          </p>
        </div>
        <div className="fd-image-container">
          <img
            src="https://images.unsplash.com/photo-1585846416120-3a7354ed7d39?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            alt="Modern Workspace Setup"
            className="fd-img"
          />
          <img
            src="https://images.unsplash.com/photo-1583861477882-48c03e7adc4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            alt="Ultimate Gaming Accessories"
            className="fd-img"
          />
        </div>
      </div>

      {/* Featured Products */}
      <div className="featured-products section-fade-in">
        <div className="section-title">Featured Products</div>
        <div className="section-subtitle">THE BEST TECH GEAR</div>
        <div className="section-description">
          Explore innovative gadgets to enhance your tech experience.
        </div>
        <div className="features-list">
          <div className="feature-item">
            <i className="fas fa-microchip feature-icon"></i>
            <div className="feature-title">Advanced Performance</div>
            <div className="feature-description">
              <p>Tech designed to keep up with your productivity needs.</p>
            </div>
          </div>
          <div className="feature-item">
            <i className="fas fa-cogs feature-icon"></i>
            <div className="feature-title">Reliable Durability</div>
            <div className="feature-description">
              <p>High-quality materials for long-lasting use.</p>
            </div>
          </div>
          <div className="feature-item">
            <i className="fas fa-lightbulb feature-icon"></i>
            <div className="feature-title">Innovative Design</div>
            <div className="feature-description">
              <p>Modern and ergonomic designs tailored for every user.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="faq-section section-fade-in">
        <div className="container">
          <div className="faq-header">
            <h2>Frequently Asked Questions</h2>
            <p>
              Your questions answered—find what you need to know about our
              products and services.
            </p>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div
                  className={`faq-question ${
                    activeFaq === index ? 'active' : ''
                  }`}
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                </div>
                <div
                  className={`faq-answer ${activeFaq === index ? 'show' : ''}`}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
