export interface GeneratedQuery {
  query: string
  category: "INFORMATIONAL" | "COMMERCIAL" | "TRANSACTIONAL" | "COMPARISON" | "BEST_OF" | "PROBLEM_SOLVING" | "BRAND_SPECIFIC" | "LOCAL_INTENT"
}

export function generateCommercialQueries(
  brandName: string,
  industry: string,
  country = "United States",
  competitors: string[] = []
): GeneratedQuery[] {
  const comp1 = competitors[0] || "industry competitors"
  const comp2 = competitors[1] || "alternative solutions"

  return [
    {
      category: "BEST_OF",
      query: `What are the best ${industry} software solutions for businesses in ${country}?`,
    },
    {
      category: "COMMERCIAL",
      query: `Top recommended ${industry} platforms for growing teams`,
    },
    {
      category: "TRANSACTIONAL",
      query: `What is the top rated ${industry} tool to buy in 2026?`,
    },
    {
      category: "COMPARISON",
      query: `How does ${brandName} compare to ${comp1} and ${comp2}?`,
    },
    {
      category: "PROBLEM_SOLVING",
      query: `How can businesses automate workflows using ${industry} software?`,
    },
    {
      category: "INFORMATIONAL",
      query: `What features should I look for when choosing a ${industry} solution?`,
    },
    {
      category: "BRAND_SPECIFIC",
      query: `What are the pros, cons, and reputation of ${brandName}?`,
    },
    {
      category: "LOCAL_INTENT",
      query: `Leading ${industry} services and software providers serving ${country}`,
    },
  ]
}