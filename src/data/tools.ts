import { AD_ELIGIBLE_TOOL_SLUGS, TOOL_QUALITY } from "./tool-quality";

/**
 * Tool Registry — single source of truth for all tools on the site.
 * To add a new tool: append to the TOOLS array below and create
 * the corresponding page + React component.
 */

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string; // emoji or SVG path
  color: string; // gradient start color
  metaTitle?: string;
  metaDescription?: string;
  seoContent?: string;
}

export interface UsageStep {
  title: string;
  content: string;
}

export interface FAQPair {
  question: string;
  answer: string;
}

export interface ContentSection {
  heading: string;
  content: string;
  bullets?: string[];
  example?: { input: string; output: string };
  comparison?: { option: string; bestFor: string; tradeoff: string }[];
}

export interface ToolQuality {
  engine: string;
  supportedInputs: string[];
  outputFormats: string[];
  limits: string[];
  limitations: string[];
  verifiedOn: string;
  sections: ContentSection[];
}

export interface Tool {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  categorySlug: string;
  icon: string;
  featured: boolean;
  keywords: string[];
  metaTitle?: string;
  metaDescription?: string;
  usageSteps?: UsageStep[];
  faq?: FAQPair[];
  additionalContent?: ContentSection[];
  adEligible?: boolean;
  quality?: ToolQuality;
  relatedToolSlugs?: string[];
}

// ── Categories ──────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  {
    slug: "text-tools",
    name: "Text Tools",
    description:
      "Transform, analyze, and format text with powerful utilities for writers and content creators.",
    icon: "✏️",
    color: "#007cf0",
    metaTitle: "Free Text Tools Online - Word Counter, Case Converter",
    metaDescription:
      "Use free text tools online for word count, character count, case conversion, readability, similarity checks, and writing cleanup in your browser.",
    seoContent:
      "Explore free text tools online for writing, editing, content cleanup, and SEO copy workflows. Count words and characters, convert case, reverse text, check readability, compare text similarity, create word clouds, and polish grammar without uploading drafts. Every text utility runs in your browser so private notes, client copy, essays, and unpublished articles stay on your device.",
  },
  {
    slug: "developer-tools",
    name: "Developer Tools",
    description:
      "Format, encode, and validate code and data for faster development workflows.",
    icon: "⚡",
    color: "#7928ca",
    metaTitle: "Free Developer Tools Online - JSON, JWT, Regex, SQL",
    metaDescription:
      "Format, validate, encode, decode, and debug with free developer tools online. Use JSON, JWT, Base64, Regex, SQL, and hash tools privately.",
    seoContent:
      "Use free developer tools online for everyday debugging and data cleanup. Format JSON, decode JWT tokens, test regular expressions, convert Base64, generate hashes, format SQL, and transform HTML or XML without sending snippets to a server. These browser-based utilities are built for API payloads, logs, configs, and test data that should remain local.",
  },
  {
    slug: "calculators",
    name: "Calculators",
    description:
      "Solve math problems and compute values with quick, precise calculators.",
    icon: "🔢",
    color: "#ff4d4d",
    metaTitle: "Free Online Calculators - Percentage, Loan, BMI, Random",
    metaDescription:
      "Solve everyday math with free online calculators for percentages, dates, discounts, loans, mortgages, BMI, tips, and random numbers.",
    seoContent:
      "Use free online calculators for quick, practical math without opening a spreadsheet. Calculate percentages, discounts, tips, date differences, age, BMI, loans, mortgages, random numbers, and number-to-word conversions. Results appear instantly in your browser and are intended for everyday planning, estimates, and learning.",
  },
  {
    slug: "converters",
    name: "Converters",
    description: "Convert between formats, units, and encodings instantly.",
    icon: "🔄",
    color: "#f9cb28",
    metaTitle: "Free Image and Converter Tools Online - No Uploads",
    metaDescription:
      "Convert images, data, colors, units, timestamps, Markdown, CSV, JSON, and YAML with free browser-based converter tools and no uploads.",
    seoContent:
      "Use free image and converter tools online to transform files, data, colors, units, and timestamps directly in your browser. Compress, crop, resize, filter, and convert images; generate QR codes; convert Markdown, CSV, JSON, YAML, colors, units, and epoch timestamps. Browser-based processing keeps private files and data on your device whenever the tool supports local conversion.",
  },
  {
    slug: "pdf-tools",
    name: "PDF Tools",
    description:
      "Merge, split, compress, and convert PDF documents right in your browser.",
    icon: "📄",
    color: "#ee0000",
    metaTitle: "Free PDF Tools Online - Merge, Split, Compress, Convert",
    metaDescription:
      "Use free PDF tools online to merge, split, compress, extract text, and convert PDF pages to images privately in your browser.",
    seoContent:
      "Use free PDF tools online to merge PDF files, split pages, compress PDFs, extract text, and convert PDF pages to images without relying on upload-heavy workflows. These tools run in the browser for everyday document tasks involving invoices, forms, notes, reports, and scanned files. File size and page limits protect performance while keeping common PDF edits fast and private.",
  },
  {
    slug: "seo-tools",
    name: "SEO Tools",
    description:
      "Generate meta tags, check keyword density, create sitemaps, and optimize your site for search engines.",
    icon: "🔍",
    color: "#0070f3",
    metaTitle: "Free SEO Tools Online - SERP, Schema, Meta Tags, Sitemaps",
    metaDescription:
      "Improve on-page SEO with free SEO tools online for meta tags, SERP previews, schema markup, headings, sitemaps, robots.txt, and alt text.",
    seoContent:
      "Use free SEO tools online to improve page snippets, structured data, crawling, content checks, and accessibility. Generate meta tags, preview SERP snippets, create schema markup, check heading structure, build robots.txt and sitemap files, analyze keyword density, and audit image alt text. These tools help creators and site owners make cleaner on-page SEO decisions before publishing.",
  },
  {
    slug: "design-tools",
    name: "Design Tools",
    description:
      "Check color contrast, convert color formats, and analyze your designs for accessibility.",
    icon: "🎨",
    color: "#7928ca",
    metaTitle: "Free Design Tools Online - Colors, Gradients, Contrast",
    metaDescription:
      "Create palettes, CSS gradients, rounded corners, and accessible color combinations with free design tools online for web projects.",
    seoContent:
      "Use free design tools online to create color palettes, CSS gradients, rounded corners, and accessible foreground/background color combinations. These browser-based utilities help designers and frontend developers move from visual idea to usable CSS quickly while checking contrast and copying production-ready values.",
  },
];

// ── Tools ───────────────────────────────────────────────────

export const TOOLS: Tool[] = [
  {
    slug: "word-counter",
    name: "Word Counter",
    description:
      "Count words, sentences, and paragraphs in any text instantly.",
    longDescription:
      "Paste or type your text to get an instant breakdown of word count, character count, sentence count, paragraph count, and estimated reading time. Perfect for writers, students, and content creators who need to meet word limits.",
    categorySlug: "text-tools",
    icon: "📝",
    featured: true,
    keywords: [
      "word counter free",
      "online word counter",
      "character counter online",
      "word count checker online",
      "free word counter tool",
    ],
    metaTitle: "Word Counter Online — Free Word Count Checker",
    metaDescription:
      "Check word count online free — instantly count words, characters, sentences, and paragraphs for any content. No signup needed.",
    usageSteps: [
      {
        title: "Paste or type your text",
        content:
          "Enter your content into the word counter text area. The tool instantly analyzes your text and displays word count, character count, sentence count, and paragraph count in real time. No configuration or setup needed — just start typing to see live results.",
      },
      {
        title: "Review the detailed breakdown",
        content:
          "Review words, characters, characters without whitespace, sentences, paragraphs and estimated reading time. It does not show average word length or keyword density. Reading time assumes 200 words per minute, rounded up.",
      },
      {
        title: "Copy and use your stats",
        content:
          "Read the displayed totals or select them manually to copy. Clear resets the input. Compare with your submission system because counting rules can differ.",
      },
    ],
    faq: [
      {
        question: "How do I use a word counter for my content?",
        answer:
          "Simply paste or type your text into the word counter and it displays live word and character counts. The tool updates instantly as you type, making it easy to track word limits for essays, articles, and blog posts without switching between tabs.",
      },
      {
        question: "What metrics does the word counter tool provide?",
        answer:
          "The word counter shows word count, character count with and without spaces, sentence count, paragraph count, and estimated reading time. These metrics give you complete text analysis in one place.",
      },
    ],
    additionalContent: [
      {
        heading: "Word Count for Writing and SEO",
        content:
          "The word counter helps writers, editors, students, and marketers measure length, reading time, sentence count, and structure. It is useful for blog drafts, essays, meta copy, social posts, and briefs.",
      },
      {
        heading: "Private Text Analysis",
        content:
          "Text is analyzed locally in the browser, so unpublished drafts and sensitive notes are not sent to a server. You can revise copy and watch counts update as you type.",
      },
      {
        heading: "How to Use the Results",
        content:
          "Use word count to meet assignment limits, estimate reading time, trim long sections, or balance SEO content depth. Pair it with the readability checker for stronger editorial review.",
      },
    ],
  },
  {
    slug: "character-counter",
    name: "Character Counter",
    description:
      "Count characters with and without spaces for social media limits.",
    longDescription:
      "Use this character counter online to count characters with spaces, characters without whitespace, and words in real time. It is built for social posts, SMS copy, meta descriptions, titles, and any writing task with a strict length limit.",
    categorySlug: "text-tools",
    icon: "🔤",
    featured: true,
    keywords: [
      "character counter online",
      "twitter character counter",
      "character count checker",
      "x post character counter",
      "social media character counter",
    ],
    metaTitle: "Character Counter Online - Free Text Length Checker",
    metaDescription:
      "Use this character counter online to count text with and without spaces for Twitter/X, SMS, meta descriptions, titles, and social limits instantly.",
    usageSteps: [
      {
        title: "Paste or Type Your Text",
        content:
          "Paste any text into the character counter online and the totals update instantly. The tool counts characters with spaces, characters without whitespace, and words.",
      },
      {
        title: "Check Platform Limits",
        content:
          "Use the character counter online to compare your text against Twitter/X posts, SMS messages, titles, and meta descriptions. This helps you trim copy before publishing.",
      },
      {
        title: "Edit Until It Fits",
        content:
          "Adjust your text and watch the counts change in real time. Because the character counter online runs locally, drafts and private copy stay in your browser.",
      },
    ],
    faq: [
      {
        question: "What does this character counter online measure?",
        answer:
          "The character counter online measures JavaScript UTF-16 code units with and without whitespace, and whitespace-separated words. It is useful for social posts, SEO snippets, and writing limits.",
      },
      {
        question: "Can I use this as a Twitter character counter?",
        answer:
          "Use it only as an approximate editing aid. Emoji, combined characters, links, platform rules and SMS encoding can use different counting methods. The platform composer is authoritative.",
      },
    ],
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    description:
      "Convert text between uppercase, lowercase, title case, and more.",
    longDescription:
      "Transform text between uppercase, lowercase, title case, sentence case, and camelCase. Copy the result with one click. Useful for formatting headings, variable names, and content.",
    categorySlug: "text-tools",
    icon: "🔠",
    featured: false,
    keywords: [
      "upper case converter",
      "convert text to uppercase",
      "uppercase text converter",
      "lowercase converter",
      "title case converter",
    ],
    metaTitle: "Case Converter — Upper & Lowercase",
    metaDescription:
      "Convert any text to uppercase instantly with our free upper case converter. Switch between uppercase, lowercase, title case, and sentence case with one click.",
    usageSteps: [
      {
        title: "Paste your text",
        content:
          "Paste your text into the upper case converter input box. The tool works with any length of text from a single word to entire paragraphs, preserving your original text as a fallback so you can switch between cases freely.",
      },
      {
        title: "Choose a case style",
        content:
          "Click the uppercase option to instantly transform your entire text to uppercase. The upper case converter also supports lowercase, title case, sentence case, and camelCase — giving you complete control over text formatting.",
      },
      {
        title: "Copy the converted result",
        content:
          "Once the text is transformed, click the copy button to copy the converted text to your clipboard. Use this upper case converter to format headings, fix accidentally typed lowercase text, or standardize content for blog posts and documents.",
      },
    ],
    faq: [
      {
        question:
          "How do I use an upper case converter to change text to uppercase online?",
        answer:
          "Paste your text into the converter and click the uppercase option. The upper case converter instantly transforms every lowercase letter to uppercase while leaving numbers and special characters untouched — perfect for headlines, acronyms, and emphasis.",
      },
      {
        question:
          "Can the upper case converter also change text to lowercase and title case?",
        answer:
          "Yes, the tool includes options for lowercase, title case, sentence case, and camelCase in addition to uppercase. This makes it a versatile upper case converter that handles all common text formatting needs in one place.",
      },
    ],
  },
  {
    slug: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator",
    description:
      "Generate placeholder text in paragraphs, sentences, or words.",
    longDescription:
      "Generate lorem ipsum placeholder text by paragraphs, sentences, or word count. Choose the amount and copy the output for mockups, wireframes, and design prototyping.",
    categorySlug: "text-tools",
    icon: "\u{1F4C4}",
    featured: false,
    keywords: [
      "lorem ipsum text",
      "classic lorem ipsum",
      "lorem ipsum generator",
      "placeholder text generator",
      "dummy text filler",
    ],
    metaTitle: "Lorem Ipsum Generator Online — Free Placeholder Text",
    metaDescription:
      "Generate classic lorem ipsum placeholder text for your design mockups. Choose paragraphs, sentences, or words — free and instant.",
    usageSteps: [
      {
        title: "Set your desired output",
        content:
          "Choose how many paragraphs, words, or sentences of lorem ipsum placeholder text you need. The generator lets you specify exact quantities so you get the right amount of filler text for your wireframe or mockup.",
      },
      {
        title: "Generate placeholder text",
        content:
          "Click generate and the tool instantly produces standard lorem ipsum dummy text in the quantity you selected. The text follows the classic Lorem Ipsum passage starting with 'Lorem ipsum dolor sit amet'.",
      },
      {
        title: "Copy and use in your project",
        content:
          "Click copy to grab the generated lorem ipsum placeholder text to your clipboard. Paste it directly into your design mockups, website prototypes, or typography samples to visualize how your final content will appear.",
      },
    ],
    faq: [
      {
        question: "What is lorem ipsum placeholder text used for?",
        answer:
          "Lorem ipsum is classic placeholder text used as filler content in design mockups, wireframes, and print layouts. It fills space with realistic-looking text so designers and clients can visualize the final product without needing final copy.",
      },
      {
        question: "How can I generate lorem ipsum text for free online?",
        answer:
          "Select the number of paragraphs, words, or sentences you need and click generate. The tool creates lorem ipsum placeholder text on demand without any sign-up or usage limits — perfect for designers and developers who need filler text for mockups.",
      },
    ],
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and beautify JSON data with syntax errors.",
    longDescription:
      "Paste minified or messy JSON and get a beautifully formatted, syntax-highlighted result. The formatter validates your JSON and highlights errors with line numbers so you can fix issues quickly.",
    categorySlug: "developer-tools",
    icon: "{ }",
    featured: true,
    keywords: [
      "json formatter online",
      "json formatter",
      "json beautifier",
      "json validator",
      "json prettify",
    ],
    metaTitle: "JSON Formatter Online — Validate & Beautify JSON",
    metaDescription:
      "Validate, format, and beautify JSON online free. Detect errors with line numbers and plain-text indentation — right in your browser.",
    usageSteps: [
      {
        title: "Paste Your Raw JSON Data",
        content:
          "Copy your unformatted or minified JSON string from any source and paste it into the input area. Whether you retrieved the data from an API response or a configuration file, our JSON formatter lets you format JSON without installing any software.",
      },
      {
        title: "Click the Format Button",
        content:
          "Press the Format or Beautify button to instantly transform your messy JSON into a properly indented, human-readable structure. It applies perfect nesting and line breaks so you can debug and edit your data with ease.",
      },
      {
        title: "Copy or Download the Result",
        content:
          "Review the formatted output in the result panel and use the copy button to transfer it to your clipboard. You can also download the beautified JSON as a file, ready to use in any project.",
      },
    ],
    faq: [
      {
        question: "How does this JSON formatter work directly in my browser?",
        answer:
          "This JSON formatter works entirely in your browser using JavaScript to parse, validate, and re-indent your JSON data with proper spacing and plain-text indentation. You get clean, validated output without needing to launch your editor or install any extensions.",
      },
      {
        question: "Can I use this JSON formatter to debug API responses?",
        answer:
          "Absolutely — developers commonly paste raw API responses into this JSON formatter to beautify JSON code and quickly inspect nested objects, arrays, and values. The formatted view makes it much easier to spot missing commas, mismatched brackets, or unexpected data types in your API payloads.",
      },
    ],
    additionalContent: [
      {
        heading: "Format and Validate JSON Privately",
        content:
          "The JSON formatter beautifies, validates, and helps debug JSON data in your browser. It is a safer workflow for API payloads, configuration snippets, and logs that may contain internal data.",
      },
      {
        heading: "JSON Formatter vs JSON Validator",
        content:
          "Formatting makes JSON easier to read with indentation and line breaks, while validation checks whether the structure is valid. This tool supports both workflows so developers can inspect data faster.",
      },
      {
        heading: "Common Developer Use Cases",
        content:
          "Use the formatter when reviewing API responses, cleaning minified JSON, preparing examples for documentation, or locating syntax errors before pasting data into code or test fixtures.",
      },
    ],
  },
  {
    slug: "url-encoder-decoder",
    name: "URL Encoder/Decoder",
    description:
      "Encode or decode URLs and query strings for safe transmission.",
    longDescription:
      "Encode special characters in URLs to make them safe for transmission, or decode percent-encoded strings back to readable text. Supports full URL encoding and component-level encoding.",
    categorySlug: "developer-tools",
    icon: "\ud83d\udd17",
    featured: true,
    keywords: [
      "url encoder decoder online",
      "url encode",
      "url decode",
      "percent encoding",
      "urlencoder",
    ],
    metaTitle: "URL Encoder Decoder - Free Online Encode Tool",
    metaDescription:
      "Free URL encoder decoder online — convert special characters in query strings and URLs with percent-encoding, or decode them back to readable paths.",
    usageSteps: [
      {
        title: "Enter the String You Want to Encode",
        content:
          "Type or paste the text or URL containing special characters like spaces, ampersands, or question marks into the input box. When you use this URL encoder decoder online tool, unsafe characters are instantly converted into their percent-encoded equivalents that browsers and servers can safely interpret.",
      },
      {
        title: "Choose Encode or Decode Mode",
        content:
          "Toggle between the encode and decode modes depending on your task. Select encode to transform plain text into a URL-safe format, or switch to decode if you need to convert an encoded URL back into its original human-readable form using this free URL encoder decoder online tool.",
      },
      {
        title: "Copy the Encoded or Decoded Result",
        content:
          "The converted string appears immediately in the output field ready for use. Copy the result and insert it into your application code, query parameters, or API calls to ensure reliable data transmission across the web.",
      },
    ],
    faq: [
      {
        question:
          "When would I need a URL encoder decoder online in my daily work?",
        answer:
          "You need a URL encoder decoder online whenever your URL contains characters that have special meaning in web addresses, such as spaces, ampersands, percent signs, or non-ASCII characters. This is especially common when building query parameters dynamically, constructing API request URLs, or processing user-submitted form data that includes special symbols.",
      },
      {
        question:
          "What is the difference between URL encoding and URL decoding?",
        answer:
          "URL encoding transforms unsafe characters into a percent-sign followed by two hexadecimal digits, making the string safe for transmission over the internet. URL decoding reverses this process, converting percent-encoded sequences back into their original characters so you can read the actual value stored in the URL parameter.",
      },
    ],
  },
  {
    slug: "base64-encoder-decoder",
    name: "Base64 Encoder/Decoder",
    description: "Encode text to Base64 or decode Base64 strings back to text.",
    longDescription:
      "Encode UTF-8 text as Base64 or decode Base64 back to UTF-8 text locally. Choose a direction and press Convert. This interface does not upload files or decode arbitrary binary data into downloadable files.",
    categorySlug: "developer-tools",
    icon: "\ud83d\udd10",
    featured: false,
    keywords: [
      "base64 encoder/decoder",
      "base64 encode",
      "base64 decode",
      "base64 converter",
      "binary to text",
    ],
    metaTitle: "Base64 Encoder Decoder - Free Online Tool",
    metaDescription:
      "Free Base64 encoder/decoder tool — encode text to Base64 format or decode strings back to plain text instantly. All client-side, no server uploads.",
    usageSteps: [
  {
    "title": "Enter text or Base64",
    "content": "Paste UTF-8 text to encode, or standard Base64 representing UTF-8 text to decode. For example, hello encodes to aGVsbG8=."
  },
  {
    "title": "Choose a direction and convert",
    "content": "Select Encode or Decode, then press Convert. Invalid Base64 or bytes that are not valid UTF-8 produce an error."
  },
  {
    "title": "Inspect and copy",
    "content": "Check the output before using Copy. Base64 is reversible encoding, not encryption. Do not use it to protect credentials."
  }
],
    faq: [
  {
    "question": "Can this convert image or audio files?",
    "answer": "No. This workspace handles text only. Use Image to Base64 for supported image files; arbitrary binary output needs a different tool."
  },
  {
    "question": "Why does Base64 grow the input?",
    "answer": "Every three bytes become four Base64 characters, with padding when needed. This is about one-third overhead for longer inputs and can be higher for very short strings."
  }
],
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    description:
      "Calculate percentages, percentage change, and what percent X is of Y.",
    longDescription:
      "Use this percentage calculator online to solve common percent math: find a percentage of a number, calculate percentage increase or decrease, compare two values, and work out what percent one value is of another for shopping, reports, grades, and everyday planning.",
    categorySlug: "calculators",
    icon: "%",
    featured: true,
    keywords: [
      "percentage calculator online",
      "percent of number",
      "percentage change calculator",
      "what percent one value is of another calculator",
      "find percentage online",
    ],
    metaTitle: "Percentage Calculator Online - Free Percent Tool",
    metaDescription:
      "Use this percentage calculator online for percent of a number, percentage change, and what percent one value is of another. Get fast formulas and results.",
    usageSteps: [
      {
        title: "Choose a Percentage Calculation",
        content:
          "Select whether you need percent of a number, percentage change, or what percent one value is of another. The percentage calculator online supports the most common percent math tasks.",
      },
      {
        title: "Enter Your Numbers",
        content:
          "Fill in the values for your calculation then press Calculate to show the result. The percentage calculator online also shows the formula so the answer is easy to understand.",
      },
      {
        title: "Use the Result",
        content:
          "Apply the percentage result to budgets, grades, growth rates, discounts, reports, or everyday math. You can clear the fields and run another calculation right away.",
      },
    ],
    faq: [
      {
        question: "What can this percentage calculator online solve?",
        answer:
          "It can find a percentage of a number, calculate percentage increase or decrease, compare two values, and solve common percentage formulas used in school, work, and shopping.",
      },
      {
        question: "Is the percentage calculator online free?",
        answer:
          "Yes. The calculator is free, runs in your browser, and does not require an account or upload any data.",
      },
    ],
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    description:
      "Compare birth and target dates using a clear calendar-age convention.",
    longDescription:
      "Calculate years, months and residual weeks/days between calendar dates. Missing month-end anniversaries clamp to the target month’s last day. Total time units assume 24-hour days; birth times and daylight-saving transitions are not measured.",
    categorySlug: "calculators",
    icon: "\uD83C\uDF82",
    featured: true,
    keywords: [
      "chronological age calculator",
      "how old am i",
      "date of birth calculator",
      "age from date of birth",
      "birthday calculator",
      "exact age finder",
    ],
    metaTitle: "Age Calculator — Chronological Age",
    metaDescription:
      "Compare birth and target dates using a clear calendar-age convention.",
    usageSteps: [
      {
        "title": "Choose a birth date",
        "content": "Use the date picker’s calendar date format. It does not accept arbitrary free-form date formats."
      },
      {
        "title": "Choose the target date",
        "content": "The target must not be earlier than the birth date."
      },
      {
        "title": "Calculate and check the convention",
        "content": "Read calendar years and months separately from total elapsed time. A legal or institutional rule may use a different anniversary convention."
      }
    ],
    faq: [
      {
        "question": "How does February 29 work?",
        "answer": "A missing anniversary date clamps to the last day of the target month. This is an arithmetic convention, not a ruling about a legal birthday."
      },
      {
        "question": "Are seconds the exact time since birth?",
        "answer": "No. The input contains dates only. Seconds are derived from elapsed whole dates assuming 24-hour days."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "January 31, 2025 to February 28, 2025 is one calendar month under this convention."
      },
      {
        "heading": "Before using the result",
        "content": "Use the rule specified by the receiving form, institution or jurisdiction for eligibility decisions."
      }
    ],
  },
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    description:
      "Calculate adult BMI with categories based on the unrounded value.",
    longDescription:
      "Enter metric or imperial height and weight to calculate Body Mass Index for adults aged 20 and older. The displayed result is rounded to two decimals; category thresholds use the unrounded value. BMI is a screening measure, not a diagnosis.",
    categorySlug: "calculators",
    icon: "\u2695\uFE0F",
    featured: true,
    keywords: [
      "bmi calculator online",
      "body mass index calculator",
      "calculate bmi",
      "bmi chart",
      "ideal weight calculator",
      "bmi checker",
    ],
    metaTitle: "BMI Calculator — Body Mass Index",
    metaDescription:
      "Calculate adult BMI with categories based on the unrounded value.",
    usageSteps: [
      {
        "title": "Choose matching units",
        "content": "Select cm/kg or inches/lb and enter positive height and weight."
      },
      {
        "title": "Calculate and read the category",
        "content": "Calculate BMI and compare the category with the numeric value. Rounded display can appear near a boundary without crossing it."
      },
      {
        "title": "Interpret with appropriate guidance",
        "content": "Consider the result alongside relevant health information with a qualified professional. Children and teens require a different age- and sex-specific assessment."
      }
    ],
    faq: [
      {
        "question": "Why can 24.96 show Healthy weight?",
        "answer": "The adult healthy-weight category is 18.5 to below 25. The tool classifies the unrounded value, so rounding cannot change the category."
      },
      {
        "question": "Does BMI measure body fat or health directly?",
        "answer": "No. BMI does not directly measure body composition or establish an individual diagnosis. Muscle mass and other factors require context."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "99.84 kg at 200 cm gives 24.96, within the adult Healthy weight category. A BMI of exactly 25 enters Overweight."
      },
      {
        "heading": "Before using the result",
        "content": "Category reference: CDC Adult BMI Categories at https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html. This calculator does not provide treatment or dietary advice."
      }
    ],
  },
  {
    slug: "tip-calculator",
    name: "Tip Calculator",
    description:
      "Calculate the tip amount and split the bill among any number of people.",
    longDescription:
      "Use this tip calculator to calculate gratuity, total bill, and per-person cost for restaurants, delivery, rides, and group meals. Enter the bill amount, choose a tip percentage, set the number of people, and see the split instantly.",
    categorySlug: "calculators",
    icon: "\uD83D\uDCB5",
    featured: true,
    keywords: [
      "tip calculator",
      "restaurant tip calculator",
      "bill split calculator",
      "gratuity calculator",
      "tip per person",
    ],
    metaTitle: "Tip Calculator - Split Bill and Gratuity Online",
    metaDescription:
      "Use this tip calculator to calculate gratuity and split restaurant bills. Enter bill amount, tip percentage, and people for per-person totals.",
    usageSteps: [
      {
        title: "Enter the Bill Amount",
        content:
          "Type the subtotal from your restaurant receipt into the tip calculator. You can include tax if you want the tip based on the final bill.",
      },
      {
        title: "Choose Tip Percentage and People",
        content:
          "Select a preset tip or enter a custom gratuity percentage, then add the number of people splitting the bill. The tip calculator updates totals instantly.",
      },
      {
        title: "Read the Per-Person Total",
        content:
          "Use the total tip, full bill, and per-person amount to settle up quickly. The tip calculator is useful for restaurants, delivery, rides, and group meals.",
      },
    ],
    faq: [
      {
        question: "How does the tip calculator split a bill?",
        answer:
          "The tip calculator adds the selected gratuity to the bill amount, then divides the total by the number of people. It also shows the tip amount separately.",
      },
      {
        question: "Can I enter a custom tip percentage?",
        answer:
          "Yes. You can use preset percentages or enter a custom tip rate for local customs, service quality, or personal preference.",
      },
    ],
  },
  {
    slug: "date-difference-calculator",
    name: "Date Difference Calculator",
    description:
      "Compare calendar dates with a month-end convention and elapsed-day totals.",
    longDescription:
      "Compare two date-only values. Calendar years and months use clamped month-end anniversaries; remaining weeks and days complete that calendar breakdown. Total hours, minutes and seconds assume 24-hour days rather than elapsed zoned timestamps.",
    categorySlug: "calculators",
    icon: "\uD83D\uDCC5",
    featured: true,
    keywords: [
      "date difference calculator online",
      "days between dates",
      "date calculator",
      "how many days between dates",
      "date duration calculator",
      "date math tool",
    ],
    metaTitle: "Date Difference Calculator - Free Online Tool",
    metaDescription:
      "Compare calendar dates with a month-end convention and elapsed-day totals.",
    usageSteps: [
      {
        "title": "Select two dates",
        "content": "Select start and end calendar dates. Reversed inputs are compared by magnitude and indicated in the result."
      },
      {
        "title": "Calculate the interval",
        "content": "Read the calendar decomposition separately from the total elapsed days. The end date is excluded from the elapsed count."
      },
      {
        "title": "Use the correct counting rule",
        "content": "This does not exclude weekends or holidays. Use a business calendar or zoned timestamp calculation if your task requires them."
      }
    ],
    faq: [
      {
        "question": "How are month ends treated?",
        "answer": "A missing anniversary date clamps to the last day of the target month. January 31 to February 28 in 2025 is one calendar month and 28 total days."
      },
      {
        "question": "Are daylight-saving changes included?",
        "answer": "No. These are date-only values and fixed 24-hour-day totals, not local-clock durations across time zones."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "2025-01-31 to 2025-02-28 gives one month, zero residual weeks/days and 28 total days."
      },
      {
        "heading": "Before using the result",
        "content": "Deadline systems can count inclusively or apply holidays; check the rule that controls your actual submission."
      }
    ],
  },
  {
    slug: "number-to-words",
    name: "Number to Words",
    description:
      "Write plain decimal numbers in English, with fractions rounded to hundredths.",
    longDescription:
      "Convert up to 15 integer digits to English words. Decimal fractions are written as hundredths and rounded half away from zero using decimal-string arithmetic. Currency names, scientific notation and comma-separated input are not supported.",
    categorySlug: "calculators",
    icon: "\u{1F522}",
    featured: true,
    keywords: [
      "spell number online",
      "convert numbers to words",
      "number to english words",
      "spell number to words",
      "number to text converter",
    ],
    metaTitle: "Number to Words - Free Online Converter Tool",
    metaDescription:
      "Write plain decimal numbers in English, with fractions rounded to hundredths.",
    usageSteps: [
      {
        "title": "Enter a plain decimal",
        "content": "Use digits and an optional leading sign and decimal fraction. Remove grouping commas."
      },
      {
        "title": "Convert to words",
        "content": "Convert, then check both the integer words and the hundredths. Rounding can carry into the integer part."
      },
      {
        "title": "Use the wording in context",
        "content": "Add the required currency or document wording yourself. This is a spelling utility, not a legally standardized cheque formatter."
      }
    ],
    faq: [
      {
        "question": "What happens to 1.999?",
        "answer": "It rounds to 2.00 and is written as two and 00/100. The same rounding is applied to the magnitude of negative values."
      },
      {
        "question": "What input is rejected?",
        "answer": "Scientific notation, nonnumeric suffixes and values outside the stated range are rejected. Rounded values must remain at or below 999,999,999,999,999.99 in magnitude."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "123 becomes one hundred twenty-three. -1.995 becomes negative two and 00/100."
      },
      {
        "heading": "Before using the result",
        "content": "Check the destination document’s required spelling convention and decimal precision."
      }
    ],
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    description: "Create a PNG QR code from text or a URL, then test it before sharing.",
    longDescription:
      "Encode a short text value or URL locally, choose the image size and download a PNG. The code uses fixed dark and light colors. It does not create a managed redirect, track scans or assemble contact/Wi-Fi records for you.",
    categorySlug: "converters",
    icon: "📱",
    featured: true,
    keywords: [
      "qr code maker online",
      "qr code creator online",
      "custom qr code maker",
      "free qr code generator",
      "downloadable qr code",
      "url to qr code converter",
    ],
    metaTitle: "QR Code Generator Online — Custom QR Codes",
    metaDescription:
      "Create a PNG QR code from text or a URL, then test it before sharing.",
    usageSteps: [
      {
        "title": "Enter the payload",
        "content": "Paste the exact text or complete URL to encode. For a structured payload such as Wi-Fi settings, supply the correct format yourself."
      },
      {
        "title": "Choose a size",
        "content": "Choose one of the available image sizes. Color customization is not provided."
      },
      {
        "title": "Download and scan",
        "content": "Save the PNG and test it with the camera or scanning app your audience will use. Check the destination before printing."
      }
    ],
    faq: [
      {
        "question": "Can the destination change later?",
        "answer": "A downloaded static QR code contains the original payload. To change it, generate and distribute a new code, or manage your own redirect URL."
      },
      {
        "question": "Why might a code fail to scan?",
        "answer": "Very long payloads, small print, insufficient quiet space or a low-quality image can reduce reliability. Test the actual printed or displayed version."
      }
    ],
    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "Encode https://example.com/ and scan the saved PNG. The decoded URL should be the same address."
      },
      {
        "heading": "Before using the result",
        "content": "Encoding does not verify that a destination is trustworthy, available or safe."
      }
    ],
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description: "Convert colors between HEX, RGB, and HSL formats instantly.",
    longDescription:
      "Enter a color in any format — HEX, RGB, or HSL — and get instant conversions to all other formats. See a live preview of the color and copy values with one click. Essential for web designers and developers.",
    categorySlug: "converters",
    icon: "🎨",
    featured: true,
    keywords: [
      "hex to rgb converter",
      "color converter online",
      "hex color converter",
      "color code converter",
      "rgb hex hsl converter",
    ],
    metaTitle: "Color Converter — HEX, RGB, HSL",
    metaDescription:
      "Convert colors between HEX, RGB, and HSL online free. Preview each shade dynamically and copy values for your designs.",
    usageSteps: [
      {
        title: "Enter Your Color Value",
        content:
          "Type or paste any color value in HEX (like #FF5733), RGB, or HSL format into this color converter. The tool instantly detects which format you entered and prepares the conversion.",
      },
      {
        title: "View Real-Time Conversions",
        content:
          "Watch as all three color formats update simultaneously with matching values. This color converter shows you the exact equivalent across HEX, RGB, and HSL as you type or adjust colors.",
      },
      {
        title: "Copy or Use the Result",
        content:
          "Click the copy icon next to any color format to copy it to your clipboard. Whether you need color converter results for CSS, design software, or print projects, the values are ready for immediate use.",
      },
    ],
    faq: [
      {
        question:
          "How does this color converter handle different color formats?",
        answer:
          "This color converter supports HEX, RGB, and HSL formats by instantly translating between them using standard conversion algorithms. Each format represents the same color differently, and the tool handles all conversions automatically.",
      },
      {
        question:
          "Can I use this color converter for print and web design projects?",
        answer:
          "Yes, the converted values from this color converter are directly compatible with CSS and print design tools. Simply copy the format you need and paste it directly into your project files.",
      },
    ],
    additionalContent: [
      {
        heading:
          "Understanding HEX, RGB, and HSL Color Models and Their Use Cases",
        content:
          "Each color model serves a different purpose in design and development. HEX (hexadecimal) is the most common format in web development, used directly in CSS to define colors with a six-character code like #FF5733. It is compact and precise but not intuitive for manual adjustment. RGB (red, green, blue) describes colors by their component light values from 0 to 255, which maps directly to how screens display color — useful when you need fine control over individual channels. HSL (hue, saturation, lightness) is the most human-readable format: hue determines the color on a 0–360 degree wheel, saturation controls intensity, and lightness adjusts brightness. HSL is ideal for creating color schemes because you can shift the hue value while keeping the same saturation and lightness for a consistent look across a palette.",
      },
      {
        heading:
          "Why Color Format Conversion Matters for Cross-Platform Design",
        content:
          "Designers and developers frequently switch between color formats as they move from design tools to production code. A color created in a design tool like Figma or Sketch is typically represented in RGB or HSL, but the final CSS or SVG code often requires HEX values. Manual conversion between formats is error-prone — a single digit off in a HEX code produces a noticeably different shade. A reliable color format converter eliminates this risk by performing precise mathematical conversions between all three models. This is especially important when maintaining brand consistency across web, print, and mobile platforms where each medium may require a different color representation of the same brand palette.",
      },
    ],
  },
  {
    slug: "html-formatter",
    name: "HTML Formatter",
    description: "Format, beautify, and minify your HTML code instantly.",
    longDescription:
      "Clean up messy or minified HTML markup with customizable indent levels. Beautify your code for better readability, or minify it to reduce file size and optimize loading times.",
    categorySlug: "developer-tools",
    icon: "\ud83c\udf10",
    featured: true,
    keywords: [
      "html beautifier online",
      "html formatter",
      "beautify html",
      "html beautifier",
      "minify html",
    ],
    metaTitle: "HTML Formatter Online — Beautify & Minify HTML",
    metaDescription:
      "Free HTML formatter online — beautify messy HTML or compress into minified code. Custom indent sizes, instant results in your browser.",
    usageSteps: [
      {
        title: "Insert Your HTML Code",
        content:
          "Paste your raw, minified, or poorly indented HTML markup into the editor area on the left. Whether you copied the source from a webpage or retrieved it from a template file, our HTML formatter works instantly without any setup.",
      },
      {
        title: "Run the Formatter",
        content:
          "Click the format button to re-indent every tag, attribute, and text node with the correct nesting hierarchy. The tool intelligently preserves inline styles and scripts while ensuring every opening and closing tag aligns properly for maximum readability.",
      },
      {
        title: "Export the Cleaned Markup",
        content:
          "Once the formatted HTML appears in the output panel, use the copy icon to grab the entire cleaned code block. You can then paste it directly into your editor or save it as a new file — ready for your development workflow.",
      },
    ],
    faq: [
      {
        question: "How is this HTML formatter different from an editor plugin?",
        answer:
          "This HTML formatter works entirely in your browser without requiring any plugin installation or editor configuration. It is especially useful when you are working on a shared or restricted machine, troubleshooting malformed markup from a live page, or need a quick second opinion on your document structure.",
      },
      {
        question:
          "Does this HTML formatter handle embedded CSS and JavaScript?",
        answer:
          "Yes — the tool is designed to intelligently format HTML code while preserving the integrity of embedded style blocks and script sections. It indents the content inside style and script tags appropriately without breaking syntax, so your entire document remains valid.",
      },
    ],
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description:
      "Test your regular expressions in real-time with syntax highlighting.",
    longDescription:
      "Write and test regular expressions against sample text. View match counts, highlight matched text, extract capture groups, and understand match coordinates instantly in your browser.",
    categorySlug: "developer-tools",
    icon: "\ud83e\uddea",
    featured: true,
    keywords: [
      "regex pattern tester",
      "regex tester",
      "test regex online",
      "regular expression tester",
      "regex matcher",
    ],
    metaTitle: "Regex Tester Online — Test Regular Expressions",
    metaDescription:
      "Free regex tester online — write and test regular expressions against sample text. See matches, capture groups, and positions in your browser.",
    usageSteps: [
      {
        title: "Enter Your Regular Expression Pattern",
        content:
          "Type or paste your regex pattern into the pattern field, including any flags like global or case-insensitive. If you are used to a regex tester workflow, you will find the same instant feedback loop here — test your pattern against sample data without setting up a local environment.",
      },
      {
        title: "Provide a Test String",
        content:
          "Paste one or more sample strings into the test input area that you want to match against your pattern. Like any good regex tester, the tool highlights every match in real time, showing you exactly which portions of your text the regular expression captures.",
      },
      {
        title: "Review Matches and Refine Your Pattern",
        content:
          "Examine the highlighted matches and the detailed match info panel to understand capture groups and positions. Iterate on your pattern by editing it directly and watching the results update instantly — just like a dedicated regex tester, this rapid feedback loop helps you get your expression exactly right.",
      },
    ],
    faq: [
      {
        question: "How does this regex tester improve my development workflow?",
        answer:
          "When you use this regex tester, you get immediate visual feedback on every match, capture group, and replacement operation without running your entire application. It mimics the behavior of a regex tester library call but with a visual interface that shows you exactly what each part of your expression does.",
      },
      {
        question: "Can I use this regex tester for languages other than Ruby?",
        answer:
          "This tester uses the browser's JavaScript RegExp engine and therefore supports ECMAScript syntax and flags. PCRE, Python, .NET, and Java have different features, so test the final pattern again in its actual target runtime.",
      },
    ],
  },
  {
    slug: "markdown-to-html",
    name: "Markdown to HTML",
    description: "Convert Markdown syntax to clean, valid HTML markup.",
    longDescription:
      "Easily convert markdown text (including headings, lists, tables, links, and code blocks) to standard HTML code. View a live rich text preview of your rendered document and copy raw HTML with one click.",
    categorySlug: "converters",
    icon: "\u2B07\uFE0F",
    featured: true,
    keywords: [
      "markdown to html",
      "convert markdown to html",
      "md to html converter",
      "markdown compiler online",
      "html from markdown",
    ],
    metaTitle: "Markdown to HTML Converter - Free Online Tool",
    metaDescription:
      "Convert markdown to HTML instantly with our free converter. See live preview and copy clean, semantic HTML5 code with one click.",
    usageSteps: [
      {
        title: "Write or Paste Markdown",
        content:
          "Type your Markdown content directly into the left editor panel or paste existing Markdown from any source. The editor supports headings, lists, code blocks, tables, links, and images to convert markdown to HTML online.",
      },
      {
        title: "Preview the HTML Output",
        content:
          "The right panel instantly renders the converted HTML as a live preview. You can see exactly how elements like bold text, links, and code snippets look as you convert markdown to HTML online.",
      },
      {
        title: "Export the HTML Code",
        content:
          "Click the copy button to grab the clean HTML source code. When you convert markdown to HTML online, the output is semantic, accessible HTML5 ready for any website or CMS.",
      },
    ],
    faq: [
      {
        question: "How do I convert markdown to HTML quickly and accurately?",
        answer:
          "Paste your Markdown content into the editor and the tool instantly generates clean HTML. This is the fastest way to convert markdown to HTML — the live preview shows exactly how your content will render while the HTML output is ready to copy.",
      },
      {
        question:
          "What Markdown features are supported when I convert markdown to HTML?",
        answer:
          "The converter fully supports headings, bold, italic, links, images, ordered and unordered lists, code blocks, tables, blockquotes, and task lists. When you convert markdown to HTML online, GFM (GitHub Flavored Markdown) syntax is also fully supported.",
      },
    ],
  },
  {
    slug: "csv-to-json",
    name: "CSV to JSON",
    description: "Convert CSV spreadsheets or tables to structured JSON data.",
    longDescription:
      "Use this CSV to JSON converter to turn spreadsheet rows, exports, and comma-separated tables into structured JSON arrays. Configure headers and delimiters, preview the output, and copy clean JSON for APIs, databases, tests, and frontend code without uploading your data.",
    categorySlug: "converters",
    icon: "📊",
    featured: true,
    keywords: [
      "csv to json converter",
      "convert csv to json",
      "csv to json online",
      "csv parser online",
      "excel to json converter",
    ],
    metaTitle: "CSV to JSON Converter - Free Online Tool",
    metaDescription:
      "Use this CSV to JSON converter for headers, delimiters, and clean array output. Convert spreadsheet data privately in your browser with no upload.",
    usageSteps: [
      {
        title: "Paste Your CSV Data",
        content:
          "Paste comma-separated data from a spreadsheet, export, or table into the CSV to JSON converter. You can keep the first row as headers or let the tool generate field names.",
      },
      {
        title: "Choose Parsing Options",
        content:
          "Set the delimiter, header mode, and output style before conversion. The CSV to JSON converter previews structured records so you can catch malformed rows early.",
      },
      {
        title: "Copy Clean JSON",
        content:
          "Copy the generated JSON array for APIs, databases, tests, or frontend code. The CSV to JSON converter runs in your browser, so private spreadsheets are not uploaded.",
      },
    ],
    faq: [
      {
        question: "Does this CSV to JSON converter upload my data?",
        answer:
          "No. The CSV to JSON converter runs client-side in your browser. Your spreadsheet rows are parsed locally and are not sent to a server.",
      },
      {
        question: "Can the CSV to JSON converter handle headers?",
        answer:
          "Yes. You can use the first row as object keys or generate generic keys. This makes the output ready for APIs, JavaScript, and data migration work.",
      },
    ],
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    description: "Compress and resize PNG, JPEG, and WebP images client-side.",
    longDescription:
      "Reduce image file sizes directly in your browser. Adjust compression quality, resize dimensions, choose JPEG, WebP, or PNG output, and compare before/after file sizes without sending the selected image to our processing server.",
    categorySlug: "converters",
    icon: "🖼️",
    featured: true,
    keywords: [
      "image compressor online",
      "compress image file size",
      "reduce image size online free",
      "jpg png webp compressor",
      "lossless image compression",
      "optimize images for web",
    ],
    metaTitle: "Image Compressor — JPEG, PNG, WebP",
    metaDescription:
      "Re-encode JPEG, PNG and WebP images locally. Compare size and appearance; lossy settings can change quality and output may be larger.",
    usageSteps: [
      {
        title: "Upload Your Image",
        content:
          "Drag and drop an image or click to browse and select a file from your device. This image compressor online tool handles JPEG, PNG, WebP, and GIF formats so you can compress image without uploading to any external server.",
      },
      {
        title: "Adjust Compression Quality",
        content:
          "Use the quality slider to balance file size reduction against image fidelity. The selected image is decoded and re-encoded locally instead of being sent to our processing server; keep the original because browser export can remove metadata.",
      },
      {
        title: "Download the Optimized Image",
        content:
          "Preview the compressed result alongside the original and compare sizes. Click download to save the optimized version when you use this image compressor online to prepare images for web use or storage.",
      },
    ],
    faq: [
      {
        question:
          "How much can I reduce file size with this image compressor online?",
        answer:
          "Savings depend on the image, output codec and quality setting. JPEG and WebP can trade image quality for size; PNG may grow. Compare the actual before and after sizes and inspect the image instead of relying on a fixed percentage.",
      },
      {
        question:
          "Is it safe to compress images with sensitive content using this tool?",
        answer:
          "The tool reads and re-encodes the selected image using browser Canvas APIs without sending it to a processing server. The page can still load analytics or advertising, and browser extensions or other device software are outside this tool's control. Use harmless files when verifying privacy.",
      },
    ],
    additionalContent: [
      {
        heading: "Private Browser-Based Image Compression",
        content:
          "The image compressor runs locally in your browser, so JPEG, PNG, and WebP files do not need to be uploaded to a remote service. This is useful for product photos, screenshots, blog images, and private visual assets.",
      },
      {
        heading: "When to Compress Images Online",
        content:
          "Use image compression before publishing web pages, sending email attachments, uploading forms, or sharing images where file size matters. Smaller files can improve page speed and reduce storage without changing the original file on your device.",
      },
      {
        heading: "Supported Formats and Limits",
        content:
          "The tool is designed for common web image formats including JPEG, PNG, and WebP. Large files are limited to keep the browser responsive, and compression results depend on image dimensions, format, and quality settings.",
      },
    ],
  },

  // ── PDF Tools (5) ────────────────────────────────────────────
  {
    slug: "pdf-merger",
    name: "PDF Merger",
    description: "Combine whole PDF files in a chosen order using your browser.",
    longDescription:
      "Select at least two unencrypted PDFs, move whole files up or down and download the combined document. Pages within each input retain their original order. There is no individual-page rearrangement or merged-document preview.",
    categorySlug: "pdf-tools",
    icon: "📑",
    featured: true,
    keywords: [
      "combine pdf files",
      "merge pdf files online",
      "combine pdf documents",
      "join pdf files",
      "pdf merger free tool",
      "merge multiple pdfs",
    ],
    metaTitle: "Merge PDF Files Online Free — Combine PDFs",
    metaDescription:
      "Combine whole PDF files in a chosen order using your browser.",
    usageSteps: [
      {
        "title": "Select the PDFs",
        "content": "Choose the input documents. Encrypted or unsupported PDFs can fail to load; keep your originals."
      },
      {
        "title": "Order the files",
        "content": "Use Move up and Move down to arrange the file list. Remove an unwanted file before merging."
      },
      {
        "title": "Merge and inspect",
        "content": "Merge, save the output and open it in a PDF viewer. Check the complete page sequence, orientation and legibility."
      }
    ],
    faq: [
      {
        "question": "Can I rearrange individual pages?",
        "answer": "This workspace orders entire files. Use PDF Splitter to extract the needed pages first, then merge those files in the desired order."
      },
      {
        "question": "Will every PDF feature survive?",
        "answer": "No universal compatibility is promised. Forms, signatures, attachments, annotations and other advanced features may change or be lost. Inspect the downloaded document."
      }
    ],
    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "Two one-page inputs ordered A then B should produce a two-page document with A before B. Reverse the files and inspect the reversed result."
      },
      {
        "heading": "Before using the result",
        "content": "Do not use the merged copy as a substitute for a signed original. Browser memory and source-file complexity affect processing."
      }
    ],
  },
  {
    slug: "pdf-splitter",
    name: "PDF Splitter",
    description: "Split a PDF file into individual pages or page ranges.",
    longDescription:
      "Upload a PDF and split it into separate pages. Choose to extract every page as an individual PDF, or select a specific page range. Ideal for extracting chapters, sections, or specific documents from larger PDF files.",
    categorySlug: "pdf-tools",
    icon: "✂️",
    featured: true,
    keywords: [
      "free pdf splitter",
      "split pdf into separate pages",
      "extract pages from pdf",
      "pdf page separator",
      "pdf splitter no upload",
      "separate pdf document",
    ],
    metaTitle: "PDF Splitter - Separate Pages Free Online Tool",
    metaDescription:
      "Use this free pdf splitter to split a PDF into individual pages or extract specific page ranges. No uploads, no signups — entirely private browser processing.",
    usageSteps: [
      {
        title: "Select Your PDF Document",
        content:
          "Upload the PDF file you want to split using our free pdf splitter. It works with files of any size directly in your browser without any server uploads or signup required.",
      },
      {
        title: "Choose Your Split Method",
        content:
          "Select how you want to split your PDF — by page range, extract every page individually, or split at specific page numbers. The interface shows a clear preview of each page to help you make accurate selections.",
      },
      {
        title: "Download Your Split Pages",
        content:
          "Click Split to process your document with the free pdf splitter. Each extracted page or range is available as a separate PDF file for immediate download with no waiting time.",
      },
    ],
    faq: [
      {
        question:
          "Can the free pdf splitter extract specific pages instead of all?",
        answer:
          "Absolutely. Our free pdf splitter lets you extract specific page ranges or individual pages from your document. Simply enter the page numbers you need, and the tool will extract only those pages into a new PDF file.",
      },
      {
        question: "Is the free pdf splitter safe for confidential documents?",
        answer:
          "Yes, completely. Our free pdf splitter processes everything locally in your browser. No data is uploaded to any server, so your confidential documents remain private and secure at all times.",
      },
    ],
  },
  {
    slug: "pdf-compressor",
    name: "PDF Compressor",
    description: "Try a local PDF rewrite and compare the actual before-and-after file sizes.",
    longDescription:
      "Rewrite an unencrypted PDF with or without object streams. The output may be smaller, unchanged or larger. This tool does not downsample images, offer image-quality percentages or guarantee a target file size. Keep the original and inspect the output.",
    categorySlug: "pdf-tools",
    icon: "🗜️",
    featured: true,
    keywords: [
      "compress pdf online",
      "reduce pdf size online",
      "pdf size reducer",
      "compress pdf free",
      "pdf compression tool",
      "optimize pdf documents",
    ],
    metaTitle: "PDF Compressor — Local Rewrite & Size Comparison",
    metaDescription:
      "Try a browser-side PDF rewrite and compare actual sizes. No image downsampling or guaranteed savings; password-protected PDFs are rejected.",
    usageSteps: [
  {
    "title": "Choose an unencrypted PDF",
    "content": "Select a local PDF within the displayed application guardrail. Password-protected or malformed files are rejected."
  },
  {
    "title": "Choose a save mode",
    "content": "Object streams may reduce structural overhead; Plain rewrite saves without them. Neither mode changes image resolution or guarantees savings."
  },
  {
    "title": "Compare and inspect",
    "content": "Run the rewrite, compare original and output sizes, then download if useful. If the output is larger, retain your original. Check page order, appearance and any advanced features before using the file."
  }
],
    faq: [
  {
    "question": "Do the modes control image quality?",
    "answer": "No. The modes change PDF serialization, not JPEG quality or image dimensions. Image-heavy scans may barely shrink or may become larger."
  },
  {
    "question": "Are all PDF features preserved?",
    "answer": "Do not assume that digital signatures, complex forms, bookmarks or accessibility tags will survive a rewrite as intended. Keep the original and use a trusted desktop editor when these features matter."
  }
],
    additionalContent: [],
  },
  {
    slug: "pdf-to-text",
    name: "PDF to Text",
    description: "Extract an existing PDF text layer; scanned pages require separate OCR.",
    longDescription:
      "Read selectable text from PDF pages using the browser PDF renderer. Image-only pages have no text layer to extract. The output is plain text and may not reproduce paragraphs, columns, tables or reading order exactly.",
    categorySlug: "pdf-tools",
    icon: "📝",
    featured: false,
    keywords: [
      "pdf to text",
      "convert pdf to text",
      "extract text from pdf",
      "pdf text extractor online",
      "pdf to text converter free",
      "copy text from pdf",
    ],
    metaTitle: "PDF to Text - Free Online PDF Extractor Tool",
    metaDescription:
      "Extract an existing PDF text layer; scanned pages require separate OCR.",
    usageSteps: [
      {
        "title": "Choose a PDF",
        "content": "Select a readable document with a text layer. Keep the original and use a harmless fixture for checks."
      },
      {
        "title": "Extract the available text",
        "content": "Extract and review every needed page. Empty output from a scan does not mean the document is blank."
      },
      {
        "title": "Copy or download and proofread",
        "content": "Copy the text or save a text file. Compare names, numbers and reading order with the original PDF."
      }
    ],
    faq: [
      {
        "question": "Can this tool recognize text in scanned images?",
        "answer": "No. There is no OCR engine. Use OCR in an appropriate document application, then inspect recognition errors."
      },
      {
        "question": "Will the formatting be identical?",
        "answer": "No. PDF text items do not always encode logical paragraph or table structure. Complex layouts need manual correction."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "A PDF with the selectable text Sample 123 should include that text in the extraction. An image-only scan of the same words can return no text."
      },
      {
        "heading": "Before using the result",
        "content": "A library or worker can need network loading. Local text extraction does not guarantee offline availability or accessibility tagging."
      }
    ],
  },
  {
    slug: "pdf-to-images",
    name: "PDF to Images",
    description: "Render PDF pages as PNG or JPEG images and download them locally.",
    longDescription:
      "The browser renders PDF pages to a raster canvas and exports PNG or JPEG images. JPEG quality is adjustable; rendered dimensions depend on the tool’s scale. Download all starts separate image downloads, not a ZIP archive.",
    categorySlug: "pdf-tools",
    icon: "🖼️",
    featured: false,
    keywords: [
      "convert pdf to images online free",
      "pdf to png converter",
      "pdf to jpg converter",
      "pdf pages to images",
      "extract images from pdf",
      "pdf to image converter",
    ],
    metaTitle: "PDF to Images - Convert Pages to PNG JPG Online",
    metaDescription:
      "Render PDF pages as PNG or JPEG images and download them locally.",
    usageSteps: [
      {
        "title": "Select a PDF",
        "content": "Choose a PDF the browser renderer can open. Image rendering is separate from extracting selectable text."
      },
      {
        "title": "Choose the output",
        "content": "Select PNG or JPEG and, for JPEG, the quality setting. Conversion rasterizes text and vector shapes."
      },
      {
        "title": "Inspect and download",
        "content": "Review the generated pages. Save individual images or use Download all; your browser may require permission for multiple downloads."
      }
    ],
    faq: [
      {
        "question": "Does PNG preserve the original PDF quality?",
        "answer": "PNG preserves the pixels of the rendered canvas, not the source document’s vectors, selectable text or metadata. Zooming a raster image can reveal pixelation."
      },
      {
        "question": "Is Download all a ZIP?",
        "answer": "No. It requests separate files. If the browser blocks additional downloads, allow them for the site or save pages individually."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "A two-page PDF should produce two image previews in the same page order. Check both, including small text and rotated pages."
      },
      {
        "heading": "Before using the result",
        "content": "Keep the source PDF when you need searchable text, accessibility structure or exact vector scaling."
      }
    ],
  },

  // ── Image Tools (5) ─────────────────────────────────────────
  {
    slug: "image-cropper",
    name: "Image Cropper",
    description: "Crop any image to custom dimensions or preset aspect ratios.",
    longDescription:
      "Use this crop image online tool to trim photos, screenshots, and graphics to custom dimensions or common aspect ratios. Preview the crop area, adjust framing, and download the result without uploading your image to a server.",
    categorySlug: "converters",
    icon: "✂️",
    featured: true,
    keywords: [
      "crop image online",
      "image cropper online",
      "photo cropper online",
      "crop picture online",
      "free online photo cropper",
    ],
    metaTitle: "Crop Image Online - Free Private Photo Cropper",
    metaDescription:
      "Use this crop image online tool with custom dimensions or aspect ratios. Crop photos privately in your browser with no uploads and instant download.",
    usageSteps: [
      {
        title: "Upload an Image Locally",
        content:
          "Choose a photo from your device to crop image online. The image opens in your browser and is not uploaded to a server.",
      },
      {
        title: "Set Crop Area or Aspect Ratio",
        content:
          "Drag the crop box or choose a preset aspect ratio for social posts, thumbnails, profile photos, or web images. The crop image online preview updates immediately.",
      },
      {
        title: "Download the Cropped Image",
        content:
          "Export the cropped image when the framing looks right. Because processing is local, you can crop private images without sending them anywhere.",
      },
    ],
    faq: [
      {
        question: "Can I crop image online without uploading it?",
        answer:
          "Yes. The photo is processed in your browser with local canvas tools, so it does not leave your device.",
      },
      {
        question: "What aspect ratios can I use?",
        answer:
          "You can crop freely or use common aspect ratios for profile images, banners, thumbnails, and social media posts depending on the options available in the tool.",
      },
    ],
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    description: "Resize images to exact dimensions while maintaining quality.",
    longDescription:
      "Use this resize image online tool to change photo dimensions by width, height, or percentage while preserving aspect ratio. Resize images for websites, email, forms, and social platforms in your browser without uploading the original file.",
    categorySlug: "converters",
    icon: "📏",
    featured: true,
    keywords: [
      "resize image online",
      "resize photos free",
      "photo resizer tool",
      "change image dimensions",
      "resize pictures without quality loss",
    ],
    metaTitle: "Resize Image Online - Free Private Photo Resizer",
    metaDescription:
      "Use this resize image online tool by width, height, or percentage. Change photo dimensions privately in your browser with no upload required.",
    usageSteps: [
      {
        title: "Choose an Image",
        content:
          "Select the file you want to resize image online. The image loads locally in your browser for a private resizing workflow.",
      },
      {
        title: "Set New Dimensions",
        content:
          "Enter a target width, height, or percentage and keep aspect ratio enabled when you want to avoid distortion. The resize image online preview helps confirm the result.",
      },
      {
        title: "Download the Resized File",
        content:
          "Export the resized image for websites, email, social media, or storage. The file is generated in your browser without uploading the original.",
      },
    ],
    faq: [
      {
        question: "Can I resize image online without uploading?",
        answer:
          "Yes. This image resizer uses browser APIs to process the file locally, so your image is not sent to a remote server.",
      },
      {
        question: "Will resizing reduce image quality?",
        answer:
          "Resizing can change quality depending on the output size and format. Keeping aspect ratio and choosing appropriate dimensions usually produces the best visual result.",
      },
    ],
  },
  {
    slug: "image-format-converter",
    name: "Image Format Converter",
    description: "Export a browser-decodable image as PNG, JPEG or WebP.",
    longDescription:
      "Decode one image in the browser and export PNG, JPEG or WebP through Canvas. JPEG and WebP quality are adjustable. Other output formats, animation preservation and original metadata/color-profile preservation are not provided.",
    categorySlug: "converters",
    icon: "🔄",
    featured: true,
    keywords: [
      "image format converter",
      "convert image format",
      "png to jpg converter",
      "jpg to png converter",
      "webp converter online",
    ],
    metaTitle: "Image Format Converter - Free Online File Tool",
    metaDescription:
      "Export a browser-decodable image as PNG, JPEG or WebP.",
    usageSteps: [
      {
        "title": "Choose a decodable image",
        "content": "Start with JPEG, PNG or WebP. Other input formats depend on your browser; a filename extension is not a guarantee of decoding support."
      },
      {
        "title": "Choose PNG, JPEG or WebP",
        "content": "Select one of the actual output options. JPEG does not support transparency, and WebP quality here is not a lossless-mode switch."
      },
      {
        "title": "Convert and inspect",
        "content": "Save the output and compare its dimensions, transparent areas, colors and file size with the original."
      }
    ],
    faq: [
      {
        "question": "Can I export GIF, BMP or TIFF?",
        "answer": "These are not output options. Use a dedicated format converter when they are required."
      },
      {
        "question": "Will animation or metadata be preserved?",
        "answer": "Canvas exports a raster image rather than the original file structure. Animation, EXIF metadata and source color profiles can be lost or changed."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "Convert a small transparent PNG to PNG and JPEG. Confirm that PNG can retain transparent pixels and that JPEG has no alpha channel."
      },
      {
        "heading": "Before using the result",
        "content": "Keep the original. Quality sliders affect supported lossy encoders and do not promise a particular file size."
      }
    ],
  },
  {
    slug: "image-filter",
    name: "Image Filter",
    description:
      "Apply filters like grayscale, sepia, blur, and invert to images.",
    longDescription:
      "Upload an image and apply powerful filters with one click. Choose from grayscale, sepia, invert colors, blur, brightness, contrast, and saturation adjustments. Preview changes in real-time and download the filtered image.",
    categorySlug: "converters",
    icon: "🎨",
    featured: false,
    keywords: [
      "black and white image filter",
      "grayscale photo filter",
      "make image black and white",
      "photo filter online free",
      "sepia filter for images",
      "image effects online",
    ],
    metaTitle: "Image Filter — Black & White, Sepia",
    metaDescription:
      "Apply a black and white image filter to any photo instantly. Convert color images to grayscale, sepia, or adjust brightness and contrast — free and client-side.",
    usageSteps: [
      {
        title: "Upload Your Image",
        content:
          "Select an image from your device to start applying creative effects. This black and white image filter tool loads your photo instantly so you can apply filter to image online with real-time preview of every adjustment.",
      },
      {
        title: "Apply the Black and White Filter",
        content:
          "Click the grayscale or black and white option to instantly remove all color from your image. You can fine-tune brightness and contrast after you apply filter to image online for the perfect monochrome look.",
      },
      {
        title: "Download Your Filtered Image",
        content:
          "Once satisfied with the result, click download to save your edited image. When you apply filter to image online using this black and white image filter, all processing stays on your device for complete privacy.",
      },
    ],
    faq: [
      {
        question:
          "How do I turn a color photo into black and white using this image filter?",
        answer:
          "Upload your color photo and click the grayscale or black and white filter option. This black and white image filter instantly converts your image while preserving brightness levels so the monochrome result has depth, contrast, and detail.",
      },
      {
        question:
          "Can I adjust brightness and contrast after applying the black and white filter?",
        answer:
          "Yes, you can fine-tune brightness, contrast, and saturation after applying the black and white effect. Use this black and white image filter to apply filter to image online and refine the result until you achieve the exact monochrome aesthetic you want.",
      },
    ],
  },
  {
    slug: "image-to-base64",
    name: "Image to Base64",
    description: "Convert any image to a Base64 encoded data URI string.",
    longDescription:
      "Upload an image and instantly get its Base64-encoded data URI representation. Copy the string with one click for use in CSS backgrounds, HTML image sources, and data URIs. Perfect for web developers embedding images directly in code.",
    categorySlug: "converters",
    icon: "🔣",
    featured: false,
    keywords: [
      "image to base64 converter online",
      "image to base64",
      "base64 image encoder",
      "data uri generator",
      "encode image to base64 string",
    ],
    metaTitle: "Image to Base64 - Free Online Converter Tool",
    metaDescription:
      "Convert any image to a Base64 string with this free image to base64 converter online. Encode images for direct embedding in HTML, CSS, and JavaScript.",
    usageSteps: [
      {
        title: "Upload Your Image",
        content:
          "Choose an image file from your device to encode it into Base64 text format. This image to base64 converter online supports JPEG, PNG, GIF, WebP, SVG, and other common image formats.",
      },
      {
        title: "View the Encoded String",
        content:
          "The tool instantly converts your image into a Base64 data URI displayed in the output area. You can toggle between including the data:image/... prefix or outputting raw Base64 with this image to base64 converter online.",
      },
      {
        title: "Copy and Use",
        content:
          "Click the copy button to copy the entire Base64 string to your clipboard. When you use this image to base64 converter online, the encoded string can be embedded directly into HTML, CSS, or JavaScript without external image files.",
      },
    ],
    faq: [
      {
        question: "Why should I use an image to base64 converter online?",
        answer:
          "Using an image to base64 converter online lets you embed images directly in HTML, CSS, or JavaScript files, reducing HTTP requests and simplifying deployment. It is especially useful for small icons, email signatures, and single-file applications.",
      },
      {
        question:
          "Does this image to base64 converter online increase file size?",
        answer:
          "Yes, this image to base64 converter online increases the file size by approximately 33% compared to the original binary file. This encoding overhead is acceptable for small images but may not be ideal for large files or performance-critical applications.",
      },
    ],
  },

  // ── Developer Tools (3) ─────────────────────────────────────
  {
    slug: "password-generator",
    name: "Password Generator",
    description: "Generate random passwords using browser cryptographic randomness.",
    longDescription:
      "Choose a length and enabled character sets, then generate and copy a password. The generator uses the browser’s cryptographic random source. Its length/variety indicator is a rough guide, not a promise that a password cannot be cracked.",
    categorySlug: "developer-tools",
    icon: "🔑",
    featured: true,
    keywords: [
      "secure password generator",
      "strong password creator",
      "random password online",
      "generate secure passwords",
      "password with symbols",
      "cryptographically secure password",
    ],
    metaTitle: "Password Generator — Secure Online",
    metaDescription:
      "Generate random passwords using browser cryptographic randomness.",
    usageSteps: [
      {
        "title": "Choose your requirements",
        "content": "Set the length and enabled character groups accepted by the destination service. Avoid unnecessarily small lengths or restricted sets."
      },
      {
        "title": "Generate a fresh value",
        "content": "Generate locally and check that the output meets that service’s requirements. Do not treat an appearance-based rating as a security guarantee."
      },
      {
        "title": "Store securely",
        "content": "Copy it into a trusted password manager and use a different password for each account. Protect the clipboard on shared devices."
      }
    ],
    faq: [
      {
        "question": "Are passwords uncrackable?",
        "answer": "No. Randomness does not make an account invulnerable. Length, service storage, phishing, reuse and device security all matter."
      },
      {
        "question": "Can I use the tool for recovery tokens?",
        "answer": "Use your application’s established token mechanism for security-sensitive identifiers. This interface is intended for creating account passwords, not designing an authentication system."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "Set a length of 16 with uppercase, lowercase, digits and symbols enabled. Confirm the length and selected groups in the generated value; generate again rather than publishing a sample as a real credential."
      },
      {
        "heading": "Before using the result",
        "content": "Do not paste an existing password into a shared device. A password manager can generate and store credentials without exposing them to the clipboard."
      }
    ],
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description:
      "Compute UTF-8 text checksums using MD5, SHA-1, SHA-256 or SHA-512.",
    longDescription:
      "Hash the exact text entered, including spaces and line breaks. MD5 uses an RFC 1321 implementation and SHA variants use Web Crypto. MD5 and SHA-1 are legacy checksums and are unsuitable for collision-resistant security or password storage.",
    categorySlug: "developer-tools",
    icon: "#",
    featured: false,
    keywords: [
      "hash generator",
      "sha256 hash generator",
      "md5 generator",
      "cryptographic hash calculator",
      "sha512 hash",
    ],
    metaTitle: "Hash Generator - Free MD5 SHA256 SHA512 Tool",
    metaDescription:
      "Compute UTF-8 text checksums using MD5, SHA-1, SHA-256 or SHA-512.",
    usageSteps: [
      {
        "title": "Enter exact text",
        "content": "Paste the text whose digest is needed. Text encoding is UTF-8; invisible whitespace changes a digest."
      },
      {
        "title": "Choose the algorithm",
        "content": "Select the algorithm required by the receiving system. This interface hashes text rather than uploaded files."
      },
      {
        "title": "Compare complete digests",
        "content": "Generate and compare the full hexadecimal output. Matching text checksums do not authenticate who supplied the data."
      }
    ],
    faq: [
      {
        "question": "Can I recover text from its hash?",
        "answer": "Hashing is one-way, but guessable inputs can be tested. A hash is not encryption and does not safely hide a short password."
      },
      {
        "question": "Which algorithm is suitable for passwords?",
        "answer": "Use a purpose-built password hashing scheme through your application’s authentication system. This general digest generator is not a password-storage tool."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "For abc, MD5 is 900150983cd24fb0d6963f7d28e17f72. A trailing newline produces a different digest."
      },
      {
        "heading": "Before using the result",
        "content": "When checking a downloaded file, use a file-hashing utility and a digest obtained from a trusted source; this workspace handles text."
      }
    ],
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate random version 4 UUID identifiers for data and testing.",
    longDescription:
      "Generate one to 100 UUID v4 identifiers and copy the output. Only the random v4 format is provided; there is no v1 or v7 selector. UUIDs identify records but should not replace authentication secrets.",
    categorySlug: "developer-tools",
    icon: "\ud83d\udd22",
    featured: false,
    keywords: [
      "random uuid generator",
      "uuid generator",
      "guid generator",
      "generate uuid v4",
      "unique id generator",
    ],
    metaTitle: "UUID Generator - Free Random v4 ID Creator",
    metaDescription:
      "Generate random version 4 UUID identifiers for data and testing.",
    usageSteps: [
      {
        "title": "Set the count",
        "content": "Choose a whole count from 1 to 100."
      },
      {
        "title": "Generate v4 identifiers",
        "content": "Generate the random UUIDs. Each uses the version 4 and RFC variant bit pattern."
      },
      {
        "title": "Copy and enforce uniqueness",
        "content": "Copy the identifiers and apply an appropriate unique constraint in the destination database."
      }
    ],
    faq: [
      {
        "question": "Can I choose time-based UUIDs?",
        "answer": "No. This interface generates v4 only. Use a UUID implementation supporting the required version when ordering or time semantics matter."
      },
      {
        "question": "Are collisions impossible?",
        "answer": "Random UUID collisions are unlikely, not impossible. Validate uniqueness where it is required and do not use this tool as a session-token security design."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "A v4 UUID has 36 characters with hyphens: xxxxxxxx-xxxx-4xxx-[89ab]xxx-xxxxxxxxxxxx, where x is a hexadecimal digit."
      },
      {
        "heading": "Before using the result",
        "content": "Generated examples are identifiers, not credentials or proof of uniqueness across every system."
      }
    ],
  },

  // ── Text Tools (3) ──────────────────────────────────────────
  {
    slug: "text-diff",
    name: "Text Diff Checker",
    description: "Compare two texts side-by-side and highlight differences.",
    longDescription:
      "Paste two versions of text and see the differences highlighted instantly. Compare line by line with additions shown in green, deletions in red, and unchanged text in gray. Perfect for reviewing document changes, code diffs, and content edits.",
    categorySlug: "text-tools",
    icon: "📊",
    featured: true,
    keywords: [
      "online text diff checker",
      "text comparison tool",
      "diff checker online",
      "compare text side by side",
      "text difference finder",
    ],
    metaTitle: "Text Diff Checker — Side by Side",
    metaDescription:
      "Compare two texts side by side with our free online text diff checker. See additions in green, deletions in red, and unchanged text instantly.",
    usageSteps: [
      {
        title: "Paste the original text",
        content:
          "Copy your original version into the first text area of the online text diff checker. This is the baseline version you want to compare against, clearly labeled as original for easy reference.",
      },
      {
        title: "Paste the modified text",
        content:
          "Copy your edited or newer version into the second text area. The online text diff checker highlights differences between the two texts with color coding as soon as both versions are entered.",
      },
      {
        title: "Review the differences",
        content:
          "Additions appear in green and deletions in red so you can review changes at a glance. This online text diff checker helps you verify edits in collaborative documents, track revisions, and ensure no content was lost during editing.",
      },
    ],
    faq: [
      {
        question:
          "How do I use an online text diff checker to compare two documents?",
        answer:
          "Paste the original text in the left panel and the modified text in the right panel of the online text diff checker. The tool instantly highlights added words in green and removed words in red, making every change visible for quick review.",
      },
      {
        question:
          "Can the online text diff checker compare code files or just regular text?",
        answer:
          "The online text diff checker works with any text-based content including prose, code, configuration files, and data entries. It performs character-level and line-level comparison that catches even small changes like a single semicolon or a corrected typo.",
      },
    ],
  },
  {
    slug: "slug-generator",
    name: "URL Slug Generator",
    description: "Convert any text to a clean, URL-friendly slug.",
    longDescription:
      "Enter any text and convert it to a clean, SEO-friendly URL slug. The generator strips special characters, converts to lowercase, replaces spaces with hyphens, and removes diacritics. Perfect for creating blog post URLs, product links, and clean web paths.",
    categorySlug: "text-tools",
    icon: "\u{1F517}",
    featured: false,
    keywords: [
      "slug generator",
      "url slug generator",
      "seo friendly url generator",
      "text to slug",
      "create url slug online",
    ],
    metaTitle: "SEO Slug Generator - Free URL Slug Creator",
    metaDescription:
      "Generate clean, SEO-friendly URL slugs from any text with our free slug generator. Perfect for blog posts, product pages, and web paths.",
    usageSteps: [
      {
        title: "Enter your title or text",
        content:
          "Type or paste the title, headline, or phrase you want to convert into a URL-friendly slug. The slug generator accepts text with spaces, special characters, uppercase letters, and punctuation — all of which it cleans up automatically.",
      },
      {
        title: "Generate the URL slug",
        content:
          "The slug generator instantly processes your text by converting to lowercase, replacing spaces with hyphens, and stripping special characters. The result is a clean SEO-friendly URL slug ready for use in your website.",
      },
      {
        title: "Copy and use in your CMS",
        content:
          "Click copy to grab the generated slug and paste it into your CMS URL field. Use the slug generator to create consistent, search-engine-friendly URLs for blog posts, product pages, and category pages across your entire website.",
      },
    ],
    faq: [
      {
        question: "How do I use a slug generator for my website URLs?",
        answer:
          "Type your page title or keyword phrase into the slug generator and it automatically converts it to a clean, hyphenated URL. For example, 'How to Bake Chocolate Cake' becomes 'how-to-bake-chocolate-cake' — readable and optimized for search engines.",
      },
      {
        question: "What makes a good URL slug generated by this tool?",
        answer:
          "The slug generator produces URLs that are lowercase, use hyphens between words, remove special characters and punctuation, and avoid stop words when possible. These characteristics create clean slugs that search engines and users both prefer.",
      },
    ],
  },
  {
    slug: "text-summarizer",
    name: "Text Summarizer",
    description:
      "Select existing English sentences using a word-frequency heuristic.",
    longDescription:
      "Choose a short extract from English text. The tool ranks sentences by repeated non-stop words, selects up to the requested count and restores source order. It does not understand meaning, verify facts or write a new summary. Review the extract against the original.",
    categorySlug: "text-tools",
    icon: "📋",
    featured: true,
    keywords: [
      "text summarizer free",
      "free text summarizer online",
      "summarize text free",
      "article summarizer free",
      "text summary generator free",
    ],
    metaTitle: "Text Summarizer — Extractive English Sentence Selector",
    metaDescription:
      "Select original English sentences by word frequency, preserving their order. Review context, sentence-boundary limitations and the selected length.",
    usageSteps: [
  {
    "title": "Paste English source text",
    "content": "Use text you can compare with the result. The application accepts up to 100,000 characters. Abbreviations and unusual punctuation can cause imperfect sentence boundaries."
  },
  {
    "title": "Choose an extract length",
    "content": "Select 3, 6 or 10 sentences, then press Summarize. If the source has fewer sentences, the result contains fewer. Repeated sentences are treated as separate occurrences within the selected limit."
  },
  {
    "title": "Review before using",
    "content": "Compare the selected sentences with the source. Restore missing context or attribution yourself. Editing the source or changing the length clears the previous result."
  }
],
    faq: [
  {
    "question": "Does this rewrite or understand the source?",
    "answer": "No. It selects existing sentences using English-oriented word-frequency rules. Important qualifications and context may be omitted. It cannot assess whether an extract accurately represents the author’s meaning."
  },
  {
    "question": "Can I use other languages or abbreviations?",
    "answer": "The scoring rules are intended for English, not multilingual summarization. Non-Latin scripts are rejected. Periods, question marks, exclamation marks and line breaks are treated as boundaries, so abbreviations can split incorrectly."
  }
],
additionalContent: []
},

  // ── Combo Tools (2) ─────────────────────────────────────────
  {
    slug: "password-strength-checker",
    name: "Password Strength Checker",
    description:
      "Inspect sample-password patterns with a clearly limited local heuristic.",
    longDescription:
      "The checker looks at length, character groups and a small set of repeated/common patterns. Common or repeated values are capped at a very weak rating. Its score is not measured entropy, a breach-database search or a cracking-time prediction.",
    categorySlug: "developer-tools",
    icon: "🛡️",
    featured: true,
    keywords: [
      "password strength checker online",
      "check password strength",
      "password security analyzer",
      "test password online",
      "password complexity checker",
      "secure password test",
    ],
    metaTitle: "Password Strength Checker - Free Security Tool",
    metaDescription:
      "Inspect sample-password patterns with a clearly limited local heuristic.",
    usageSteps: [
      {
        "title": "Use a sample",
        "content": "Try a synthetic example rather than a password used on an account."
      },
      {
        "title": "Inspect the score and patterns",
        "content": "Read the component scores as heuristic feedback. A low score identifies selected weaknesses; a high score does not establish security."
      },
      {
        "title": "Choose a safer account workflow",
        "content": "Use a trusted password manager, unique credentials and the account’s available second factor. The accompanying generator is separate from the checker."
      }
    ],
    faq: [
      {
        "question": "Does it know whether a password was leaked?",
        "answer": "No. There is no breach-database lookup."
      },
      {
        "question": "Why can a long password still be weak?",
        "answer": "Repeating a short pattern or a common password creates predictable structure. For example, repeating Password1! does not make it a strong secret."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "Password1! repeated seven times is classified Very Weak despite its length and mixed characters."
      },
      {
        "heading": "Before using the result",
        "content": "The pattern list is limited. Do not interpret an unflagged value as safe for any particular account."
      }
    ],
  },
  {
    slug: "text-analyzer",
    name: "Text Analyzer",
    description:
      "Count words and characters, estimate reading time and convert text case.",
    longDescription:
      "Combine basic text counts with case conversion in one workspace. Counts use whitespace and punctuation heuristics; reading and speaking times are estimates. This tool does not compute word frequency, vocabulary complexity or readability scores.",
    categorySlug: "text-tools",
    icon: "📊",
    featured: true,
    keywords: [
      "text analysis online",
      "text readability analyzer",
      "readability checker",
      "text complexity analyzer",
      "reading level checker",
    ],
    metaTitle: "Text Analyzer — Counts, Timing & Case Conversion",
    metaDescription:
      "Count words, characters, sentences and paragraphs; estimate reading time and convert case locally. See the counting assumptions and limits.",
    usageSteps: [
  {
    "title": "Enter text",
    "content": "Type or paste a draft. Counts update as you edit. For “Cats run. Cats sleep.” the tool reports 4 words and 2 sentences."
  },
  {
    "title": "Read the counts and estimates",
    "content": "Review characters, characters without whitespace, sentences and paragraphs. Reading time assumes 200 words per minute and speaking time 130, rounded up to whole minutes."
  },
  {
    "title": "Convert case if needed",
    "content": "Choose a case option to create a separate result, then copy it. Review names, acronyms and formatting before replacing your original text."
  }
],
    faq: [
  {
    "question": "Does this calculate readability or word frequency?",
    "answer": "No. This workspace provides counts, timing estimates and case conversion. Use the separate Readability Score or Keyword Density Checker tool for those different tasks."
  },
  {
    "question": "Why might counts differ from my editor?",
    "answer": "Words are split on whitespace, sentences on punctuation and paragraphs on blank lines. Abbreviations and languages without spaces may differ from editorial or submission-system rules."
  }
],
additionalContent: []
},

  // ── SEO Tools (8) ──────────────────────────────────────────
  {
    slug: "meta-tag-generator",
    name: "Meta Tag Generator",
    description:
      "Draft title, description and social metadata from entered values.",
    longDescription:
      "Create escaped HTML tags and illustrative previews from your form values. Optional canonical and image URLs must be absolute HTTP(S) URLs. The preview is not a live search result; metadata does not guarantee rankings or a particular snippet.",
    categorySlug: "seo-tools",
    icon: "🏷️",
    featured: true,
    keywords: [
      "seo meta tag generator",
      "meta tag creator",
      "html meta tags generator",
      "og meta tag generator",
      "meta description generator",
      "seo head tags",
    ],
    metaTitle: "SEO Meta Tag Generator - Free Meta Creator",
    metaDescription:
      "Draft title, description and social metadata from entered values.",
    usageSteps: [
      {
        "title": "Describe the actual page",
        "content": "Write a useful title and description that match visible content. Avoid keyword lists written only for a ranking target."
      },
      {
        "title": "Enter valid URLs",
        "content": "Use the actual canonical and image URLs, or leave those optional fields blank."
      },
      {
        "title": "Copy and inspect the deployed head",
        "content": "Review the generated tags in your website’s template and check for duplicate or contradictory metadata."
      }
    ],
    faq: [
      {
        "question": "Does Google require a 150–160 character description?",
        "answer": "There is no fixed display guarantee. Search snippets can be rewritten or truncated according to the query, device and available space."
      },
      {
        "question": "Does the keywords tag improve Google rankings?",
        "answer": "Google does not use the meta keywords tag for web search ranking. Its presence in this draft is not an SEO recommendation."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "A title containing A & B should be escaped as A &amp; B in generated HTML while reading as A & B in a browser."
      },
      {
        "heading": "Before using the result",
        "content": "The Open Graph image preview may request the entered image URL. It does not fetch and audit your page HTML."
      }
    ],
  },
  {
    slug: "keyword-density-checker",
    name: "Keyword Density Checker",
    description: "Count individual word frequency using a limited Latin-text tokenizer.",
    longDescription:
      "Analyze repeated single-word tokens in pasted text. Percentages describe token frequency in that input, not SEO quality or an ideal ranking target. This is not phrase analysis, a multilingual segmenter or a web crawler.",
    categorySlug: "seo-tools",
    icon: "📈",
    featured: true,
    keywords: [
      "keyword density checker free",
      "keyword density analyzer",
      "keyword frequency tool",
      "seo keyword analyzer",
      "content optimization tool",
      "keyword density calculator",
    ],
    metaTitle: "Keyword Density Checker - Free SEO Content Tool",
    metaDescription:
      "Count individual word frequency using a limited Latin-text tokenizer.",
    usageSteps: [
      {
        "title": "Paste text",
        "content": "Use the text to be counted. The tokenizer is limited to the implementation’s Latin-word rules and may omit other scripts."
      },
      {
        "title": "Inspect repeated tokens",
        "content": "Review the words and counts. Treat stop-word filtering and punctuation handling as counting choices rather than language understanding."
      },
      {
        "title": "Edit for the reader",
        "content": "Check whether repetition helps or obscures meaning. Do not add keywords just to meet a numerical percentage."
      }
    ],
    faq: [
      {
        "question": "What density does Google require?",
        "answer": "This tool provides no required or ideal density. Search quality depends on usefulness and many other signals, not a prescribed word percentage."
      },
      {
        "question": "Does it count multiword phrases?",
        "answer": "The interface analyzes individual tokens, not phrases or semantic topics."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "In a short passage containing the same word twice, check its count against the entered text before interpreting the percentage."
      },
      {
        "heading": "Before using the result",
        "content": "Use language-specific analysis for Hindi or other scripts; this tool’s tokenizer is not universal."
      }
    ],
  },
  {
    slug: "sitemap-generator",
    name: "Sitemap Generator",
    description: "Draft validated XML sitemap entries from absolute URLs on one host.",
    longDescription:
      "Enter same-protocol, same-host HTTP(S) URLs and optional real modification dates. Invalid URLs, impossible dates and out-of-range priorities prevent output. This manual generator does not crawl a website or decide which pages deserve indexing.",
    categorySlug: "seo-tools",
    icon: "🗺️",
    featured: true,
    keywords: [
      "xml sitemap generator",
      "seo sitemap creator",
      "google sitemap generator",
      "website sitemap tool",
      "sitemap xml creator",
    ],
    metaTitle: "Sitemap Generator - Free XML SEO Sitemap Tool",
    metaDescription:
      "Draft validated XML sitemap entries from absolute URLs on one host.",
    usageSteps: [
      {
        "title": "Enter the actual page URLs",
        "content": "Use absolute URLs without fragments or credentials. All entries must have the same origin."
      },
      {
        "title": "Set optional protocol fields",
        "content": "Leave unknown modification dates blank. Priority must be 0–1; Google ignores priority and change frequency."
      },
      {
        "title": "Review and publish separately",
        "content": "Copy valid XML, verify those pages and use your site’s publishing process. A sitemap does not guarantee indexing."
      }
    ],
    faq: [
      {
        "question": "Does this discover every page?",
        "answer": "No. You enter the rows manually. Use your site generator or CMS for a large, maintained URL inventory."
      },
      {
        "question": "What limits are enforced?",
        "answer": "At most 50,000 populated URLs and 50 MB of uncompressed XML. Each URL must be shorter than 2,048 characters. Your device can impose practical limits earlier."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "For https://example.com/a?x=1&y=2, the XML loc contains &amp; between the query parameters. A relative /a path produces an error."
      },
      {
        "heading": "Before using the result",
        "content": "Only include pages you actually intend to publish and index. Do not invent a modification date to imply freshness."
      }
    ],
  },
  {
    slug: "robots-txt-generator",
    name: "Robots.txt Generator",
    description: "Draft robots.txt crawler rules and inspect them before publishing.",
    longDescription:
      "Build a plain-text robots.txt draft using the form’s user-agent, path and sitemap fields. Rules are requests to compliant crawlers; they do not restrict visitors or protect private files. A blocked URL can still appear in search.",
    categorySlug: "seo-tools",
    icon: "🤖",
    featured: true,
    keywords: [
      "robots txt creator",
      "seo robots.txt tool",
      "crawl rules generator",
      "search engine bot control",
      "robots.txt maker",
      "website crawl manager",
    ],
    metaTitle: "Robots.txt Generator - Free SEO Crawl Config",
    metaDescription:
      "Draft robots.txt crawler rules and inspect them before publishing.",
    usageSteps: [
      {
        "title": "Choose a crawler and paths",
        "content": "Select the user agent and enter paths relative to your site. Avoid accidentally blocking resources needed to render public pages."
      },
      {
        "title": "Add the actual sitemap URL",
        "content": "Use the sitemap served by your site. A sitemap declaration does not guarantee crawling or indexing."
      },
      {
        "title": "Review before deployment",
        "content": "Copy the draft to a review environment first. Check your existing rules and the target crawler’s supported directives."
      }
    ],
    faq: [
      {
        "question": "Can robots.txt protect sensitive content?",
        "answer": "No. Use authentication and access controls. Robots.txt is publicly readable and advisory."
      },
      {
        "question": "Will crawl-delay work for Googlebot?",
        "answer": "Google does not support crawl-delay in robots.txt. Support differs between crawlers, so do not rely on it for Googlebot throttling."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "User-agent: * followed by Disallow: /private/ asks compliant crawlers not to request that path; it does not stop a browser from opening it."
      },
      {
        "heading": "Before using the result",
        "content": "Do not replace a working production robots.txt solely because this generator produced a syntactically plausible draft."
      }
    ],
  },
  {
    slug: "open-graph-preview-generator",
    name: "Open Graph Preview Generator",
    description:
      "Draft social metadata and inspect an illustrative card preview.",
    longDescription:
      "Generate escaped Open Graph and Twitter card tags from entered values. The tool does not crawl the page URL. An image preview can request the supplied remote image URL; actual social platforms have their own fetch, cache and rendering behavior.",
    categorySlug: "seo-tools",
    icon: "🔗",
    featured: false,
    keywords: [
      "open graph preview tool",
      "open graph preview",
      "og tag preview",
      "social media preview tool",
      "facebook link preview",
    ],
    metaTitle: "Open Graph Preview Tool - Social Share Preview",
    metaDescription:
      "Draft social metadata and inspect an illustrative card preview.",
    usageSteps: [
      {
        "title": "Enter accurate page details",
        "content": "Enter title, description and site name that match the page being shared."
      },
      {
        "title": "Use valid page and image URLs",
        "content": "Use absolute HTTP(S) URLs. Choose a card/type supported by the target platform and review any additional required fields."
      },
      {
        "title": "Copy and validate on the destination",
        "content": "Copy the draft tags, then test the deployed URL with the destination platform’s own tools."
      }
    ],
    faq: [
      {
        "question": "Will every card type work with these fields alone?",
        "answer": "No. App, player and specialized types can require extra properties or platform approval. The generator is a draft, not a conformance validator."
      },
      {
        "question": "Does this show the current cached social card?",
        "answer": "No. It illustrates your entered values and does not query a platform’s cache."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "Enter Example page as the title, then inspect that it appears in the preview and both generated title tags."
      },
      {
        "heading": "Before using the result",
        "content": "Do not enter a private image URL into a preview if fetching it is inappropriate. The external image host can receive the request."
      }
    ],
  },
  {
    slug: "seo-length-checker",
    name: "SEO Length Checker",
    description:
      "Count title and description characters with approximate width and snippet previews.",
    longDescription:
      "Compare title and description lengths with editable-copy guidelines. Width and snippet previews are rough estimates based on character classes, not measured search-result rendering. Search engines can rewrite or truncate text differently by query and device.",
    categorySlug: "seo-tools",
    icon: "📏",
    featured: false,
    keywords: [
      "seo title length checker",
      "meta description length tool",
      "seo snippet checker",
      "title tag analyzer",
      "search preview tool",
    ],
    metaTitle: "SEO Length Checker — Approximate Snippet Preview",
    metaDescription:
      "Check title and description character counts and approximate width. Understand why guideline ranges cannot guarantee search-result display or rankings.",
    usageSteps: [
  {
    "title": "Enter your title and description",
    "content": "Paste the text into the two fields. Character counts and approximate widths update as you type."
  },
  {
    "title": "Compare the guide ranges",
    "content": "Treat the indicators as editing prompts. Width is estimated from character classes and does not measure the exact font or distinguish every wide and narrow glyph."
  },
  {
    "title": "Review clarity and actual results",
    "content": "Prefer useful, accurate wording over filling a character quota. The preview is illustrative; a green indicator cannot ensure an untruncated snippet or a ranking improvement."
  }
],
    faq: [
  {
    "question": "Does a green indicator guarantee full display?",
    "answer": "No. Display varies by device and query, and search engines can choose different title or snippet text. The tool cannot predict the final result."
  },
  {
    "question": "Is the pixel width measured from a font?",
    "answer": "No. It is an approximation using fixed character-class widths. For example, narrow and wide lowercase letters share an estimated width here, even though real fonts render them differently."
  }
],
additionalContent: []
},
  {
    slug: "canonical-tag-generator",
    name: "Canonical Tag Generator",
    description:
      "Draft a canonical link pointing to your preferred page URL.",
    longDescription:
      "Generate a link element for a preferred URL. A canonical is a search-engine signal, not a redirect or a guarantee that a duplicate will be consolidated. Review the complete page and other indexing signals before installation.",
    categorySlug: "seo-tools",
    icon: "🔗",
    featured: false,
    keywords: [
      "canonical tag generator",
      "rel canonical generator",
      "canonical url creator",
      "duplicate content seo",
      "hreflang tag generator",
      "seo canonical tool",
    ],
    metaTitle: "Canonical Tag Generator - Fix Duplicate Content",
    metaDescription:
      "Draft a canonical link pointing to your preferred page URL.",
    usageSteps: [
      {
        "title": "Enter the preferred URL",
        "content": "Use the actual absolute URL of the page you want to identify."
      },
      {
        "title": "Copy the link element",
        "content": "Copy the generated markup into the appropriate head template in a review environment."
      },
      {
        "title": "Check the deployed page",
        "content": "Ensure a single consistent canonical, matching redirects, internal links and sitemap entries."
      }
    ],
    faq: [
      {
        "question": "Will a canonical force Google to use this URL?",
        "answer": "No. Google can select another canonical when other signals disagree."
      },
      {
        "question": "Does it replace a redirect?",
        "answer": "No. Visitors remain on the current URL. URL migrations and duplicate handling require a separate plan."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "For https://example.com/article/, inspect that the link’s href is that complete preferred URL."
      },
      {
        "heading": "Before using the result",
        "content": "This generator does not crawl your site or decide which page is the best canonical."
      }
    ],
  },
  {
    slug: "alt-text-checker",
    name: "Alt Text Checker",
    description:
      "Inspect image alt attributes in pasted HTML for manual review.",
    longDescription:
      "List img elements from detached HTML and classify their alt attributes as present, empty or missing. Presence alone does not establish meaningful alternative text or WCAG conformance. Empty alt can be correct for decorative images.",
    categorySlug: "seo-tools",
    icon: "👁️",
    featured: false,
    keywords: [
      "alt text checker",
      "image alt text analyzer",
      "accessibility checker html",
      "wcag alt text tool",
      "seo image checker",
      "missing alt attribute finder",
    ],
    metaTitle: "Alt Text Checker - Free SEO Image Audit Tool",
    metaDescription:
      "Inspect image alt attributes in pasted HTML for manual review.",
    usageSteps: [
      {
        "title": "Paste the markup",
        "content": "Paste the HTML containing the images to inspect. This does not fetch a URL or scan the rendered page."
      },
      {
        "title": "Check attribute presence",
        "content": "Review missing and empty values. A data-alt attribute is not an alt attribute."
      },
      {
        "title": "Edit the source yourself",
        "content": "Write context-appropriate alternatives in your own editor. This tool does not suggest descriptions or export repaired HTML."
      }
    ],
    faq: [
      {
        "question": "Is empty alt always an error?",
        "answer": "No. An image that is decorative in context can use alt=\"\" without requiring an extra role attribute. Review its purpose, including whether it is a link or conveys information."
      },
      {
        "question": "Does a Present result prove accessibility?",
        "answer": "No. The alternative can be inaccurate, redundant or inappropriate. Evaluate the surrounding content and actual experience with assistive technology."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "For <img src=\"a.png\" data-alt=\"label\">, expect Missing. For <img src=\"a.png\" alt=\"\">, expect an empty value requiring context review."
      },
      {
        "heading": "Before using the result",
        "content": "Use a full accessibility review for SVG, CSS backgrounds, accessible names, dynamic images and image links."
      }
    ],
  },

  // ── Design Tools (1) ────────────────────────────────────────
  {
    slug: "color-contrast-checker",
    name: "Color Contrast Checker",
    description:
      "Check WCAG contrast ratios between foreground and background colors.",
    longDescription:
      "Use this WCAG color contrast checker to test foreground and background color combinations for readability. Enter hex colors, view the contrast ratio, and check WCAG AA and AAA pass status for normal text, large text, and interface design.",
    categorySlug: "design-tools",
    icon: "👁️",
    featured: true,
    keywords: [
      "wcag color contrast checker",
      "color contrast checker",
      "wcag contrast checker",
      "accessibility contrast tool",
      "aa aaa compliance checker",
    ],
    metaTitle: "WCAG Color Contrast Checker - Free Accessibility Tool",
    metaDescription:
      "Use this WCAG color contrast checker for text and backgrounds. Test AA and AAA accessibility compliance instantly with foreground and background colors.",
    usageSteps: [
      {
        title: "Enter Foreground and Background Colors",
        content:
          "Add text and background colors as hex values in the WCAG color contrast checker. The preview shows how the combination appears in real use.",
      },
      {
        title: "Review AA and AAA Results",
        content:
          "The WCAG color contrast checker calculates the contrast ratio and marks whether it passes normal text, large text, and interface contrast recommendations.",
      },
      {
        title: "Adjust Until Accessible",
        content:
          "Change either color until the ratio passes your target level. Use the WCAG color contrast checker while designing buttons, text, links, and UI states.",
      },
    ],
    faq: [
      {
        question: "What does a WCAG color contrast checker measure?",
        answer:
          "A WCAG color contrast checker measures the luminance contrast between foreground and background colors. The result helps determine whether text is readable for users with low vision.",
      },
      {
        question: "Should I target AA or AAA contrast?",
        answer:
          "WCAG AA is the common accessibility target for most websites, while AAA is stricter. This checker shows both so you can choose the level that fits your design and compliance goals.",
      },
    ],
  },

  // ── Converter Tools (5) ─────────────────────────────────────
  {
    slug: "unit-converter",
    name: "Unit Converter",
    description:
      "Convert between units of length, weight, temperature, speed, and more.",
    longDescription:
      "Use this unit converter online to convert common measurements across metric and imperial units. Convert length, weight, temperature, speed, volume, and everyday values instantly for recipes, shipping, travel, study, and planning.",
    categorySlug: "converters",
    icon: "📐",
    featured: true,
    keywords: [
      "unit converter online",
      "measurement converter tool",
      "metric imperial converter",
      "length weight converter",
      "volume temperature converter",
    ],
    metaTitle: "Unit Converter Online - Metric and Imperial Calculator",
    metaDescription:
      "Use this unit converter online for length, weight, temperature, speed, volume, and more. Fast metric and imperial conversion for daily tasks.",
    usageSteps: [
      {
        title: "Choose a Unit Category",
        content:
          "Select length, weight, temperature, speed, volume, or another measurement type in the unit converter online. Each category shows compatible input and output units.",
      },
      {
        title: "Enter a Value",
        content:
          "Type the value you want to convert and choose the source unit. The unit converter online calculates matching metric and imperial values instantly.",
      },
      {
        title: "Copy the Result",
        content:
          "Use the converted number in recipes, shipping, travel, engineering notes, or everyday measurements. The unit converter online keeps calculations local and fast.",
      },
    ],
    faq: [
      {
        question: "What can this unit converter online convert?",
        answer:
          "The unit converter online supports common measurement categories including length, weight, temperature, volume, and speed. It is designed for practical metric and imperial conversions.",
      },
      {
        question: "Is the unit converter online accurate enough for daily use?",
        answer:
          "Yes. The converter uses standard conversion factors for everyday calculations. For regulated engineering, medical, or legal measurements, verify results against official references.",
      },
    ],
  },
  {
    slug: "json-to-csv",
    name: "JSON to CSV",
    description: "Convert JSON arrays and objects to CSV spreadsheet format.",
    longDescription:
      "Use this JSON to CSV converter to transform JSON arrays and objects into spreadsheet-ready CSV. Flatten nested fields, preview columns, choose delimiters, and export data for Excel, Google Sheets, databases, and analysis workflows without uploading files.",
    categorySlug: "converters",
    icon: "📊",
    featured: false,
    keywords: [
      "json to csv converter",
      "convert json to csv",
      "json to csv online",
      "json to excel converter",
      "flatten json to csv",
    ],
    metaTitle: "JSON to CSV Converter - Free Online Tool",
    metaDescription:
      "Use this JSON to CSV converter with nested object flattening, custom delimiters, and table preview. Export spreadsheet-ready CSV privately.",
    usageSteps: [
      {
        title: "Paste JSON Data",
        content:
          "Paste a JSON array or object into the JSON to CSV converter. The tool detects fields and prepares tabular rows from flat or nested structures.",
      },
      {
        title: "Preview Columns",
        content:
          "Review the detected columns, delimiter, and flattened nested keys before export. The JSON to CSV converter helps avoid missing fields in spreadsheet output.",
      },
      {
        title: "Copy or Download CSV",
        content:
          "Copy the CSV text or download it for Excel, Google Sheets, databases, or analysis workflows. Conversion happens in your browser with no upload.",
      },
    ],
    faq: [
      {
        question: "How does this JSON to CSV converter handle nested objects?",
        answer:
          "Nested objects are flattened with dot notation so values like user.name become CSV columns. Arrays can be represented as joined values or serialized strings depending on the structure.",
      },
      {
        question: "Is this JSON to CSV converter private?",
        answer:
          "Yes. The JSON to CSV converter processes input locally in your browser, so private data exports and API responses do not leave your device.",
      },
    ],
  },
  {
    slug: "yaml-to-json",
    name: "YAML to JSON",
    description: "Convert a documented subset of YAML mappings and scalar lists to JSON locally.",
    longDescription:
      "Convert simple YAML mappings and scalar lists using two-space indentation. Supported values are strings, finite decimal numbers, booleans and null. Unsupported syntax produces an error rather than a guessed conversion. This is not a full YAML 1.2 parser.",
    categorySlug: "converters",
    icon: "⬅️",
    featured: false,
    keywords: [
      "yaml to json",
      "convert yaml to json",
      "yaml to json online",
      "yaml parser online",
      "yaml converter tool",
    ],
    metaTitle: "YAML to JSON — Simple Mappings & Lists",
    metaDescription:
      "Convert simple YAML mappings and scalar lists in your browser. See supported syntax, size guardrails and explicit errors for unsupported YAML features.",
    usageSteps: [
  {
    "title": "Paste a supported YAML document",
    "content": "Enter a mapping or scalar list. Use two spaces per nesting level. Quote values when you need to preserve numeric-looking text such as an identifier with leading zeros."
  },
  {
    "title": "Select Convert to JSON",
    "content": "Conversion runs when you press the button. Inspect errors for unsupported syntax. File uploads, automatic conversion, syntax highlighting and minified mode are not provided."
  },
  {
    "title": "Inspect and copy the JSON",
    "content": "Confirm that keys, list values and types match your input, then select Copy. Editing the input clears the old output so stale JSON is not mistaken for a new conversion."
  }
],
    faq: [
  {
    "question": "Are anchors, aliases and all YAML features supported?",
    "answer": "No. Anchors, aliases, tags, flow collections, block strings, merge keys, multiple documents and object items in lists are rejected. Use a full YAML parser when these features are required."
  },
  {
    "question": "What are the supported limits and types?",
    "answer": "This application allows 100,000 characters, 1,000 lines and 32 nesting levels as conservative guardrails. Numbers must be finite and integer values must fit JavaScript’s safe integer range. Quote identifiers and large integers to preserve their exact text."
  }
],
additionalContent: []
},
  {
    slug: "temperature-converter",
    name: "Temperature Converter",
    description:
      "Convert temperatures between Celsius, Fahrenheit, and Kelvin.",
    longDescription:
      "Convert temperature values between Celsius, Fahrenheit, and Kelvin scales instantly. Enter a value in any unit and see the equivalent in all others. Perfect for cooking, science, travel, and weather comparisons.",
    categorySlug: "converters",
    icon: "🌡️",
    featured: false,
    keywords: [
      "temperature converter",
      "celsius to fahrenheit converter",
      "fahrenheit to celsius",
      "kelvin converter",
      "temp conversion online",
    ],
    metaTitle: "Temperature Converter - Free Metric Imperial",
    metaDescription:
      "Convert temperatures between Celsius, Fahrenheit, and Kelvin with this free temperature converter. Instant results for cooking, science, and travel planning.",
    usageSteps: [
      {
        title: "Enter Your Temperature Value",
        content:
          "Type the temperature value you want to convert in the Celsius, Fahrenheit, or Kelvin field. This temperature converter instantly calculates the equivalent temperatures in all three scales as you type.",
      },
      {
        title: "Choose the Correct Scale",
        content:
          "Select the temperature scale you want to convert from — Celsius for metric, Fahrenheit for imperial, or Kelvin for scientific. This temperature converter supports bidirectional conversion between all three scales simultaneously.",
      },
      {
        title: "Read All Converted Values",
        content:
          "View the equivalent temperatures displayed in all three scales at once. Use this temperature converter for cooking recipes, science experiments, weather analysis, and travel planning with instant results.",
      },
    ],
    faq: [
      {
        question:
          "How does this temperature converter calculate Celsius to Fahrenheit?",
        answer:
          "This temperature converter uses the standard formula: multiply Celsius by 9/5 and add 32. For example, 100 degrees Celsius times 9/5 plus 32 equals 212 degrees Fahrenheit. The temperature converter handles this calculation instantly for any value you enter.",
      },
      {
        question: "What scales does this temperature converter support?",
        answer:
          "This temperature converter supports Celsius, Fahrenheit, and Kelvin scales. You can enter a value in any scale and see the equivalent in all others simultaneously, making it ideal for international cooking, science, and weather comparisons.",
      },
    ],
  },
  {
    slug: "lbs-to-kg-converter",
    name: "Lbs to Kg Converter",
    description:
      "Convert pounds to kilograms and kilograms to pounds instantly.",
    longDescription:
      "Convert weight between pounds (lbs) and kilograms (kg) with instant bidirectional conversion. Enter a value in either unit and see the result in both. Perfect for fitness tracking, shipping, cooking, and travel.",
    categorySlug: "converters",
    icon: "⚖️",
    featured: false,
    keywords: [
      "lbs to kg converter",
      "pounds to kilograms converter",
      "weight converter lbs to kg",
      "kg to lbs converter",
      "pound kilogram converter",
    ],
    metaTitle: "Lbs to Kg Converter - Free Weight Calculator",
    metaDescription:
      "Convert pounds to kilograms and kilograms to pounds with this free lbs to kg converter. Instant weight conversion for fitness, shipping, and everyday use.",
    usageSteps: [
      {
        title: "Enter Weight in Pounds or Kilograms",
        content:
          "Type your weight value into either the pounds (lbs) or kilograms (kg) field. This lbs to kg converter instantly shows the conversion in real time as you type in either direction.",
      },
      {
        title: "View the Converted Result",
        content:
          "The equivalent weight in the opposite unit appears instantly with up to three decimal places of precision. This lbs to kg converter updates both fields simultaneously for true bidirectional conversion.",
      },
      {
        title: "Continue Converting as Needed",
        content:
          "Clear the fields and enter new values for additional conversions. Use this lbs to kg converter for fitness tracking, shipping calculations, cooking recipes, and travel luggage limits.",
      },
    ],
    faq: [
      {
        question: "What conversion factor does this lbs to kg converter use?",
        answer:
          "This lbs to kg converter uses the international standard factor of 0.453592 kilograms per pound. This ensures precise weight conversions based on the official avoirdupois pound standard.",
      },
      {
        question: "Why would I need an lbs to kg converter in daily life?",
        answer:
          "You need an lbs to kg converter for international travel (luggage limits), fitness tracking where many scales use metric, scientific measurements, international shipping, and when following cooking recipes from different countries.",
      },
    ],
  },

  // ── Calculators (3) ─────────────────────────────────────────
  {
    slug: "loan-calculator",
    name: "Loan Calculator",
    description:
      "Estimate fixed-rate monthly payments and a cent-rounded amortization schedule.",
    longDescription:
      "Enter an amount, nominal annual interest rate, term in years and optional extra monthly payment. The estimate assumes equal monthly periods and excludes fees. Extra payments shorten the schedule; a final adjustment settles cent rounding.",
    categorySlug: "calculators",
    icon: "\uD83C\uDFE6",
    featured: true,
    keywords: [
      "online loan calculator",
      "monthly payment calculator",
      "amortization calculator",
      "loan repayment calculator",
      "interest calculator loan",
      "personal loan calculator",
    ],
    metaTitle: "Loan Calculator - Free Monthly Payment Estimator",
    metaDescription:
      "Estimate fixed-rate monthly payments and a cent-rounded amortization schedule.",
    usageSteps: [
      {
        "title": "Enter finite loan terms",
        "content": "Use a positive amount up to $1 trillion, 0–100% annual interest and a term that equals 1–1200 whole months. For example, 1.5 years means 18 months."
      },
      {
        "title": "Set a nonnegative extra payment",
        "content": "Leave extra payment at zero for the regular schedule, or add a fixed monthly amount. Negative extra payments are rejected."
      },
      {
        "title": "Calculate and inspect",
        "content": "Calculate and review the schedule. The final payment may differ because of early payoff or cent rounding. Downloaded or lender-specific terms must be checked separately."
      }
    ],
    faq: [
      {
        "question": "Is the estimate a lender quote?",
        "answer": "No. Fees, actual-day accrual, rate changes and lender rounding policies can change payments. The input is a nominal annual rate, not a fee-inclusive APR model."
      },
      {
        "question": "Does zero interest work?",
        "answer": "Yes. Principal is divided across the term and extra payments can still accelerate payoff."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "$12,000 at 0% for one year with no extra payment gives 12 payments of $1,000 and $0 interest."
      },
      {
        "heading": "Before using the result",
        "content": "Compare the assumptions and rounding convention with the actual loan agreement before making a financial decision."
      }
    ],
  },
  {
    slug: "discount-calculator",
    name: "Discount Calculator",
    description:
      "Calculate sale prices, savings and discount percentages, including 0% and 100%.",
    longDescription:
      "Compare an original positive price with a discount percentage, sale price or discount amount. Equal original and sale prices mean zero savings; a discount equal to the original price produces a zero final price.",
    categorySlug: "calculators",
    icon: "\uD83C\uDFF7\uFE0F",
    featured: false,
    keywords: [
      "percent discount calculator",
      "sale price calculator",
      "percentage off calculator",
      "savings calculator",
      "shopping discount tool",
      "markdown calculator",
    ],
    metaTitle: "Discount Calculator - Free Sale Price Finder",
    metaDescription:
      "Calculate sale prices, savings and discount percentages, including 0% and 100%.",
    usageSteps: [
      {
        "title": "Choose the calculation",
        "content": "Select savings, discount percentage or final price. Each mode uses different units for the second field."
      },
      {
        "title": "Enter valid amounts",
        "content": "Use a positive original price, a 0–100% discount, or a nonnegative sale/discount amount no greater than the original."
      },
      {
        "title": "Read the rounded result",
        "content": "Inspect savings, final price and percentage. Currency amounts are displayed in USD and rounded to cents."
      }
    ],
    faq: [
      {
        "question": "Can the final price be zero?",
        "answer": "Yes. A 100% discount or a discount amount equal to the original price yields a zero final price."
      },
      {
        "question": "Are taxes and stacked coupons included?",
        "answer": "No. This tool calculates one discount. Apply checkout-specific rules separately when tax, coupons or shipping affect the total."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "Original $100 and sale $100 gives 0% discount. Original $100 and discount amount $100 gives a $0 final price."
      },
      {
        "heading": "Before using the result",
        "content": "Displayed results are rounded; the store’s final checkout determines the actual amount payable."
      }
    ],
  },
  {
    slug: "mortgage-calculator",
    name: "Mortgage Calculator",
    description:
      "Estimate fixed-rate mortgage payments with selected recurring expenses.",
    longDescription:
      "Estimate principal and interest plus annual property-tax percentage, annual insurance amount and a monthly PMI percentage of the loan. These expenses remain constant in the model. Closing costs, HOA fees and changing insurance or tax bills are excluded.",
    categorySlug: "calculators",
    icon: "\uD83C\uDFE0",
    featured: false,
    keywords: [
      "mortgage calculator online",
      "mortgage payment estimator",
      "home loan calculator",
      "monthly mortgage calculator",
      "home buying calculator",
      "mortgage affordability calculator",
    ],
    metaTitle: "Mortgage Calculator - Free Monthly Payment Tool",
    metaDescription:
      "Estimate fixed-rate mortgage payments with selected recurring expenses.",
    usageSteps: [
      {
        "title": "Enter the home and loan terms",
        "content": "Enter the home price, a nonnegative down payment below the price, annual nominal rate and term in years."
      },
      {
        "title": "Set the expense units carefully",
        "content": "Property tax is an annual percentage of home price; insurance is an annual dollar amount; PMI is a monthly percentage of loan principal. Use zero when an item does not apply."
      },
      {
        "title": "Compare the breakdown",
        "content": "Review each monthly component and interest total. The result is an estimate under fixed assumptions rather than a complete ownership budget."
      }
    ],
    faq: [
      {
        "question": "Does it include every housing cost?",
        "answer": "No. Maintenance, utilities, closing costs, HOA fees and changes in taxes, insurance or PMI are outside this model."
      },
      {
        "question": "Is PMI automatically removed?",
        "answer": "No. The entered monthly PMI amount stays constant. Your actual cancellation rules and lender charges require a separate check."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "A $12,000 home with zero down, 0% interest, one-year term and zero expenses gives $1,000 monthly principal and interest."
      },
      {
        "heading": "Before using the result",
        "content": "A PMI value of 0.5 means 0.5% per month here, not per year. Convert an annual percentage to a monthly one before entering it."
      }
    ],
  },

  // ── Developer Tools (3) ─────────────────────────────────────
  {
    slug: "css-minifier",
    name: "CSS Minifier",
    description:
      "Compact CSS whitespace while preserving strings and token boundaries.",
    longDescription:
      "Conservatively collapse whitespace outside strings and replace comments with empty token separators. Escapes, quoted content and spacing in CSS math are preserved. This tool does not deduplicate rules, optimize selectors or validate the full CSS grammar.",
    categorySlug: "developer-tools",
    icon: "\ud83c\udfa8",
    featured: false,
    keywords: [
      "css minifier",
      "compress css",
      "css optimizer",
      "minify css online",
      "css compressor",
    ],
    metaTitle: "CSS Minifier - Minify CSS Code Online Free",
    metaDescription:
      "Compact CSS whitespace while preserving strings and token boundaries.",
    usageSteps: [
      {
        "title": "Paste the stylesheet",
        "content": "Use a copy of your CSS. Keep an unmodified source file for review and debugging."
      },
      {
        "title": "Check output and errors",
        "content": "The result updates as you type. Unclosed comments or strings are reported rather than returning a partial result."
      },
      {
        "title": "Compare in your project",
        "content": "Copy the compact output and verify the affected pages. The size figures count characters, not transferred gzip/Brotli bytes."
      }
    ],
    faq: [
      {
        "question": "Why are empty comments retained?",
        "answer": "A comment can separate tokens without introducing a CSS whitespace token. Keeping /**/ prevents formerly separated tokens from joining or gaining a different selector meaning."
      },
      {
        "question": "Will the tool remove duplicate declarations?",
        "answer": "No. It compacts text conservatively; use a maintained CSS build pipeline for grammar-aware optimization and source maps."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "width: calc(100% - 2px) must retain spaces around the subtraction operator. content: \"a  b\" must retain the two spaces inside the string."
      },
      {
        "heading": "Before using the result",
        "content": "Savings depend on the input. Check browser rendering; a smaller character count does not guarantee a measurable performance improvement."
      }
    ],
  },
  {
    slug: "html-entity-converter",
    name: "HTML Entity Converter",
    description:
      "Encode and decode HTML entities like &amp; &lt; &gt; and special characters.",
    longDescription:
      "Convert special characters to their HTML entity equivalents and vice versa. Encode text for safe HTML display (e.g., < → &lt;) or decode entities back to readable characters. Perfect for preparing content for web pages and email templates.",
    categorySlug: "developer-tools",
    icon: "\ud83d\udd23",
    featured: false,
    keywords: [
      "html entity converter",
      "html entities",
      "html entity encode",
      "html entity decode",
      "escape html",
    ],
    metaTitle: "HTML Entity Converter - Free Encode Decode Tool",
    metaDescription:
      "Free HTML entity converter tool — convert special characters to HTML entities and decode them back. Encode text for safe HTML display in any browser.",
    usageSteps: [
      {
        title: "Enter Your Text or HTML Entities",
        content:
          "Paste the text you want to encode or the HTML entities you want to decode. This HTML entity converter accepts special characters like copyright and registered symbols, angle brackets, ampersands, and quotes that need encoding for safe HTML display.",
      },
      {
        title: "Choose Encode or Decode Mode",
        content:
          "Select Encode to convert special characters to their HTML entity equivalents, or Decode to convert entities back to readable characters. The HTML entity converter tool works bidirectionally with a single click, making it easy to switch between encoding and decoding.",
      },
      {
        title: "Copy the Result",
        content:
          "Click copy to grab the encoded or decoded output and paste it into your web project. Using an HTML entity converter ensures your content displays correctly in all browsers without rendering issues or broken markup.",
      },
    ],
    faq: [
      {
        question:
          "Which characters does an HTML entity converter typically handle?",
        answer:
          "An HTML entity converter handles the five most common characters that need encoding: & (&amp;), < (&lt;), > (&gt;), \" (&quot;), and ' (&#39;). It also supports special characters like copyright (©), registered (®), and non-breaking spaces, plus many named and numeric entities.",
      },
      {
        question: "Why do I need an HTML entity converter for my web pages?",
        answer:
          "An HTML entity converter prevents browsers from interpreting special characters as code. Without encoding, angle brackets can be mistaken for HTML tags, ampersands can break URL parameters, and quotes can disrupt attribute values, leading to broken page rendering and potential XSS vulnerabilities.",
      },
    ],
  },
  {
    slug: "binary-converter",
    name: "Binary Converter",
    description:
      "Convert nonnegative integers exactly between bases 2, 8, 10 and 16.",
    longDescription:
      "Convert digit strings using BigInt, avoiding JavaScript Number rounding for large integers. Enter up to 4,096 digits without signs, fractions or radix prefixes. Results update locally in all four bases.",
    categorySlug: "developer-tools",
    icon: "\ud83d\udcbb",
    featured: false,
    keywords: [
      "number base converter",
      "binary converter",
      "decimal to binary",
      "binary to hex",
      "binary translator",
    ],
    metaTitle: "Binary Converter - Decimal to Hex Translator",
    metaDescription:
      "Convert nonnegative integers exactly between bases 2, 8, 10 and 16.",
    usageSteps: [
      {
        "title": "Choose the input base",
        "content": "Select Binary, Decimal, Hexadecimal or Octal before entering digits."
      },
      {
        "title": "Enter an unsigned integer",
        "content": "Use only the digits permitted by that base. Leading zeros are accepted; output normalizes them."
      },
      {
        "title": "Copy the exact representation",
        "content": "Copy the desired base output. This converts a numerical value, not a character encoding or a fixed-width two’s-complement bit pattern."
      }
    ],
    faq: [
      {
        "question": "Does it handle integers above 2^53?",
        "answer": "Yes. BigInt preserves integers above Number’s safe range within the application’s 4,096-digit input limit."
      },
      {
        "question": "Can I convert signed numbers or text?",
        "answer": "No. Negative values, fractions, prefixes and text encodings require a different representation or tool."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "Decimal 9007199254740993 becomes hexadecimal 20000000000001. Converting that hex value back must retain the original final digit."
      },
      {
        "heading": "Before using the result",
        "content": "Leading zeros and input letter case are normalized. The output does not preserve an original word size."
      }
    ],
  },
  {
    slug: "grammar-checker",
    name: "Grammar Checker",
    description:
      "Check English text for repeated words, selected misspellings and simple formatting issues.",
    longDescription:
      "Run a limited set of English spelling and style rules in your browser. Review suggestions for repetition, selected misspellings, line capitalization, spacing and frequently repeated filler words. Edit your original text manually; this tool does not check all grammar or certify a draft as correct.",
    categorySlug: "text-tools",
    icon: "\u2713",
    featured: true,
    keywords: [
      "free grammar checker online",
      "online grammar checker free",
      "grammar and spell checker free",
      "free writing checker",
      "english grammar checker free",
    ],
    metaTitle: "Grammar Checker — Limited English Writing Checks",
    metaDescription:
      "Review repeated words, selected English misspellings and simple formatting suggestions locally. Understand what these rules can and cannot detect.",
    usageSteps: [
  {
    "title": "Enter English text",
    "content": "Paste a short English draft. The checks use fixed rules, not a contextual language model or a complete dictionary."
  },
  {
    "title": "Run the checks",
    "content": "Select Check Grammar. Review the suggestion, line number and surrounding text. A suggestion may be inappropriate for quotations, headings or deliberate repetition."
  },
  {
    "title": "Edit and check again",
    "content": "Make changes yourself in the input, then run the check again. There are no automatic accept, dismiss or rewrite controls. No suggestions means only that these rules found nothing."
  }
],
    faq: [
  {
    "question": "Does this check every grammar error?",
    "answer": "No. It does not reliably detect subject-verb agreement, fragments, run-on sentences or meaning errors. For example, “She go to school every day.” can produce no suggestions. Proofread the text yourself."
  },
  {
    "question": "Which language and corrections are supported?",
    "answer": "The rules target English. They flag repeated words, a fixed list of misspellings, line-start capitalization, spaces, ending punctuation and repeated filler words. Suggestions are informational; edit the input manually."
  }
],
    additionalContent: [],
  },
  {
    slug: "palindrome-checker",
    name: "Palindrome Checker",
    description:
      "Check if a word, phrase, or number reads the same forward and backward.",
    longDescription:
      "Enter any text to check if it's a palindrome — reading the same forwards and backwards (ignoring spaces, punctuation, and capitalization). See the reversed version, character-by-character comparison, and a clear pass/fail result. Fun for wordplay enthusiasts and programming practice.",
    categorySlug: "text-tools",
    icon: "\u{1F504}",
    featured: false,
    keywords: [
      "palindrome checker",
      "check palindrome online",
      "palindrome test tool",
      "is it a palindrome",
      "word palindrome tester",
    ],
    metaTitle: "Palindrome Checker - Free Online Word Checker",
    metaDescription:
      "Check if any word, phrase, or number is a palindrome with our free palindrome checker. See character-by-character comparison and instant pass/fail results.",
    usageSteps: [
      {
        title: "Enter Your Word or Phrase",
        content:
          "Type any word, phrase, sentence, or number into the palindrome checker input. The tool strips spaces, punctuation, and capitalization before analyzing the text for symmetrical reading characteristics.",
      },
      {
        title: "Review the Character Comparison",
        content:
          "See the original text compared against its reversed version with a character-by-character breakdown. The palindrome checker highlights matching and non-matching characters for clear visual feedback on whether the text reads the same forward and backward.",
      },
      {
        title: "Check the Pass or Fail Result",
        content:
          "A clear pass or fail indicator tells you whether your text is a palindrome. The palindrome checker works with numbers and multi-word phrases, making it useful for wordplay, programming exercises, and linguistic exploration.",
      },
    ],
    faq: [
      {
        question:
          "How does a palindrome checker determine if text is a palindrome?",
        answer:
          "The palindrome checker reverses your text and compares each character, ignoring spaces, punctuation, and capitalization. If the cleaned text reads the same forward and backward, it is identified as a palindrome.",
      },
      {
        question:
          "What are some famous examples I can test in this palindrome checker?",
        answer:
          "Famous palindrome examples include 'racecar', 'madam', 'level', 'radar', and the classic phrase 'A man, a plan, a canal, Panama'. You can test all of these in the palindrome checker to see them confirmed as palindromes.",
      },
    ],
  },
  {
    slug: "reverse-text",
    name: "Reverse Text",
    description: "Reverse text, words, or individual characters in your text.",
    longDescription:
      "Use this reverse text generator to flip text backwards, reverse word order, or reverse line order instantly. It is useful for puzzles, social posts, formatting tests, and quick text experiments, with all processing done in your browser.",
    categorySlug: "text-tools",
    icon: "\u21A9\uFE0F",
    featured: false,
    keywords: [
      "reverse text generator",
      "reverse text online",
      "backwards text generator",
      "text reverser tool",
      "flip text online",
    ],
    metaTitle: "Reverse Text Generator - Free Backwards Text Tool",
    metaDescription:
      "Use this reverse text generator to reverse text by characters, words, or line order. Create backwards text privately in your browser in seconds.",
    usageSteps: [
      {
        title: "Enter Text to Reverse",
        content:
          "Paste words, sentences, or paragraphs into the reverse text generator. The tool can reverse characters, words, or line order depending on your goal.",
      },
      {
        title: "Choose Reverse Mode",
        content:
          "Select whether to create backwards text, reverse word order, or preserve line breaks. The reverse text generator updates output instantly.",
      },
      {
        title: "Copy the Reversed Text",
        content:
          "Copy the reversed output for puzzles, formatting tests, social posts, or quick text experiments. Processing stays inside your browser.",
      },
    ],
    faq: [
      {
        question: "What can I do with a reverse text generator?",
        answer:
          "A reverse text generator can create backwards writing, reverse word order, or flip lines for puzzles, jokes, testing, and formatting experiments.",
      },
      {
        question: "Does the reverse text generator change my original text?",
        answer:
          "No. It creates a separate reversed output while your original input remains available for editing or resetting.",
      },
    ],
  },
  // ── NEW TOOLS (Phase: Option A Expansion) ──────────────────
  {
    slug: "plagiarism-checker",
    name: "Text Similarity Checker",
    description:
      "Compare two texts and find similarity percentage with matching phrase highlights.",
    longDescription:
      "Paste two pieces of text to compare similarity, overlap, and repeated phrases. This browser-based text similarity checker highlights matching content and estimates how closely two drafts resemble each other. It does not crawl the web or check against external databases, so it is best for comparing two known documents privately.",
    categorySlug: "text-tools",
    icon: "✓",
    featured: true,
    keywords: [
      "text similarity checker",
      "compare text similarity",
      "duplicate text checker",
      "plagiarism checker",
      "content similarity checker",
    ],
    metaTitle: "Text Similarity Checker - Compare Two Texts Online",
    metaDescription:
      "Compare two texts online with a private text similarity checker. Highlight overlap, repeated phrases, and similarity percentage in your browser.",
    usageSteps: [
      {
        title: "Paste Both Texts",
        content:
          "Add the original text and comparison text into the text similarity checker. This works well for drafts, rewrites, article versions, and student writing samples.",
      },
      {
        title: "Run the Similarity Check",
        content:
          "The text similarity checker compares overlap between the two inputs and highlights matching phrases. Results appear locally without uploading either document.",
      },
      {
        title: "Review Matching Sections",
        content:
          "Use the similarity percentage and highlights to decide whether the text needs rewriting, citation, or further review. This is not a web-wide plagiarism database.",
      },
    ],
    faq: [
      {
        question: "Is this a full plagiarism checker?",
        answer:
          "No. This is a text similarity checker for comparing two texts you provide. It does not crawl the web, search academic databases, or compare against private repositories.",
      },
      {
        question: "When should I use a text similarity checker?",
        answer:
          "Use it to compare drafts, rewrites, source excerpts, or two known documents. It helps spot overlap and repeated phrasing while keeping both texts in your browser.",
      },
    ],
  },
  {
    slug: "readability-score",
    name: "Readability Score Checker",
    description:
      "Check readability scores like Flesch-Kincaid and Gunning Fog.",
    longDescription:
      "Analyze your text's readability using multiple standard formulas: Flesch-Kincaid Grade Level, Flesch Reading Ease, Gunning Fog Index, Coleman-Liau Index, SMOG Index, and Automated Readability Index. Get grade-level estimates and actionable suggestions to make your writing clearer.",
    categorySlug: "text-tools",
    icon: "📊",
    featured: false,
    keywords: [
      "readability score checker",
      "flesch kincaid grade level",
      "readability test online",
      "text readability analyzer",
      "gunning fog index calculator",
    ],
    metaTitle: "Readability Score Checker — Flesch-Kincaid & Gunning Fog",
    metaDescription:
      "Check readability scores with our free readability score checker. Analyze Flesch-Kincaid grade level, Gunning Fog Index, and more — instant text analysis.",
    usageSteps: [
      {
        title: "Paste your text",
        content:
          "Paste any text into the readability score checker input. The tool works with any length from a single paragraph to full articles, automatically analyzing sentence length, syllable count, and word complexity for accurate readability assessment.",
      },
      {
        title: "View multiple readability scores",
        content:
          "The readability score checker displays Flesch-Kincaid Grade Level, Flesch Reading Ease, Gunning Fog Index, Coleman-Liau Index, SMOG Index, and Automated Readability Index side by side for comprehensive text analysis.",
      },
      {
        title: "Interpret the results",
        content:
          "Each readability score checker result includes a grade-level interpretation and suggestions for improvement. Lower grade levels indicate easier-to-read text, making this tool valuable for writers targeting specific audience reading levels.",
      },
    ],
    faq: [
      {
        question: "What is a good Flesch-Kincaid grade level for web content?",
        answer:
          "A Flesch-Kincaid grade level between 6 and 8 is recommended for most web content, as this targets a broad audience. The readability score checker helps you verify your content is accessible to readers with at least a middle school reading level.",
      },
      {
        question:
          "How does the readability score checker calculate the Gunning Fog Index?",
        answer:
          "The Gunning Fog Index is calculated by measuring average sentence length and the percentage of complex words (three or more syllables) in your text. The readability score checker applies this formula along with five other common readability metrics for a complete analysis.",
      },
    ],
  },
  {
    slug: "word-cloud-generator",
    name: "Word Cloud Generator",
    description: "Generate a visual word cloud from any text online.",
    longDescription:
      "Create beautiful word clouds from any text. Paste your content and instantly see a visual representation where the most frequent words appear larger. Customize colors, remove common stop words, and download your word cloud as an image. Perfect for presentations, reports, and content analysis.",
    categorySlug: "text-tools",
    icon: "☁️",
    featured: true,
    keywords: [
      "word cloud generator",
      "create word cloud online",
      "word cloud maker free",
      "tag cloud generator",
      "text visualization tool",
    ],
    metaTitle: "Word Cloud Generator — Create Free Online",
    metaDescription:
      "Create a word cloud online with our free word cloud generator. Paste any text and generate a visual tag cloud with customizable colors. Download as PNG.",
    usageSteps: [
      {
        title: "Paste or type your text",
        content:
          "Enter the text you want to visualize into the word cloud generator. The tool analyzes word frequency and prepares your data for visual rendering — the more frequently a word appears, the larger it will appear in the cloud.",
      },
      {
        title: "Customize your word cloud",
        content:
          "Adjust colors, remove common stop words, and set the maximum number of words displayed. The word cloud generator updates in real time as you change settings, giving you full control over the final visual output.",
      },
      {
        title: "Download or share",
        content:
          "Once satisfied with the layout, download your word cloud as a PNG image. The word cloud generator creates 600 × 600 pixel PNG images perfect for presentations, educational materials, blog posts, and content analysis reports.",
      },
    ],
    faq: [
      {
        question: "How does a word cloud generator determine word sizes?",
        answer:
          "A word cloud generator analyzes word frequency in your text — words that appear more frequently are displayed larger in the cloud. Stop words like 'the', 'and', and 'is' are typically filtered out to highlight meaningful content words.",
      },
      {
        question: "Can I customize colors in the word cloud generator?",
        answer:
          "Yes, the word cloud generator offers customizable color schemes and palettes. You can choose from preset color themes to change the displayed palette before downloading the final image.",
      },
    ],
    additionalContent: [
      {
        heading: "Visualize Text Themes",
        content:
          "The word cloud generator turns repeated words into a visual summary. It is useful for survey responses, article drafts, brainstorming notes, classroom activities, and content research.",
      },
      {
        heading: "Private Text Visualization",
        content:
          "Your text is processed in the browser, so drafts and research notes are not uploaded. The generated word cloud can be reviewed and downloaded locally.",
      },
      {
        heading: "Better Word Clouds",
        content:
          "Remove filler words, paste focused text, and adjust colors or layout to make the most important terms stand out. Pair the result with the keyword density checker for a more analytical view.",
      },
    ],
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode JWT tokens and inspect header and payload.",
    longDescription:
      "Decode any JSON Web Token (JWT) to inspect its header, payload, and signature information. Paste a JWT string and instantly see the decoded header and payload as formatted JSON. Perfect for debugging authentication flows, verifying token contents, and learning JWT structure.",
    categorySlug: "developer-tools",
    icon: "🔐",
    featured: true,
    keywords: [
      "jwt decoder",
      "jwt decode online",
      "jwt token decoder",
      "jwt debugger",
      "json web token decoder",
    ],
    metaTitle: "JWT Decoder - Free Online JSON Web Token Tool",
    metaDescription:
      "Decode JWT tokens online with our free JWT decoder. Inspect JWT header and payload as formatted JSON. Debug authentication tokens instantly in your browser.",
    usageSteps: [
      {
        title: "Paste your JWT token",
        content:
          "Copy and paste your JSON Web Token into the JWT decoder input. The tool automatically detects the three JWT segments (header, payload, signature) separated by dots and prepares them for decoding.",
      },
      {
        title: "View decoded header and payload",
        content:
          "The JWT decoder instantly shows the decoded header (token type and signing algorithm) and payload (claims like subject, issuer, and expiration) as formatted, readable JSON objects for easy inspection.",
      },
      {
        title: "Copy decoded data",
        content:
          "Use the copy buttons to grab the decoded header or payload JSON. The JWT decoder is perfect for debugging authentication issues, verifying token contents during development, and learning about JWT structure.",
      },
    ],
    faq: [
      {
        question: "Is the JWT decoder safe to use with production tokens?",
        answer:
          "The decoder processes the pasted token locally and does not send it to our processing server. Tokens are credentials and can still be exposed through clipboard history, extensions, screenshots, or device compromise, so use an expired or redacted sample instead of an active production token.",
      },
      {
        question: "Does the JWT decoder verify token signatures?",
        answer:
          "The JWT decoder decodes and displays the header and payload but does not verify cryptographic signatures. For signature verification, you need the secret key or public key used to sign the token, which is a server-side operation.",
      },
    ],
    additionalContent: [
      {
        heading: "Decode JWT Tokens Safely",
        content:
          "The JWT decoder reads the header and payload locally in your browser. This helps developers inspect authentication claims without sending tokens to a remote debugging service.",
      },
      {
        heading: "What the Tool Does Not Do",
        content:
          "Decoding a JWT is not the same as verifying trust. This tool displays token content for debugging, but production verification must still check signatures, issuers, audiences, and expiration rules.",
      },
      {
        heading: "Developer Use Cases",
        content:
          "Use the decoder while debugging OAuth, OpenID Connect, API sessions, test environments, and claim mappings. Avoid pasting live production secrets unless you understand the risk.",
      },
    ],
  },
  {
    slug: "sql-formatter",
    name: "SQL Formatter",
    description: "Format and beautify SQL queries online.",
    longDescription:
      "Format common SQL keywords and whitespace with two- or four-space indentation. Quoted values, identifiers, comments and dollar-quoted bodies are preserved as entered. Unterminated protected segments are rejected. This heuristic formatter does not execute SQL or validate a database dialect.",
    categorySlug: "developer-tools",
    icon: "🗄️",
    featured: false,
    keywords: [
      "sql formatter",
      "format sql online",
      "sql beautifier",
      "sql query formatter",
      "pretty print sql",
    ],
    metaTitle: "SQL Formatter — Beautify Queries Online",
    metaDescription:
      "Format SQL queries online with our free SQL formatter. Beautify and pretty-print your SQL code with customizable indentation. Instant, in-browser formatting.",
    usageSteps: [
      {
        title: "Paste your SQL query",
        content:
          "Paste SQL into the formatter input. Common keywords such as SELECT, FROM and WHERE can be reformatted; quoted values, identifiers, comments and dollar-quoted bodies are preserved. An unterminated protected segment produces an error.",
      },
      {
        title: "Choose formatting options",
        content:
          "Choose two- or four-space indentation, then select Format. Recognized code keywords become uppercase; text inside protected segments keeps its original case and spacing.",
      },
      {
        title: "Copy the formatted output",
        content:
          "Review the output before copying it. Formatting does not establish that a statement is valid or equivalent in your database dialect; use your database tooling for validation.",
      },
    ],
    faq: [
      {
        question: "What SQL dialects does the SQL formatter support?",
        answer:
          "The formatter applies heuristic keyword and whitespace rules; it is not a SQL parser or dialect validator. Quoted values and identifiers, line and nested block comments, and dollar-quoted bodies are preserved as entered. Unterminated protected segments are rejected. Use a dialect-aware tool to validate database-specific syntax.",
      },
      {
        question:
          "Can the SQL formatter handle complex queries with multiple JOINs?",
        answer:
          "It can reflow common keywords and use parenthesis-based indentation, but it does not parse complete query structure. Review JOINs, subqueries and CTEs manually. Preserving a protected body does not validate the SQL inside it.",
      },
    ],
  },
  {
    slug: "html-to-markdown",
    name: "HTML to Markdown Converter",
    description: "Convert detached HTML to Markdown while preserving common text structure.",
    longDescription:
      "Convert headings, inline emphasis, lists, links, images, fenced code and simple tables using Turndown with its GFM plugin. Scripts and unsafe URL schemes are excluded. Complex layout, merged table cells and interactive controls do not have equivalent Markdown representations.",
    categorySlug: "developer-tools",
    icon: "🔄",
    featured: false,
    keywords: [
      "html to markdown converter",
      "convert html to markdown",
      "html to md converter",
      "html to markdown online",
      "html to md online free",
    ],
    metaTitle: "HTML to Markdown Converter — Free Online",
    metaDescription:
      "Convert detached HTML to Markdown while preserving common text structure.",
    usageSteps: [
      {
        "title": "Paste HTML",
        "content": "Use up to 1,000,000 characters. The input is parsed in a detached template rather than inserted into the page."
      },
      {
        "title": "Convert and inspect",
        "content": "Check inline spacing, nesting, code fences and tables in the output. A table needs ordinary header cells for GFM conversion."
      },
      {
        "title": "Copy to your destination",
        "content": "Copy and preview it in the Markdown renderer used by your documentation or publishing system."
      }
    ],
    faq: [
      {
        "question": "Is this an exact round trip?",
        "answer": "No. HTML layout, scripts, styles and many interactive features cannot be represented as plain Markdown."
      },
      {
        "question": "How are complex tables handled?",
        "answer": "Simple header-based tables convert to GFM. Merged cells and other complex structures are not promised to retain their original layout."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "The input <p>Hello <strong>world</strong> again.</p> should become Hello **world** again., preserving spaces around the emphasized word."
      },
      {
        "heading": "Before using the result",
        "content": "Treat converted links and images as untrusted references. Review the final destination before publishing."
      }
    ],
  },
  {
    slug: "json-to-xml",
    name: "JSON to XML Converter",
    description: "Map JSON to XML with validated element names and explicit array rules.",
    longDescription:
      "Choose a root name and convert JSON to an indented XML document. Object keys become elements; arrays contain item children; null uses a declared xsi:nil attribute. Unsupported names, characters and excessive nesting produce errors.",
    categorySlug: "developer-tools",
    icon: "📄",
    featured: false,
    keywords: [
      "json to xml converter",
      "convert json to xml",
      "json to xml online",
      "json to xml free",
      "json xml transformation tool",
    ],
    metaTitle: "JSON to XML Converter — Free Online",
    metaDescription:
      "Map JSON to XML with validated element names and explicit array rules.",
    usageSteps: [
      {
        "title": "Paste JSON",
        "content": "Use valid JSON with representable numbers. Large numbers follow JavaScript JSON parsing limits; preserve important large identifiers as strings."
      },
      {
        "title": "Set a valid root name",
        "content": "Use a letter or underscore first, then letters, digits, underscore, hyphen or period. Namespace prefixes and names starting with xml are not supported."
      },
      {
        "title": "Convert and review the mapping",
        "content": "Convert and copy the XML. No primitive-attribute mode or download button is provided. The output is checked as XML before being shown."
      }
    ],
    faq: [
      {
        "question": "How are arrays and null represented?",
        "answer": "An array becomes a container with repeated item children; an empty array is an empty container. Null becomes an element with xsi:nil=\"true\" and the namespace declared on the root."
      },
      {
        "question": "Is this a reversible JSON mapping?",
        "answer": "No. An empty object and an empty array can look alike in XML, and primitive type information is not fully retained. Agree on a schema with the receiving system."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "For {\"items\":[],\"missing\":null}, expect an empty items element and a missing element with xsi:nil=\"true\", without an invented array item."
      },
      {
        "heading": "Before using the result",
        "content": "The application accepts at most 100,000 JSON characters, 10,000 generated nodes and 32 nesting levels. Invalid XML names must be changed in the source data."
      }
    ],
  },
  {
    slug: "serp-preview-generator",
    name: "SERP Preview Generator",
    description: "Preview how your page looks in Google search results.",
    longDescription:
      "Create an illustrative search-result preview from a title, description and URL. Use it to review wording and approximate length. Google can rewrite titles and snippets and render them differently by query and device; this is not an exact prediction or a promise of clicks.",
    categorySlug: "seo-tools",
    icon: "🔍",
    featured: true,
    keywords: [
      "serp preview generator",
      "google search preview",
      "serp snippet preview",
      "meta tag preview tool",
      "search result preview",
    ],
    metaTitle: "SERP Preview Generator — Google Snippet Preview",
    metaDescription:
      "Preview your Google search result snippet with our free SERP preview generator. Review an approximate title and description layout; actual search results can differ.",
    usageSteps: [
      {
        title: "Enter your title tag",
        content:
          "Type or paste your page title into the SERP preview generator. The tool shows an illustrative preview with character counts. Its truncation rules are local approximations, not search-engine display guarantees.",
      },
      {
        title: "Add your meta description",
        content:
          "Enter your meta description and watch the SERP preview generator update the snippet in real time. The preview illustrates a possible layout; it does not measure the actual search engine font or predict the final snippet.",
      },
      {
        title: "Preview and optimize",
        content:
          "Review the complete SERP preview including URL display and adjust your title and description until they look perfect. The SERP preview generator helps you optimize click-through rates by showing exactly what searchers will see.",
      },
    ],
    faq: [
      {
        question:
          "How accurate is the SERP preview generator compared to real Google results?",
        answer:
          "The preview uses a simplified local layout. Actual search results can differ substantially, including rewritten titles, different snippets and device-dependent widths. Use it for drafting, not as a certification of display.",
      },
      {
        question: "What is the ideal title length for Google search results?",
        answer:
          "Google typically displays the first 50-60 characters of a title tag before truncating. The SERP preview generator shows a pixel-width-based truncation that is more accurate than simple character counts, helping you craft titles that display fully.",
      },
    ],
  },
  {
    slug: "heading-structure-checker",
    name: "Heading Structure Checker",
    description: "Inspect pasted HTML headings and review hierarchy prompts.",
    longDescription:
      "Parse heading elements from detached HTML, including multiline content and inline markup. The report counts levels and flags empty or skipped headings for manual review. It does not fetch a website, predict rankings or certify accessibility.",
    categorySlug: "seo-tools",
    icon: "📑",
    featured: false,
    keywords: [
      "heading structure checker",
      "heading hierarchy checker",
      "h1 h2 checker",
      "html heading analyzer",
      "seo heading structure tool",
    ],
    metaTitle: "Heading Structure Checker — H1-H6 Analyzer",
    metaDescription:
      "Inspect pasted HTML headings and review hierarchy prompts.",
    usageSteps: [
      {
        "title": "Paste the relevant HTML",
        "content": "Use a complete page when evaluating the main heading, or remember that a snippet may legitimately have no H1."
      },
      {
        "title": "Inspect the ordered outline",
        "content": "Read headings in DOM order and check that their levels express the actual content structure."
      },
      {
        "title": "Resolve meaningful issues",
        "content": "Add useful heading text or adjust levels where needed. Multiple H1 elements require context review, not an automatic ranking penalty assumption."
      }
    ],
    faq: [
      {
        "question": "Does every warning mean a search penalty?",
        "answer": "No. These are structural prompts. Search ranking is not calculated by this tool."
      },
      {
        "question": "Can it inspect dynamic headings or accessible names?",
        "answer": "Only the pasted markup is analyzed. Script-generated content, CSS appearance and some accessible-name behavior require a browser/accessibility review."
      }
    ],

    additionalContent: [
      {
        "heading": "A result you can check",
        "content": "An H2 with text on multiple lines remains one H2 entry. A comment containing a fake heading is not a rendered heading."
      },
      {
        "heading": "Before using the result",
        "content": "Compare the outline with the rendered page and keyboard/screen-reader experience before deciding on changes."
      }
    ],
  },
  {
    slug: "schema-markup-generator",
    name: "Schema Markup Generator",
    description: "Generate JSON-LD schema markup for your web pages.",
    longDescription:
      "Generate ready-to-use JSON-LD schema markup for your web pages. Select from common schema types like Article, Product, LocalBusiness, FAQ, BreadcrumbList, Recipe, Event, and Organization. Fill in the fields and get properly formatted JSON-LD code you can copy directly into your website's HTML head section.",
    categorySlug: "seo-tools",
    icon: "🏷️",
    featured: false,
    keywords: [
      "schema markup generator",
      "json ld generator",
      "schema org generator",
      "structured data generator",
      "rich snippet generator",
    ],
    metaTitle: "Schema Markup Generator — JSON-LD Structured Data",
    metaDescription:
      "Generate JSON-LD schema markup with our free tool. Create structured data for Article, Product, FAQ, LocalBusiness, and more. Copy and paste ready.",
    usageSteps: [
      {
        title: "Select schema type",
        content:
          "Choose from common schema types including Article, Product, LocalBusiness, FAQ, BreadcrumbList, Recipe, Event, or Organization. The schema markup generator loads the appropriate form fields for your selected type.",
      },
      {
        title: "Fill in the fields",
        content:
          "Complete the required and recommended fields for your selected schema type. The generator assembles the fields you enter into JSON-LD. It does not certify factual accuracy, required-property completeness or eligibility for a rich result. Validate the final page with the relevant official tools.",
      },
      {
        title: "Copy the JSON-LD code",
        content:
          "Copy the generated JSON-LD markup with one click and paste it into your page's head section. The schema markup generator creates Google-compatible structured data that helps your pages qualify for rich results and enhanced search listings.",
      },
    ],
    faq: [
      {
        question: "What is JSON-LD schema markup and why do I need it?",
        answer:
          "JSON-LD is Google's recommended format for structured data markup. The schema markup generator creates JSON-LD code that helps search engines understand your content and display rich results like star ratings, product prices, and FAQ snippets in search results.",
      },
      {
        question:
          "Which schema types does the schema markup generator support?",
        answer:
          "The schema markup generator supports Article, Product, LocalBusiness, FAQ, BreadcrumbList, Recipe, Event, and Organization schema types. Each type includes the most commonly used properties based on Google's structured data documentation.",
      },
    ],
  },
  {
    slug: "color-palette-generator",
    name: "Color Palette Generator",
    description: "Generate harmonious color palettes for your designs.",
    longDescription:
      "Create beautiful, harmonious color palettes with ease. Generate monochromatic, complementary, analogous, triadic, and tetradic color schemes from any base color. See your palette as a visual grid with hex codes for easy copying. Perfect for designers, developers, and anyone creating color schemes for web or print projects.",
    categorySlug: "design-tools",
    icon: "🎨",
    featured: true,
    keywords: [
      "color palette generator",
      "color scheme generator",
      "color palette maker",
      "harmonious color generator",
      "hex color palette",
    ],
    metaTitle: "Color Palette Generator — Free Color Scheme Maker",
    metaDescription:
      "Generate beautiful color palettes with our free generator. Create monochromatic, complementary, analogous, and triadic color schemes from any base color.",
    usageSteps: [
      {
        title: "Choose a base color",
        content:
          "Pick any color as your starting point using the color picker or by entering a hex code. The color palette generator instantly creates harmonious color schemes based on color theory principles from your selected base color.",
      },
      {
        title: "Select a palette type",
        content:
          "Choose from monochromatic, complementary, analogous, triadic, or tetradic color schemes. The color palette generator applies color relationships to create balanced, professional-looking palettes for any design project.",
      },
      {
        title: "Copy hex codes",
        content:
          "Copy individual hex codes or the entire palette with one click. The color palette generator displays all colors in a visual grid with hex values, making it easy to use your generated palette in CSS, design tools, or brand guidelines.",
      },
    ],
    faq: [
      {
        question:
          "What is the difference between monochromatic and complementary color schemes?",
        answer:
          "Monochromatic schemes use variations in lightness and saturation of a single hue, creating a cohesive look. Complementary schemes use colors opposite each other on the color wheel for high contrast. The color palette generator offers both options for different design needs.",
      },
      {
        question:
          "How does the color palette generator create harmonious color schemes?",
        answer:
          "The color palette generator uses color theory rules based on the color wheel. Complementary schemes use opposite colors, analogous uses adjacent colors, triadic uses evenly spaced colors, and tetradic uses two complementary pairs for visually balanced results.",
      },
    ],
  },
  {
    slug: "gradient-generator",
    name: "Gradient Generator",
    description: "Create CSS gradients with a visual preview.",
    longDescription:
      "Design beautiful CSS gradients with a live visual preview. Choose from linear or radial gradients, pick colors, adjust direction and angle, and see your changes in real time. Copy the generated CSS code instantly. Perfect for web designers and developers creating gradient backgrounds for websites, apps, and UI elements.",
    categorySlug: "design-tools",
    icon: "🌈",
    featured: false,
    keywords: [
      "gradient generator",
      "css gradient generator",
      "css gradient maker",
      "linear gradient css",
      "radial gradient generator",
    ],
    metaTitle: "Gradient Generator — CSS Gradient Maker",
    metaDescription:
      "Create CSS gradients with our free gradient generator. Design linear and radial gradients with a live preview. Copy the generated CSS code instantly.",
    usageSteps: [
      {
        title: "Choose gradient type",
        content:
          "Select linear or radial gradient type from the options. The gradient generator updates the preview in real time as you switch between types, showing you exactly how your gradient will look.",
      },
      {
        title: "Pick your colors",
        content:
          "Add color stops by picking colors using the color pickers. The gradient generator supports two or more color stops with adjustable positions for complete control over your gradient appearance.",
      },
      {
        title: "Copy the CSS code",
        content:
          "Adjust the angle or position, then copy the generated CSS code with one click. The gradient generator creates cross-browser compatible CSS that you can paste directly into your stylesheets.",
      },
    ],
    faq: [
      {
        question: "What is the difference between linear and radial gradients?",
        answer:
          "Linear gradients transition colors along a straight line (specified by angle or direction), while radial gradients transition outward from a central point in a circular pattern. The gradient generator lets you switch between both types to find the perfect effect.",
      },
      {
        question: "Can I add more than two colors to my gradient?",
        answer:
          "Yes, the gradient generator supports multiple color stops. You can add as many colors as you want and adjust each stop's position independently, giving you complete creative control over the final gradient result.",
      },
    ],
  },
  {
    slug: "css-border-radius-generator",
    name: "Border Radius Generator",
    description: "Generate CSS border-radius values with a visual preview.",
    longDescription:
      "Create and preview CSS border-radius values visually. Adjust all four corners independently or together using sliders, see a live preview of your element, and copy the generated CSS code. Perfect for web designers and developers creating rounded corners for buttons, cards, images, and UI elements.",
    categorySlug: "design-tools",
    icon: "⬜",
    featured: false,
    keywords: [
      "border radius generator",
      "css border radius maker",
      "rounded corners generator",
      "border radius css",
      "corner radius tool",
    ],
    metaTitle: "Border Radius Generator — CSS Rounded Corners",
    metaDescription:
      "Generate CSS border-radius values with our free tool. Preview rounded corners visually and copy the CSS code. Customize each corner independently.",
    usageSteps: [
      {
        title: "Adjust border radius values",
        content:
          "Use the sliders to adjust the border-radius of each corner or all corners uniformly. The border radius generator shows a live preview of your element with the current corner radius values applied.",
      },
      {
        title: "Preview the result",
        content:
          "See your element update in real time as you adjust values. The border radius generator provides a visual preview box that demonstrates exactly how your rounded corners will look on a real element.",
      },
      {
        title: "Copy the CSS code",
        content:
          "Copy the generated CSS with one click. The border radius generator outputs clean, formatted CSS that you can paste directly into your stylesheet for buttons, cards, images, or any other element needing rounded corners.",
      },
    ],
    faq: [
      {
        question: "What is the CSS border-radius property used for?",
        answer:
          "The CSS border-radius property creates rounded corners on HTML elements. The border radius generator makes it easy to visualize and generate the correct CSS values without manually calculating pixel or percentage values for each corner.",
      },
      {
        question:
          "Can I set different values for each corner using the border radius generator?",
        answer:
          "Yes, the border radius generator lets you set individual values for the top-left, top-right, bottom-right, and bottom-left corners independently. You can also use the uniform mode to apply the same value to all corners at once.",
      },
    ],
  },
  {
    slug: "epoch-converter",
    name: "Epoch Timestamp Converter",
    description:
      "Convert Unix timestamps to human-readable dates and vice versa.",
    longDescription:
      "Convert Unix epoch timestamps to human-readable dates and times, and convert dates back to timestamps. Supports seconds, milliseconds, and microseconds. See the converted result in multiple time formats including UTC, ISO 8601, and local time. Essential for developers working with APIs, databases, and log files.",
    categorySlug: "converters",
    icon: "⏰",
    featured: true,
    keywords: [
      "epoch converter",
      "unix timestamp converter",
      "epoch time converter",
      "timestamp to date",
      "unix time converter online",
    ],
    metaTitle: "Epoch Timestamp Converter — Unix Time to Date",
    metaDescription:
      "Convert Unix timestamps to readable dates with our free epoch converter. Convert timestamps to UTC, ISO 8601, and local time, plus dates back to timestamps.",
    usageSteps: [
      {
        title: "Enter a timestamp or date",
        content:
          "Paste a Unix epoch timestamp or select a date and time. The epoch converter automatically detects whether your input is in seconds, milliseconds, or microseconds and converts it accordingly.",
      },
      {
        title: "View converted results",
        content:
          "See the converted result in multiple formats simultaneously: UTC, ISO 8601, local time, and relative time (e.g., '2 hours ago'). The epoch converter makes it easy to understand timestamps in whatever format you need.",
      },
      {
        title: "Copy the result",
        content:
          "Copy any of the converted formats to your clipboard. The epoch converter also shows the current timestamp and lets you convert dates back to Unix timestamps for use in API calls and database queries.",
      },
    ],
    faq: [
      {
        question: "What is a Unix epoch timestamp?",
        answer:
          "A Unix epoch timestamp represents the number of seconds (or milliseconds) that have elapsed since January 1, 1970 (midnight UTC). The epoch converter translates these numeric timestamps into human-readable date and time formats.",
      },
      {
        question:
          "Does the epoch converter support milliseconds and microseconds?",
        answer:
          "Yes, the epoch converter supports timestamps in seconds (10 digits), milliseconds (13 digits), and microseconds (16 digits). It automatically detects the precision of your input and converts it correctly without manual configuration.",
      },
    ],
    additionalContent: [
      {
        heading: "Convert Unix Timestamps Quickly",
        content:
          "The epoch converter turns Unix timestamps into readable dates and converts dates back to epoch values. It supports common developer workflows involving APIs, logs, databases, and scheduled jobs.",
      },
      {
        heading: "Seconds, Milliseconds, and Time Zones",
        content:
          "Timestamps may be stored in seconds, milliseconds, or microseconds. The converter helps identify the format and displays UTC, ISO, and local time views for easier debugging.",
      },
      {
        heading: "When Developers Need Epoch Time",
        content:
          "Use epoch conversion when reading logs, checking token expiration, testing API responses, comparing database records, or preparing timestamp values for scripts.",
      },
    ],
  },
  {
    slug: "random-number-generator",
    name: "Random Number Generator",
    description: "Generate random numbers, dice rolls, and lottery numbers.",
    longDescription:
      "Generate whole numbers using the browser's cryptographic random source with unbiased range sampling. Choose safe integer bounds spanning at most 2³² possible values and generate up to 1,000 numbers per batch. Choose unique values or allow duplicates, and sort or copy the results.",
    categorySlug: "calculators",
    icon: "🎲",
    featured: true,
    keywords: [
      "random number generator",
      "random number picker",
      "lottery number generator",
      "dice roller online",
      "true random generator",
    ],
    metaTitle: "Random Number Generator — Dice Roll & Lottery Picker",
    metaDescription:
      "Generate random numbers with our free random number generator. Use it as a dice roller, lottery number picker, or randomizer for giveaways and contests.",
    usageSteps: [
      {
        title: "Set your range",
        content:
          "Enter safe whole-number minimum and maximum bounds. The inclusive range can contain at most 2³² possible values. For a dice roll, choose 1 through 6.",
      },
      {
        title: "Choose how many numbers",
        content:
          "Choose 1 to 1,000 results. For unique numbers, the requested count must fit in the range; invalid requests show an error instead of a partial result. These are application guardrails.",
      },
      {
        title: "Copy your results",
        content:
          "View the generated numbers and copy them to your clipboard. The random number generator can also sort results in ascending order, making it easy to use for lottery tickets, contest winners, or random assignments.",
      },
    ],
    faq: [
      {
        question: "How are the random values generated?",
        answer:
          "The browser's Crypto.getRandomValues supplies cryptographically strong pseudorandom bytes. Rejection sampling avoids modulo bias within the supported range. This is not a physical true-random source or a lottery prediction tool.",
      },
      {
        question:
          "Can the random number generator be used for lottery number selection?",
        answer:
          "Yes, the random number generator is perfect for lottery number picks. Set the range to match your lottery's number pool (e.g., 1-69), enable unique numbers, and generate your set of random picks instantly.",
      },
    ],
  },
];

TOOLS.push({
  "slug": "attendance-calculator",
  "name": "Attendance Calculator",
  "description": "Check your attendance and the classes needed to reach your own target.",
  "longDescription": "Calculate your current class attendance, how many consecutive classes you need to attend, and how many you can miss while meeting an entered target.",
  "categorySlug": "calculators",
  "icon": "📅",
  "keywords": [
    "attendance calculator",
    "attendance percentage"
  ],
  "metaTitle": "Attendance Calculator — Classes Needed & Percentage",
  "metaDescription": "Calculate attendance percentage, catch-up classes and remaining-class scenarios using your own target. See the formula and exact class counts.",
  "relatedToolSlugs": [
    "marks-percentage-calculator",
    "required-marks-calculator",
    "percentage-calculator"
  ],
  "usageSteps": [
    {
      "title": "Enter completed classes",
      "content": "Enter attended and conducted class counts. Use one consistent unit: classes, not a mixture of classes and hours."
    },
    {
      "title": "Set your target",
      "content": "Enter the percentage that applies to you. Add remaining classes only if you know the schedule; no university threshold is assumed."
    },
    {
      "title": "Read the scenario",
      "content": "Calculate to see the current fraction, consecutive attendance needed and maximum extra absences. A target may be impossible within the remaining schedule."
    }
  ],
  "faq": [
    {
      "question": "Is 75% a universal attendance requirement?",
      "answer": "No. The example uses 75% only to demonstrate the arithmetic. Enter your own target and check subject-specific, excused-absence and eligibility rules with your institution."
    },
    {
      "question": "Can I recover exact 100% after missing a class?",
      "answer": "No finite number of additional attended classes removes an earlier absence from the conducted total. If every conducted class was attended, catch-up is zero. If no classes were conducted, one attended class establishes a percentage."
    }
  ],
  "featured": false,
  "adEligible": false
});

TOOLS.push({
  "slug": "sgpa-calculator",
  "name": "SGPA Calculator",
  "description": "Calculate semester GPA using your credits and grade-point scale.",
  "longDescription": "Enter course credits and numeric points or your own grade-label mapping to calculate a credit-weighted semester GPA with a visible breakdown.",
  "categorySlug": "calculators",
  "icon": "🎓",
  "keywords": [
    "sgpa calculator",
    "credit weighted semester GPA"
  ],
  "metaTitle": "SGPA Calculator — Your Credits & Grade Scale",
  "metaDescription": "Calculate credit-weighted SGPA using numeric points or a custom grade mapping. See included credits, weighted points, exclusions and the formula.",
  "relatedToolSlugs": [
    "cgpa-calculator",
    "marks-percentage-calculator",
    "required-marks-calculator"
  ],
  "usageSteps": [
    {
      "title": "Choose your scale",
      "content": "Enter your institution's grade-point maximum. Use numerical points or define each grade label and its point value yourself."
    },
    {
      "title": "Enter included courses",
      "content": "Enter positive credits and grade points for each counted course. Explicitly exclude pass/fail, audit or repeated attempts that your institution does not count."
    },
    {
      "title": "Check the weighted result",
      "content": "Calculate and inspect each credit × point contribution and total included credits. Display rounding does not alter intermediate calculations."
    }
  ],
  "faq": [
    {
      "question": "Does this use one university's SGPA rules?",
      "answer": "No. It calculates a credit-weighted mean from your selected scale and included courses. Check your institution's course inclusion, repeated-attempt and rounding rules before using the result."
    },
    {
      "question": "Are failed courses excluded automatically?",
      "answer": "No. An included course with zero points contributes its credits and zero weighted points. Exclude a course only when your official rules exclude it."
    }
  ],
  "featured": false,
  "adEligible": false
});

TOOLS.push({
  "slug": "cgpa-calculator",
  "name": "CGPA Calculator",
  "description": "Combine semesters or courses using credits or explicitly selected weights.",
  "longDescription": "Calculate cumulative GPA from individual courses or semester SGPAs, with explicit credit, custom or equal weighting and a visible calculation.",
  "categorySlug": "calculators",
  "icon": "📚",
  "keywords": [
    "cgpa calculator",
    "credit weighted cumulative GPA"
  ],
  "metaTitle": "CGPA Calculator — Explicit Semester & Course Weights",
  "metaDescription": "Calculate CGPA from courses or semester SGPAs with explicit credits, custom weights or chosen equal weighting. View the method and full breakdown.",
  "relatedToolSlugs": [
    "sgpa-calculator",
    "marks-percentage-calculator",
    "required-marks-calculator"
  ],
  "usageSteps": [
    {
      "title": "Choose your input method",
      "content": "Use individual courses for underlying credit and grade-point data, or semester SGPAs for an aggregate. Keep every entry on the same grade-point scale."
    },
    {
      "title": "Supply the weighting",
      "content": "For semesters, select credits or custom institutional weights and enter every weight. Equal weighting is used only when explicitly selected."
    },
    {
      "title": "Review the calculation",
      "content": "Check the selected weighting method and each weighted contribution. An aggregate of rounded SGPAs is an estimate, not a recovery of unrounded course totals."
    }
  ],
  "faq": [
    {
      "question": "Can I simply average my semester SGPAs?",
      "answer": "Only if you deliberately select equal weighting and that method fits your requirements. Credit-weighted results differ when semester credit totals differ; no weights are inferred."
    },
    {
      "question": "Can I combine a 4-point SGPA with a 10-point SGPA?",
      "answer": "Not directly. Supply entries on one consistent scale. This tool does not invent conversions between grading systems or a CGPA-to-percentage formula."
    }
  ],
  "featured": false,
  "adEligible": false
});

TOOLS.push({
  "slug": "marks-percentage-calculator",
  "name": "Marks Percentage Calculator",
  "description": "Calculate a total marks percentage across subjects with different maximum marks.",
  "longDescription": "Calculate a total marks percentage across subjects with different maximum marks. Enter your own assessment details and inspect the calculation behind the result.",
  "categorySlug": "calculators",
  "icon": "📊",
  "keywords": [
    "marks percentage calculator"
  ],
  "metaTitle": "Marks Percentage Calculator — Formula & Breakdown",
  "metaDescription": "Calculate a total marks percentage across subjects with different maximum marks. See the formula, worked totals and clear input checks.",
  "relatedToolSlugs": [
    "required-marks-calculator",
    "sgpa-calculator",
    "cgpa-calculator"
  ],
  "usageSteps": [
    {
      "title": "Enter subject marks",
      "content": "Add obtained marks and a positive maximum for each subject. Subjects can have different maximum marks."
    },
    {
      "title": "Choose optional grade thresholds",
      "content": "A percentage needs no grading system. Enable your own thresholds only if you want a grade label, including a threshold starting at zero."
    },
    {
      "title": "Inspect the calculation",
      "content": "Check total obtained marks divided by total maximum marks, multiplied by 100. The result shows every subject and the totals."
    }
  ],
  "faq": [
    {
      "question": "Is this an average of subject percentages?",
      "answer": "No. It divides total obtained marks by total maximum marks. A subject out of 100 contributes twice the possible marks of a subject out of 50."
    },
    {
      "question": "Does the grade match my university?",
      "answer": "A grade appears only when you supply your own thresholds. Subject pass conditions, classifications and GPA conversion are not inferred."
    }
  ],
  "featured": false,
  "adEligible": false
});

TOOLS.push({
  "slug": "required-marks-calculator",
  "name": "Required Marks Calculator",
  "description": "Find the score needed on remaining work to reach a target overall percentage.",
  "longDescription": "Find the score needed on remaining work to reach a target overall percentage. Enter your own assessment details and inspect the calculation behind the result.",
  "categorySlug": "calculators",
  "icon": "📊",
  "keywords": [
    "required marks calculator"
  ],
  "metaTitle": "Required Marks Calculator — Formula & Breakdown",
  "metaDescription": "Find the score needed on remaining work to reach a target overall percentage. See the formula, worked totals and clear input checks.",
  "relatedToolSlugs": [
    "marks-percentage-calculator",
    "sgpa-calculator",
    "attendance-calculator"
  ],
  "usageSteps": [
    {
      "title": "Enter the completed average",
      "content": "Use the percentage average on completed work, the remaining assessment weight and your desired overall percentage."
    },
    {
      "title": "Optionally enter exam marks",
      "content": "Supply the assessment maximum and allowed increment for a minimum attainable mark. For example, choose 1 for whole marks or 0.5 for half marks."
    },
    {
      "title": "Review feasibility and formula",
      "content": "Inspect the weighted formula and upward rounding. Requirements above 100% and increments beyond the maximum are flagged as impossible."
    }
  ],
  "faq": [
    {
      "question": "What if the remaining assessment has no weight?",
      "answer": "At 0% remaining weight the completed average is final: the target is either already secured or impossible. No division by zero is attempted."
    },
    {
      "question": "Does this enforce my exam pass rules?",
      "answer": "No. It calculates a weighted overall target from your inputs. Separate pass marks, extra credit, moderation and institutional requirements must be checked independently."
    }
  ],
  "featured": false,
  "adEligible": false
});

TOOLS.push({
  "slug": "image-to-pdf",
  "name": "Image to PDF",
  "description": "Combine JPEG and PNG images into a PDF locally in your browser.",
  "longDescription": "Arrange image pages, choose A4 or US Letter, set margins and download one PDF. Your files are processed in this browser tab without uploading them.",
  "categorySlug": "pdf-tools",
  "icon": "📄",
  "keywords": [
    "image to pdf",
    "jpg to pdf",
    "png to pdf"
  ],
  "metaTitle": "Image to PDF — Private JPEG & PNG Converter",
  "metaDescription": "Convert JPEG and PNG images to PDF in your browser. Reorder pages, choose A4 or Letter, adjust margins and download without uploading your files.",
  "relatedToolSlugs": [
    "pdf-merger",
    "pdf-compressor",
    "image-resizer",
    "image-format-converter"
  ],
  "usageSteps": [
    {
      "title": "Choose local images",
      "content": "Add still JPEG or PNG files. The tool checks file sizes and image dimensions before creating local previews."
    },
    {
      "title": "Arrange and fit pages",
      "content": "Use Up and Down to set page order. Choose A4 or US Letter, automatic or fixed orientation, and a margin in millimeters."
    },
    {
      "title": "Create and check the PDF",
      "content": "Create the PDF locally and download it. Check the page order and orientation before submitting; clear the images when finished."
    }
  ],
  "faq": [
    {
      "question": "Are my images uploaded?",
      "answer": "No. File reading, image decoding, previews and PDF generation run in this browser tab. This tool does not send filenames or image contents or save them in browser storage; ordinary site analytics may still load."
    },
    {
      "question": "What are the supported formats and limits?",
      "answer": "Still JPEG and PNG are supported. The application's reliability guardrails are 20 files, 15 MiB per file, 50 MiB total, 16 megapixels per image, 64 megapixels total and 16,384 pixels per side. These are not universal browser limits, and smaller batches may be needed on some devices."
    },
    {
      "question": "Does the PDF contain searchable text?",
      "answer": "No. It contains one fitted image per page without OCR. Images are re-encoded and their original metadata is omitted, so JPEG quality and color appearance may differ from the original."
    }
  ],
  "featured": false,
  "adEligible": false
});

// ── Helper functions ────────────────────────────────────────

for (const tool of TOOLS) {
  const quality = TOOL_QUALITY[tool.slug];
  if (!quality) continue;
  tool.adEligible = AD_ELIGIBLE_TOOL_SLUGS.includes(tool.slug);
  tool.quality = quality;
  tool.additionalContent = [...(tool.additionalContent ?? []), ...quality.sections];
}

export function getToolsByCategory(categorySlug: string): Tool[] {
  return TOOLS.filter((t) => t.categorySlug === categorySlug);
}

export function getFeaturedTools(): Tool[] {
  return TOOLS.filter((t) => t.featured);
}

export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getRelatedTools(currentSlug: string, limit = 4): Tool[] {
  const current = getToolBySlug(currentSlug);
  if (!current) return TOOLS.slice(0, limit);
  if (current.relatedToolSlugs) return current.relatedToolSlugs.map(slug => getToolBySlug(slug)).filter((tool): tool is Tool => Boolean(tool)).slice(0, limit);
  return TOOLS.filter(
    (t) => t.categorySlug === current.categorySlug && t.slug !== currentSlug,
  ).slice(0, limit);
}

export function getAllToolSlugs(): string[] {
  return TOOLS.map((t) => t.slug);
}

export const SITE = {
  name: "Free Online Tools Nest",
  domain: "freeonlinetoolsnest.com",
  url: "https://freeonlinetoolsnest.com",
  description:
    "Free browser tools for writing, code, SEO, images, PDFs and calculations. No signup required; tool inputs are processed locally.",
  tagline: "Free browser tools for writing, code and everyday tasks.",
};
