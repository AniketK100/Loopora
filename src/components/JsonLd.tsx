const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

function getWebsite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Loopora",
    url: baseUrl,
    description: "Structured interview preparation with 500+ frequently asked questions, model answers, and real video explanations across HR, Technical, Situational, and more interview types.",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    author: {
      "@type": "Person",
      name: "Aniket Kakad",
      url: "https://github.com/AniketK100",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en",
    copyrightYear: new Date().getFullYear(),
  };
}

function getOrganization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Loopora",
    url: baseUrl,
    description: "Interview preparation platform helping candidates ace every kind of interview question with curated answers and video walkthroughs.",
    foundingDate: "2026",
    founder: {
      "@type": "Person",
      name: "Aniket Kakad",
    },
    sameAs: [
      "https://github.com/AniketK100/Loopora",
    ],
  };
}

function getPerson() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Aniket Kakad",
    url: "https://github.com/AniketK100",
    jobTitle: "Software Developer",
    sameAs: [
      "https://github.com/AniketK100",
    ],
  };
}

function getWebApplication() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Loopora",
    url: baseUrl,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description: "Interview preparation platform with AI-powered resume personalization, curated questions, and video walkthroughs.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Aniket Kakad",
    },
  };
}

function getFAQ() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What types of interview questions does Loopora cover?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Loopora covers HR, Technical, Non-Technical, Situational, Managerial, Company-specific, Aptitude, and Case Study interview questions with model answers and video explanations.",
        },
      },
      {
        "@type": "Question",
        name: "Can Loopora personalize answers based on my resume?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Upload your resume and Loopora's AI generates personalized interview answers tailored to your experience, skills, and background using Google Gemini.",
        },
      },
      {
        "@type": "Question",
        name: "Is Loopora free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Loopora offers a free tier with access to curated questions and answers. Premium features including extended resume storage and unlimited personalized answers are available.",
        },
      },
      {
        "@type": "Question",
        name: "Does Loopora include video interview answers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Many questions include multiple video walkthroughs from YouTube, Vimeo, Loom, and Google Drive showing real interview answer techniques.",
        },
      },
    ],
  };
}

function getBreadcrumb(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

export function JsonLd() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebsite()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganization()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getPerson()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebApplication()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getFAQ()) }} />
    </>
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumb(items)) }} />
  );
}
