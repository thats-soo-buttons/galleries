import React, { useEffect, useState } from "react";

interface GalleryProps {
  folderId: string;
}

const Gallery: React.FC<GalleryProps> = ({ folderId }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imagesPerPage, setImagesPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/listImages?folderId=${folderId}`);
        const data = await res.json();
        if (data.error) {
          console.error('Gallery API error:', data);
          setError(`Error: ${data.error} Details: ${data.details || ''}`);
        } else {
          setImages(data.images);
        }
      } catch (err) {
        console.error('Gallery fetchImages catch error:', err);
        setError(`Failed to load images. ${typeof err === 'object' && err && 'message' in err ? (err as any).message : ''}`);
      }
      setLoading(false);
    }
    fetchImages();
  }, [folderId]);

  if (loading) return <div>Loading gallery...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!images.length) return <div>No images found in this gallery.</div>;

  // Pagination logic
  const totalImages = images.length;
  const totalPages = Math.ceil(totalImages / imagesPerPage);
  const paginatedImages = images.slice((currentPage - 1) * imagesPerPage, currentPage * imagesPerPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-bold text-green-700">Images: {totalImages}</div>
        <div>
          <label htmlFor="imagesPerPage" className="mr-2 text-green-700">Images per page:</label>
          <select
            id="imagesPerPage"
            value={imagesPerPage}
            onChange={e => {
              setImagesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-green-400 rounded px-2 py-1"
          >
            {[6, 9, 12, 18].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
      </div>
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8`}>
        {paginatedImages.map((img: any) => (
          <div key={img.id || img.name} className="border-4 border-green-400 rounded-lg shadow-lg flex flex-col items-center bg-white p-4">
            <img
              src={img.thumbnailUrl || img.url}
              alt={img.name}
              className="w-full h-auto mb-2 rounded-lg"
              style={{ maxWidth: 300, border: '3px solid #22c55e', boxShadow: '0 4px 16px #22c55e33' }}
            />
            <div className="text-green-700 font-semibold mb-2">{img.name}</div>
            <a
              href={img.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2"
            >
              <button className="bg-yellow-400 text-green-900 px-4 py-2 rounded shadow hover:bg-yellow-500 transition">Download</button>
            </a>
          </div>
        ))}
      </div>
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <button
            className="px-3 py-1 mx-1 rounded bg-green-200 text-green-700 font-bold disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >Previous</button>
          <span className="px-3 py-1 mx-1 text-green-700">Page {currentPage} of {totalPages}</span>
          <button
            className="px-3 py-1 mx-1 rounded bg-green-200 text-green-700 font-bold disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >Next</button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
