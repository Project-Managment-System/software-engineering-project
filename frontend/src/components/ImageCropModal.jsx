import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, RotateCw, RefreshCw, X, Check } from 'lucide-react';

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getRadianAngle = (degreeValue) => (degreeValue * Math.PI) / 180;

const rotateSize = (width, height, rotation) => {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

// Crops + rotates the source image per react-easy-crop's pixel-crop output, then downscales
// and re-encodes as JPEG so large phone-camera photos do not get uploaded at full resolution.
const getCroppedImg = async (imageSrc, pixelCrop, rotation, maxOutputSize) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const rotRad = getRadianAngle(rotation);

  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.putImageData(data, 0, 0);

  let outputCanvas = canvas;
  if (canvas.width > maxOutputSize || canvas.height > maxOutputSize) {
    const scale = maxOutputSize / Math.max(canvas.width, canvas.height);
    const small = document.createElement('canvas');
    small.width = Math.round(canvas.width * scale);
    small.height = Math.round(canvas.height * scale);
    small.getContext('2d').drawImage(canvas, 0, 0, small.width, small.height);
    outputCanvas = small;
  }

  return outputCanvas.toDataURL('image/jpeg', 0.85);
};

// Reusable image crop/zoom/rotate modal — takes a raw image data URL, returns a cropped,
// compressed JPEG data URL via onSave. Used today for profile photo uploads.
export default function ImageCropModal({ imageSrc, onCancel, onSave, aspect = 1, cropShape = 'round', maxOutputSize = 512 }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropComplete = useCallback((_croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels || isSaving) return;
    setIsSaving(true);
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, maxOutputSize);
      onSave(cropped);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="crop-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="crop-modal-panel"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="crop-modal-header">
            <span>Adjust Photo</span>
            <button type="button" className="crop-modal-close-btn" onClick={onCancel} title="Cancel">
              <X size={18} />
            </button>
          </div>

          <div className="crop-modal-stage">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              cropShape={cropShape}
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="crop-modal-controls">
            <div className="crop-modal-slider-row">
              <ZoomIn size={16} />
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="crop-modal-slider"
              />
            </div>
            <div className="crop-modal-slider-row">
              <RotateCw size={16} />
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="crop-modal-slider"
              />
            </div>
          </div>

          <div className="crop-modal-actions">
            <button type="button" className="cancel-btn" onClick={handleReset}>
              <RefreshCw size={14} /> Reset
            </button>
            <button type="button" className="cancel-btn" onClick={onCancel}>
              <X size={14} /> Cancel
            </button>
            <button type="button" className="save-btn" onClick={handleSave} disabled={isSaving}>
              <Check size={14} /> {isSaving ? 'Saving...' : 'Save Photo'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
