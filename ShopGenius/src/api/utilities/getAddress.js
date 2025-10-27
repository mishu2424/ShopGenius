export const getAddress = async (lat, lng) => {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    }`
  );
  const data = await res.json();
//   console.log(data);
  return data.results[0]?.formatted_address;
};
