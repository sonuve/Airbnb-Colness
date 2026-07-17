import React,
{
  useRef,
  useState,
  useEffect,
  useCallback,
  Suspense
} from "react";

import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { addListing } from "../../Redux/Listing";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import imageCompression from "browser-image-compression";
const API_URL = import.meta.env.VITE_API_URL;
const Nav2 = React.lazy(() => import("../Components/Nav2.jsx"));

function ListingCreate() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const imageRef = useRef(null);

  const MAX_IMAGES = 10;

  const [loading,setLoading] = useState(false);

  const [form,setForm] = useState({
    title:"",
    description:"",
    category:"",
    maxGuests:"",
    pricePerNight:"",
    washrooms:"",
    bedrooms:"",
    beds:"",
    address:"",
    city:"",
    state:"",
    country:""
  });

  const [images,setImages] = useState([]);
  const [preview,setPreview] = useState([]);

  /* ---------------- INPUT CHANGE ---------------- */

  const handleChange = useCallback((e)=>{

    const {name,value} = e.target;

    setForm(prev => ({
      ...prev,
      [name]:value
    }));

  },[]);

  /* ---------------- IMAGE CHANGE ---------------- */

  const handleImageChange = useCallback(async (e)=>{

    const files = Array.from(e.target.files);

    if(images.length + files.length > MAX_IMAGES){
      toast.error("Maximum 10 images allowed");
      return;
    }

    try{

      const compressed = await Promise.all(
        files.map(file =>
          imageCompression(file,{
            maxSizeMB:2,
            maxWidthOrHeight:1280
          })
        )
      );

      const newPreview = compressed.map(file => ({
        file,
        url:URL.createObjectURL(file)
      }));

      setImages(prev => [...prev,...compressed]);
      setPreview(prev => [...prev,...newPreview]);

    }catch(err){

      toast.error("Image compression failed");

    }

  },[images]);

  /* ---------------- REMOVE IMAGE ---------------- */

  const removeImage = useCallback((index)=>{

    setImages(prev => prev.filter((_,i)=>i!==index));

    setPreview(prev=>{
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_,i)=>i!==index);
    });

  },[]);

  /* ---------------- CLEAN MEMORY ---------------- */

  useEffect(()=>{
    return ()=>{
      preview.forEach(img => URL.revokeObjectURL(img.url));
    };
  },[preview]);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = useCallback(async(e)=>{

    e.preventDefault();

    try{

      setLoading(true);

      const data = new FormData();

      Object.entries(form).forEach(([key,value])=>{
        data.append(key,value);
      });

      images.forEach(img => data.append("images",img));

      const res = await axios.post(
        `${API_URL}/api/listing/add/listing`,
        data,
        {
          headers:{ "Content-Type":"multipart/form-data" },
          withCredentials:true
        }
      );

      if(res.data.success){

        dispatch(addListing(res.data.listing));
        toast.success(res.data.message);
        navigate("/");

      }

    }catch(err){

      console.log(err);
      toast.error("Something went wrong");

    }finally{

      setLoading(false);

    }

  },[form,images,dispatch,navigate]);

  /* ---------------- UI ---------------- */

  return (

    <>

      <Suspense fallback={<div>Loading...</div>}>
        <Nav2/>
      </Suspense>

      <div className="min-h-screen bg-gray-100 px-4 py-10">

        <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-xl">

          <div className="flex justify-between items-center mb-8">

            <h2 className="text-3xl font-bold">
              Create New Listing
            </h2>

            <button
              onClick={()=>navigate(-1)}
              className="px-4 py-2 bg-gray-200 rounded-xl"
            >
              ← Back
            </button>

          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* TITLE */}

            <input
              name="title"
              placeholder="Listing Title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
              required
            />

            {/* DESCRIPTION */}

            <textarea
              name="description"
              rows="4"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
              required
            />

            {/* CATEGORY */}

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
              required
            >

              <option value="">Select Category</option>
              <option>Villa</option>
              <option>Room</option>
              <option>PG</option>
              <option>Flat</option>
              <option>Farm House</option>
              <option>Cabin</option>
              <option>Pool House</option>


            </select>

            {/* LOCATION */}

            <div className="grid md:grid-cols-2 gap-4">

              {["address","city","state","country"].map(field => (

                <input
                  key={field}
                  name={field}
                  placeholder={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="border rounded-xl p-3"
                  required
                />

              ))}

            </div>

            {/* PROPERTY DETAILS */}

            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">

              {["maxGuests","pricePerNight","bedrooms","beds","washrooms"].map(field => (

                <input
                  key={field}
                  name={field}
                  type="number"
                  placeholder={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="border rounded-xl p-3"
                  required
                />

              ))}

            </div>

            {/* IMAGE UPLOAD */}

            <input
              hidden
              ref={imageRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />

            <div
              onClick={()=>imageRef.current.click()}
              className="border-2 border-dashed p-10 text-center cursor-pointer"
            >
              Click to Upload Images
            </div>

            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">

              {preview.map((img,idx)=>(

                <div
                  key={idx}
                  className="relative aspect-square rounded-xl overflow-hidden"
                >

                  <LazyLoadImage
                    src={img.url}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={()=>removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full px-2"
                  >
                    ✕
                  </button>

                </div>

              ))}

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-500 text-white py-3 rounded-2xl"
            >
              {loading ? "Publishing..." : "Publish Listing"}
            </button>

          </form>

        </div>

      </div>

    </>

  );

}

export default React.memo(ListingCreate);
