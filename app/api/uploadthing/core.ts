import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      return {};
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Görsel yüklendi:", file.url);
      return { uploadedBy: "Sistem" };
    }),

  pdfUploader: f({ pdf: { maxFileSize: "60MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      return {};
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("PDF yüklendi:", file.url);
      return { uploadedBy: "Sistem" };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;