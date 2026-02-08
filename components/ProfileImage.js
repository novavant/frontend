import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';

const S3_ENDPOINT = process.env.NEXT_PUBLIC_S3_ENDPOINT;
const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;

export default function ProfileImage({ 
  profile, 
  className = 'w-12 h-12', 
  iconClassName = 'w-6 h-6',
  primaryColor = '#fe7d17',
  alt = 'Profile'
}) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (profile) {
      setLoading(true);
      fetch(`/api/s3-image?key=${encodeURIComponent(profile)}`)
        .then(res => res.json())
        .then(data => { 
          if (isMounted && data.url) {
            setUrl(data.url);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setUrl(null);
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [profile]);

  // If no profile or loading, show default icon
  if (!profile || loading || !url) {
    return (
      <div 
        className={`${className} rounded-full flex items-center justify-center`}
        style={{ backgroundColor: `${primaryColor}15` }}
      >
        <Icon icon="mdi:account" className={iconClassName} style={{ color: primaryColor }} />
      </div>
    );
  }

  // Show profile image
  return (
    <div className={`${className} rounded-full overflow-hidden relative`}>
      <Image
        src={url}
        alt={alt}
        unoptimized
        fill
        className="object-cover"
      />
    </div>
  );
}

