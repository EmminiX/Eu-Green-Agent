"use client";
import React from "react";
import { ExternalLink, FileText, Globe, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Boxes } from "@/components/ui/background-boxes";

const euResources = [
  {
    title: "European Green Deal",
    description: "The EU's flagship policy framework for achieving climate neutrality by 2050",
    url: "https://ec.europa.eu/info/strategy/priorities-2019-2024/european-green-deal_en",
    icon: Globe,
    category: "Core Policy"
  },
  {
    title: "Carbon Border Adjustment Mechanism (CBAM)",
    description: "EU's carbon pricing system for imports to prevent carbon leakage",
    url: "https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en",
    icon: FileText,
    category: "Trade Policy"
  },
  {
    title: "Farm to Fork Strategy",
    description: "Making EU food systems fair, healthy and environmentally-friendly",
    url: "https://ec.europa.eu/food/horizontal-topics/farm-fork-strategy_en",
    icon: Globe,
    category: "Agriculture"
  },
  {
    title: "Circular Economy Action Plan",
    description: "EU's plan for sustainable product policy and waste reduction",
    url: "https://ec.europa.eu/environment/circular-economy/",
    icon: FileText,
    category: "Sustainability"
  },
  {
    title: "EU Biodiversity Strategy for 2030",
    description: "Bringing nature back into our lives with ambitious biodiversity targets",
    url: "https://ec.europa.eu/environment/strategy/biodiversity-strategy-2030_en",
    icon: Globe,
    category: "Environment"
  },
  {
    title: "EU Climate Law",
    description: "Making the EU's 2050 climate neutrality target legally binding",
    url: "https://ec.europa.eu/clima/eu-action/european-green-deal/european-climate-law_en",
    icon: FileText,
    category: "Legislation"
  }
];

export const ResourcesSection: React.FC = () => {
  return (
    <section id="resources" className="relative py-20 overflow-hidden">
      {/* Background with boxes */}
      <div className="absolute inset-0 z-0">
        <Boxes />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Official EU{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
              Green Resources
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Direct access to official European Union environmental policies and sustainability frameworks
          </p>
        </div>

        {/* Resources grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {euResources.map((resource, index) => {
            const IconComponent = resource.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <IconComponent className="h-6 w-6 text-green-400" />
                    </div>
                    <span className="text-xs font-semibold text-green-300 bg-green-500/20 px-2 py-1 rounded-full">
                      {resource.category}
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-green-300 transition-colors">
                  {resource.title}
                </h3>

                <p className="text-white/70 text-sm mb-4 leading-relaxed flex-grow">
                  {resource.description}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full border-white/60 bg-white/10 text-white hover:bg-white/20 hover:border-white/80 hover:text-green-300 backdrop-blur-sm"
                >
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    View Resource
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Key dates section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Important <span className="text-green-400">Deadlines</span>
            </h3>
            <p className="text-white/70">Key dates for EU Green Deal implementation</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { date: "2024", title: "CBAM Reporting Phase", description: "Carbon reporting for covered sectors" },
              { date: "2026", title: "CBAM Full Implementation", description: "Financial obligations begin" },
              { date: "2030", title: "Biodiversity Targets", description: "25% organic farming, 50% pesticide reduction" },
              { date: "2050", title: "Climate Neutrality", description: "EU becomes climate neutral" }
            ].map((deadline, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-md rounded-lg p-6 border border-white/20 text-center"
              >
                <div className="flex items-center justify-center mb-3">
                  <Calendar className="h-6 w-6 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">{deadline.date}</div>
                <h4 className="text-lg font-semibold text-green-300 mb-2">{deadline.title}</h4>
                <p className="text-white/70 text-sm">{deadline.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};