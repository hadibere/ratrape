"use client";

/**
 * Que faire quand la position a été refusée.
 *
 * Aucune page web ne peut ouvrir les réglages du téléphone : une fois le refus
 * mémorisé, le navigateur ne redemande plus rien. Proposer « réessayer »
 * reviendrait à promettre une action impossible ; on indique le chemin.
 */
function steps(): string {
  if (typeof navigator === "undefined") return "";
  const ua = navigator.userAgent;

  if (/iPad|iPhone|iPod/.test(ua)) {
    return "Sur iPhone : touchez le bouton de réglages à gauche de l’adresse, puis « Réglages du site web » et « Localisation ». Vérifiez aussi que la localisation est autorisée pour votre navigateur dans les réglages du téléphone.";
  }
  if (/Android/.test(ua)) {
    return "Sur Android : touchez le cadenas à gauche de l’adresse, puis « Autorisations » et « Localisation ».";
  }
  return "Cliquez sur l’icône à gauche de l’adresse du site, puis autorisez la localisation.";
}

export function LocationHelp({ className = "" }: { className?: string }) {
  return <p className={`text-[12px]/[1.45] ${className}`}>{steps()}</p>;
}
