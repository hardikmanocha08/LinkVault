import axios from "axios";
import { BACKEND_URL } from "../config";
import { DeleteIcon } from "../icons/DeleteIcon";

interface CardProps {
  readonly _id: string; // added so we can delete by ID
  readonly title: string;
  readonly link: string;
  readonly type: "twitter" | "youtube";
  readonly onDelete?: () => void; // callback to refetch or update UI
  readonly cardNumber?: number; // card number
}

export function Card({ _id, title, link, type, onDelete, cardNumber }: CardProps) {
  // Load Twitter widgets.js for embed
  if (type === "twitter") {
    setTimeout(() => {
      if (window && (window as any).twttr && (window as any).twttr.widgets) {
        (window as any).twttr.widgets.load();
      }
    }, 0);
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/content`, {
        headers:{
                "authorization":localStorage.getItem("token")
            },
        data: { content_id: _id }, // axios DELETE needs `data`
      });
      onDelete?.(); // trigger refresh
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div>
      <div className="p-4 pt-2 bg-white/80 backdrop-blur rounded-xl border border-white/60 shadow-md shadow-indigo-100 max-w-72 min-h-48 min-w-72 z-30">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-md font-semibold gap-2">
            {typeof cardNumber === 'number' && (
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 rounded-full px-2 py-1 mr-2">#{cardNumber + 1}</span>
            )}
            {title}
          </div>
          <div className="flex items-center">
            <div className="pr-2 text-gray-500 hover:text-red-500 cursor-pointer transition-colors">
              <button className="cursor-pointer" onClick={handleDelete}><DeleteIcon/></button>
            </div>
          </div>
        </div>

        <div className="pt-3">
          {type === "youtube" && (
            <iframe
              className="w-full"
              src={link.replace("watch", "embed").replace("?v=", "/")}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          )}

          {type === "twitter" && (
            <blockquote className="twitter-tweet">
              <a href={link.replace("x.com", "twitter.com")} aria-label="View tweet link">View Tweet</a>
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
}
