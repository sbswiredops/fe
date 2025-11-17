"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export default function Accordion({
  items,
  allowMultiple = false,
}: AccordionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newExpandedItems = new Set(expandedItems);

    if (newExpandedItems.has(id)) {
      newExpandedItems.delete(id);
    } else {
      if (!allowMultiple) {
        newExpandedItems.clear();
      }
      newExpandedItems.add(id);
    }

    setExpandedItems(newExpandedItems);
  };

  return (
    <div className="accordion-container space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="accordion-item border border-gray-200 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => toggleItem(item.id)}
            className="w-full accordion-header flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
          >
            <h3 className="font-semibold text-gray-900">{item.title}</h3>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                expandedItems.has(item.id) ? "rotate-180" : ""
              }`}
            />
          </button>

          {expandedItems.has(item.id) && (
            <div className="accordion-content border-t border-gray-200 bg-gray-50 px-6 py-4">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
