export function JsonLd() {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Loopora",
    url: baseUrl,
    description: "Structured interview preparation with 500+ frequently asked questions, model answers, and real video explanations.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Loopora",
    url: baseUrl,
    description: "Interview preparation platform.",
  };

  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Loopora",
    url: baseUrl,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplication) }}
      />
    </>
  );
}
