import React, { useRef } from 'react';
import { Upload, X, Wand2, ImageIcon, Check } from 'lucide-react';
import { compressImage, compressImages } from '../../services/imageCompressor';

interface MediaSectionProps {
  thumbnailPreview?: string;
  imagePreviews?: string[];
  description?: string;
  aiLoading?: boolean;
  onThumbnailSelect: (file: File | null, previewUrl: string) => void;
  onImagesSelect: (files: File[], previewUrls: string[]) => void;
  onDescriptionChange: (val: string) => void;
  onGenerateAiDetails: () => void;
}

export const MediaSection: React.FC<MediaSectionProps> = ({
  thumbnailPreview,
  imagePreviews = [],
  description = '',
  aiLoading = false,
  onThumbnailSelect,
  onImagesSelect,
  onDescriptionChange,
  onGenerateAiDetails,
}) => {
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, { maxSizeKB: 2048, maxDimension: 1920, quality: 0.82 });
      const preview = URL.createObjectURL(compressed);
      onThumbnailSelect(compressed, preview);
    } catch {
      const preview = URL.createObjectURL(file);
      onThumbnailSelect(file, preview);
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    try {
      const compressedFiles = await compressImages(selectedFiles, { maxSizeKB: 2048, maxDimension: 1920, quality: 0.82 });
      const newPreviews = compressedFiles.map((f) => URL.createObjectURL(f));
      onImagesSelect(compressedFiles, [...imagePreviews, ...newPreviews]);
    } catch {
      const newPreviews = selectedFiles.map((f) => URL.createObjectURL(f));
      onImagesSelect(selectedFiles, [...imagePreviews, ...newPreviews]);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    const updated = imagePreviews.filter((_, i) => i !== index);
    onImagesSelect([], updated);
  };

  const handleAddUrlImage = () => {
    const url = prompt('Enter external image URL (optional):');
    if (url) {
      if (!thumbnailPreview) {
        onThumbnailSelect(null, url);
      } else {
        onImagesSelect([], [...imagePreviews, url]);
      }
    }
  };

  return (
    <div className="product-editor-card space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-blue-900/40 pb-4">
        <div>
          <h4 className="font-heading text-base font-bold text-white">
            Photos &amp; description
          </h4>
          <p className="text-xs text-blue-300 mt-0.5">
            Upload main cover photo, additional gallery images, and product description.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddUrlImage}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold rounded-xl border border-amber-400/30 transition-all shadow-md cursor-pointer"
        >
          + Add Image URL
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Thumbnail Cover Upload */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-white flex items-center justify-between">
            <span>Main Cover Thumbnail <span className="text-amber-400">*</span></span>
            <span className="text-[10px] text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full">
              Primary Card Image
            </span>
          </label>

          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="hidden"
          />

          {thumbnailPreview ? (
            <div className="relative h-48 rounded-2xl border-2 border-amber-400/60 overflow-hidden group bg-slate-900 shadow-xl">
              <img src={thumbnailPreview} alt="Cover Preview" className="w-full h-full object-contain p-2" />
              <span className="absolute bottom-2 left-2 bg-amber-400 text-blue-950 font-black text-[10px] px-3 py-1 rounded-full uppercase shadow-md flex items-center gap-1">
                <Check size={12} /> Main Cover Photo
              </span>
              <button
                type="button"
                onClick={() => onThumbnailSelect(null, '')}
                className="absolute top-2 right-2 h-7 w-7 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-lg transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => thumbnailInputRef.current?.click()}
              className="flex min-h-36 w-full flex-col items-center justify-center rounded-xl border border-dashed border-input bg-background p-4 text-center transition-colors hover:border-primary cursor-pointer"
            >
              <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Upload size={22} />
              </span>
              <span className="text-xs font-bold text-white">Upload cover image</span>
              <span className="mt-1 text-[11px] text-muted-foreground">PNG, JPG or WebP</span>
            </button>
          )}
        </div>

        {/* Gallery Upload */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-white flex items-center justify-between">
            <span>Product Gallery Photos</span>
            <span className="text-[10px] text-blue-300 font-bold">Multiple Images Allowed</span>
          </label>

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex min-h-36 w-full flex-col items-center justify-center rounded-xl border border-dashed border-input bg-background p-4 text-center transition-colors hover:border-primary cursor-pointer"
          >
            <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ImageIcon size={22} />
            </span>
            <span className="text-xs font-bold text-white">Add gallery photos</span>
            <span className="mt-1 text-[11px] text-muted-foreground">Select multiple photos at once</span>
          </button>
        </div>
      </div>

      {/* Gallery Previews Grid */}
      {imagePreviews.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold text-white">Uploaded Gallery Images ({imagePreviews.length})</p>
          <div className="flex flex-wrap gap-3">
            {imagePreviews.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 border border-blue-900/60 rounded-xl overflow-hidden group bg-slate-900 shadow-md">
                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(idx)}
                  className="absolute top-1 right-1 h-6 w-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Description with AI Wand */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-white">Product Description</label>
          <button
            type="button"
            onClick={onGenerateAiDetails}
            disabled={aiLoading}
            className="flex items-center gap-1.5 text-xs font-black text-blue-950 bg-amber-400 hover:bg-amber-500 px-3 py-1.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            <Wand2 className={`h-3.5 w-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
            {aiLoading ? 'Generating AI Description...' : '✨ Auto-Generate with AI'}
          </button>
        </div>

        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe your product benefits, origin, ingredients, usage instructions, or warranty..."
          className="w-full p-4 rounded-xl border border-blue-900/60 bg-slate-900 text-white text-xs font-medium focus:ring-2 focus:ring-amber-400/40 outline-none"
          rows={4}
        />
      </div>
    </div>
  );
};
