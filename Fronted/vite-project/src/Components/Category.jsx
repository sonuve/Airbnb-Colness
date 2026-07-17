import React, { useState, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { filterByCategroy } from "../../Redux/Listing";

import { MdWhatshot } from "react-icons/md";
import { GiFamilyHouse } from "react-icons/gi";
import { MdBedroomParent } from "react-icons/md";
import { MdOutlinePool } from "react-icons/md";
import { GiWoodCabin } from "react-icons/gi";
import { SiHomeassistantcommunitystore } from "react-icons/si";
import { IoBedOutline } from "react-icons/io5";
import { FaTreeCity } from "react-icons/fa6";
import { BiBuildingHouse } from "react-icons/bi";

function Category() {

  const dispatch = useDispatch();
  const [activeCategory, setActiveCategory] = useState("trending");

  /* -------- MEMOIZED CATEGORY LIST -------- */

  const categories = useMemo(() => [
    { key: "trending", label: "Trending", icon: MdWhatshot },
    { key: "villa", label: "Villa", icon: GiFamilyHouse },
    { key: "room", label: "Rooms", icon: MdBedroomParent },
    { key: "pool-house", label: "Pool House", icon: MdOutlinePool },
    { key: "cabin", label: "Cabins", icon: GiWoodCabin },
    { key: "shop", label: "Shops", icon: SiHomeassistantcommunitystore },
    { key: "pg", label: "PG", icon: IoBedOutline },
    { key: "farm-house", label: "Farm House", icon: FaTreeCity },
    { key: "flat", label: "Flat", icon: BiBuildingHouse },
  ], []);

  /* -------- OPTIMIZED HANDLER -------- */

  const handleCategory = useCallback((category) => {

    setActiveCategory(category);
    dispatch(filterByCategroy(category));

  }, [dispatch]);

  return (
    <div
      className="
        sticky top-20 z-40
        bg-white border-b border-gray-200
        h-[80px]   /* Prevent CLS */
      "
    >
      <div
        className="
          flex gap-8 px-4 py-4
          overflow-x-auto scrollbar-hide
          md:justify-center
        "
      >

        {categories.map((cat) => {

          const Icon = cat.icon;

          return (
            <div
              key={cat.key}
              onClick={() => handleCategory(cat.key)}
              className={`
                flex flex-col items-center min-w-[72px] cursor-pointer
                transition-all duration-200
                ${activeCategory === cat.key
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-black"}
              `}
            >
              <Icon size={22} />

              <span className="mt-1 text-xs md:text-sm whitespace-nowrap font-medium">
                {cat.label}
              </span>
            </div>
          );
        })}

      </div>
    </div>
  );
}

export default Category;