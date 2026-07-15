'use client';
import { useEffect, useState } from 'react';
import { galleryAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const MINIO_URL = process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000';

export default function AdminGalleryPage() {
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAlbumForm, setShowAlbumForm] = useState(false);
    const [albumForm, setAlbumForm] = useState({ title_en: '', title_hi: '', event_date: '' });
    const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
    const [photos, setPhotos] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const fetchAlbums = async () => {
        try {
            const res = await galleryAPI.getAlbums();
            setAlbums(res.data.data || []);
        } catch { toast.error('Failed to load albums'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAlbums(); }, []);

    const handleCreateAlbum = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await galleryAPI.createAlbum(albumForm);
            toast.success('Album created!');
            setShowAlbumForm(false);
            setAlbumForm({ title_en: '', title_hi: '', event_date: '' });
            fetchAlbums();
        } catch { toast.error('Failed to create album'); }
    };

    const handleUploadPhotos = async () => {
        if (!selectedAlbum || photos.length === 0) return;
        setUploading(true);
        try {
            const formData = new FormData();
            photos.forEach((p) => formData.append('photos', p));
            await galleryAPI.uploadPhotos(selectedAlbum.id, formData);
            toast.success(`${photos.length} photos uploaded!`);
            setPhotos([]);
            setSelectedAlbum(null);
        } catch { toast.error('Upload failed'); }
        finally { setUploading(false); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Gallery</h1>
                <button onClick={() => setShowAlbumForm(true)} className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    + Create Album
                </button>
            </div>

            {showAlbumForm && (
                <div className="bg-white rounded-xl border p-6 mb-6">
                    <h2 className="font-bold text-gray-800 mb-4">Create New Album</h2>
                    <form onSubmit={handleCreateAlbum} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Album Title (English) *</label>
                                <input type="text" value={albumForm.title_en} onChange={(e) => setAlbumForm({ ...albumForm, title_en: e.target.value })} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. Annual Day 2026" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Album Title (Hindi)</label>
                                <input type="text" value={albumForm.title_hi} onChange={(e) => setAlbumForm({ ...albumForm, title_hi: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="वार्षिक दिवस" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Event Date</label>
                                <input type="date" value={albumForm.event_date} onChange={(e) => setAlbumForm({ ...albumForm, event_date: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Create Album</button>
                            <button type="button" onClick={() => setShowAlbumForm(false)} className="border px-6 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {selectedAlbum && (
                <div className="bg-white rounded-xl border p-6 mb-6">
                    <h2 className="font-bold text-gray-800 mb-4">Upload Photos to: {selectedAlbum.title_en}</h2>
                    <input type="file" accept="image/*" multiple onChange={(e) => setPhotos(Array.from(e.target.files || []))} className="w-full border rounded-lg px-3 py-2 text-sm mb-4" />
                    {photos.length > 0 && <p className="text-sm text-gray-600 mb-4">{photos.length} photos selected</p>}
                    <div className="flex gap-3">
                        <button onClick={handleUploadPhotos} disabled={uploading || photos.length === 0} className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {uploading ? 'Uploading...' : `Upload ${photos.length} Photos`}
                        </button>
                        <button onClick={() => setSelectedAlbum(null)} className="border px-6 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
                    </div>
                </div>
            )}

            {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {albums.length === 0 ? (
                        <div className="col-span-3 text-center py-16 text-gray-400 bg-white rounded-xl border">No albums yet</div>
                    ) : albums.map((album) => (
                        <div key={album.id} className="bg-white border rounded-xl p-4">
                            <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center mb-3 text-4xl">📷</div>
                            <h3 className="font-bold text-gray-800">{album.title_en}</h3>
                            <p className="text-sm text-gray-500 mb-3">{album.photo_count || 0} photos</p>
                            <button onClick={() => setSelectedAlbum(album)} className="w-full bg-blue-900 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
                                Upload Photos
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}