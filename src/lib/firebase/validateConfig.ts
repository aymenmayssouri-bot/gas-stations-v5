export const validateConfig = () => {
  const required = ['NEXT_PUBLIC_FIREBASE_APIKEY','NEXT_PUBLIC_FIREBASE_AUTHDOMAIN','NEXT_PUBLIC_FIREBASE_PROJECTID','NEXT_PUBLIC_FIREBASE_APPID'];
  required.forEach(k=>{
    if (!process.env[k]) throw new Error(`Missing Firebase config: ${k}`);
  });
}