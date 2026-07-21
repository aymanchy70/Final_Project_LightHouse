import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, Keyboard } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import '../../styles/hero-slider.css';

// ─── Slide data ────────────────────────────────────────────────────────────────

interface SlideData {
  id: number;
  imageUrl: string;
  quote: string;
  author: string;
  icon: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600&q=80',
    quote: 'বই পড়া মানে এক হাজার জীবন বাঁচিয়ে দেখা।',
    author: '— হ্যারিয়েট বীচার স্টো',
    icon: '📚',
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=80',
    quote: 'একটি বই হলো একটি স্বপ্ন যা তুমি তোমার হাতে ধরো।',
    author: '— নিল গেইমান',
    icon: '📖',
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&q=80',
    quote: 'পড়ার মধ্যে দিয়ে আমরা অন্যের অভিজ্ঞতায় বাঁচতে পারি।',
    author: '— লেভ তলস্তয়',
    icon: '📚',
  },
  {
    id: 4,
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=80',
    quote: 'বই হলো মানুষের সবচেয়ে বিশ্বস্ত বন্ধু।',
    author: '— চার্লস ডিকেন্স',
    icon: '📖',
  },
  {
    id: 5,
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1600&q=80',
    quote: 'যে পড়ে না, সে যে পড়তে পারে না তার চেয়ে কোনো সুবিধায় নেই।',
    author: '— মার্ক টোয়েন',
    icon: '📚',
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

const HeroSlider = (): JSX.Element => {
  return (
    <Swiper
      className="hero-swiper"
      modules={[Autoplay, Pagination, Navigation, Keyboard]}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      loop={true}
      speed={800}
      pagination={{ clickable: true }}
      navigation={true}
      keyboard={{ enabled: true }}
    >
      {SLIDES.map(slide => (
        <SwiperSlide key={slide.id}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>

            {/* ── Background image ──────────────────── */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url("${slide.imageUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 30%',
              backgroundRepeat: 'no-repeat',
            }} />

            {/* ── Overlay ───────────────────────────── */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(249,246,240,0.85) 0%, rgba(249,246,240,0.75) 100%)',
            }} />

            {/* ── Content ───────────────────────────── */}
            <div style={{
              position: 'relative', zIndex: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px',
              textAlign: 'center',
            }}>

              {/* Book logo */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{
                  width: '100px',
                  height: '140px',
                  margin: '0 auto',
                  borderRadius: '14px',
                  background: 'linear-gradient(145deg, #2C3E50 0%, #1a1a2e 100%)',
                  border: '2px solid #C0392B',
                  boxShadow: '0 25px 45px rgba(0,0,0,0.3), 0 0 0 4px rgba(192,57,43,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.8rem',
                }}>{slide.icon}</div>

                {/* Glow below logo */}
                <div style={{
                  width: '140px', height: '8px',
                  margin: '14px auto 0',
                  background: 'radial-gradient(ellipse, rgba(192,57,43,0.4), transparent)',
                  borderRadius: '50%',
                }} />
              </div>

              {/* Quote card */}
              <div style={{
                background: 'rgba(44,62,80,0.08)',
                backdropFilter: 'blur(6px)',
                borderRadius: '40px',
                padding: '18px 32px',
                maxWidth: '560px',
                border: '1px solid rgba(255,255,255,0.35)',
              }}>
                <p style={{
                  fontSize: '1.1rem',
                  fontStyle: 'italic',
                  color: '#1a1a2e',
                  margin: '0 0 10px',
                  lineHeight: 1.65,
                  fontWeight: 500,
                  textShadow: '0 1px 2px rgba(255,255,255,0.5)',
                }}>"{slide.quote}"</p>

                <p style={{
                  fontSize: '0.8rem',
                  color: '#2C3E50',
                  margin: 0,
                  letterSpacing: '0.3px',
                  opacity: 0.85,
                  fontWeight: 500,
                }}>{slide.author}</p>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroSlider;
