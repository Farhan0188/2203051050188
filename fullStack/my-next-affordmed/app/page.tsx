'use client';
import { useState } from 'react';
// import { isValidUrl, isValidShortcode } from '@/lib/utils';
import { isValidUrl, isValidShortcode } from './lib/util';

type ShortUrlItem = {
  originalUrl: string;
  shortUrl: string;
  expiresAt: string;
  shortcode: string;
};

export default function UrlShortener() {
  const [urls, setUrls] = useState<Array<{
    originalUrl: string;
    validity: string;
    shortcode: string;
  }>>([{ originalUrl: '', validity: '30', shortcode: '' }]);
  
  const [shortenedUrls, setShortenedUrls] = useState<ShortUrlItem[]>([]);
  const [errors, setErrors] = useState<Record<number, string>>({});

  const validateInputs = (index: number) => {
    const newErrors = { ...errors };
    const current = urls[index];
    
    // Validate URL
    if (!current.originalUrl) {
      newErrors[index] = 'URL is required';
    } else if (!isValidUrl(current.originalUrl)) {
      newErrors[index] = 'Invalid URL format';
    }
    // Validate validity (if provided)
    else if (current.validity && isNaN(Number(current.validity))) {
      newErrors[index] = 'Validity must be a number';
    }
    // Validate shortcode (if provided)
    else if (current.shortcode && !isValidShortcode(current.shortcode)) {
      newErrors[index] = 'Shortcode must be 4-20 alphanumeric characters';
    } else {
      delete newErrors[index];
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = { ...newUrls[index], [field]: value };
    setUrls(newUrls);
    
    if (errors[index]) {
      validateInputs(index);
    }
  };

  const addUrlField = () => {
    if (urls.length < 5) {
      setUrls([...urls, { originalUrl: '', validity: '30', shortcode: '' }]);
    }
  };

  const removeUrlField = (index: number) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
      
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const shortenUrls = async () => {
    // Validate all inputs first
    const allValid = urls.every((_, index) => validateInputs(index));
    if (!allValid) return;

    try {
      const results = await Promise.all(
        urls.map(async (url) => {
          const response = await fetch('/api/shorturls', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: url.originalUrl,
              validity: url.validity ? parseInt(url.validity) : undefined,
              shortcode: url.shortcode || undefined,
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to shorten URL: ${url.originalUrl}`);
          }
          
          return await response.json();
        })
      );
      
      setShortenedUrls([...shortenedUrls, ...results]);
    } catch (error) {
      console.error('Error shortening URLs:', error);
      alert('An error occurred while shortening URLs. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">URL Shortener</h1>
      
      <div className="space-y-4">
        {urls.map((url, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Original URL *
                </label>
                <input
                  type="text"
                  value={url.originalUrl}
                  onChange={(e) => handleInputChange(index, 'originalUrl', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="https://example.com/very-long-url"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Validity (minutes)
                </label>
                <input
                  type="number"
                  value={url.validity}
                  onChange={(e) => handleInputChange(index, 'validity', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="30"
                  min="1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Custom Shortcode (optional)
                </label>
                <input
                  type="text"
                  value={url.shortcode}
                  onChange={(e) => handleInputChange(index, 'shortcode', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="my-custom-code"
                />
              </div>
              
              <div className="flex items-end">
                {urls.length > 1 && (
                  <button
                    onClick={() => removeUrlField(index)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            
            {errors[index] && (
              <p className="text-red-500 text-sm mt-2">{errors[index]}</p>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex space-x-4 mt-4">
        {urls.length < 5 && (
          <button
            onClick={addUrlField}
            className="bg-gray-200 p-2 rounded hover:bg-gray-300"
          >
            + Add Another URL
          </button>
        )}
        
        <button
          onClick={shortenUrls}
          disabled={Object.keys(errors).length > 0}
          className={`p-2 rounded text-white ${
            Object.keys(errors).length > 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          Shorten URLs
        </button>
      </div>
      
      {shortenedUrls.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Shortened URLs</h2>
          <div className="space-y-3">
            {shortenedUrls.map((item, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Original URL</p>
                    <p className="break-all">{item.originalUrl}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Expires at</p>
                    <p>{new Date(item.expiresAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Short URL</p>
                  <a
                    href={item.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
                  >
                    {item.shortUrl}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}