export interface MotiveLink {
  link: string;
  linkThumbnail: string;
}

export interface ImageItem {
  imageID: number;
  imageDescription: string;
  imageSlogan: string;
  links: MotiveLink;
}

export interface GalleryItem {
  category: string;
  categoryDescription: string;
  categoryId: number;
  images: ImageItem[];
}
