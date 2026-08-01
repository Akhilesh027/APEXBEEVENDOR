import React from 'react';

interface MediaSectionProps {
  thumbnail?: string;
  images: string[];
  onChange: (field: string, value: any) => void;
}

export const MediaSection: React.FC<MediaSectionProps> = ({ thumbnail, images, onChange }) => {
  const handleAddImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      onChange('images', [...images, url]);
      if (!thumbnail) {
        onChange('thumbnail', url);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange('images', updated);
    if (thumbnail === images[index]) {
      onChange('thumbnail', updated[0] || '');
    }
  };

  return (
    <div className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Product Media & Gallery</h4>
        <button
          type="button"
          onClick={handleAddImageUrl}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
        >
          + Add Image URL
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
            <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemoveImage(idx)}
              className="absolute top-1 right-1 p-1 bg-red-600 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
            {thumbnail === img && (
              <span className="absolute bottom-0 inset-x-0 bg-amber-600 text-white text-[10px] text-center font-bold">
                Cover
              </span>
            )}
          </div>
        ))}

        {images.length === 0 && (
          <div className="w-full p-6 text-center border-2 border-dashed rounded-lg text-xs text-gray-500 dark:border-gray-700">
            No images uploaded yet. Click "+ Add Image URL" to add product photos.
          </div>
        )}
      </div>
    </div>
  );
};
