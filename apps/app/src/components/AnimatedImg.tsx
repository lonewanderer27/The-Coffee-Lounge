import { ImgHTMLAttributes, useState } from "react";

import { motion } from "framer-motion";

interface ImgProps extends ImgHTMLAttributes<HTMLImageElement> {}

export default function AnimatedImg({ src, alt, ...rest }: ImgProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: imageLoaded ? 1 : 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="justify-center items-center flex h-full w-full"
    >
      <img
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        {...rest}
      />
    </motion.div>
  );
}