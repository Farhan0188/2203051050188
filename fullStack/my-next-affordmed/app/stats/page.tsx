'use client';
import { useEffect, useState } from 'react';

type ShortUrlStats = {
  shortUrl: string;
  originalUrl: string;
  shortcode: string;
  createdAt: string;
  expiresAt: string;
  clickCount: number;
  clicks: Array<{
    timestamp: string;
    source?: string;
  }>;
};

export default function StatisticsPage() {
  const [stats, setStats] = useState<ShortUrlStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const mockData: ShortUrlStats[] = [
          {
            shortUrl: 'http://localhost:3000/abc123',
            originalUrl: 'https://example.com/long-url-1',
            shortcode: 'abc123',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            clickCount: 3,
            clicks: [
              { timestamp: new Date(Date.now() - 3600000).toISOString(), source: 'Direct' },
              { timestamp: new Date(Date.now() - 7200000).toISOString(), source: 'Twitter' },
              { timestamp: new Date(Date.now() - 10800000).toISOString(), source: 'Email' },
            ],
          },
          // Add more mock items as needed
        ];
        
        setStats(mockData);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4">Loading statistics...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">URL Shortener Statistics</h1>
      
      {stats.length === 0 ? (
        <p>No shortened URLs found.</p>
      ) : (
        <div className="space-y-6">
          {stats.map((item, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Original URL</p>
                  <p className="break-all">{item.originalUrl}</p>
                </div>
                <div>
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
                <div>
                  <p className="text-sm text-gray-500">Shortcode</p>
                  <p>{item.shortcode}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Created at</p>
                  <p>{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expires at</p>
                  <p>{new Date(item.expiresAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total clicks</p>
                  <p className="text-xl font-semibold">{item.clickCount}</p>
                </div>
              </div>
              
              {item.clickCount > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Click Details</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {item.clicks.map((click, clickIndex) => (
                          <tr key={clickIndex}>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {new Date(click.timestamp).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {click.source || 'Unknown'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}