export interface IFileSignedUrl {
  imageName: string;
}

export interface IMultiFileSignedUrl {
  imageNames: string[];
}

export interface IFileSigned {
  preSignedUrl: string;
  path: string;
}
