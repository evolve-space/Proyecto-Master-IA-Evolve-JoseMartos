import { useEffect, useState } from "react";

export default function ComposeFilePreview({ file }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file?.type?.startsWith("image/")) return undefined;
    const objectUrl = window.URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => window.URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!file?.type?.startsWith("image/")) return null;

  return (
    <img
      src={url ?? undefined}
      alt={file.name}
      className="w-16 h-16 object-cover rounded-lg border border-slate-200 bg-slate-50"
    />
  );
}
