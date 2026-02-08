import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function S3Image({ imageKey, className = 'w-16 h-16', onClick, alt = 'image' }) {
  const [url, setUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    let isMounted = true;
    if (imageKey) {
      fetch(`/api/s3-image?key=${encodeURIComponent(imageKey)}`)
        .then(res => res.json())
        .then(data => { if (isMounted && data.url) setUrl(data.url); })
        .catch(() => {});
    }
    return () => { isMounted = false; };
  }, [imageKey]);
  if (!url) return (
    <div className={`${className} bg-purple-100 animate-pulse rounded-xl border border-purple-200/60`} />
  );
  return (
    <>
      <Image
        src={url}
        alt={alt}
        unoptimized
        className={`${className} object-cover rounded-xl border border-purple-200/60 shadow cursor-pointer hover:scale-105 transition-transform duration-200`}
        onClick={(e) => { e?.stopPropagation(); setShowModal(true); if (onClick) onClick(); }}
        style={{ background: '#f3e8ff' }}
      />
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative z-10 max-w-4xl w-full">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 z-20 bg-black/40 text-white rounded-full p-2"
              aria-label="Close image"
            >
              ✕
            </button>
            <Image src={url} alt="preview" unoptimized className="w-full h-auto rounded-xl shadow-lg" />
          </div>
        </div>
      )}
    </>
  );
}
