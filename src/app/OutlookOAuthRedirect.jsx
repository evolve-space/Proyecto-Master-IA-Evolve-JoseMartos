import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

/**
 * Tras OAuth, el backend redirige a /?outlook=connected&return=correos.
 * Esta ruta no es /correos, así que reenviamos a la pantalla correcta.
 */
export default function OutlookOAuthRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const result = searchParams.get("outlook");
    if (!result || location.pathname !== "/") return;

    const returnTo = searchParams.get("return") || "correos";
    const target = returnTo === "calendario" ? "/calendario" : "/correos";
    const next = new URLSearchParams({ outlook: result });
    const message = searchParams.get("message");
    if (message) next.set("message", message);

    navigate(`${target}?${next.toString()}`, { replace: true });
  }, [searchParams, location.pathname, navigate]);

  return null;
}
