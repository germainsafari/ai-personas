export function getPersonaImageUrl(personaId: string): string {
  // Map persona IDs to appropriate placeholder images
  const imageMap: Record<string, string> = {
    "niina-gerber": "/abstract-brand-lead.png",
    "kate-smith": "/abstract-social-media.png",
    "alicia-morel": "/abstract-governance.png",
    "angela-may": "/abstract-am.png",
    "simon-wallace": "/abstract-southwest.png",
    "robert-cop": "/remote-control-collection.png",
  }

  return imageMap[personaId] || "/chromatic-persona.png"
}
