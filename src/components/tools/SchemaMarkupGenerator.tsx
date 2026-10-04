import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { hasValidSchemaValues } from "../../helpers/tool-output-validity";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

interface SchemaField {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
}

const SCHEMA_TYPES: { value: string; label: string; fields: SchemaField[] }[] = [
  {
    value: "Article",
    label: "Article",
    fields: [
      { key: "headline", label: "Headline", placeholder: "Article title", required: true },
      { key: "author", label: "Author Name", placeholder: "John Doe", required: true },
      { key: "datePublished", label: "Date Published", placeholder: "2026-06-26", required: true },
      { key: "dateModified", label: "Date Modified", placeholder: "2026-06-26", required: false },
      { key: "image", label: "Image URL", placeholder: "https://example.com/image.jpg", required: false },
      { key: "publisher", label: "Publisher Name", placeholder: "Publisher Inc.", required: true },
    ],
  },
  {
    value: "Product",
    label: "Product",
    fields: [
      { key: "name", label: "Product Name", placeholder: "Product name", required: true },
      { key: "description", label: "Description", placeholder: "Product description", required: true },
      { key: "brand", label: "Brand", placeholder: "Brand name", required: true },
      { key: "price", label: "Price", placeholder: "29.99", required: true },
      { key: "priceCurrency", label: "Currency", placeholder: "USD", required: true },
      { key: "availability", label: "Availability", placeholder: "InStock", required: false },
    ],
  },
  {
    value: "LocalBusiness",
    label: "Local Business",
    fields: [
      { key: "name", label: "Business Name", placeholder: "Business name", required: true },
      { key: "address", label: "Address", placeholder: "123 Main St, City", required: true },
      { key: "telephone", label: "Phone", placeholder: "+1 555-123-4567", required: true },
      { key: "openingHours", label: "Opening Hours", placeholder: "Mo-Fr 09:00-17:00", required: false },
      { key: "image", label: "Image URL", placeholder: "https://example.com/logo.jpg", required: false },
      { key: "priceRange", label: "Price Range", placeholder: "$$", required: false },
    ],
  },
  {
    value: "FAQ",
    label: "FAQ",
    fields: [
      { key: "question1", label: "Question 1", placeholder: "First question", required: true },
      { key: "answer1", label: "Answer 1", placeholder: "First answer", required: true },
      { key: "question2", label: "Question 2", placeholder: "Second question", required: false },
      { key: "answer2", label: "Answer 2", placeholder: "Second answer", required: false },
      { key: "question3", label: "Question 3", placeholder: "Third question", required: false },
      { key: "answer3", label: "Answer 3", placeholder: "Third answer", required: false },
    ],
  },
  {
    value: "Recipe",
    label: "Recipe",
    fields: [
      { key: "name", label: "Recipe Name", placeholder: "Recipe name", required: true },
      { key: "author", label: "Author", placeholder: "Chef name", required: true },
      { key: "cookTime", label: "Cook Time", placeholder: "PT30M", required: true },
      { key: "prepTime", label: "Prep Time", placeholder: "PT15M", required: false },
      { key: "recipeYield", label: "Yield", placeholder: "4 servings", required: true },
      { key: "image", label: "Image URL", placeholder: "https://example.com/recipe.jpg", required: false },
    ],
  },
  {
    value: "Event",
    label: "Event",
    fields: [
      { key: "name", label: "Event Name", placeholder: "Event name", required: true },
      { key: "startDate", label: "Start Date", placeholder: "2026-07-01T19:00", required: true },
      { key: "endDate", label: "End Date", placeholder: "2026-07-01T23:00", required: false },
      { key: "location", label: "Location", placeholder: "Venue name", required: true },
      { key: "description", label: "Description", placeholder: "Event description", required: true },
      { key: "image", label: "Image URL", placeholder: "https://example.com/event.jpg", required: false },
    ],
  },
  {
    value: "Organization",
    label: "Organization",
    fields: [
      { key: "name", label: "Organization Name", placeholder: "Organization name", required: true },
      { key: "description", label: "Description", placeholder: "Organization description", required: true },
      { key: "url", label: "Website URL", placeholder: "https://example.com", required: true },
      { key: "logo", label: "Logo URL", placeholder: "https://example.com/logo.png", required: false },
      { key: "sameAs", label: "Social Profile URL", placeholder: "https://twitter.com/handle", required: false },
      { key: "foundingDate", label: "Founding Date", placeholder: "2020", required: false },
    ],
  },
];

function buildSchema(type: string, values: Record<string, string>): object | null {
  switch (type) {
    case "Article":
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: values.headline || undefined,
        author: { "@type": "Person", name: values.author || undefined },
        datePublished: values.datePublished || undefined,
        dateModified: values.dateModified || undefined,
        image: values.image || undefined,
        publisher: { "@type": "Organization", name: values.publisher || undefined },
      };
    case "Product":
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: values.name || undefined,
        description: values.description || undefined,
        brand: { "@type": "Brand", name: values.brand || undefined },
        offers: {
          "@type": "Offer",
          price: values.price || undefined,
          priceCurrency: values.priceCurrency || undefined,
          availability: values.availability ? `https://schema.org/${values.availability}` : undefined,
        },
      };
    case "LocalBusiness":
      return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: values.name || undefined,
        address: { "@type": "PostalAddress", streetAddress: values.address || undefined },
        telephone: values.telephone || undefined,
        openingHours: values.openingHours || undefined,
        image: values.image || undefined,
        priceRange: values.priceRange || undefined,
      };
    case "FAQ": {
      const questions = [];
      if (values.question1 && values.answer1) {
        questions.push({ "@type": "Question", name: values.question1, acceptedAnswer: { "@type": "Answer", text: values.answer1 } });
      }
      if (values.question2 && values.answer2) {
        questions.push({ "@type": "Question", name: values.question2, acceptedAnswer: { "@type": "Answer", text: values.answer2 } });
      }
      if (values.question3 && values.answer3) {
        questions.push({ "@type": "Question", name: values.question3, acceptedAnswer: { "@type": "Answer", text: values.answer3 } });
      }
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions,
      };
    }
    case "Recipe":
      return {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: values.name || undefined,
        author: { "@type": "Person", name: values.author || undefined },
        cookTime: values.cookTime || undefined,
        prepTime: values.prepTime || undefined,
        recipeYield: values.recipeYield || undefined,
        image: values.image || undefined,
      };
    case "Event":
      return {
        "@context": "https://schema.org",
        "@type": "Event",
        name: values.name || undefined,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        location: { "@type": "Place", name: values.location || undefined },
        description: values.description || undefined,
        image: values.image || undefined,
      };
    case "Organization":
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: values.name || undefined,
        description: values.description || undefined,
        url: values.url || undefined,
        logo: values.logo || undefined,
        sameAs: values.sameAs ? [values.sameAs] : undefined,
        foundingDate: values.foundingDate || undefined,
      };
    default:
      return null;
  }
}

export default function SchemaMarkupGenerator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [schemaType, setSchemaType] = useState("Article");
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, handleCopy] = useCopyToClipboard();

  const currentType = SCHEMA_TYPES.find((t) => t.value === schemaType) || SCHEMA_TYPES[0];

  const setValue = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const jsonLd = useMemo(() => {
    const obj = buildSchema(schemaType, values);
    return obj ? JSON.stringify(obj, null, 2) : "";
  }, [schemaType, values]);

  const handleCopyJson = useCallback(() => {
    if (jsonLd) handleCopy(jsonLd);
  }, [handleCopy, jsonLd]);

  useEffect(() => {
    if (jsonLd && hasValidSchemaValues(schemaType, values, currentType.fields.filter(field => field.required).map(field => field.key))) recordSuccess("generate");
  }, [jsonLd, currentType, values, recordSuccess]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <div>
        <label htmlFor="sm-schema-type" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
          Schema Type
        </label>
        <select
          id="sm-schema-type"
          value={schemaType}
          onChange={(e) => {
            setSchemaType(e.target.value);
            setValues({});
          }}
          className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
          style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
        >
          {SCHEMA_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentType.fields.map((field) => (
          <div key={field.key}>
            <label htmlFor={`sm-${field.key}`} className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
              {field.label}
              {field.required && <span className="ml-1" style={{ color: "var(--color-error)" }}>*</span>}
            </label>
            <input
              id={`sm-${field.key}`}
              type="text"
              value={values[field.key] || ""}
              onChange={(e) => setValue(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
            />
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Generated JSON-LD</span>
          <button
            type="button"
            onClick={handleCopyJson}
            className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
            style={{
              color: copied ? "var(--color-success)" : "var(--color-link)",
              backgroundColor: "var(--color-canvas-soft-2)",
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre
          className="p-4 rounded-lg text-sm overflow-x-auto max-h-96"
          style={{
            backgroundColor: "var(--color-canvas-soft-2)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-mono)",
            lineHeight: "1.6",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          {jsonLd || "// Select a schema type and fill in fields to generate JSON-LD markup"}
        </pre>
      </div>
    </div>
  );
}
