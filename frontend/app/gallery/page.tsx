'use client';
import { useEffect, useState } from 'react';
import { galleryAPI } from '@/lib/api';
import moment from 'moment';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';

const MINIO_URL = process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000';

export default function GalleryPage() {
    const { language } = useLanguage();
    const [albums, setAlbums] = useState<any[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
    const [photos, setPhotos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [photosLoading, setPhotosLoading] = useState(false);
    const [lightbox, setLightbox] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await galleryAPI.getAlbums();
                setAlbums(res.data.data || []);
            } catch {
                toast.error(language === 'hi' ? 'गैलरी लोड करने में विफल' : 'Failed to load gallery');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [language]);

    const openAlbum = async (album: any) => {
        setSelectedAlbum(album);
        setPhotosLoading(true);
        try {
            const res = await galleryAPI.getPhotos(album.id);
            setPhotos(res.data.data || []);
        } catch {
            toast.error(language === 'hi' ? 'फोटो लोड करने में विफल' : 'Failed to load photos');
        } finally {
            setPhotosLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-blue-900 text-white rounded-xl p-8 mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    {language === 'hi' ? 'फोटो गैलरी' : 'Photo Gallery'}
                </h1>
                <p className="text-blue-200">
                    {language === 'hi' ? 'टीसीआईएल के कार्यक्रमों और परियोजनाओं के क्षणों को कैद करना' : 'Capturing moments from TCIL events and projects'}
                </p>
            </div>

            {/* LIGHTBOX */}
            {lightbox && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white text-3xl"
                        onClick={() => setLightbox(null)}
                    >
                        ✕
                    </button>
                    <img
                        src={`${MINIO_URL}/tcil-media/${lightbox}`}
                        alt="Gallery"
                        className="max-w-full max-h-full object-contain rounded"
                    />
                </div>
            )}

            {selectedAlbum ? (
                <>
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => { setSelectedAlbum(null); setPhotos([]); }}
                            className="text-blue-600 hover:underline"
                        >
                            {language === 'hi' ? '← एल्बम पर वापस जाएं' : '← Back to Albums'}
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">
                            {language === 'hi' ? (selectedAlbum.title_hi || selectedAlbum.title_en) : selectedAlbum.title_en}
                        </h2>
                    </div>

                    {photosLoading ? (
                        <div className="text-center py-16 text-gray-400">
                            {language === 'hi' ? 'फोटो लोड हो रहे हैं...' : 'Loading photos...'}
                        </div>
                    ) : photos.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border">
                            <p className="text-4xl mb-4">📷</p>
                            <p>{language === 'hi' ? 'इस एल्बम में अभी कोई फोटो नहीं है' : 'No photos in this album yet'}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {photos.map((photo) => (
                                <div
                                    key={photo.id}
                                    className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity bg-gray-100"
                                    onClick={() => setLightbox(photo.file_key)}
                                >
                                    <img
                                        src={`${MINIO_URL}/tcil-media/${photo.thumb_key || photo.file_key}`}
                                        alt={language === 'hi' ? (photo.caption_hi || photo.caption_en || 'Gallery photo') : (photo.caption_en || 'Gallery photo')}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : loading ? (
                <div className="text-center py-16 text-gray-400">
                    {language === 'hi' ? 'एल्बम लोड हो रहे हैं...' : 'Loading albums...'}
                </div>
            ) : albums.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white rounded-xl border">
                    <p className="text-4xl mb-4">🖼️</p>
                    <p>{language === 'hi' ? 'कोई एल्बम नहीं मिला' : 'No albums found'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {albums.map((album) => (
                        <div
                            key={album.id}
                            onClick={() => openAlbum(album)}
                            className="bg-white border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                        >
                            <div className="bg-blue-100 h-40 flex items-center justify-center">
                                {album.cover_key ? (
                                    <img
                                        src={`${MINIO_URL}/tcil-media/${album.cover_key}`}
                                        alt={language === 'hi' ? (album.title_hi || album.title_en) : album.title_en}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-6xl">📷</span>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800">
                                    {language === 'hi' ? (album.title_hi || album.title_en) : album.title_en}
                                </h3>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-500">
                                        {album.photo_count || 0} {language === 'hi' ? 'फोटो' : 'photos'}
                                    </span>
                                    {album.event_date && (
                                        <span className="text-xs text-gray-400">
                                            {moment(album.event_date).format('MMM YYYY')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}