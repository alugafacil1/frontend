export const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/placeholder-user.png";
  
  if (path.startsWith("http")) return path;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
};