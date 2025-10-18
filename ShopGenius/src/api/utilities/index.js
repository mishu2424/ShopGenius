import axios from "axios";

export const ImageBBUpload=async(img)=>{
    const formData=new FormData();
    formData.append('image',img);
    const {data}=await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,formData);
    // console.log(data.data.display_url);
    return data.data.display_url;
}