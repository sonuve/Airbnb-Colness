import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback
} from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { updateListing } from "../../Redux/Listing";
import { LazyLoadImage } from "react-lazy-load-image-component";
const API_URL = import.meta.env.VITE_API_URL;

function EditListings() {

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const imageRef = useRef(null);

  const userListings =
    useSelector((state) => state.listing.userListing) || [];

  /* ---------- MEMOIZED LISTING ---------- */
  const listing = useMemo(() => {
    return userListings.find((l) => l._id === id);
  }, [userListings, id]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pricePerNight: "",
    city: "",
    state: ""
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- PREFILL DATA ---------- */
  useEffect(() => {
    if (!listing) return;

    setFormData({
      title: listing.title || "",
      description: listing.description || "",
      pricePerNight: listing.pricePerNight || "",
      city: listing.location?.city || "",
      state: listing.location?.state || ""
    });

    setExistingImages(listing.images || []);

  }, [listing]);

  /* ---------- INPUT CHANGE ---------- */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

  }, []);

  /* ---------- IMAGE ADD ---------- */
  const handleImageChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
  }, []);

  /* ---------- REMOVE EXISTING IMAGE ---------- */
  const removeExistingImage = useCallback((img) => {
    setExistingImages((prev) =>
      prev.filter((i) => i !== img)
    );
  }, []);

  /* ---------- REMOVE NEW IMAGE ---------- */
  const removeNewImage = useCallback((index) => {
    setNewImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }, []);

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) =>
        data.append(key, value)
      );

      existingImages.forEach((img) =>
        data.append("existingImages", img)
      );

      newImages.forEach((file) =>
        data.append("images", file)
      );

      const res = await axios.put(
        `${API_URL}/api/listing/update/listing/${id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          },
          withCredentials: true
        }
      );

      if (res.data.success) {

        dispatch(updateListing(res.data.listing));

        toast.success("Listing updated");

        navigate(`/room/${id}`);
      }

    } catch (error) {

      console.error(error);
      toast.error("Update failed");

    } finally {
      setLoading(false);
    }
  };

  /* ---------- NOT FOUND ---------- */
  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Listing not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">

      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-10">

        <h1 className="text-3xl font-bold mb-8">
          Edit Listing
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* TITLE */}
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Property title"
            className="w-full border rounded-xl p-4"
          />

          {/* DESCRIPTION */}
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Property description"
            className="w-full border rounded-xl p-4"
          />

          {/* PRICE + LOCATION */}
          <div className="grid md:grid-cols-3 gap-4">

            <input
              type="number"
              name="pricePerNight"
              value={formData.pricePerNight}
              onChange={handleChange}
              placeholder="Price"
              className="border rounded-xl p-4"
            />

            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="border rounded-xl p-4"
            />

            <input
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              className="border rounded-xl p-4"
            />

          </div>

          {/* IMAGE GRID */}
          <div>

            <input
              type="file"
              hidden
              multiple
              ref={imageRef}
              onChange={handleImageChange}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {/* EXISTING IMAGES */}
              {existingImages.map((img, idx) => (
                <div key={idx} className="relative">

                  <LazyLoadImage
                    src={img}
                    className="h-40 w-full object-cover rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={() => removeExistingImage(img)}
                    className="absolute top-2 right-2 bg-black text-white rounded-full px-2"
                  >
                    ✕
                  </button>

                </div>
              ))}

              {/* NEW IMAGES */}
              {newImages.map((file, idx) => (
                <div key={idx} className="relative">

                  <LazyLoadImage
                    src={URL.createObjectURL(file)}
                    className="h-40 w-full object-cover rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute top-2 right-2 bg-black text-white rounded-full px-2"
                  >
                    ✕
                  </button>

                </div>
              ))}

              {/* ADD BUTTON */}
              <div
                onClick={() => imageRef.current.click()}
                className="h-40 flex items-center justify-center border-2 border-dashed rounded-xl cursor-pointer"
              >
                Add Images
              </div>

            </div>

          </div>

          {/* SUBMIT */}
          <button
            disabled={loading}
            className="w-full bg-rose-500 text-white py-3 rounded-xl"
          >
            {loading ? "Updating..." : "Update Listing"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default React.memo(EditListings);
