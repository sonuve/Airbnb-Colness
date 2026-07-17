import React, { useEffect, useRef, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

function HotelSlider({ hotels }) {
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef(null);

  // Automatic slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % hotels.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [hotels.length]);

  // Scroll horizontally without affecting page scroll
  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      const child = slider.children[current];
      if (child) {
        // Calculate the horizontal scroll to center the active slide
        const sliderCenter = slider.offsetWidth / 2;
        const childCenter =
          child.offsetLeft + child.offsetWidth / 2;
        slider.scrollTo({
          left: childCenter - sliderCenter,
          behavior: "smooth",
        });
      }
    }
  }, [current]);

  if (!hotels || hotels.length === 0) return null;

  return (
    <div className="relative w-full mt-6">
      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="flex overflow-x-auto snap-x gap-6 px-4 scrollbar-hide"
        style={{ scrollBehavior: "smooth" }} // smooth horizontal scroll
      >
        {hotels.map((hotel, index) => (
          <div
            key={hotel._id}
            className={`snap-center flex-shrink-0 w-[300px] md:w-[400px] lg:w-[500px] transition-transform duration-500 cursor-pointer ${
              index === current ? "scale-105" : "scale-95 opacity-70"
            }`}
            onClick={() => window.location.href = `/room/${hotel._id}`} 
          >
            <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition">
              <LazyLoadImage
                src={hotel.images?.[0] || "/default-room.jpg"}
                alt={hotel.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                <h3 className="font-bold text-lg md:text-xl">{hotel.title}</h3>
                <p className="text-sm md:text-base">📍 {hotel.location?.city}</p>
                <p className="text-lg md:text-xl font-bold">
                  ₹{hotel.pricePerNight}/night
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center mt-4 gap-2">
        {hotels.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full transition ${
              current === idx ? "bg-[#fe395c]" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default HotelSlider;