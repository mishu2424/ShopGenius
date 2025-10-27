// hooks/useMyLocation.js
import { useState, useEffect } from "react";
import { getAddress } from "../api/utilities/getAddress";

const useMyLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const address = await getAddress(
          position.coords.latitude,
          position.coords.longitude
        );
        setLocation({ address });
      },
      (err) => {
        setError("Permission denied or location unavailable.");
        console.error(err);
      }
    );
  };

  return { location, error, getLocation };
};

export default useMyLocation;
