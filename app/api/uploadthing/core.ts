// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique route key
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      // Check if the user is authenticated
      // If not, throw an error or handle accordingly
      
      // Return whatever is needed in onUploadComplete
      return {};
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Yükleme tamamlandı:", file.url);
 
      // !!! Her başarılı yüklemeden sonra burada veritabanına kaydedebilirsiniz
      try {
        const response = await fetch('/api/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: file.url,
            name: file.name
          }),
        });
        
        if (!response.ok) {
          console.error('Görsel veritabanına kaydedilemedi');
        }
      } catch (error) {
        console.error('Görsel veritabanına kaydedilirken hata oluştu:', error);
      }
      
      return { uploadedBy: "Sistem" };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;