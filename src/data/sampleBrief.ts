import { TechnologyBriefData } from '../types/technologyBrief';

export const sampleBriefData: TechnologyBriefData = {
  techId: '2024VITTTO73',
  title: 'Natural Vitamin B12 Fortification in Fermented Foods',
  titleBannerBgColor: '#7ed957',
  domains: ['Food Biotechnology', 'Fermentation Microbiology', 'Nutraceutical Engineering'],
  applications: ['Staple Batter Enrichment', 'Bakery Products', 'Dairy Fermentation'],
  trlLevel: 5,
  patentStatus: 'Patent Pending',
  patentApplicationNo: '202441015300',
  priorityDate: 'March 1, 2024',
  leadInventor: 'Dr. Krishnan Venkataraman',
  inventorDesignation: 'Professor, Centre for Bio Separation Technology (CBST), VIT Vellore',
  coInventors: [],
  contactInfo: {
    name: 'Mr. Manish Kumar',
    title: 'Sr. Technology Transfer Officer',
    department: 'IP&TT Cell, VIT-IST',
    institution: 'VIT Vellore',
    email: 'manish.k@vit.ac.in',
    phoneOffice: '+91 416 220 4330',
    phoneMobile: '+91 83099 93511',
    website: 'https://vit.ac.in/iprcell'
  },
  published: true,
  sections: [
    // Page 1 Sections
    {
      id: 'sec-domain',
      title: 'Technology Domain',
      headerBgColor: '#5ce1e6',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'left',
      page: 1,
      blocks: [
        {
          id: 'blk-domain-1',
          type: 'bullets',
          bulletPoints: [
            'Food Biotechnology',
            'Fermentation Microbiology',
            'Nutraceutical Engineering'
          ]
        }
      ]
    },
    {
      id: 'sec-applications',
      title: 'Applications',
      headerBgColor: '#5ce1e6',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'right',
      page: 1,
      blocks: [
        {
          id: 'blk-app-1',
          type: 'bullets',
          bulletPoints: [
            'Staple Batter Enrichment',
            'Bakery Products',
            'Dairy Fermentation'
          ]
        }
      ]
    },
    {
      id: 'sec-problem',
      title: 'Problem Statement',
      headerBgColor: '#5ce1e6',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'left',
      page: 1,
      blocks: [
        {
          id: 'blk-prob-1',
          type: 'bullets',
          bulletPoints: [
            'Plant-based diets lack sufficient Vitamin B12',
            'Significant loss of Vitamin B12 during cooking',
            'Critical deficiency in vegetarians and vegans, particularly in pregnant women and nursing mothers',
            'Vitamin B12 deficiency leads to neurological disorders, pernicious anemia, cardiovascular risks, mental health risks, GI disorders, etc.'
          ]
        }
      ]
    },
    {
      id: 'sec-results',
      title: 'Results',
      headerBgColor: '#5ce1e6',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'right',
      page: 1,
      blocks: [
        {
          id: 'blk-res-1',
          type: 'image',
          imageUrl: '/assets/sample/curdled_milk_composite.png',
          imageFit: 'contain',
          placeholderHeight: 215
        },
        {
          id: 'blk-res-2',
          type: 'image',
          imageUrl: '/assets/sample/idly_dosa_composite.png',
          imageFit: 'contain',
          placeholderHeight: 215
        }
      ]
    },
    {
      id: 'sec-solution',
      title: 'Technological Solution',
      headerBgColor: '#5ce1e6',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'left',
      page: 1,
      blocks: [
        {
          id: 'blk-sol-1',
          type: 'bullets',
          bulletPoints: [
            'Formulation comprising inexpensive additives with food products before fermentation',
            'Synergistic enhancement of Vitamin B12 level directly within food matrix during its natural fermentation process',
            'Novel approach ensuring Vit B12 availability in food avoiding need for supplements'
          ]
        }
      ]
    },
    {
      id: 'sec-summary',
      title: 'Technology Summary',
      headerBgColor: '#5ce1e6',
      headerTextColor: '#000000',
      columnSpan: 2,
      page: 1,
      blocks: [
        {
          id: 'blk-sum-1',
          type: 'text',
          content: 'This novel composition and method comprises mixing of specific amino acids (1 mg/ml Glycine, 1 mg/ml K-glutamate or Mono-sodium glutamate) and 1 μg/ml Cobalt(II) chloride with a food product (e.g., yogurt, idli batter, bread dough) before fermentation.\n\nThis technology establishes a remarkable increase in vitamin B12 concentration in various fermented foods (e.g., up to 1409 μg/ml in appam batter, 1025 μg/ml in curdled milk), with minimal reduction (only 20%) after cooking, indicating stability.'
        }
      ]
    },

    // Page 2 Sections
    {
      id: 'sec-usp',
      title: 'Technical USP',
      headerBgColor: '#5ce1e6',
      headerTextColor: '#000000',
      columnSpan: 2,
      page: 2,
      blocks: [
        {
          id: 'blk-usp-1',
          type: 'bullets',
          bulletPoints: [
            'Simple integration into fermented food using minimal process tweaks and budget-friendly additives.',
            'Boosts bioavailability naturally, making superfoods accessible, scalable, and profitable for producers everywhere.'
          ]
        }
      ]
    },
    {
      id: 'sec-results-page2',
      title: 'Results',
      headerBgColor: '#5ce1e6',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'left',
      page: 2,
      blocks: [
        {
          id: 'blk-res-p2-1',
          type: 'image',
          imageUrl: '/assets/sample/appam_composite.png',
          imageFit: 'contain',
          placeholderHeight: 155
        },
        {
          id: 'blk-res-p2-2',
          type: 'image',
          imageUrl: '/assets/sample/bread_composite.png',
          imageFit: 'contain',
          placeholderHeight: 155
        }
      ]
    },
    {
      id: 'sec-comp-adv',
      title: 'Competitive Advantage',
      headerBgColor: '#5ce1e6',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'left',
      page: 2,
      blocks: [
        {
          id: 'blk-comp-1',
          type: 'bullets',
          bulletPoints: [
            '<span style="color:#ff3131;font-weight:bold;">Superior bioavailability</span> of Vitamin B12 when paired with food vs. pure supplements or injections',
            '<span style="color:#ff3131;font-weight:bold;">Cost-effective alternative</span> to pricey supplements or unavailable fortified foods, accessible to all societal sections',
            '<span style="color:#ff3131;font-weight:bold;">Versatile for all ages:</span> pregnant/lactating women, growing children, and aging populations with lifestyle diseases like diabetes and CVD'
          ]
        }
      ]
    },
    {
      id: 'sec-ip-stage',
      title: 'IP & Development Stage',
      headerBgColor: '#5ce1e6',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'right',
      page: 2,
      blocks: [
        {
          id: 'blk-ip-1',
          type: 'bullets',
          bulletPoints: [
            'Patent Application: 202441015300 (Priority Date: March 1, 2024) - Patent Pending',
            'Technology Readiness Level - 5',
            'Ready for Industry scale-up'
          ]
        }
      ]
    },
    {
      id: 'sec-value-prop',
      title: 'Value Proposition',
      headerBgColor: '#5ce1e6',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'right',
      page: 2,
      blocks: [
        {
          id: 'blk-val-1',
          type: 'bullets',
          bulletPoints: [
            '<span style="color:#ff3131;font-weight:bold;">Ultra-Cost-Effective B12 Boost:</span> Enrich essential Vitamin B12 directly in food, no premium ingredients needed',
            '<span style="color:#ff3131;font-weight:bold;">Post-cooking B12 Retention:</span> 80% of Vitamin B12 is retained in the food even after cooking (steaming, frying, or baking)',
            '<span style="color:#ff3131;font-weight:bold;">Seamless Integration:</span> Mix additives in-situ during fermentation or pre-ferment blending',
            '<span style="color:#ff3131;font-weight:bold;">Ready-to-Sell Sachets:</span> Package B12-enriching pre-mixes for instant scalability'
          ]
        }
      ]
    },
    {
      id: 'sec-market',
      title: 'Market Potential',
      headerBgColor: '#5ce1e6',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'right',
      page: 2,
      blocks: [
        {
          id: 'blk-mkt-1',
          type: 'bullets',
          bulletPoints: [
            'Global Vitamin B12 market: USD 350M (2024), reaching USD 593M by 2032 (6.8% CAGR)',
            'Indian market: USD 7-12M, growing to USD 20M+ by 2033 (6.4% CAGR), with 47% deficiency among 574M vegetarians',
            'Cost-effective, stable B12 method (1400+ μg/ml in batter) targets billions of vegetarians via sachet sales, premium fortified foods, and emerging-market Vitamin B12 deficiency'
          ]
        }
      ]
    },
    {
      id: 'sec-research-lab',
      title: 'Research Lab',
      headerBgColor: '#5ce1e6',
      headerTextColor: '#000000',
      columnSpan: 2,
      page: 2,
      blocks: [
        {
          id: 'blk-lab-1',
          type: 'bullets',
          bulletPoints: [
            '<u style="font-weight:bold;">Dr. Krishnan Venkataraman</u><br/>Professor, Centre for Bio Separation Technology (CBST), VIT Vellore'
          ]
        }
      ]
    }
  ]
};
