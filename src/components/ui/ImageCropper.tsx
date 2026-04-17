import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from './button';
import { Slider } from './slider';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogOverlay } from './dialog';
import getCroppedImg from '../../lib/canvasUtils';
import { Loader2 } from 'lucide-react';

interface ImageCropperProps {
    isOpen: boolean;
    imageSrc: string | null;
    aspect: number;
    onCancel: () => void;
    onCropComplete: (croppedImageBlob: Blob) => void;
}

export function ImageCropper({ isOpen, imageSrc, aspect, onCancel, onCropComplete }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const onCropChange = (crop: { x: number; y: number }) => setCrop(crop);
    const onZoomChange = (zoom: number) => setZoom(zoom);
    const onCropCompleteCallback = useCallback((_: any, croppedAreaPixels: any) => setCroppedAreaPixels(croppedAreaPixels), []);

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setLoading(true);
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedImage) onCropComplete(croppedImage);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            {/* ★ ここも暗くした！ */}
            <DialogOverlay className="bg-black/90 backdrop-blur-sm" />
            <DialogContent className="sm:max-w-xl bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-white">画像を調整する</DialogTitle>
                </DialogHeader>
                <div className="relative w-full h-[400px] bg-black rounded-md overflow-hidden my-4 border border-slate-700">
                    {imageSrc && (
                        <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={aspect} onCropChange={onCropChange} onCropComplete={onCropCompleteCallback} onZoomChange={onZoomChange} style={{ containerStyle: { background: '#000' } }} />
                    )}
                </div>
                <div className="space-y-4 px-2">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-400 w-12">ズーム</span>
                        <Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={(value) => setZoom(value[0])} className="flex-1" />
                    </div>
                </div>
                <DialogFooter className="mt-4 gap-2">
                    <Button variant="outline" onClick={onCancel} disabled={loading} className="border-slate-700 hover:bg-slate-800 text-black">キャンセル</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white border-0">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '切り抜きを決定'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}