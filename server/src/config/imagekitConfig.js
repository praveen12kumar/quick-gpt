import ImageKit from "imagekit";

import { IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY, IMAGEKIT_URL_ENDPOINT} from "./serverConfig.js";



const imagekit = new ImageKit({
  publicKey:IMAGEKIT_PUBLIC_KEY,
  privateKey:IMAGEKIT_PRIVATE_KEY,
  urlEndpoint:IMAGEKIT_URL_ENDPOINT, // e.g. https://ik.imagekit.io/your_project_id
});

export default imagekit;
