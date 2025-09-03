import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { BACKEND_URL } from '../config';

interface ShareData {
  username: string;
  content: any[];
}

export function SharePage() {
  const { shareLink } = useParams<{ shareLink: string }>();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShareData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/brain/${shareLink}`);
        setShareData(response.data);
      } catch (err) {
        setError('Failed to load shared content');
        console.error('Error fetching share data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (shareLink) {
      fetchShareData();
    }
  }, [shareLink]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading shared content...</div>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-red-600">{error || 'Content not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4">
      <div className="max-w-2xl sm:max-w-6xl mx-auto">
        <div className="mb-8 px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            {shareData.username}'s Brain
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Shared content from {shareData.username}
          </p>
        </div>
        <div className="flex gap-3 sm:gap-4 flex-wrap justify-center">
          {shareData.content && shareData.content.length > 0 ? (
            shareData.content.map(({ _id, type, link, title }, idx) => (
              <Card 
                key={_id} 
                _id={_id} 
                title={title} 
                type={type} 
                link={link}
                cardNumber={idx}
                // No onDelete callback for shared content
              />
            ))
          ) : (
            <div className="text-gray-500 text-lg">
              No content available to share
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
